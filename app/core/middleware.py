import time

from fastapi import Request

from app.core.logger import logger


async def log_requests(request: Request, call_next):
    start = time.time()

    response = await call_next(request)

    duration = time.time() - start

    logger.info(
        "%s %s | %d | %.3fs",
        request.method,
        request.url.path,
        response.status_code,
        duration,
    )

    return response
