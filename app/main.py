import asyncio
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import secrets, owners, auth
from app.core.database import SessionLocal
from app.services.decay_service import expire_overdue_secrets


# Background worker that runs continuously
async def run_decay_loop():
    while True:
        print("[decay worker] tick - checking now")

        # Create a database session
        db = SessionLocal()

        try:
            # Expire overdue secrets
            count = expire_overdue_secrets(db)

            print(
                f"[decay worker] checked, "
                f"expired {count} secret(s)"
            )

        except Exception as e:
            # Rollback if an error occurs
            db.rollback()
            print(f"[decay worker] ERROR: {e}")

        finally:
            # Close the database session
            db.close()

        # Wait for 60 seconds before checking again
        await asyncio.sleep(60)


# Runs automatically when FastAPI starts and stops
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Start the background worker
    task = asyncio.create_task(run_decay_loop())

    yield

    # Stop the background worker on shutdown
    task.cancel()


# Create FastAPI application
app = FastAPI(
    title="VaultFlow",
    version="0.1.0",
    lifespan=lifespan,
)


# Enable CORS for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Register API routers
app.include_router(secrets.router)
app.include_router(owners.router)
app.include_router(auth.router)


# Health check endpoint
@app.get("/")
def health_check():
    return {
        "status": "VaultFlow is running"
    }