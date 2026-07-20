from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, Field, field_validator
from pydantic import ConfigDict


class SecretCreateRequest(BaseModel):
    name: str = Field(
        min_length=3,
        max_length=100,
    )

    value: str = Field(
        min_length=1,
        max_length=5000,
    )

    vault_key: str = Field(
        min_length=8,
        max_length=128,
    )

    expires_in_days: int | None = Field(
        default=30,
        ge=1,
        le=3650,
    )

    @field_validator("name")
    @classmethod
    def validate_name(cls, value: str):
        value = value.strip()

        if not value:
            raise ValueError("Secret name cannot be empty.")

        return value


class SecretCreateResponse(BaseModel):
    id: str
    message: str
    name: str
    expires_at: datetime | None


class SecretListItem(BaseModel):
    id: UUID
    name: str
    status: str
    created_at: datetime
    expires_at: datetime | None
    last_accessed_at: datetime | None

    model_config = ConfigDict(from_attributes=True)


class SecretRevealRequest(BaseModel):
    secret_id: UUID
    vault_key: str = Field(
        min_length=8,
        max_length=128,
    )


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
    question: str = Field(
        min_length=3,
        max_length=1000,
    )


class QueryResponse(BaseModel):
    intent: dict
    result: dict


class SummaryResponse(BaseModel):
    summary: str


class SecretDeleteResponse(BaseModel):
    id: UUID
    message: str
