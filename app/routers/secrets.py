from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.services.audit_service import log_action

from app.core.database import get_db
from app.models.secret import Secret
from datetime import datetime, timezone
from app.schemas.secret import (
    SecretCreateRequest,
    SecretCreateResponse,
    SecretVerifyRequest,
    SecretVerifyResponse,
    SecretListItem,
    SecretRevealRequest,
    SecretRevealResponse,
)
from app.services.secret_service import create_secret
from app.services.crypto_service import (decrypt_server_half,decrypt_secret_value)
from app.services.key_service import verify_key
from app.schemas.secret import QueryRequest, QueryResponse
from app.services.query_service import run_natural_language_query
from app.schemas.secret import SummaryResponse
from app.services.summary_service import summarize_recent_activity
from app.schemas.secret import SecretRevokeRequest, SecretRevokeResponse
from app.services.secret_service import revoke_secret
from app.models.owner import Owner
from app.core.auth_dependencies import get_current_owner

router = APIRouter(prefix="/secrets", tags=["secrets"])

@router.post("/", response_model=SecretCreateResponse)
def create_secret_endpoint(
    payload: SecretCreateRequest,
    db: Session = Depends(get_db),
    current_owner: Owner = Depends(get_current_owner),
):
    result = create_secret(
        db,
        name=payload.name,
        value=payload.value,
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
        .filter(Secret.owner_id == current_owner.id)
        .order_by(Secret.created_at.desc())
        .all()
    )

    return secrets

@router.post(
    "/verify",
    response_model=SecretVerifyResponse,
)
def verify_secret_endpoint(
    payload: SecretVerifyRequest,
    db: Session = Depends(get_db),
    current_owner: Owner = Depends(
        get_current_owner
    ),
):
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

    if secret.status != "active":
        return SecretVerifyResponse(
            valid=False,
            status=secret.status,
        )

    decrypted_server_half = (
        decrypt_server_half(
            db,
            secret.server_half,
        )
    )

    is_valid = verify_key(
        decrypted_server_half,
        payload.client_half,
        secret.key_hash,
    )

    log_action(
        db,
        secret_id=secret.id,
        action="verified",
        metadata={
            "result": is_valid
        },
    )

    db.commit()
    return SecretVerifyResponse(
        valid=is_valid,
        status=secret.status,
    )

@router.post(
    "/reveal",
    response_model=SecretRevealResponse,
)
def reveal_secret_endpoint(
    payload: SecretRevealRequest,
    db: Session = Depends(get_db),
    current_owner: Owner = Depends(
        get_current_owner
    ),
):
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

    if secret.status != "active":
        raise HTTPException(
            status_code=403,
            detail=(
                f"Cannot reveal a "
                f"{secret.status} secret"
            ),
        )

    if secret.encrypted_value is None:
        raise HTTPException(
            status_code=409,
            detail=(
                "This is an older secret record "
                "and has no stored secret value"
            ),
        )

    decrypted_server_half = (
        decrypt_server_half(
            db,
            secret.server_half,
        )
    )

    try:
        is_valid = verify_key(
            decrypted_server_half,
            payload.client_half,
            secret.key_hash,
        )

    except ValueError:
        is_valid = False

    if not is_valid:
        log_action(
            db,
            secret_id=secret.id,
            action="reveal_failed",
            metadata={
                "reason": "invalid_client_half"
            },
        )

        db.commit()

        raise HTTPException(
            status_code=403,
            detail="Invalid client half",
        )

    secret_value = decrypt_secret_value(
        db,
        secret.encrypted_value,
    )

    secret.last_accessed_at = datetime.now(
        timezone.utc
    )

    log_action(
        db,
        secret_id=secret.id,
        action="revealed",
    )

    db.commit()

    return {
        "id": secret.id,
        "name": secret.name,
        "value": secret_value,
    }


@router.post(
    "/query",
    response_model=QueryResponse,
)
def query_secrets_endpoint(
    payload: QueryRequest,
    db: Session = Depends(get_db),
    current_owner: Owner = Depends(
        get_current_owner
    ),
):
    result = run_natural_language_query(
        db,
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
    current_owner: Owner = Depends(
        get_current_owner
    ),
):
    summary = summarize_recent_activity(
        db,
        owner_id=current_owner.id,
        days=days,
    )

    return {
        "summary": summary
    }


@router.post("/revoke", response_model=SecretRevokeResponse)

def revoke_secret_endpoint(
    payload: SecretRevokeRequest,
    db: Session = Depends(get_db),
    current_owner: Owner = Depends(get_current_owner),
):
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

    secret = revoke_secret(
        db,
        payload.secret_id,
        current_owner.id,
    )

    return {
        "id": secret.id,
        "status": secret.status,
    }
