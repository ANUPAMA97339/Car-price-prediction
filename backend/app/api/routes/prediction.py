from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.schemas.vehicle import NewCarInput, UsedCarInput
from app.schemas.prediction import PredictionResponse, PriceRange
from app.services import prediction_service, history_service

router = APIRouter(prefix="/predictions", tags=["Predictions"])


def _to_response(r) -> PredictionResponse:
    return PredictionResponse(
        id=r.id,
        vehicle_type=r.vehicle_type,
        country=r.country,
        brand=r.brand,
        model=r.model,
        manufacturing_year=r.manufacturing_year,
        original_currency=r.original_currency,
        predicted_price=r.predicted_price,
        price_range=PriceRange(min=r.price_min, max=r.price_max)
        if r.price_min is not None and r.price_max is not None else None,
        model_version=r.model_version,
        limitations=r.notes,
        created_at=r.created_at,
    )


@router.post("/new", response_model=PredictionResponse, status_code=status.HTTP_201_CREATED)
def predict_new(payload: NewCarInput, db: Session = Depends(get_db)):
    try:
        result = prediction_service.predict_new(db, payload.model_dump())
    except prediction_service.ModelNotAvailable as e:
        raise HTTPException(status_code=503, detail=str(e))
    record = history_service.get_prediction(db, result["id"])
    return _to_response(record)


@router.post("/used", response_model=PredictionResponse, status_code=status.HTTP_201_CREATED)
def predict_used(payload: UsedCarInput, db: Session = Depends(get_db)):
    try:
        result = prediction_service.predict_used(db, payload.model_dump())
    except prediction_service.ModelNotAvailable as e:
        raise HTTPException(status_code=503, detail=str(e))
    record = history_service.get_prediction(db, result["id"])
    return _to_response(record)


@router.get("/{prediction_id}", response_model=PredictionResponse)
def get_prediction(prediction_id: int, db: Session = Depends(get_db)):
    record = history_service.get_prediction(db, prediction_id)
    if not record:
        raise HTTPException(status_code=404, detail="Prediction not found")
    return _to_response(record)