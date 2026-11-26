from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import datetime


_PROTECTED = ConfigDict(protected_namespaces=(), from_attributes=True)


class PriceRange(BaseModel):
    min: float
    max: float


class PredictionResponse(BaseModel):
    model_config = _PROTECTED

    id: int
    vehicle_type: str
    country: str
    brand: str
    model: str
    manufacturing_year: int
    original_currency: str
    predicted_price: float
    price_range: Optional[PriceRange] = None
    model_version: str
    limitations: Optional[str] = None
    factors: Optional[List[str]] = None
    created_at: datetime


class HistoryItem(BaseModel):
    model_config = _PROTECTED

    id: int
    vehicle_type: str
    country: str
    brand: str
    model: str
    manufacturing_year: int
    mileage: Optional[float] = None
    fuel_type: Optional[str] = None
    transmission: Optional[str] = None
    original_currency: str
    predicted_price: float
    model_version: str
    created_at: datetime


class HistoryList(BaseModel):
    items: List[HistoryItem]
    total: int


class CompareItem(BaseModel):
    model_config = _PROTECTED

    id: Optional[int] = None
    vehicle_type: str
    country: str
    brand: str
    model: str
    manufacturing_year: int
    mileage: Optional[float] = None
    fuel_type: Optional[str] = None
    transmission: Optional[str] = None
    original_currency: str
    predicted_price: float
    fx_to_usd: Optional[float] = 1.0


class CompareRequest(BaseModel):
    items: List[CompareItem]


class CompareResponse(BaseModel):
    items: List[CompareItem]
    differences_usd: Dict[str, Any]


class AnalyticsOverview(BaseModel):
    total_predictions: int
    new_count: int
    used_count: int
    avg_predicted_price: Optional[float]
    countries_supported: int
    brands_supported: int
    latest_prediction_at: Optional[datetime]


class CountryStat(BaseModel):
    country: str
    count: int
    avg_price: Optional[float]
    currency: Optional[str]


class BrandStat(BaseModel):
    brand: str
    count: int
    avg_price: Optional[float]


class TrendPoint(BaseModel):
    label: str
    count: int
    avg_price: Optional[float]


class ModelMetric(BaseModel):
    model_config = _PROTECTED

    id: int
    model_name: str
    model_version: str
    mae: Optional[float]
    rmse: Optional[float]
    r2_score: Optional[float]
    mape: Optional[float]
    training_date: datetime
    is_active: int


class ModelInfo(BaseModel):
    active_model: Optional[ModelMetric]
    available_models: List[ModelMetric]
    note: str