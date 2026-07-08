from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.owner import Owner
from app.schemas.owner import LoginRequest, LoginResponse
from app.services.auth_service import (
    verify_password,
    create_access_token,
)


router = APIRouter(
    prefix="/auth",
    tags=["auth"],
)


@router.post(
    "/login",
    response_model=LoginResponse,
)
def login(
    payload: LoginRequest,
    db: Session = Depends(get_db),
):
    owner = (
        db.query(Owner)
        .filter(Owner.email == str(payload.email))
        .first()
    )

    if not owner:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password",
        )

    if not verify_password(
        payload.password,
        owner.password_hash,
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password",
        )

    token = create_access_token(
        str(owner.id)
    )

    return {
        "access_token": token,
        "token_type": "bearer",
    }