from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.owner import Owner
from app.schemas.owner import (
    OwnerCreateRequest,
    OwnerCreateResponse,
)
from app.services.owner_service import create_owner


router = APIRouter(
    prefix="/owners",
    tags=["owners"],
)


@router.post(
    "/register",
    response_model=OwnerCreateResponse,
)
def create_owner_endpoint(
    payload: OwnerCreateRequest,
    db: Session = Depends(get_db),
):
    existing_owner = (
        db.query(Owner)
        .filter(
            Owner.email == str(payload.email)
        )
        .first()
    )

    if existing_owner:
        raise HTTPException(
            status_code=400,
            detail="Email already registered",
        )

    owner, generated_vault_key = create_owner(
        db=db,
        name=payload.name,
        email=str(payload.email),
        password=payload.password,
        mode=payload.mode,
        vault_key=payload.vault_key,
    )

    return {
        "owner": owner,
        "generated_vault_key": generated_vault_key,
    }