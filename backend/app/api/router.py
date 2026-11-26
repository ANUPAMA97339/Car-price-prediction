from fastapi import APIRouter
from app.api.routes import (
    health, prediction, history, analytics, comparison, model, reports, forecast,
)

api_router = APIRouter()
api_router.include_router(health.router)
api_router.include_router(prediction.router)
api_router.include_router(history.router)
api_router.include_router(analytics.router)
api_router.include_router(comparison.router)
api_router.include_router(model.router)
api_router.include_router(reports.router)
api_router.include_router(forecast.router)