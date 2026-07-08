from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, EmailStr


class OwnerCreateRequest(BaseModel):
    name: str
    email: EmailStr
    password: str


class OwnerCreateResponse(BaseModel):
    id: UUID
    name: str
    email: EmailStr
    created_at: datetime


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str