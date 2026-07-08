from sqlalchemy.orm import Session

from app.models.owner import Owner
from app.services.auth_service import hash_password


def create_owner(
    db: Session,
    name: str,
    email: str,
    password: str,
) -> Owner:

    new_owner = Owner(
        name=name,
        email=email,
        password_hash=hash_password(password),
    )

    db.add(new_owner)
    db.commit()
    db.refresh(new_owner)

    return new_owner