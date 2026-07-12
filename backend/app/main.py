from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import structlog

from app.core.config import settings
from app.core.logging import setup_logging
from app.middleware.logging_middleware import LoggingMiddleware
from app.api.health import router as health_router
from app.api.vehicles import router as vehicles_router
from app.api.drivers import router as drivers_router

# Configure logging
setup_logging(debug=settings.debug)
logger = structlog.get_logger()

def create_app() -> FastAPI:
    """Create and configure the FastAPI application instance."""
    app = FastAPI(
        title=settings.app_name,
        description="TransitOps Fleet Management API",
        version="1.0.0",
        docs_url="/docs",
        redoc_url="/redoc",
    )

    # CORS configuration
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],  # In production, this should be restricted
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Custom Logging Middleware
    app.add_middleware(LoggingMiddleware)

    # Global Exception Handler
    @app.exception_handler(Exception)
    async def global_exception_handler(request: Request, exc: Exception):
        logger.exception("unhandled_exception", error=str(exc))
        return JSONResponse(
            status_code=500,
            content={"detail": "Internal Server Error"},
        )

    from app.api.auth import router as auth_router
    from app.api.users import router as users_router
    
    # Include routers
    app.include_router(health_router)
    app.include_router(vehicles_router)
    app.include_router(drivers_router)
    app.include_router(auth_router, prefix="/api/auth", tags=["auth"])
    app.include_router(users_router, prefix="/api/users", tags=["users"])
    @app.on_event("startup")
    async def on_startup():
        logger.info("application_startup", app_name=settings.app_name, debug=settings.debug)

    @app.on_event("shutdown")
    async def on_shutdown():
        logger.info("application_shutdown")

    return app

app = create_app()
