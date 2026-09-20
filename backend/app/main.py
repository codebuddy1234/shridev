"""ShriDev API application."""

from __future__ import annotations

import logging
import time
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import text
from sqlalchemy.exc import IntegrityError, SQLAlchemyError

from app.config import settings
from app.database import engine
from app.routers import admin, auth, enquiries, posts, projects, team

logging.basicConfig(
    level=logging.DEBUG if settings.DEBUG else logging.INFO,
    format="%(asctime)s %(levelname)-8s %(name)s | %(message)s",
)
logger = logging.getLogger("shridev")


@asynccontextmanager
async def lifespan(_app: FastAPI) -> AsyncIterator[None]:
    """Verify the database is reachable at boot.

    Failing here surfaces a misconfigured DATABASE_URL in the deploy logs
    rather than as a 500 on the first visitor's request.
    """
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
        logger.info("Database connection established.")
    except SQLAlchemyError as exc:
        logger.error("Database unreachable at startup: %s", exc)
        if settings.is_production:
            raise
    yield
    engine.dispose()


app = FastAPI(
    title=settings.APP_NAME,
    version="1.0.0",
    description=(
        "Backend for the ShriDev website: project enquiries, portfolio "
        "case studies, team profiles and insights articles."
    ),
    lifespan=lifespan,
    # The interactive docs expose every schema and endpoint. Useful in
    # development, unnecessary surface area in production.
    docs_url=None if settings.is_production else "/docs",
    redoc_url=None if settings.is_production else "/redoc",
    openapi_url=None if settings.is_production else "/openapi.json",
)

# ---------------------------------------------------------------------------
# Middleware
# ---------------------------------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    # An explicit origin list, never "*" — credentials are sent with admin
    # requests and a wildcard would make them readable from any site.
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
    max_age=600,
)


@app.middleware("http")
async def security_and_timing(request: Request, call_next):
    """Attach baseline security headers and a server-timing header."""
    started = time.perf_counter()
    response = await call_next(request)
    elapsed_ms = (time.perf_counter() - started) * 1000

    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["X-Response-Time-Ms"] = f"{elapsed_ms:.1f}"
    if settings.is_production:
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"

    return response


# ---------------------------------------------------------------------------
# Error handling
# ---------------------------------------------------------------------------


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(
    _request: Request, exc: RequestValidationError
) -> JSONResponse:
    """Return field-level errors the frontend form can map onto inputs."""
    errors = [
        {
            # Drop the leading "body"/"query" segment so the path matches the
            # form field name the client knows about.
            "field": ".".join(str(part) for part in error["loc"][1:]) or "body",
            "message": error["msg"],
            "type": error["type"],
        }
        for error in exc.errors()
    ]
    return JSONResponse(
        # Starlette renamed its 422 constant; the numeric literal avoids a
        # deprecation warning while staying correct across versions.
        status_code=422,
        content={"detail": "Validation failed.", "errors": errors},
    )


@app.exception_handler(IntegrityError)
async def integrity_exception_handler(_request: Request, exc: IntegrityError) -> JSONResponse:
    """Turn a constraint violation into a 409 without leaking the SQL."""
    logger.warning("Database integrity error: %s", exc.orig)
    return JSONResponse(
        status_code=status.HTTP_409_CONFLICT,
        content={"detail": "That record conflicts with one that already exists."},
    )


@app.exception_handler(SQLAlchemyError)
async def sqlalchemy_exception_handler(_request: Request, exc: SQLAlchemyError) -> JSONResponse:
    """Log the detail server-side; return a generic message to the client."""
    logger.exception("Unhandled database error: %s", exc)
    return JSONResponse(
        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        content={"detail": "The service is temporarily unavailable. Please try again."},
    )


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

app.include_router(auth.router, prefix=settings.API_PREFIX)
app.include_router(enquiries.router, prefix=settings.API_PREFIX)
app.include_router(projects.router, prefix=settings.API_PREFIX)
app.include_router(team.router, prefix=settings.API_PREFIX)
app.include_router(posts.router, prefix=settings.API_PREFIX)
app.include_router(admin.router, prefix=settings.API_PREFIX)


@app.get("/health", tags=["system"], summary="Liveness and database check")
def health() -> dict[str, str]:
    """Used by the platform health check and by uptime monitoring."""
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
        database = "ok"
    except SQLAlchemyError:
        database = "unavailable"

    return {
        "status": "ok" if database == "ok" else "degraded",
        "service": settings.APP_NAME,
        "environment": settings.ENVIRONMENT,
        "database": database,
    }


@app.get("/", include_in_schema=False)
def root() -> dict[str, str]:
    return {"service": settings.APP_NAME, "docs": "/docs" if not settings.is_production else "disabled"}
