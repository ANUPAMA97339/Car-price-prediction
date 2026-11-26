from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import Response
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.database.session import get_db
from app.services import report_service

router = APIRouter(prefix="/reports", tags=["Reports"])


class PredictionReportRequest(BaseModel):
    prediction_id: int


@router.post("/prediction")
def prediction_report(payload: PredictionReportRequest, db: Session = Depends(get_db)):
    try:
        pdf = report_service.generate_prediction_report(db, payload.prediction_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    return Response(
        content=pdf, media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="prediction_{payload.prediction_id}.pdf"'},
    )


@router.post("/analytics")
def analytics_report(db: Session = Depends(get_db)):
    pdf = report_service.generate_analytics_report(db)
    return Response(
        content=pdf, media_type="application/pdf",
        headers={"Content-Disposition": 'attachment; filename="analytics.pdf"'},
    )


@router.post("/comparison")
def comparison_report():
    raise HTTPException(status_code=501, detail="Comparison PDF is a future feature.")