"""
Builds model-ready feature frames. No training, no data leakage.
"""
from __future__ import annotations

import logging
from pathlib import Path
import pandas as pd

logger = logging.getLogger(__name__)

TARGET = "price"

NUMERIC_FEATURES = [
    "manufacturing_year", "vehicle_age", "mileage", "engine_capacity",
]
CATEGORICAL_FEATURES = [
    "brand", "country", "fuel_type", "transmission", "vehicle_condition",
]


def select_and_fill(df: pd.DataFrame) -> pd.DataFrame:
    keep = [c for c in NUMERIC_FEATURES + CATEGORICAL_FEATURES + [TARGET, "currency", "vehicle_type"] if c in df]
    out = df[keep].copy()

    for c in NUMERIC_FEATURES:
        if c in out:
            out[c] = pd.to_numeric(out[c], errors="coerce")

    for c in CATEGORICAL_FEATURES:
        if c in out:
            out[c] = out[c].fillna("Unknown").astype(str)

    out = out.dropna(subset=[TARGET])
    return out.reset_index(drop=True)


def save_split(df: pd.DataFrame, out_dir: Path, name: str) -> Path:
    out_dir.mkdir(parents=True, exist_ok=True)
    path = out_dir / f"{name}.csv"
    df.to_csv(path, index=False)
    logger.info("Saved %s (%d rows) → %s", name, len(df), path)
    return path


def build_features(master: pd.DataFrame, out_dir: Path) -> dict[str, Path]:
    """
    Splits master into per-vehicle-type, per-currency feature frames.
    Currency is NOT converted — each frame trains its own model.
    """
    paths: dict[str, Path] = {}
    new_df = master[master["vehicle_type"] == "new"]
    used_df = master[master["vehicle_type"] == "used"]

    for label, frame in (("new", new_df), ("used", used_df)):
        if frame.empty:
            logger.warning("No rows for vehicle_type=%s", label)
            continue
        for ccy, grp in frame.groupby("currency"):
            feats = select_and_fill(grp)
            if len(feats) < 30:
                logger.info("Skipping %s/%s — only %d rows", label, ccy, len(feats))
                continue
            name = f"{label}_{ccy.lower()}"
            paths[name] = save_split(feats, out_dir, name)

    if not paths:
        raise RuntimeError(
            "No feature splits produced. Need ≥30 rows per (vehicle_type, currency). "
            "Download more datasets per backend/data/README.md."
        )

    # Also save a combined master for analytics
    master.to_csv(out_dir / "master.csv", index=False)
    logger.info("Saved master.csv (%d rows)", len(master))
    paths["master"] = out_dir / "master.csv"
    return paths


def feature_columns(df: pd.DataFrame) -> tuple[list[str], list[str]]:
    num = [c for c in NUMERIC_FEATURES if c in df.columns]
    cat = [c for c in CATEGORICAL_FEATURES if c in df.columns]
    return num, cat