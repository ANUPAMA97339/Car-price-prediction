from pydantic import BaseModel, Field, field_validator
from typing import Optional
from datetime import datetime, timezone

CURRENT_YEAR = datetime.now(timezone.utc).year


class VehicleBase(BaseModel):
    country: str = Field(..., min_length=2, max_length=64)
    brand: str = Field(..., min_length=1, max_length=64)
    model: str = Field(..., min_length=1, max_length=64)
    manufacturing_year: int = Field(..., ge=1950, le=CURRENT_YEAR + 1)
    fuel_type: Optional[str] = Field(None, max_length=32)
    transmission: Optional[str] = Field(None, max_length=32)
    engine_capacity: Optional[float] = Field(None, gt=0, le=10000)
    currency: str = Field(..., min_length=3, max_length=3)

    @field_validator("currency")
    @classmethod
    def _upper_currency(cls, v: str) -> str:
        v = v.upper()
        if v not in {"INR", "USD", "EUR", "GBP"}:
            raise ValueError("Unsupported currency")
        return v


class NewCarInput(VehicleBase):
    body_type: Optional[str] = Field(None, max_length=32)
    engine_power: Optional[float] = Field(None, gt=0, le=2000)
    vehicle_condition: Optional[str] = Field(None, max_length=32)


class UsedCarInput(VehicleBase):
    mileage: float = Field(..., ge=0, le=1_500_000)
    owner_count: Optional[int] = Field(None, ge=0, le=20)
    accident_history: Optional[str] = Field(None, max_length=32)
    vehicle_condition: Optional[str] = Field(None, max_length=32)