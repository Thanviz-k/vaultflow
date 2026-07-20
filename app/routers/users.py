from fastapi import APIRouter, Depends

from app.dependencies.auth import get_current_owner
from app.models.owner import Owner
from app.schemas.user import OwnerProfileResponse
from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.user import (
    ChangePasswordRequest,
    ChangePasswordResponse,
)

from app.services.user_service import (
    change_password,
)

router = APIRouter(
    prefix="/users",
    tags=["Users"],
)


@router.get(
    "/me",
    response_model=OwnerProfileResponse,
)
def get_current_user(
    current_owner: Owner = Depends(get_current_owner),
):
    return current_owner


@router.put(
    "/change-password",
    response_model=ChangePasswordResponse,
)
def change_password_endpoint(
    payload: ChangePasswordRequest,
    current_owner: Owner = Depends(get_current_owner),
    db: Session = Depends(get_db),
):
    try:
        change_password(
            db=db,
            owner=current_owner,
            current_password=payload.current_password,
            new_password=payload.new_password,
        )

        return ChangePasswordResponse(message="Password changed successfully.")

    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e),
        )
