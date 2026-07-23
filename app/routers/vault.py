from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies.auth import get_current_owner
from app.models.owner import Owner
from app.schemas.vault import (
    VaultInitializeRequest,
    VaultInitializeResponse,
)
from app.services.vault_service import (
    initialize_owner_vault,
    reset_owner_vault,
)

from app.schemas.vault import VaultStatusResponse

from app.services.vault_service import (
    initialize_owner_vault,
    reset_owner_vault,
    get_vault_status,
)
router = APIRouter(
    prefix="/vault",
    tags=["Vault"],
)

@router.get(
    "/status",
    response_model=VaultStatusResponse,
)
def vault_status(
    db: Session = Depends(get_db),
    current_owner=Depends(get_current_owner),
):

    initialized = get_vault_status(
        db,
        current_owner.id,
    )

    return VaultStatusResponse(
        initialized=initialized
    )


@router.post(
    "/initialize",
    summary="Initialize Vault",
    description="Initialize the owner's vault by generating and securely storing the vault encryption key.",
    response_model=VaultInitializeResponse,
)
def initialize_vault(
    payload: VaultInitializeRequest,
    db: Session = Depends(get_db),
    owner: Owner = Depends(get_current_owner),
):
    try:
        if payload.mode == "generated":
            from app.services.key_service import generate_vault_key

            vault_key = generate_vault_key()

        elif payload.mode == "custom":
            if not payload.vault_key:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Vault key is required for custom mode.",
                )
            vault_key = payload.vault_key

        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid mode.",
            )

        initialize_owner_vault(
            db=db,
            owner=owner,
            vault_key=vault_key,
        )

        return VaultInitializeResponse(
    generated_vault_key=vault_key if payload.mode == "generated" else None,
    message="Vault initialized successfully.",
)

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )

@router.post(
    "/reset",
    summary="Reset Vault",
    description="Reset the owner's vault and generate a new encryption key.",
)
def reset_vault(
    db: Session = Depends(get_db),
    owner: Owner = Depends(get_current_owner),
):
    reset_owner_vault(
        db=db,
        owner=owner,
    )

    return {
        "message": (
            "Vault reset successfully. "
            "Initialize your vault again to get a new Vault Key."
        )
    }

