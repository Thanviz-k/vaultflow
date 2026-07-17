from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class SecretCreateRequest(BaseModel):
    name: str
    value: str

    # Required to encrypt the secret
    vault_key: str

    expires_in_days: int | None = 30


class SecretCreateResponse(BaseModel):
    id: UUID
    name: str
    expires_at: datetime | None


class SecretListItem(BaseModel):
    id: UUID
    name: str
    status: str
    created_at: datetime
    expires_at: datetime | None
    last_accessed_at: datetime | None

    class Config:
        from_attributes = True


class SecretRevealRequest(BaseModel):
    secret_id: UUID

    # Required to decrypt this secret
    vault_key: str


class SecretRevealResponse(BaseModel):
    id: UUID
    name: str
    value: str


class SecretRevokeRequest(BaseModel):
    secret_id: UUID


class SecretRevokeResponse(BaseModel):
    id: UUID
    status: str


class QueryRequest(BaseModel):
    question: str


class QueryResponse(BaseModel):
    intent: dict
    result: dict


class SummaryResponse(BaseModel):
    summary: str