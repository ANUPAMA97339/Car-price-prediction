"""
Loads saved metrics and produces a summary across all splits.
"""
from __future__ import annotations

import logging
from pathlib import Path

from app.models.ml_models import METRICS_DIR, load_metrics

logger = logging.getLogger(__name__)


def list_metric_files() -> list[Path]:
    if not METRICS_DIR.exists():
        return []
    return sorted(METRICS_DIR.glob("*.json"))


def load_all_reports() -> list[dict]:
    reports = []
    for p in list_metric_files():
        try:
            reports.append(load_metrics(p.stem))
        except Exception as e:  # pragma: no cover
            logger.warning("Skipping %s: %s", p, e)
    return reports


def summarise() -> str:
    reports = load_all_reports()
    if not reports:
        return "No training reports found."
    lines = ["Model evaluation summary:", "=" * 70]
    for r in reports:
        b = r["best_metrics"]
        lines.append(
            f"{r['split_name']:12s}  best={r['best_model']:18s} "
            f"MAE={b['mae']:>12.0f}  RMSE={b['rmse']:>12.0f}  "
            f"R²={b['r2']:.4f}  n={b['n_samples']}"
        )
    return "\n".join(lines)