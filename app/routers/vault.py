from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies.auth import get_current_owner
from app.models.owner import Owner
from app.schemas.vault import (
    VaultInitializeRequest,
    VaultInitializeResponse,
)
from app.services.vault_service import initialize_owner_vault

router = APIRouter(
    prefix="/vault",
    tags=["Vault"],
)


@router.post(
    "/initialize",
    response_model=VaultInitializeResponse,
)
def initialize_vault(
    payload: VaultInitializeRequest,
    db: Session = Depends(get_db),
    owner: Owner = Depends(get_current_owner),
):
    try:
        initialize_owner_vault(
            db=db,
            owner=owner,
            vault_key=payload.vault_key,
        )

        return VaultInitializeResponse(message="Vault initialized successfully.")

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
