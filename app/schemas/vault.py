
from typing import Literal
from pydantic import BaseModel

class VaultInitializeRequest(BaseModel):
    mode: Literal["generated", "custom"]
    vault_key: str | None = None


class VaultInitializeResponse(BaseModel):
    generated_vault_key: str | None = None
    message: str


class VaultResetRequest(BaseModel):
    vault_key: str


class VaultStatusResponse(BaseModel):
    initialized: bool