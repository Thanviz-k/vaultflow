import asyncio
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import secrets, owners,auth
from app.core.database import SessionLocal
from app.services.decay_service import expire_overdue_secrets


async def run_decay_loop():
    while True:
        print("[decay worker] tick - checking now")

        db = SessionLocal()

        try:
            count = expire_overdue_secrets(db)
            print(
                f"[decay worker] checked, "
                f"expired {count} secret(s)"
            )
        except Exception as e:
            db.rollback()
            print(f"[decay worker] ERROR: {e}")
        finally:
            db.close()

        await asyncio.sleep(60)


@asynccontextmanager
async def lifespan(app: FastAPI):
    task = asyncio.create_task(run_decay_loop())

    yield

    task.cancel()


app = FastAPI(
    title="VaultFlow",
    version="0.1.0",
    lifespan=lifespan,
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(secrets.router)
app.include_router(owners.router)
app.include_router(auth.router)


@app.get("/")
def health_check():
    return {"status": "VaultFlow is running"}