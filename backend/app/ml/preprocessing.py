"""
Cleaning & normalization pipeline for raw car datasets.
Does NOT train anything — only produces clean, canonical DataFrames.
"""
from __future__ import annotations

import logging
import re
from pathlib import Path
from typing import Optional

import numpy as np
import pandas as pd

logger = logging.getLogger(__name__)

CURRENT_YEAR = pd.Timestamp.utcnow().year
MIN_YEAR = 1950

FUEL_CANON = {
    "petrol": "Petrol", "gasoline": "Petrol", "gas": "Petrol",
    "diesel": "Diesel", "electric": "Electric", "ev": "Electric",
    "hybrid": "Hybrid", "cng": "CNG", "lpg": "LPG",
}
TRANS_CANON = {
    "manual": "Manual", "automatic": "Automatic", "auto": "Automatic",
    "cvt": "CVT", "dct": "DCT",
}
CONDITION_CANON = {
    "excellent": "Excellent", "good": "Good", "fair": "Fair",
    "like new": "Excellent", "new": "Excellent", "poor": "Poor",
    "salvage": "Poor",
}

_BRAND_ALIASES = {
    "maruti suzuki india ltd": "Maruti Suzuki",
    "maruti suzuki": "Maruti Suzuki",
    "maruti": "Maruti Suzuki",
    "hyundai motors": "Hyundai",
    "hyundai": "Hyundai",
    "tata motors": "Tata",
    "tata": "Tata",
    "honda cars": "Honda",
    "honda": "Honda",
    "toyota": "Toyota",
    "kia motors": "Kia",
    "kia": "Kia",
    "ford": "Ford",
    "chevrolet": "Chevrolet",
    "chevy": "Chevrolet",
    "bmw": "BMW",
    "mercedes-benz": "Mercedes-Benz",
    "mercedes benz": "Mercedes-Benz",
    "mercedes": "Mercedes-Benz",
    "audi": "Audi",
    "vw": "Volkswagen",
    "volkswagen": "Volkswagen",
    "tesla": "Tesla",
    "nissan": "Nissan",
    "renault": "Renault",
    "skoda": "Skoda",
    "land rover": "Land Rover",
    "jaguar": "Jaguar",
    "volvo": "Volvo",
    "mazda": "Mazda",
    "mitsubishi": "Mitsubishi",
    "lexus": "Lexus",
    "jeep": "Jeep",
    "dodge": "Dodge",
    "ram": "Ram",
    "gmc": "GMC",
    "subaru": "Subaru",
    "acura": "Acura",
    "infiniti": "Infiniti",
    "cadillac": "Cadillac",
    "buick": "Buick",
    "chrysler": "Chrysler",
    "fiat": "Fiat",
    "peugeot": "Peugeot",
    "citroen": "Citroen",
    "mini": "Mini",
    "porsche": "Porsche",
    "ferrari": "Ferrari",
    "lamborghini": "Lamborghini",
    "bentley": "Bentley",
    "rolls-royce": "Rolls-Royce",
    "maserati": "Maserati",
    "alfa romeo": "Alfa Romeo",
}


def _canon_brand(raw: str) -> Optional[str]:
    if not isinstance(raw, str):
        return None
    key = raw.strip().lower()
    if key in _BRAND_ALIASES:
        return _BRAND_ALIASES[key]
    # first word fallback
    first = key.split()[0] if key else ""
    return _BRAND_ALIASES.get(first, raw.strip().title())


def _canon_fuel(raw) -> Optional[str]:
    if not isinstance(raw, str):
        return None
    return FUEL_CANON.get(raw.strip().lower())


def _canon_trans(raw) -> Optional[str]:
    if not isinstance(raw, str):
        return None
    return TRANS_CANON.get(raw.strip().lower())


def _canon_condition(raw) -> Optional[str]:
    if not isinstance(raw, str):
        return None
    return CONDITION_CANON.get(raw.strip().lower())


def _extract_engine_cc(raw) -> Optional[float]:
    """'1197 CC' or '2.0L' → 1197.0 / 2000.0"""
    if pd.isna(raw):
        return None
    if isinstance(raw, (int, float)):
        v = float(raw)
        return v if 50 <= v <= 10000 else None
    s = str(raw).lower().replace(",", "")
    m = re.search(r"(\d+(?:\.\d+)?)\s*(cc|litre|liter|l)", s)
    if not m:
        return None
    n = float(m.group(1))
    unit = m.group(2)
    if unit == "cc":
        return n if 50 <= n <= 10000 else None
    return n * 1000 if 0.5 <= n <= 10 else None


