#!/usr/bin/env python3
from __future__ import annotations
import logging, sys
from pathlib import Path
import pandas as pd

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from app.ml.train import train_all
from app.ml.model_selection import update_model_versions
from app.database.init_db import init_db
from app.database.session import SessionLocal

logging.basicConfig(level=logging.INFO, format="%(asctime)s | %(levelname)-7s | %(message)s")

SPLITS = ["new_inr", "used_inr", "used_usd"]

def main() -> int:
    processed = ROOT / "data" / "processed"
    if not processed.exists():
        print(f"❌ {processed} not found. Run scripts/prepare_data.py first.")
        return 1
    init_db()
    reports = []
    for split in SPLITS:
        path = processed / f"{split}.csv"
        if not path.exists():
            print(f"⚠️  Skipping {split} (file missing)")
            continue
        df = pd.read_csv(path)
        if len(df) < 100:
            print(f"⚠️  Skipping {split} (only {len(df)} rows, need ≥100)")
            continue
        print(f"\n=== Training on {split} ({len(df)} rows) ===")
        reports.append(train_all(df, split))
    if not reports:
        print("\n❌ No models trained.")
        return 1
    print("\n=== Updating model_versions DB table ===")
    with SessionLocal() as db:
        update_model_versions(db, reports)
    print("\n✅ Training complete. Artifacts in backend/artifacts/")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
