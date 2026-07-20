from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.owner import Owner
from app.services.auth_service import decode_access_token

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/auth/login",
)


def get_current_owner(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> Owner:
    owner_id = decode_access_token(token)

    if owner_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )

    owner = db.query(Owner).filter(Owner.id == owner_id).first()

    if owner is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Owner not found",
        )

    return owner