def _extract_power_bhp(raw) -> Optional[float]:
    if pd.isna(raw):
        return None
    if isinstance(raw, (int, float)):
        v = float(raw)
        return v if 20 <= v <= 2000 else None
    s = str(raw).lower()
    m = re.search(r"(\d+(?:\.\d+)?)\s*(bhp|ps|kw|hp)?", s)
    if not m:
        return None
    n = float(m.group(1))
    unit = m.group(2)
    if unit == "kw":
        n *= 1.341
    return n if 20 <= n <= 2000 else None


def _mileage_to_km(raw, is_miles: bool) -> Optional[float]:
    if pd.isna(raw):
        return None
    try:
        v = float(str(raw).replace(",", "").replace("km", "").replace("mi", "").strip())
    except ValueError:
        return None
    if v < 0 or v > 1_500_000:
        return None
    return v * 1.60934 if is_miles else v


def _price_filter(df: pd.DataFrame, currency_col: str) -> pd.DataFrame:
    """Remove clearly invalid and IQR outliers per currency group."""
    if df.empty:
        return df
    df = df[df["price"] > 0].copy()
    keep = []
    for ccy, grp in df.groupby(currency_col):
        if len(grp) < 20:
            keep.append(grp)
            continue
        q1, q3 = grp["price"].quantile([0.25, 0.75])
        iqr = q3 - q1
        lo = max(0.01, q1 - 3 * iqr)
        hi = q3 + 3 * iqr
        keep.append(grp[(grp["price"] >= lo) & (grp["price"] <= hi)])
    return pd.concat(keep, ignore_index=True) if keep else df


# ---------- Dataset-specific loaders ----------

def load_cardekho_used(path: Path) -> pd.DataFrame:
    df = pd.read_csv(path)
    cols = {c.lower(): c for c in df.columns}

    def pick(*names):
        for n in names:
            if n in cols:
                return df[cols[n]]
        return pd.Series([None] * len(df))

    name = pick("car_name", "name").astype(str)
    out = pd.DataFrame({
        "brand": name.str.split().str[0].map(_canon_brand),
        "model": name.str.split(n=1).str[1].fillna("unknown"),
        "manufacturing_year": pd.to_numeric(pick("year"), errors="coerce"),
        "mileage": pick("kms_driven", "km_driven").apply(_mileage_to_km, is_miles=False),
        "price": pd.to_numeric(pick("selling_price"), errors="coerce") * 100000,
        "fuel_type": pick("fuel_type", "fuel").apply(_canon_fuel),
        "transmission": pick("transmission").apply(_canon_trans),
        "engine_capacity": np.nan,
        "vehicle_condition": None,
        "country": "India",
        "currency": "INR",
        "vehicle_type": "used",
        "source": "cardekho_used",
    })
    return out


def load_cardekho_new(path: Path) -> pd.DataFrame:
    df = pd.read_csv(path)
    cols = {c.lower().strip(): c for c in df.columns}

    def pick(*names):
        for n in names:
            if n in cols:
                return df[cols[n]]
        return pd.Series([None] * len(df))

    name = pick("name", "car_name").astype(str)
    out = pd.DataFrame({
        "brand": name.str.split().str[0].map(_canon_brand),
        "model": name.str.split(n=1).str[1].fillna("unknown"),
        "manufacturing_year": pd.to_numeric(pick("year"), errors="coerce"),
        "mileage": np.nan,
        "price": pd.to_numeric(pick("selling_price", "price"), errors="coerce"),
        "fuel_type": pick("fuel", "fuel_type").apply(_canon_fuel),
        "transmission": pick("transmission").apply(_canon_trans),
        "engine_capacity": pick("engine").apply(_extract_engine_cc),
        "vehicle_condition": "Excellent",
        "country": "India",
        "currency": "INR",
        "vehicle_type": "new",
        "source": "cardekho_new",
    })
    return out

def load_craigslist(path: Path) -> pd.DataFrame:
    df = pd.read_csv(path, low_memory=False)
    out = pd.DataFrame({
        "brand": df.get("manufacturer").apply(_canon_brand),
        "model": df.get("model").astype(str).fillna("unknown"),
        "manufacturing_year": pd.to_numeric(df.get("year"), errors="coerce"),
        "mileage": df.get("odometer").apply(_mileage_to_km, is_miles=True),
        "price": pd.to_numeric(df.get("price"), errors="coerce"),
        "fuel_type": df.get("fuel").apply(_canon_fuel),
        "transmission": df.get("transmission").apply(_canon_trans),
        "engine_capacity": np.nan,
        "vehicle_condition": df.get("condition").apply(_canon_condition),
        "country": "USA",
        "currency": "USD",
        "vehicle_type": "used",
        "source": "craigslist",
    })
    return out


