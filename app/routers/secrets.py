from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.auth_dependencies import get_current_owner
from app.core.database import get_db

from app.models.owner import Owner
from app.models.secret import Secret

from app.schemas.secret import (
    QueryRequest,
    QueryResponse,
    SecretCreateRequest,
    SecretCreateResponse,
    SecretListItem,
    SecretRevealRequest,
    SecretRevealResponse,
    SecretRevokeRequest,
    SecretRevokeResponse,
    SummaryResponse,
)

from app.services.audit_service import log_action
from app.services.crypto_service import (
    decrypt_secret,
    decrypt_server_half,
)
from app.services.key_service import (
    derive_client_half,
    verify_vault_key,
    reconstruct_full_key,
)
from app.services.query_service import (
    run_natural_language_query,
)
from app.services.secret_service import (
    create_secret,
    revoke_secret,
)
from app.services.summary_service import (
    summarize_recent_activity,
)


router = APIRouter(
    prefix="/secrets",
    tags=["secrets"],
)


@router.post(
    "/",
    response_model=SecretCreateResponse,
)
def create_secret_endpoint(
    payload: SecretCreateRequest,
    db: Session = Depends(get_db),
    current_owner: Owner = Depends(get_current_owner),
):

    result = create_secret(
        db=db,
        name=payload.name,
        value=payload.value,
        vault_key=payload.vault_key,
        owner_id=current_owner.id,
        expires_in_days=payload.expires_in_days,
    )

    return result


@router.get(
    "/mine",
    response_model=list[SecretListItem],
)
def get_my_secrets(
    db: Session = Depends(get_db),
    current_owner: Owner = Depends(get_current_owner),
):

    secrets = (
        db.query(Secret)
        .filter(
            Secret.owner_id == current_owner.id
        )
        .order_by(
            Secret.created_at.desc()
        )
        .all()
    )

    return secrets

@router.post(
    "/reveal",
    response_model=SecretRevealResponse,
)
def reveal_secret_endpoint(
    payload: SecretRevealRequest,
    db: Session = Depends(get_db),
    current_owner: Owner = Depends(get_current_owner),
):

    # Find the secret
    secret = (
        db.query(Secret)
        .filter(
            Secret.id == payload.secret_id,
            Secret.owner_id == current_owner.id,
        )
        .first()
    )

    if not secret:
        raise HTTPException(
            status_code=404,
            detail="Secret not found",
        )

    # Find the owner
    owner = (
        db.query(Owner)
        .filter(
            Owner.id == current_owner.id
        )
        .first()
    )

    if not owner:
        raise HTTPException(
            status_code=404,
            detail="Owner not found",
        )

    # Secret must be active
    if secret.status != "active":
        raise HTTPException(
            status_code=403,
            detail=f"Cannot reveal a {secret.status} secret",
        )

    # Decrypt owner's server half
    server_half = decrypt_server_half(
        owner.encrypted_server_half
    )

    # Verify the client half
    client_half = derive_client_half(
    payload.vault_key,
    owner.vault_salt,
)

    is_valid = verify_vault_key(
        server_half,
        client_half,
        owner.key_hash,
    )

    if not is_valid:

        log_action(
            db,
            secret_id=secret.id,
            action="reveal_failed",
            metadata={
                "reason": "invalid_vault_key",
            },
        )

        db.commit()

        raise HTTPException(
            status_code=403,
            detail="Invalid Vault Key",
        )

    # Reconstruct full key
    full_key = reconstruct_full_key(
    server_half,
    client_half,
)

    # Decrypt secret
    secret_value = decrypt_secret(
        full_key,
        secret.encrypted_value,
        secret.nonce,
    )

    # Update last accessed time
    secret.last_accessed_at = datetime.now(
        timezone.utc
    )

    log_action(
        db,
        secret_id=secret.id,
        action="revealed",
    )

    db.commit()

    db.refresh(secret)

    return SecretRevealResponse(
        id=secret.id,
        name=secret.name,
        value=secret_value,
    )

@router.post(
    "/query",
    response_model=QueryResponse,
)
def query_secrets_endpoint(
    payload: QueryRequest,
    db: Session = Depends(get_db),
    current_owner: Owner = Depends(get_current_owner),
):

    result = run_natural_language_query(
        db=db,
        question=payload.question,
        owner_id=current_owner.id,
    )

    return result


@router.get(
    "/summary",
    response_model=SummaryResponse,
)
def get_summary_endpoint(
    days: int = 7,
    db: Session = Depends(get_db),
    current_owner: Owner = Depends(get_current_owner),
):

    summary = summarize_recent_activity(
        db=db,
        owner_id=current_owner.id,
        days=days,
    )

    return SummaryResponse(
        summary=summary,
    )


@router.post(
    "/revoke",
    response_model=SecretRevokeResponse,
)
def revoke_secret_endpoint(
    payload: SecretRevokeRequest,
    db: Session = Depends(get_db),
    current_owner: Owner = Depends(get_current_owner),
):

    secret = revoke_secret(
        db=db,
        secret_id=payload.secret_id,
        owner_id=current_owner.id,
    )

    if not secret:
        raise HTTPException(
            status_code=404,
            detail="Secret not found",
        )

    return SecretRevokeResponse(
        id=secret.id,
        status=secret.status,
    )