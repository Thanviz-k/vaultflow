from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.owner import Owner
from app.services.auth_service import decode_access_token


bearer_scheme = HTTPBearer()


def get_current_owner(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> Owner:
    token = credentials.credentials

    owner_id = decode_access_token(token)

    if owner_id is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token",
        )

    owner = (
        db.query(Owner)
        .filter(Owner.id == owner_id)
        .first()
    )

    if owner is None:
        raise HTTPException(
            status_code=401,
            detail="Owner not found",
        )

    return owner