from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from app.models.database_models import Prediction
from app.schemas.prediction import (
    AnalyticsOverview, CountryStat, BrandStat, TrendPoint,
)


def overview(db: Session) -> AnalyticsOverview:
    total = db.query(func.count(Prediction.id)).scalar() or 0
    new_count = db.query(func.count(Prediction.id)).filter(Prediction.vehicle_type == "new").scalar() or 0
    used_count = db.query(func.count(Prediction.id)).filter(Prediction.vehicle_type == "used").scalar() or 0
    avg_price = db.query(func.avg(Prediction.predicted_price)).scalar()
    countries = db.query(func.count(func.distinct(Prediction.country))).scalar() or 0
    brands = db.query(func.count(func.distinct(Prediction.brand))).scalar() or 0
    latest = db.query(func.max(Prediction.created_at)).scalar()
    return AnalyticsOverview(
        total_predictions=total,
        new_count=new_count,
        used_count=used_count,
        avg_predicted_price=float(avg_price) if avg_price is not None else None,
        countries_supported=countries,
        brands_supported=brands,
        latest_prediction_at=latest,
    )


def countries(db: Session) -> List[CountryStat]:
    rows = (
        db.query(
            Prediction.country,
            func.count(Prediction.id),
            func.avg(Prediction.predicted_price),
            func.min(Prediction.original_currency),
        )
        .group_by(Prediction.country)
        .order_by(desc(func.count(Prediction.id)))
        .all()
    )
    return [
        CountryStat(
            country=r[0],
            count=r[1],
            avg_price=float(r[2]) if r[2] is not None else None,
            currency=r[3],
        )
        for r in rows
    ]


def brands(db: Session) -> List[BrandStat]:
    rows = (
        db.query(
            Prediction.brand,
            func.count(Prediction.id),
            func.avg(Prediction.predicted_price),
        )
        .group_by(Prediction.brand)
        .order_by(desc(func.count(Prediction.id)))
        .limit(20)
        .all()
    )
    return [
        BrandStat(
            brand=r[0],
            count=r[1],
            avg_price=float(r[2]) if r[2] is not None else None,
        )
        for r in rows
    ]


def trends(db: Session) -> List[TrendPoint]:
    rows = (
        db.query(
            func.strftime("%Y-%m", Prediction.created_at).label("month"),
            func.count(Prediction.id),
            func.avg(Prediction.predicted_price),
        )
        .group_by("month")
        .order_by("month")
        .all()
    )
    return [
        TrendPoint(
            label=r[0] or "unknown",
            count=r[1],
            avg_price=float(r[2]) if r[2] is not None else None,
        )
        for r in rows
    ]