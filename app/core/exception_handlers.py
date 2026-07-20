from fastapi import Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from app.core.exceptions import VaultFlowException


async def vaultflow_exception_handler(
    request: Request,
    exc: VaultFlowException,
):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error": exc.message,
            "path": str(request.url.path),
        },
    )


async def request_validation_exception_handler(
    request: Request,
    exc: RequestValidationError,
):
    return JSONResponse(
        status_code=422,
        content={
            "success": False,
            "error": "Validation failed",
            "details": exc.errors(),
        },
    )


async def generic_exception_handler(
    request: Request,
    exc: Exception,
):
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": "Internal Server Error",
            "path": str(request.url.path),
        },
    )


async def validation_exception_handler(
    request,
    exc: RequestValidationError,
):
    return JSONResponse(
        status_code=422,
        content={
            "error": "Validation Error",
            "details": exc.errors(),
        },
    )
