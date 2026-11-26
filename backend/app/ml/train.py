"""
Train all candidate regression models on a given feature CSV.
Produces: trained pipelines, metric JSON, and plots.

Run per split via scripts/train_models.py.
"""
from __future__ import annotations

import logging
from pathlib import Path
from typing import Any

import numpy as np
import pandas as pd
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.impute import SimpleImputer
from sklearn.model_selection import train_test_split, KFold, cross_val_score
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from xgboost import XGBRegressor

from app.ml.feature_engineering import feature_columns
from app.models.ml_models import (
    save_pipeline, save_metrics, PLOTS_DIR, ensure_dirs,
)

logger = logging.getLogger(__name__)

RANDOM_STATE = 42
TEST_SIZE = 0.2
CV_FOLDS = 5


def _build_preprocessor(num_cols: list[str], cat_cols: list[str]) -> ColumnTransformer:
    num_pipe = Pipeline([
        ("imputer", SimpleImputer(strategy="median")),
        ("scaler", StandardScaler()),
    ])
    cat_pipe = Pipeline([
        ("imputer", SimpleImputer(strategy="most_frequent")),
        ("onehot", OneHotEncoder(handle_unknown="ignore", sparse_output=False)),
    ])
    return ColumnTransformer([
        ("num", num_pipe, num_cols),
        ("cat", cat_pipe, cat_cols),
    ], remainder="drop")


def _candidate_models() -> dict[str, Any]:
    return {
        "linear_regression": LinearRegression(),
        "random_forest": RandomForestRegressor(
            n_estimators=200, max_depth=None, n_jobs=-1, random_state=RANDOM_STATE
        ),
        "gradient_boosting": GradientBoostingRegressor(
            n_estimators=200, learning_rate=0.05, random_state=RANDOM_STATE
        ),
        "xgboost": XGBRegressor(
            n_estimators=300, learning_rate=0.05, max_depth=6,
            subsample=0.9, colsample_bytree=0.9, n_jobs=-1,
            random_state=RANDOM_STATE, verbosity=0,
        ),
    }


def _safe_mape(y_true: np.ndarray, y_pred: np.ndarray, min_price: float = 500.0) -> float:
    y_true = np.asarray(y_true, dtype=float)
    y_pred = np.asarray(y_pred, dtype=float)
    mask = y_true >= min_price
    if mask.sum() == 0:
        return float("nan")
    return float(np.mean(np.abs((y_true[mask] - y_pred[mask]) / y_true[mask])) * 100)


def _metrics(y_true, y_pred) -> dict[str, float]:
    return {
        "mae": float(mean_absolute_error(y_true, y_pred)),
        "rmse": float(np.sqrt(mean_squared_error(y_true, y_pred))),
        "r2": float(r2_score(y_true, y_pred)),
        "mape": _safe_mape(y_true, y_pred),
        "n_samples": int(len(y_true)),
    }


def _plot_actual_vs_pred(y_true, y_pred, name: str) -> None:
    ensure_dirs()
    fig, ax = plt.subplots(figsize=(6, 6))
    ax.scatter(y_true, y_pred, alpha=0.3, s=8, color="#3B82F6")
    lim = max(float(np.max(y_true)), float(np.max(y_pred)))
    ax.plot([0, lim], [0, lim], color="#EF4444", linestyle="--", linewidth=1)
    ax.set_xlabel("Actual Price")
    ax.set_ylabel("Predicted Price")
    ax.set_title(f"Actual vs Predicted — {name}")
    fig.tight_layout()
    fig.savefig(PLOTS_DIR / f"actual_vs_pred_{name}.png", dpi=110)
    plt.close(fig)


def _plot_residuals(y_true, y_pred, name: str) -> None:
    ensure_dirs()
    residuals = np.asarray(y_true) - np.asarray(y_pred)
    fig, ax = plt.subplots(figsize=(6, 4))
    ax.hist(residuals, bins=60, color="#06B6D4", alpha=0.8)
    ax.axvline(0, color="#EF4444", linestyle="--", linewidth=1)
    ax.set_xlabel("Residual (actual − predicted)")
    ax.set_ylabel("Frequency")
    ax.set_title(f"Residual Distribution — {name}")
    fig.tight_layout()
    fig.savefig(PLOTS_DIR / f"residuals_{name}.png", dpi=110)
    plt.close(fig)


