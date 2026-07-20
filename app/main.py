import asyncio
from contextlib import asynccontextmanager
from app.core.config import settings

from app.routers import (
    auth,
    owners,
    users,
    vault,
    secrets,
    audit,
)
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import SessionLocal
from app.services.decay_service import expire_overdue_secrets
from app.core.exceptions import VaultFlowException
from app.core.exception_handlers import (
    validation_exception_handler,
    vaultflow_exception_handler,
    generic_exception_handler,
)
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.exceptions import RequestValidationError
from app.core.exception_handlers import (
    request_validation_exception_handler,
)
from app.core.logger import logger
from app.core.middleware import log_requests
from fastapi.middleware.gzip import GZipMiddleware

from app.core.security_headers import add_security_headers


# Background worker that runs continuously
async def run_decay_loop():
    while True:
        logger.info("Decay worker: checking expired secrets")

        # Create a database session
        db = SessionLocal()

        try:
            # Expire overdue secrets
            count = expire_overdue_secrets(db)

            logger.info(
                "Decay worker expired %s secret(s)",
                count,
            )

        except Exception:
            # Rollback if an error occurs
            db.rollback()
            logger.exception("Decay worker failed")

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
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Register API routers
app.include_router(auth.router)
app.include_router(owners.router)
app.include_router(vault.router)
app.include_router(secrets.router)
app.include_router(users.router)
app.include_router(audit.router)
app.add_exception_handler(
    VaultFlowException,
    vaultflow_exception_handler,
)

app.add_exception_handler(
    Exception,
    generic_exception_handler,
)


# Health check endpoint
@app.get("/health")
def health():
    return {"status": "VaultFlow is running"}


app.add_exception_handler(
    RequestValidationError,
    request_validation_exception_handler,
)

app.middleware("http")(log_requests)

app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["*"],
)
app.add_middleware(
    GZipMiddleware,
    minimum_size=1000,
)

app.middleware("http")(add_security_headers)

app.add_exception_handler(
    RequestValidationError,
    validation_exception_handler,
)
