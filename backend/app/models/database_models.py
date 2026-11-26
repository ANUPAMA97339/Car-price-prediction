from datetime import datetime, timezone
from sqlalchemy import (
    Column, Integer, String, Float, DateTime, Index, UniqueConstraint, Text,
)
from app.database.connection import Base


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


class Prediction(Base):
    __tablename__ = "predictions"
    __table_args__ = (
        Index("ix_predictions_country_brand", "country", "brand"),
        Index("ix_predictions_created_at", "created_at"),
        Index("ix_predictions_vehicle_type", "vehicle_type"),
    )

    id = Column(Integer, primary_key=True, index=True)
    vehicle_type = Column(String(10), nullable=False)
    country = Column(String(64), nullable=False)
    brand = Column(String(64), nullable=False)
    model = Column(String(64), nullable=False)
    manufacturing_year = Column(Integer, nullable=False)
    mileage = Column(Float, nullable=True)
    fuel_type = Column(String(32), nullable=True)
    transmission = Column(String(32), nullable=True)
    engine_capacity = Column(Float, nullable=True)
    owner_count = Column(Integer, nullable=True)
    accident_history = Column(String(32), nullable=True)
    vehicle_condition = Column(String(32), nullable=True)
    body_type = Column(String(32), nullable=True)
    original_currency = Column(String(8), nullable=False)
    predicted_price = Column(Float, nullable=False)
    price_min = Column(Float, nullable=True)
    price_max = Column(Float, nullable=True)
    model_version = Column(String(64), nullable=False, default="unavailable")
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=_utcnow, nullable=False)


class Dataset(Base):
    __tablename__ = "datasets"
    __table_args__ = (UniqueConstraint("dataset_name", name="uq_dataset_name"),)

    id = Column(Integer, primary_key=True, index=True)
    dataset_name = Column(String(128), nullable=False)
    source = Column(String(256), nullable=False)
    country = Column(String(64), nullable=True)
    vehicle_type = Column(String(16), nullable=True)
    record_count = Column(Integer, default=0)
    license_information = Column(String(256), nullable=True)
    imported_at = Column(DateTime(timezone=True), default=_utcnow, nullable=False)


class ModelVersion(Base):
    __tablename__ = "model_versions"
    __table_args__ = (UniqueConstraint("model_name", "model_version", name="uq_model_version"),)

    id = Column(Integer, primary_key=True, index=True)
    model_name = Column(String(64), nullable=False)
    model_version = Column(String(64), nullable=False)
    mae = Column(Float, nullable=True)
    rmse = Column(Float, nullable=True)
    r2_score = Column(Float, nullable=True)
    mape = Column(Float, nullable=True)
    training_date = Column(DateTime(timezone=True), default=_utcnow, nullable=False)
    dataset_version = Column(String(64), nullable=True)
    is_active = Column(Integer, default=0)


class CurrencyRate(Base):
    __tablename__ = "currency_rates"
    __table_args__ = (
        UniqueConstraint("base_currency", "target_currency", "rate_date", name="uq_rate"),
    )

    id = Column(Integer, primary_key=True, index=True)
    base_currency = Column(String(8), nullable=False)
    target_currency = Column(String(8), nullable=False)
    exchange_rate = Column(Float, nullable=False)
    rate_date = Column(DateTime(timezone=True), default=_utcnow, nullable=False)
    source = Column(String(128), nullable=True)