from app.core.database import Base, engine
from app.models import Owner, Secret, AuditLog

print("DATABASE:", engine.url)
print("TABLES:", list(Base.metadata.tables.keys()))

Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)

print("Done")