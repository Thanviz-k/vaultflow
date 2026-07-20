from fastapi import APIRouter, Depends
from uuid import UUID
from sqlalchemy.orm import Session

from app.core.database import get_db


from app.dependencies.auth import get_current_owner

from app.models.owner import Owner
from app.models.secret import Secret

from app.schemas.secret import (
    QueryRequest,
    QueryResponse,
    SecretCreateRequest,
    SecretCreateResponse,
    SecretDeleteResponse,
    SecretListItem,
    SecretRevealRequest,
    SecretRevealResponse,
    SecretRevokeRequest,
    SecretRevokeResponse,
    SummaryResponse,
)

from app.services.query_service import (
    run_natural_language_query,
)
from app.services.secret_service import (
    create_secret,
    revoke_secret,
    delete_secret,
    reveal_secret,
)
from app.services.summary_service import (
    summarize_recent_activity,
)

router = APIRouter(
    prefix="/secrets",
    tags=["Secrets"],
)


@router.post(
    "/",
    summary="Create Secret",
    description="Encrypt and securely store a secret.",
    response_model=SecretCreateResponse,
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

    secret = create_secret(
        db=db,
        name=payload.name,
        value=payload.value,
        vault_key=payload.vault_key,
        owner_id=current_owner.id,
        expires_in_days=payload.expires_in_days,
    )

    return SecretCreateResponse(
        id=str(secret.id),
        message="Secret created successfully.",
        name=secret.name,
        expires_at=secret.expires_at,
    )


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
    "/reveal",
    response_model=SecretRevealResponse,
)
def reveal_secret_endpoint(
    payload: SecretRevealRequest,
    db: Session = Depends(get_db),
    current_owner: Owner = Depends(get_current_owner),
):

    secret = reveal_secret(
        db=db,
        secret_id=payload.secret_id,
        owner_id=current_owner.id,
        vault_key=payload.vault_key,
    )

    return SecretRevealResponse(
        id=secret["id"],
        name=secret["name"],
        value=secret["value"],
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

    return SecretRevokeResponse(
        id=secret.id,
        status=secret.status,
    )


@router.delete(
    "/{secret_id}",
    response_model=SecretDeleteResponse,
)
def delete_secret_endpoint(
    secret_id: UUID,
    db: Session = Depends(get_db),
    current_owner: Owner = Depends(get_current_owner),
):

    delete_secret(
        db=db,
        secret_id=secret_id,
        owner_id=current_owner.id,
    )

    return SecretDeleteResponse(
        id=secret_id,
        message="Secret deleted successfully.",
    )
