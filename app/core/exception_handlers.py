from fastapi import Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from app.core.exceptions import VaultFlowException


def _safe_errors(exc: RequestValidationError):
    """
    Pydantic v2 puts the raw exception object (e.g. a ValueError raised
    inside a @field_validator) into each error's 'ctx' dict. That object
    isn't JSON-serializable, so we stringify it before returning.
    """

    safe = []

    for err in exc.errors():
        err = dict(err)

        ctx = err.get("ctx")
        if isinstance(ctx, dict):
            err["ctx"] = {
                key: (str(value) if isinstance(value, BaseException) else value)
                for key, value in ctx.items()
            }

        safe.append(err)

    return safe


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
            "details": _safe_errors(exc),
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
            "details": _safe_errors(exc),
        },
    )