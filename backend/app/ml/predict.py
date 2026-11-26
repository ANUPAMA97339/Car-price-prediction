"""
Loads the active trained pipeline and runs inference.
Called by prediction_service in Phase 6.
"""
from __future__ import annotations

import logging
from typing import Optional
import pandas as pd

from app.models.ml_models import load_pipeline, load_metrics

logger = logging.getLogger(__name__)


class ModelBundle:
    def __init__(self, split_name: str):
        self.split_name = split_name
        self.pipeline = load_pipeline(f"{split_name}__{self._best_model_name()}")
        self.report = load_metrics(split_name)

    def _best_model_name(self) -> str:
        return load_metrics(self.split_name)["best_model"]

    def predict_price(self, features: dict) -> dict:
        df = pd.DataFrame([features])
        pred = float(self.pipeline.predict(df)[0])
        m = self.report["best_metrics"]
        # Range = prediction ± MAE (statistically supported, documented)
        return {
            "predicted_price": max(0.0, pred),
            "price_min": max(0.0, pred - m["mae"]),
            "price_max": max(0.0, pred + m["mae"]),
            "model_version": f"{self.split_name}__{self.report['best_model']}",
            "model_name": self.report["best_model"],
            "r2": m["r2"],
            "mae": m["mae"],
        }


_BUNDLE_CACHE: dict[str, ModelBundle] = {}


def get_bundle(split_name: str) -> Optional[ModelBundle]:
    if split_name in _BUNDLE_CACHE:
        return _BUNDLE_CACHE[split_name]
    try:
        bundle = ModelBundle(split_name)
    except FileNotFoundError:
        return None
    _BUNDLE_CACHE[split_name] = bundle
    return bundle