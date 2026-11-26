from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.database.session import get_db
from app.models.database_models import ModelVersion
from app.schemas.prediction import ModelInfo, ModelMetric

router = APIRouter(prefix="/model", tags=["Model"])


@router.get("/performance", response_model=ModelInfo)
def performance(db: Session = Depends(get_db)):
    rows = db.query(ModelVersion).order_by(desc(ModelVersion.training_date)).all()
    active = next((r for r in rows if r.is_active == 1), None)
    return ModelInfo(
        active_model=ModelMetric.model_validate(active) if active else None,
        available_models=[ModelMetric.model_validate(r) for r in rows],
        note=(
            "Metrics reflect real training results only. "
            "Empty list means no model has been trained yet."
        ),
    )


@router.get("/information", response_model=ModelInfo)
def information(db: Session = Depends(get_db)):
    return performance(db)