#!/usr/bin/env python3
from __future__ import annotations
import logging, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from app.ml.evaluate import summarise, load_all_reports
from app.ml.model_selection import update_model_versions
from app.database.init_db import init_db
from app.database.session import SessionLocal

logging.basicConfig(level=logging.INFO, format="%(levelname)-7s | %(message)s")

def main() -> int:
    init_db()
    reports = load_all_reports()
    if not reports:
        print("No reports. Run scripts/train_models.py first.")
        return 1
    print(summarise())
    with SessionLocal() as db:
        update_model_versions(db, reports)
    print("\n✅ DB refreshed.")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
