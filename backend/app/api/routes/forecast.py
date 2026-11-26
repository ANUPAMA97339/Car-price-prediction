from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from app.database.session import get_db
from app.services.forecast_service import predict_future_prices

router = APIRouter(prefix="/forecast", tags=["Forecast"])

class ForecastRequest(BaseModel):
    country: str
    brand: str
    model: str
    manufacturing_year: int
    mileage: Optional[float] = None
    fuel_type: Optional[str] = None
    transmission: Optional[str] = None
    engine_capacity: Optional[float] = None
    currency: str
    vehicle_type: str = "used"

@router.post("/predict")
def get_forecast(payload: ForecastRequest, db: Session = Depends(get_db)):
    try:
        return predict_future_prices(db, payload.model_dump())
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))