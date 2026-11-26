from typing import Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.models.database_models import Prediction


def create_prediction(db: Session, payload: dict) -> Prediction:
    rec = Prediction(**payload)
    db.add(rec)
    db.commit()
    db.refresh(rec)
    return rec


def get_prediction(db: Session, prediction_id: int) -> Optional[Prediction]:
    return db.query(Prediction).filter(Prediction.id == prediction_id).first()


def list_predictions(
    db: Session,
    search: Optional[str] = None,
    country: Optional[str] = None,
    vehicle_type: Optional[str] = None,
    limit: int = 100,
    offset: int = 0,
) -> tuple[List[Prediction], int]:
    q = db.query(Prediction)
    if search:
        like = f"%{search.lower()}%"
        q = q.filter(
            (Prediction.brand.ilike(like)) | (Prediction.model.ilike(like))
        )
    if country:
        q = q.filter(Prediction.country == country)
    if vehicle_type in ("new", "used"):
        q = q.filter(Prediction.vehicle_type == vehicle_type)
    total = q.count()
    items = q.order_by(desc(Prediction.created_at)).offset(offset).limit(limit).all()
    return items, total


def delete_prediction(db: Session, prediction_id: int) -> bool:
    rec = get_prediction(db, prediction_id)
    if not rec:
        return False
    db.delete(rec)
    db.commit()
    return True


def clear_all(db: Session) -> int:
    n = db.query(Prediction).delete()
    db.commit()
    return n