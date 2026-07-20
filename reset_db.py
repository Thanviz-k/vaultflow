from app.core.database import Base, engine

print("DATABASE:", engine.url)
print("TABLES:", list(Base.metadata.tables.keys()))

Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)

print("Done")
