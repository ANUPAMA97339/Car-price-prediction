from fastapi import APIRouter
from app.core.config import settings
from app.schemas.common import HealthResponse

router = APIRouter(tags=["Health"])


@router.get("/health", response_model=HealthResponse)
def health():
    return HealthResponse(status="ok", app_name=settings.APP_NAME, env=settings.APP_ENV)