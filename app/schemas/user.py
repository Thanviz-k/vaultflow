from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, Field
import re
from pydantic import field_validator


class OwnerProfileResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str
    email: EmailStr
    vault_initialized: bool
    created_at: datetime


class ChangePasswordRequest(BaseModel):
    current_password: str

    new_password: str = Field(
        ...,
        min_length=8,
        max_length=128,
    )

    @field_validator("new_password")
    @classmethod
    def validate_password(cls, value: str):

        if not re.search(r"[A-Z]", value):
            raise ValueError("Password must contain an uppercase letter.")

        if not re.search(r"[a-z]", value):
            raise ValueError("Password must contain a lowercase letter.")

        if not re.search(r"\d", value):
            raise ValueError("Password must contain a digit.")

        if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", value):
            raise ValueError("Password must contain a special character.")

        return value


class ChangePasswordResponse(BaseModel):
    message: str
