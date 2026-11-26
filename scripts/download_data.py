#!/usr/bin/env python3
"""
Verifies that manually-downloaded CSVs are in place.
Prints a checklist and does NOT download anything.
"""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CHECKS = [
    ("CarDekho Used (India)", ROOT / "data/raw/cardekho/used_cars.csv"),
    ("CarDekho New (India)", ROOT / "data/raw/cardekho/new_cars.csv"),
    ("Craigslist (USA)", ROOT / "data/raw/craigslist/vehicles.csv"),
    ("Europe (optional)", ROOT / "data/raw/europe/used_cars_europe.csv"),
]


def main() -> int:
    print("Dataset checklist:\n")
    missing = 0
    for name, path in CHECKS:
        ok = path.exists() and path.stat().st_size > 0
        mark = "✅" if ok else "❌"
        size = f"{path.stat().st_size / 1024 / 1024:.1f} MB" if ok else "missing"
        print(f"  {mark} {name:30s}  {path.relative_to(ROOT)}  ({size})")
        if not ok:
            missing += 1
    if missing:
        print(f"\n{missing} file(s) missing — see backend/data/README.md for download links.")
        return 1
    print("\nAll required files present. Run: python scripts/prepare_data.py")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())