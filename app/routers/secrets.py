from fastapi import APIRouter, Depends
from uuid import UUID
from sqlalchemy.orm import Session

from app.models.secret import Secret
from app.core.database import get_db
from app.dependencies.auth import get_current_owner

from app.models.owner import Owner

from app.schemas.secret import (
    QueryRequest,
    QueryResponse,
    RevokedSecretItem,
    SecretCreateRequest,
    SecretCreateResponse,
    SecretDeleteRequest,
    SecretDeleteResponse,
    SecretListItem,
    SecretRevealRequest,
    SecretRevealResponse,
    SecretRevokeRequest,
    SecretRevokeResponse,
    SummaryResponse,
    SecretUpdateRequest,
    SecretUpdateResponse,
)

from app.services.query_service import (
    run_natural_language_query,
)
from app.services.secret_service import (
    create_secret,
    get_revoked_secrets,
    revoke_secret,
    delete_secret,
    reveal_secret,
    search_secrets,
    update_secret,
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
    status_code=201,
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
    summary="List My Secrets",
    description="Retrieve all secrets owned by the authenticated user.",
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
    summary="Reveal Secret",
    description="Decrypt and reveal a secret using the owner's vault key.",
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
    summary="Natural Language Query",
    description="Ask questions about your stored secrets using natural language and receive an AI-generated response.",
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
    summary="Activity Summary",
    description="Generate an AI-powered summary of recent secret activity for the authenticated user.",
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
    summary="Revoke Secret",
    description="Permanently revoke a secret by removing its encrypted value while preserving its metadata.",
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
        vault_key=payload.vault_key,
    )

    return SecretRevokeResponse(
        id=secret.id,
        status=secret.status,
    )


@router.post(
    "/delete",
    summary="Delete Secret",
    description="Permanently delete a secret after Vault Key verification.",
    response_model=SecretDeleteResponse,
)
def delete_secret_endpoint(
    payload: SecretDeleteRequest,
    db: Session = Depends(get_db),
    current_owner: Owner = Depends(get_current_owner),
):

    delete_secret(
        db=db,
        secret_id=payload.secret_id,
        owner_id=current_owner.id,
        vault_key=payload.vault_key,
    )

    return SecretDeleteResponse(
        id=payload.secret_id,
        message="Secret deleted successfully.",
    )

@router.put(
    "/{secret_id}",
    summary="Update Secret",
    description="Update the name and encrypted value of an existing secret.",
    response_model=SecretUpdateResponse,
)
def update_secret_endpoint(
    secret_id: UUID,
    payload: SecretUpdateRequest,
    db: Session = Depends(get_db),
    owner: Owner = Depends(get_current_owner),
):
    secret = update_secret(
        db=db,
        secret_id=secret_id,
        owner_id=owner.id,
        name=payload.name,
        value=payload.value,
        vault_key=payload.vault_key,
    )

    return SecretUpdateResponse(
        id=secret.id,
        message="Secret updated successfully.",
    )

@router.get(
    "/revoked",
    summary="List Revoked Secrets",
    description="Retrieve all revoked secrets belonging to the authenticated user.",
    response_model=list[RevokedSecretItem],
)
def list_revoked_secrets(
    db: Session = Depends(get_db),
    owner: Owner = Depends(get_current_owner),
):
    return get_revoked_secrets(
        db=db,
        owner_id=owner.id,
    )

@router.get(
    "/search",
    summary="Search Secrets",
    description="Search the authenticated user's secrets by name.",
    response_model=list[SecretListItem],
)
def search_secret(
    query: str,
    db: Session = Depends(get_db),
    current_owner: Owner = Depends(get_current_owner),
):
    return search_secrets(
        db=db,
        owner_id=current_owner.id,
        query=query,
    )