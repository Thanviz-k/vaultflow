from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies.auth import get_current_owner
from app.models.owner import Owner
from app.schemas.audit import AuditLogResponse
from app.services.audit_log_service import get_audit_logs

router = APIRouter(
    prefix="/audit",
    tags=["Audit"],
)


@router.get(
    "/",
    summary="Get Audit Logs",
    description="Retrieve the audit history of all secret operations performed by the authenticated user.",
    response_model=list[AuditLogResponse],
)
def list_audit_logs(
    db: Session = Depends(get_db),
    owner: Owner = Depends(get_current_owner),
):
    return get_audit_logs(
        db=db,
        owner_id=owner.id,
    )

