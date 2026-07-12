import time
import uuid
from typing import Callable
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
import structlog

logger = structlog.get_logger()

class LoggingMiddleware(BaseHTTPMiddleware):
    """Middleware to log requests, responses, and execution times."""
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        # Generate a correlation ID for tracing the request
        request_id = str(uuid.uuid4())
        
        # Bind the request ID to the structlog context
        structlog.contextvars.bind_contextvars(
            request_id=request_id,
            method=request.method,
            path=request.url.path,
            client_ip=request.client.host if request.client else "unknown"
        )
        
        start_time = time.time()
        
        try:
            response = await call_next(request)
            
            process_time = time.time() - start_time
            response.headers["X-Request-ID"] = request_id
            response.headers["X-Process-Time"] = str(process_time)
            
            logger.info(
                "request_completed",
                status_code=response.status_code,
                duration_s=round(process_time, 4)
            )
            
            return response
            
        except Exception as e:
            process_time = time.time() - start_time
            logger.exception(
                "request_failed",
                error=str(e),
                duration_s=round(process_time, 4)
            )
            raise
        finally:
            structlog.contextvars.clear_contextvars()
