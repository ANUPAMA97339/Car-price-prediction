"""
Helpers for saving/loading ML artifacts. No training here.
"""
from __future__ import annotations

import json
from pathlib import Path
from typing import Any

import joblib


ARTIFACTS_DIR = Path(__file__).resolve().parents[2] / "artifacts"
MODELS_DIR = ARTIFACTS_DIR / "models"
METRICS_DIR = ARTIFACTS_DIR / "metrics"
PLOTS_DIR = ARTIFACTS_DIR / "plots"


def ensure_dirs() -> None:
    for d in (MODELS_DIR, METRICS_DIR, PLOTS_DIR):
        d.mkdir(parents=True, exist_ok=True)


def save_pipeline(pipeline: Any, name: str) -> Path:
    ensure_dirs()
    path = MODELS_DIR / f"{name}.joblib"
    joblib.dump(pipeline, path)
    return path


def load_pipeline(name: str) -> Any:
    path = MODELS_DIR / f"{name}.joblib"
    if not path.exists():
        raise FileNotFoundError(f"Model not found: {path}")
    return joblib.load(path)


def save_metrics(metrics: dict, name: str) -> Path:
    ensure_dirs()
    path = METRICS_DIR / f"{name}.json"
    path.write_text(json.dumps(metrics, indent=2, default=str))
    return path


def load_metrics(name: str) -> dict:
    path = METRICS_DIR / f"{name}.json"
    if not path.exists():
        raise FileNotFoundError(f"Metrics not found: {path}")
    return json.loads(path.read_text())