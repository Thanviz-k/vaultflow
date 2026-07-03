from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.services.audit_service import log_action

from app.core.database import get_db
from app.models.secret import Secret
from app.schemas.secret import (
    SecretCreateRequest,
    SecretCreateResponse,
    SecretVerifyRequest,
    SecretVerifyResponse,
)
from app.services.secret_service import create_secret
from app.services.crypto_service import decrypt_server_half
from app.services.key_service import verify_key
from app.schemas.secret import QueryRequest, QueryResponse
from app.services.query_service import run_natural_language_query
from app.schemas.secret import SummaryResponse
from app.services.summary_service import summarize_recent_activity

router = APIRouter(prefix="/secrets", tags=["secrets"])


@router.post("/", response_model=SecretCreateResponse)
def create_secret_endpoint(payload: SecretCreateRequest, db: Session = Depends(get_db)):
    result = create_secret(
        db,
        name=payload.name,
        owner_id=str(payload.owner_id),
        expires_in_days=payload.expires_in_days,
    )
    return result


@router.post("/verify", response_model=SecretVerifyResponse)
def verify_secret_endpoint(payload: SecretVerifyRequest, db: Session = Depends(get_db)):
    secret = db.query(Secret).filter(Secret.id == payload.secret_id).first()

    if not secret:
        raise HTTPException(status_code=404, detail="Secret not found")

    if secret.status != "active":
        return SecretVerifyResponse(valid=False, status=secret.status)

    decrypted_server_half = decrypt_server_half(db, secret.server_half)

    is_valid = verify_key(decrypted_server_half, payload.client_half, secret.key_hash)

    log_action(db, secret_id=secret.id, action="verified", metadata={"result": is_valid})

    return SecretVerifyResponse(valid=is_valid, status=secret.status)

@router.post("/query", response_model=QueryResponse)
def query_secrets_endpoint(payload: QueryRequest, db: Session = Depends(get_db)):
    result = run_natural_language_query(db, payload.question)
    return result

@router.get("/summary", response_model=SummaryResponse)
def get_summary_endpoint(days: int = 7, db: Session = Depends(get_db)):
    summary = summarize_recent_activity(db, days=days)
    return {"summary": summary}