from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies.auth import get_current_owner
from app.models.owner import Owner
from app.schemas.vault import (
    VaultInitializeRequest,
    VaultInitializeResponse,
    VaultResetRequest,
    VaultStatusResponse,
)
from app.services.vault_service import (
    initialize_owner_vault,
    reset_owner_vault,
    get_vault_status,
)
from app.services.secret_service import verify_owner_vault_key
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
    description=(
        "Verify the current Vault Key, then permanently delete all secrets "
        "and reset the vault so a new Vault Key can be set."
    ),
)
def reset_vault(
    payload: VaultResetRequest,
    db: Session = Depends(get_db),
    owner: Owner = Depends(get_current_owner),
):
    # The owner must prove they know the CURRENT vault key before we allow
    # them to wipe it. Without this, anyone with a stolen session token
    # could destroy every secret without knowing the key at all.
    verify_owner_vault_key(
        db=db,
        owner_id=owner.id,
        vault_key=payload.vault_key,
    )

    reset_owner_vault(
        db=db,
        owner=owner,
    )

    return {
        "message": (
            "Vault reset successfully. All previous secrets have been "
            "permanently deleted. Initialize your vault again to set a new Vault Key."
        )
    }

@router.post(
    "/force-reset",
    summary="Force Reset Vault (Forgot Vault Key)",
    description=(
        "Permanently delete all secrets and reset the vault WITHOUT verifying "
        "the current Vault Key. Used only when the owner has forgotten their "
        "Vault Key and cannot use /vault/reset. Requires an authenticated "
        "session; the vault key itself is never checked."
    ),
)
def force_reset_vault(
    db: Session = Depends(get_db),
    owner: Owner = Depends(get_current_owner),
):
    # No verify_owner_vault_key call here — that's the whole point.
    # Login (JWT) is the only proof of identity available when the
    # vault key itself is lost.
    reset_owner_vault(
        db=db,
        owner=owner,
    )
    return {
        "message": (
            "Vault force-reset successfully. All previous secrets have been "
            "permanently deleted. Initialize your vault again to set a new Vault Key."
        )
    }