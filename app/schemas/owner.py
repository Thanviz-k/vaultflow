from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, EmailStr
from typing import Literal
from pydantic import field_validator
import re
from pydantic import ConfigDict


class OwnerInfo(BaseModel):
    id: UUID
    name: str
    email: EmailStr
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class OwnerCreateResponse(BaseModel):
    owner: OwnerInfo

    # Returned only when mode == "generated"
    generated_vault_key: str | None = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str


class OwnerCreateRequest(BaseModel):
    name: str
    email: EmailStr
    password: str

    mode: Literal["generated", "custom"] = "generated"
    vault_key: str | None = None

    @field_validator("password")
    @classmethod
    def validate_password(cls, value: str) -> str:
        if len(value) < 8:
            raise ValueError("Password must be at least 8 characters.")

        if not re.search(r"[A-Z]", value):
            raise ValueError("Password must contain an uppercase letter.")

        if not re.search(r"[a-z]", value):
            raise ValueError("Password must contain a lowercase letter.")

        if not re.search(r"\d", value):
            raise ValueError("Password must contain a digit.")

        if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", value):
            raise ValueError("Password must contain a special character.")

        return value
