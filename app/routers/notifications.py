from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.core.database import get_db
from app.models.notification import Notification
from app.models.owner import Owner
from app.schemas.notification import NotificationOut, NotificationSummary
from app.dependencies.auth import get_current_owner

router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.get("/", response_model=NotificationSummary)
def get_notifications(
    db: Session = Depends(get_db),
    current_owner: Owner = Depends(get_current_owner),
    limit: int = 20,
):
    notifications = (
        db.query(Notification)
        .filter(Notification.owner_id == current_owner.id)
        .order_by(Notification.created_at.desc())
        .limit(limit)
        .all()
    )
    unread_count = (
        db.query(func.count(Notification.id))
        .filter(
            Notification.owner_id == current_owner.id,
            Notification.is_read == False,
        )
        .scalar()
    )
    return {"unread_count": unread_count, "notifications": notifications}


@router.patch("/{notification_id}/read")
def mark_as_read(
    notification_id: str,
    db: Session = Depends(get_db),
    current_owner: Owner = Depends(get_current_owner),
):
    notif = (
        db.query(Notification)
        .filter(
            Notification.id == notification_id,
            Notification.owner_id == current_owner.id,
        )
        .first()
    )
    if notif:
        notif.is_read = True
        db.commit()
    return {"success": True}


@router.patch("/read-all")
def mark_all_read(
    db: Session = Depends(get_db),
    current_owner: Owner = Depends(get_current_owner),
):
    db.query(Notification).filter(
        Notification.owner_id == current_owner.id,
        Notification.is_read == False,
    ).update({"is_read": True})
    db.commit()
    return {"success": True}
