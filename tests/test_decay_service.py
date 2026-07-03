from datetime import datetime, timedelta, timezone
from freezegun import freeze_time

from app.core.database import SessionLocal
from app.models.owner import Owner
from app.services.secret_service import create_secret
from app.services.decay_service import expire_overdue_secrets


def test_secret_expires_after_expiry_date():
    db = SessionLocal()

    owner = Owner(name="Test Owner For Decay")
    db.add(owner)
    db.commit()
    db.refresh(owner)

    with freeze_time("2026-01-01"):
        result = create_secret(db, name="Decay Test Secret", owner_id=str(owner.id), expires_in_days=30)
        secret_id = result["id"]

    with freeze_time("2026-02-05"):
        expired_count = expire_overdue_secrets(db)

    db.close()

    assert expired_count >= 1