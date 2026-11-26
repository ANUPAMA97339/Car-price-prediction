import numpy as np
import pandas as pd
import pytest

from app.ml.preprocessing import (
    clean_master, _canon_brand, _canon_fuel, _canon_trans,
    _extract_engine_cc, _mileage_to_km, split_new_used,
)
from app.ml.feature_engineering import select_and_fill, feature_columns


def test_brand_canonicalization():
    assert _canon_brand("maruti suzuki india ltd") == "Maruti Suzuki"
    assert _canon_brand("HYUNDAI") == "Hyundai"
    assert _canon_brand("bmw") == "BMW"


def test_fuel_canonicalization():
    assert _canon_fuel("Petrol") == "Petrol"
    assert _canon_fuel("GASOLINE") == "Petrol"
    assert _canon_fuel("EV") == "Electric"
    assert _canon_fuel(None) is None


def test_transmission_canonicalization():
    assert _canon_trans("MANUAL") == "Manual"
    assert _canon_trans("auto") == "Automatic"


def test_engine_cc_parsing():
    assert _extract_engine_cc("1197 CC") == 1197.0
    assert _extract_engine_cc("2.0L") == 2000.0
    assert _extract_engine_cc(None) is None
    assert _extract_engine_cc("garbage") is None


def test_mileage_to_km():
    assert _mileage_to_km("100", is_miles=True) == pytest.approx(160.934, rel=1e-3)
    assert _mileage_to_km(5000, is_miles=False) == 5000
    assert _mileage_to_km(None, is_miles=False) is None


def _make_df(rows=40):
    data = {
        "brand": ["Maruti Suzuki"] * rows,
        "model": ["swift"] * rows,
        "manufacturing_year": np.linspace(2010, 2023, rows).astype(int),
        "mileage": np.linspace(10000, 120000, rows),
        "price": np.linspace(300000, 700000, rows),
        "currency": ["INR"] * rows,
        "country": ["India"] * rows,
        "fuel_type": ["Petrol"] * rows,
        "transmission": ["Manual"] * rows,
        "engine_capacity": [1197.0] * rows,
        "vehicle_condition": ["Good"] * rows,
        "vehicle_type": ["used"] * rows,
    }
    return pd.DataFrame(data)


def test_clean_master_drops_bad_rows():
    df = _make_df()
    df.loc[0, "price"] = -1
    df.loc[1, "manufacturing_year"] = 1800
    df.loc[2, "brand"] = None
    cleaned = clean_master(df)
    assert len(cleaned) == len(df) - 3
    assert "vehicle_age" in cleaned.columns
    assert (cleaned["price"] > 0).all()


def test_split_new_used():
    df = _make_df()
    df2 = _make_df()
    df2["vehicle_type"] = "new"
    combined = pd.concat([df, df2])
    n, u = split_new_used(combined)
    assert len(n) == len(df2)
    assert len(u) == len(df)


def test_select_and_fill_outputs():
    df = _make_df()
    df.loc[0, "mileage"] = np.nan
    feats = select_and_fill(df)
    num, cat = feature_columns(feats)
    assert "brand" in cat
    assert "mileage" in num
    assert feats["brand"].iloc[0] == "Maruti Suzuki"