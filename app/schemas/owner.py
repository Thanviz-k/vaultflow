from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, EmailStr
from typing import Literal


class OwnerCreateRequest(BaseModel):
    name: str
    email: EmailStr
    password: str

    # "generated" -> VaultFlow generates a Vault Key
    # "custom" -> User provides their own Vault Key
    mode: Literal["generated", "custom"] = "generated"

    # Required only when mode == "custom"
    vault_key: str | None = None


class OwnerInfo(BaseModel):
    id: UUID
    name: str
    email: EmailStr
    created_at: datetime

    class Config:
        from_attributes = True


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