def _plot_feature_importance(pipeline: Pipeline, name: str, top_n: int = 15) -> None:
    model = pipeline.named_steps["model"]
    if not hasattr(model, "feature_importances_"):
        return
    pre: ColumnTransformer = pipeline.named_steps["pre"]
    try:
        feat_names = pre.get_feature_names_out()
    except Exception:
        return
    importances = model.feature_importances_
    if len(importances) != len(feat_names):
        return
    idx = np.argsort(importances)[-top_n:]
    fig, ax = plt.subplots(figsize=(8, 5))
    ax.barh(np.array(feat_names)[idx], importances[idx], color="#3B82F6")
    ax.set_title(f"Top Feature Importance — {name}")
    fig.tight_layout()
    fig.savefig(PLOTS_DIR / f"feature_importance_{name}.png", dpi=110)
    plt.close(fig)


def train_all(df: pd.DataFrame, split_name: str) -> dict:
    """Trains all 4 models on df, returns evaluation report with best model."""
    num_cols, cat_cols = feature_columns(df)
    if not num_cols and not cat_cols:
        raise ValueError(f"No feature columns in {split_name}")

    y = df["price"].astype(float).values
    X = df[num_cols + cat_cols]
    logger.info("[%s] Training on %d rows × %d features", split_name, len(df), X.shape[1])

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=TEST_SIZE, random_state=RANDOM_STATE
    )

    preprocessor = _build_preprocessor(num_cols, cat_cols)
    kfold = KFold(n_splits=CV_FOLDS, shuffle=True, random_state=RANDOM_STATE)

    results: dict[str, dict] = {}

    for name, estimator in _candidate_models().items():
        pipeline = Pipeline([("pre", preprocessor), ("model", estimator)])
        logger.info("[%s] Fitting %s…", split_name, name)
        pipeline.fit(X_train, y_train)
        y_pred = pipeline.predict(X_test)

        test_metrics = _metrics(y_test, y_pred)

        # CV on training only (no leakage)
        cv_r2 = cross_val_score(
            pipeline, X_train, y_train, cv=kfold, scoring="r2", n_jobs=-1
        )
        cv_mae = cross_val_score(
            pipeline, X_train, y_train, cv=kfold, scoring="neg_mean_absolute_error", n_jobs=-1
        )

        results[name] = {
            **test_metrics,
            "cv_r2_mean": float(np.mean(cv_r2)),
            "cv_r2_std": float(np.std(cv_r2)),
            "cv_mae_mean": float(-np.mean(cv_mae)),
            "model_key": f"{split_name}__{name}",
        }

        # Save artifacts
        save_pipeline(pipeline, f"{split_name}__{name}")
        _plot_actual_vs_pred(y_test, y_pred, f"{split_name}__{name}")
        _plot_residuals(y_test, y_pred, f"{split_name}__{name}")
        _plot_feature_importance(pipeline, f"{split_name}__{name}")

        logger.info(
            "[%s/%s] MAE=%.1f RMSE=%.1f R²=%.4f CV-R²=%.4f",
            split_name, name, test_metrics["mae"], test_metrics["rmse"],
            test_metrics["r2"], float(np.mean(cv_r2)),
        )

    # Pick best by lowest RMSE
    best_name = min(results, key=lambda k: results[k]["rmse"])
    best = results[best_name]
    logger.info("[%s] BEST = %s (RMSE=%.1f, R²=%.4f)",
                split_name, best_name, best["rmse"], best["r2"])

    report = {
        "split_name": split_name,
        "n_train": int(len(X_train)),
        "n_test": int(len(X_test)),
        "currency": df["currency"].iloc[0] if "currency" in df else "unknown",
        "vehicle_type": df["vehicle_type"].iloc[0] if "vehicle_type" in df else "unknown",
        "best_model": best_name,
        "best_metrics": best,
        "all_models": results,
    }

    save_metrics(report, split_name)
    return report