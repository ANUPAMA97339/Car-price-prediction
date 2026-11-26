from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.database.session import get_db
from app.schemas.prediction import AnalyticsOverview, CountryStat, BrandStat, TrendPoint
from app.services import analytics_service

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/overview", response_model=AnalyticsOverview)
def overview(db: Session = Depends(get_db)):
    return analytics_service.overview(db)


@router.get("/countries", response_model=List[CountryStat])
def countries(db: Session = Depends(get_db)):
    return analytics_service.countries(db)


@router.get("/brands", response_model=List[BrandStat])
def brands(db: Session = Depends(get_db)):
    return analytics_service.brands(db)


@router.get("/trends", response_model=List[TrendPoint])
def trends(db: Session = Depends(get_db)):
    return analytics_service.trends(db)