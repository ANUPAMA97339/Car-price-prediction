from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.schemas.prediction import CompareRequest, CompareResponse
from app.services.currency_service import get_rate_to_usd

router = APIRouter(prefix="/compare", tags=["Comparison"])


@router.post("", response_model=CompareResponse)
def compare(payload: CompareRequest, db: Session = Depends(get_db)):
    items = []
    usd_prices = []
    for it in payload.items:
        fx = it.fx_to_usd or get_rate_to_usd(db, it.original_currency)
        usd = it.predicted_price * fx
        items.append(it.model_copy(update={"fx_to_usd": fx}))
        usd_prices.append(usd)

    diffs = {}
    if usd_prices:
        diffs = {
            "min_usd": round(min(usd_prices), 2),
            "max_usd": round(max(usd_prices), 2),
            "spread_usd": round(max(usd_prices) - min(usd_prices), 2),
            "note": "Differences are normalised to USD using documented snapshot rates.",
        }
    return CompareResponse(items=items, differences_usd=diffs)