def load_europe(path: Path, country: str = "Germany", currency: str = "EUR") -> pd.DataFrame:
    df = pd.read_csv(path)
    lower = {c.lower(): c for c in df.columns}

    def col(*names):
        for n in names:
            if n in lower:
                return df[lower[n]]
        return pd.Series([None] * len(df))

    out = pd.DataFrame({
        "brand": col("brand", "make", "manufacturer").apply(_canon_brand),
        "model": col("model", "model_name").astype(str).fillna("unknown"),
        "manufacturing_year": pd.to_numeric(col("year", "registration_year"), errors="coerce"),
        "mileage": col("mileage", "km", "kilometers").apply(_mileage_to_km, is_miles=False),
        "price": pd.to_numeric(col("price", "selling_price"), errors="coerce"),
        "fuel_type": col("fuel", "fuel_type").apply(_canon_fuel),
        "transmission": col("transmission", "gearbox").apply(_canon_trans),
        "engine_capacity": col("engine", "engine_cc", "displacement").apply(_extract_engine_cc),
        "vehicle_condition": col("condition").apply(_canon_condition),
        "country": country,
        "currency": currency,
        "vehicle_type": "used",
        "source": "europe",
    })
    return out


# ---------- Global cleaning ----------

def clean_master(df: pd.DataFrame) -> pd.DataFrame:
    before = len(df)
    df = df.copy()

    # Drop rows missing essential fields
    essential = ["brand", "model", "manufacturing_year", "price", "currency", "country", "vehicle_type"]
    df = df.dropna(subset=essential)

    # Normalize
    df["brand"] = df["brand"].astype(str).str.strip()
    df["model"] = df["model"].astype(str).str.strip().str.lower()
    df["country"] = df["country"].astype(str).str.strip()
    df["currency"] = df["currency"].astype(str).str.upper()

    # Numeric coercion
    for c in ["manufacturing_year", "mileage", "price", "engine_capacity"]:
        if c in df:
            df[c] = pd.to_numeric(df[c], errors="coerce")

    df["manufacturing_year"] = df["manufacturing_year"].astype("Int64")
    df = df[df["manufacturing_year"].between(MIN_YEAR, CURRENT_YEAR + 1)]
    df = df[df["price"] > 0]

    # Derive vehicle_age
    df["vehicle_age"] = (CURRENT_YEAR - df["manufacturing_year"]).astype(int)

    # Fill categorical defaults
    for c, default in [("fuel_type", "Unknown"), ("transmission", "Unknown")]:
        if c in df:
            df[c] = df[c].fillna(default)

    # Deduplicate
    subset = [c for c in ["brand", "model", "manufacturing_year", "price", "country", "vehicle_type"] if c in df]
    df = df.drop_duplicates(subset=subset)

    # Outlier filter (per-currency)
    df = _price_filter(df, "currency")

    after = len(df)
    logger.info("clean_master: %d → %d rows (%.1f%% kept)", before, after, 100 * after / max(before, 1))
    return df.reset_index(drop=True)


def split_new_used(df: pd.DataFrame) -> tuple[pd.DataFrame, pd.DataFrame]:
    new = df[df["vehicle_type"] == "new"].reset_index(drop=True)
    used = df[df["vehicle_type"] == "used"].reset_index(drop=True)
    return new, used


def build_master(raw_dir: Path) -> pd.DataFrame:
    frames = []

    cardekho_used = raw_dir / "cardekho" / "used_cars.csv"
    if cardekho_used.exists():
        logger.info("Loading %s", cardekho_used)
        frames.append(load_cardekho_used(cardekho_used))

    cardekho_new = raw_dir / "cardekho" / "new_cars.csv"
    if cardekho_new.exists():
        logger.info("Loading %s", cardekho_new)
        frames.append(load_cardekho_new(cardekho_new))

    craigslist = raw_dir / "craigslist" / "vehicles.csv"
    if craigslist.exists():
        logger.info("Loading %s", craigslist)
        frames.append(load_craigslist(craigslist))

    europe = raw_dir / "europe" / "used_cars_europe.csv"
    if europe.exists():
        logger.info("Loading %s", europe)
        frames.append(load_europe(europe))

    if not frames:
        raise FileNotFoundError(
            "No datasets found in backend/data/raw/. "
            "See backend/data/README.md for manual download instructions."
        )

    master = pd.concat(frames, ignore_index=True)
    return clean_master(master)