from pydantic import BaseModel
from datetime import datetime
from uuid import UUID







class SecretCreateResponse(BaseModel):
    id: UUID
    name: str
    client_half: str
    expires_at: datetime | None


class SecretVerifyRequest(BaseModel):
    secret_id: UUID
    client_half: str


class SecretVerifyResponse(BaseModel):
    valid: bool
    status: str


class QueryRequest(BaseModel):
    question: str


class QueryResponse(BaseModel):
    intent: dict
    result: dict

class SummaryResponse(BaseModel):
    summary: str

class SecretRevokeRequest(BaseModel):
    secret_id: UUID


class SecretRevokeResponse(BaseModel):
    id: UUID
    status: str

class SecretCreateRequest(BaseModel):
    name: str
    value: str
    expires_in_days: int | None = 30

class SecretListItem(BaseModel):
    id: UUID
    name: str
    status: str
    created_at: datetime
    expires_at: datetime | None
    last_accessed_at: datetime | None

class SecretRevealRequest(BaseModel):
    secret_id: UUID
    client_half: str


class SecretRevealResponse(BaseModel):
    id: UUID
    name: str
    value: str