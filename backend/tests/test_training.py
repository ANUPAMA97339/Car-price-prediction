import numpy as np
import pandas as pd
import pytest

from app.ml.train import train_all, _metrics, _safe_mape


def _toy_df(n=400, seed=0):
    rng = np.random.default_rng(seed)
    years = rng.integers(2010, 2023, n)
    mileage = rng.integers(5_000, 150_000, n)
    price = 500_000 - (2023 - years) * 20_000 - mileage * 1.2 + rng.normal(0, 10_000, n)
    return pd.DataFrame({
        "manufacturing_year": years,
        "vehicle_age": 2023 - years,
        "mileage": mileage,
        "engine_capacity": rng.choice([1197.0, 1498.0, 1998.0], n),
        "brand": rng.choice(["Maruti Suzuki", "Hyundai", "Honda"], n),
        "country": "India",
        "fuel_type": rng.choice(["Petrol", "Diesel"], n),
        "transmission": rng.choice(["Manual", "Automatic"], n),
        "vehicle_condition": "Good",
        "price": np.maximum(price, 50_000),
        "currency": "INR",
        "vehicle_type": "used",
    })


def test_metrics_perfect_prediction():
    y = np.array([100.0, 200.0, 300.0])
    m = _metrics(y, y)
    assert m["mae"] == 0.0
    assert m["rmse"] == 0.0
    assert m["r2"] == 1.0


def test_mape_handles_zero():
    assert np.isnan(_safe_mape(np.array([0, 0]), np.array([1, 2])))


def test_train_all_returns_expected_keys(tmp_path, monkeypatch):
    # Isolate artifacts to a temp dir
    from app.models import ml_models
    monkeypatch.setattr(ml_models, "PLOTS_DIR", tmp_path)
    monkeypatch.setattr(ml_models, "MODELS_DIR", tmp_path)
    monkeypatch.setattr(ml_models, "METRICS_DIR", tmp_path)

    df = _toy_df()
    report = train_all(df, "toy")
    assert report["split_name"] == "toy"
    assert report["best_model"] in report["all_models"]
    assert set(report["all_models"].keys()) == {
        "linear_regression", "random_forest", "gradient_boosting", "xgboost"
    }
    best = report["best_metrics"]
    assert best["rmse"] >= 0
    assert -1 <= best["r2"] <= 1


def test_train_rejects_tiny_df():
    df = _toy_df(n=5)
    with pytest.raises(Exception):
        train_all(df, "tiny")