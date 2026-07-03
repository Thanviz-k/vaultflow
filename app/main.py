from fastapi import FastAPI
from app.routers import secrets

app = FastAPI(title="VaultFlow", version="0.1.0")

app.include_router(secrets.router)


@app.get("/")
def health_check():
    return {"status": "VaultFlow is running"}