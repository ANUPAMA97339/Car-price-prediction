from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging

from app.core.config import settings
from app.core.logging import configure_logging
from app.database.init_db import init_db
from app.database.session import SessionLocal
from app.services.currency_service import seed_default_rates
from app.api.router import api_router

configure_logging()
log = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    log.info("Initialising database…")
    init_db()
    with SessionLocal() as db:
        seed_default_rates(db)
    log.info("Startup complete.")
    yield
    log.info("Shutdown.")


app = FastAPI(
    title=settings.APP_NAME,
    version="1.0.0",
    description="AI-powered global car price prediction API.",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    log.exception("Unhandled error on %s", request.url.path)
    return JSONResponse(status_code=500, content={"detail": "Internal server error"})


app.include_router(api_router, prefix="/api")


@app.get("/")
def root():
    return {"message": "Global Car Price Prediction AI API", "docs": "/docs", "version": "1.0.0"}