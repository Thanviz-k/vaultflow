from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.exceptions import ValidationError
from app.core.logger import logger

from app.models.owner import Owner

from app.schemas.owner import (
    OwnerCreateRequest,
    OwnerCreateResponse,
    OwnerInfo,
)

from app.services.owner_service import create_owner


router = APIRouter(
    prefix="/owners",
    tags=["Owners"],
)

@router.post(
    "/register",
    summary="Register Owner",
    description="Create a new owner account using a name, email, and password.",
    response_model=OwnerCreateResponse,
    status_code=201,
)
def create_owner_endpoint(
    payload: OwnerCreateRequest,
    db: Session = Depends(get_db),
):
    existing_owner = db.query(Owner).filter(Owner.email == str(payload.email)).first()

    if existing_owner:
        raise ValidationError("Email already registered")

    owner = create_owner(
        db=db,
        name=payload.name,
        email=str(payload.email),
        password=payload.password,
    )

    logger.info(
        "New owner registered: %s",
        owner.email,
    )

    return OwnerCreateResponse(
    owner=OwnerInfo.model_validate(owner),
    generated_vault_key=None,
)
