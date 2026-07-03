from pydantic import BaseModel
from datetime import datetime
from uuid import UUID


class SecretCreateRequest(BaseModel):
    name: str
    owner_id: UUID
    expires_in_days: int = 30


class SecretCreateResponse(BaseModel):
    id: UUID
    name: str
    client_half: str
    expires_at: datetime


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

