from pydantic import BaseModel, Field


class VaultInitializeRequest(BaseModel):
    vault_key: str = Field(
        min_length=8,
        max_length=128,
    )


class VaultInitializeResponse(BaseModel):
    message: str
