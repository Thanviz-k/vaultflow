from sqlalchemy.orm import Session
from app.core.exceptions import (
    AuthenticationError,
    ValidationError,
)
from app.models.owner import Owner
from app.services.auth_service import (
    hash_password,
    verify_password,
)


def change_password(
    db: Session,
    owner: Owner,
    current_password: str,
    new_password: str,
) -> None:

    if not verify_password(
        current_password,
        owner.password_hash,
    ):
        raise AuthenticationError("Current password is incorrect.")

    if current_password == new_password:
        raise ValidationError(
            "New password must be different from the current password."
        )

    owner.password_hash = hash_password(new_password)

    db.commit()
