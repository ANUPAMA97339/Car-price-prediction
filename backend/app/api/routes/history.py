from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.schemas.prediction import HistoryList, HistoryItem
from app.schemas.common import MessageResponse
from app.services import history_service

router = APIRouter(prefix="/history", tags=["History"])


@router.get("", response_model=HistoryList)
def list_history(
    search: Optional[str] = Query(None),
    country: Optional[str] = Query(None),
    vehicle_type: Optional[str] = Query(None, pattern="^(new|used)$"),
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
):
    items, total = history_service.list_predictions(
        db, search=search, country=country, vehicle_type=vehicle_type,
        limit=limit, offset=offset,
    )
    return HistoryList(items=[HistoryItem.model_validate(i) for i in items], total=total)


@router.delete("/{prediction_id}", response_model=MessageResponse)
def delete_one(prediction_id: int, db: Session = Depends(get_db)):
    ok = history_service.delete_prediction(db, prediction_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Prediction not found")
    return MessageResponse(message="Prediction deleted")


@router.delete("", response_model=MessageResponse)
def clear_history(db: Session = Depends(get_db)):
    n = history_service.clear_all(db)
    return MessageResponse(message=f"Cleared {n} prediction(s)")