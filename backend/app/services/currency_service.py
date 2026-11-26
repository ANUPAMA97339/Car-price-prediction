from typing import Dict
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.models.database_models import CurrencyRate

_FALLBACK_USD: Dict[str, float] = {
    "USD": 1.0,
    "INR": 0.012,
    "EUR": 1.08,
    "GBP": 1.27,
}


def get_rate_to_usd(db: Session, currency: str) -> float:
    currency = currency.upper()
    row = (
        db.query(CurrencyRate)
        .filter(CurrencyRate.base_currency == currency, CurrencyRate.target_currency == "USD")
        .order_by(desc(CurrencyRate.rate_date))
        .first()
    )
    if row:
        return row.exchange_rate
    return _FALLBACK_USD.get(currency, 1.0)


def convert(amount: float, from_ccy: str, to_ccy: str, db: Session) -> float:
    usd = amount * get_rate_to_usd(db, from_ccy)
    if to_ccy.upper() == "USD":
        return usd
    return usd / get_rate_to_usd(db, to_ccy)


def seed_default_rates(db: Session) -> None:
    if db.query(CurrencyRate).count() > 0:
        return
    now = datetime.now(timezone.utc)
    for ccy, rate in _FALLBACK_USD.items():
        if ccy == "USD":
            continue
        db.add(CurrencyRate(
            base_currency=ccy,
            target_currency="USD",
            exchange_rate=rate,
            rate_date=now,
            source="static_snapshot_2025-01-01",
        ))
    db.commit()