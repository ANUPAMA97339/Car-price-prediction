#!/usr/bin/env python3
"""
Prepare raw datasets → cleaned → feature-engineered splits.
Run from backend/ with venv active:
    python scripts/prepare_data.py
"""
from __future__ import annotations

import logging
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]  # backend/
sys.path.insert(0, str(ROOT))

from app.ml.preprocessing import build_master  # noqa: E402
from app.ml.feature_engineering import build_features  # noqa: E402

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-7s | %(message)s",
)


def main() -> int:
    raw = ROOT / "data" / "raw"
    processed = ROOT / "data" / "processed"
    processed.mkdir(parents=True, exist_ok=True)

    print(f"Raw dir:       {raw}")
    print(f"Processed dir: {processed}")

    try:
        master = build_master(raw)
    except FileNotFoundError as e:
        print(f"\n❌ {e}")
        return 1

    print(f"\nMaster rows after cleaning: {len(master)}")
    print(master.groupby(["vehicle_type", "currency"]).size().to_string())

    paths = build_features(master, processed)
    print("\n✅ Feature files produced:")
    for name, p in paths.items():
        print(f"  - {name}: {p}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())