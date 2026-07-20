from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.exceptions import AuthenticationError
from app.core.logger import logger
from app.models.owner import Owner
from app.schemas.owner import LoginRequest, LoginResponse
from app.services.auth_service import (
    verify_password,
    create_access_token,
)

router = APIRouter(
    prefix="/auth",
    tags=["Auth"],
)


@router.post(
    "/login",
    response_model=LoginResponse,
)
def login(
    payload: LoginRequest,
    db: Session = Depends(get_db),
):
    owner = db.query(Owner).filter(Owner.email == str(payload.email)).first()

    if owner is None:
        raise AuthenticationError("Invalid email or password")

    if not verify_password(
        payload.password,
        owner.password_hash,
    ):
        raise AuthenticationError("Invalid email or password")

    token = create_access_token(str(owner.id))

    logger.info(
        "Owner %s logged in",
        owner.email,
    )

    return LoginResponse(
        access_token=token,
        token_type="bearer",
    )
