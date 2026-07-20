from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies.auth import get_current_owner

from app.models.audit_log import AuditLog


from app.models.owner import Owner
from app.models.secret import Secret
from app.schemas.audit import AuditResponse

router = APIRouter(
    prefix="/audit",
    tags=["Audit"],
)


@router.get(
    "/",
    response_model=list[AuditResponse],
)
def get_audit_logs(
    db: Session = Depends(get_db),
    current_owner: Owner = Depends(get_current_owner),
):

    logs = (
        db.query(AuditLog)
        .join(Secret)
        .filter(Secret.owner_id == current_owner.id)
        .order_by(AuditLog.timestamp.desc())
        .all()
    )

    return logs
