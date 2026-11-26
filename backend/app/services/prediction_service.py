"""
Real ML inference. Loads the best saved pipeline per (vehicle_type, currency) split.
"""
from __future__ import annotations

import logging
from typing import Optional
from sqlalchemy.orm import Session

from app.ml.predict import get_bundle
from app.models.database_models import ModelVersion
from app.services.history_service import create_prediction

logger = logging.getLogger(__name__)


class ModelNotAvailable(Exception):
    """No trained model for the requested (vehicle_type, currency) combination."""


def get_active_model(db: Session) -> Optional[ModelVersion]:
    return db.query(ModelVersion).filter(ModelVersion.is_active == 1).first()


def _split_name(vehicle_type: str, currency: str) -> str:
    return f"{vehicle_type}_{currency.lower()}"


def _build_features(payload: dict, vehicle_type: str) -> dict:
    from datetime import datetime, timezone
    year = int(payload["manufacturing_year"])
    current_year = datetime.now(timezone.utc).year
    return {
        "manufacturing_year": year,
        "vehicle_age": max(0, current_year - year),
        "mileage": payload.get("mileage"),
        "engine_capacity": payload.get("engine_capacity"),
        "brand": payload.get("brand", "Unknown"),
        "country": payload.get("country", "Unknown"),
        "fuel_type": payload.get("fuel_type") or "Unknown",
        "transmission": payload.get("transmission") or "Unknown",
        "vehicle_condition": payload.get("vehicle_condition") or "Unknown",
    }


def _predict(db: Session, payload: dict, vehicle_type: str) -> dict:
    split = _split_name(vehicle_type, payload["currency"])
    bundle = get_bundle(split)
    if bundle is None:
        raise ModelNotAvailable(
            f"No trained model for {vehicle_type} cars in {payload['currency']}. "
            f"Available splits: new_inr, used_inr, used_usd."
        )

    features = _build_features(payload, vehicle_type)
    result = bundle.predict_price(features)

    limitations = (
        "Prediction is an estimate based on real training data. "
        "Actual market prices may vary. "
        f"Model R² = {result['r2']:.3f}, MAE = {result['mae']:.0f} {payload['currency']}."
    )

    record_payload = {
        "vehicle_type": vehicle_type,
        "country": payload["country"],
        "brand": payload["brand"],
        "model": payload["model"],
        "manufacturing_year": int(payload["manufacturing_year"]),
        "mileage": payload.get("mileage"),
        "fuel_type": payload.get("fuel_type"),
        "transmission": payload.get("transmission"),
        "engine_capacity": payload.get("engine_capacity"),
        "owner_count": payload.get("owner_count"),
        "accident_history": payload.get("accident_history"),
        "vehicle_condition": payload.get("vehicle_condition"),
        "body_type": payload.get("body_type"),
        "original_currency": payload["currency"],
        "predicted_price": result["predicted_price"],
        "price_min": result["price_min"],
        "price_max": result["price_max"],
        "model_version": result["model_version"],
        "notes": limitations,
    }

    record = create_prediction(db, record_payload)

    return {
        "id": record.id,
        "vehicle_type": vehicle_type,
        "country": record.country,
        "brand": record.brand,
        "model": record.model,
        "manufacturing_year": record.manufacturing_year,
        "original_currency": record.original_currency,
        "predicted_price": record.predicted_price,
        "price_min": record.price_min,
        "price_max": record.price_max,
        "model_version": record.model_version,
        "notes": record.notes,
        "created_at": record.created_at,
    }


def predict_new(db: Session, payload: dict) -> dict:
    return _predict(db, payload, "new")


def predict_used(db: Session, payload: dict) -> dict:
    return _predict(db, payload, "used")


def format_limitations() -> str:
    return (
        "Prediction is an estimate based on available training data. "
        "Actual market prices may differ."
    )