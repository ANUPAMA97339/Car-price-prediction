# Dataset Documentation — Global Car Price Prediction AI

All datasets used in this project are public, free, and legally accessible.
**No scraping, no paid APIs.** Each entry documents source, license, coverage,
collection date, currency, and known limitations.

---

## 1. CarDekho Used Cars (India)

| Field | Value |
|-------|-------|
| **Source** | https://www.kaggle.com/datasets/nehalbirla/vehicle-dataset-from-cardekho |
| **File** | `cardekho/used_cars.csv` |
| **Country** | India |
| **Vehicle Type** | Used |
| **Currency** | INR (₹) |
| **Expected rows** | ~4,340 |
| **License** | CC0 Public Domain |
| **Collection date** | 2023 (per Kaggle listing) |
| **Known limitations** | Only India; limited brands (mostly Maruti, Hyundai); no transmission for some rows |

**Required columns:** `name, year, selling_price, km_driven, fuel, seller_type, transmission, owner`

---

## 2. CarDekho New Cars (India)

| Field | Value |
|-------|-------|
| **Source** | https://www.kaggle.com/datasets/nehalbirla/vehicle-dataset-from-cardekho (v3 / Car details) |
| **File** | `cardekho/new_cars.csv` |
| **Country** | India |
| **Vehicle Type** | New |
| **Currency** | INR |
| **Expected rows** | ~8,100 |
| **License** | CC0 Public Domain |
| **Collection date** | 2022 (per Kaggle listing) |
| **Known limitations** | Missing engine data for some models |

**Required columns:** `name, year, selling_price, fuel, transmission, engine, max_power, seats`

---

## 3. Craigslist Vehicles (USA)

| Field | Value |
|-------|-------|
| **Source** | https://www.kaggle.com/datasets/austinreese/craigslist-carstrucks-data |
| **File** | `craigslist/vehicles.csv` |
| **Country** | USA |
| **Vehicle Type** | Used |
| **Currency** | USD ($) |
| **Expected rows** | ~426,000 |
| **License** | CC0 Public Domain |
| **Collection date** | Oct 2021 (per Kaggle listing) |
| **Known limitations** | Prices are listing prices, not selling prices; heavy missing values |

**Required columns:** `price, year, manufacturer, model, odometer, fuel, transmission, condition`

---

## 4. European Car Listings (Germany / UK)

| Field | Value |
|-------|-------|
| **Source** | https://www.kaggle.com/datasets (search "used cars germany" / "used cars uk") |
| **File** | `europe/used_cars_europe.csv` (you choose the exact Kaggle dataset) |
| **Country** | Germany (EUR) / UK (GBP) |
| **Vehicle Type** | Used |
| **Currency** | EUR / GBP |
| **Expected rows** | Varies by dataset |
| **License** | Verify on Kaggle page before use |
| **Known limitations** | Coverage depends on the dataset you pick |

**Required columns (minimum):** `brand, model, year, price, mileage, fuel, transmission`

---

## Rules Applied in Preprocessing

1. **Currencies are never mixed.** Each row keeps its original currency; no cross-currency averaging is performed.
2. **Outliers** are removed using the IQR method per country/currency group.
3. **Vehicle age** is derived from `manufacturing_year`, never stored as a mixed unit.
4. **Mileage** is converted to kilometers where the source uses miles (`km = miles * 1.60934`).
5. **Brand names** are canonicalized (e.g., "Maruti Suzuki India Ltd" → `Maruti Suzuki`).
6. **Rows missing year, price, brand, or model are dropped** — a prediction without these is meaningless.
7. **Records with price ≤ 0 or year outside 1950–current_year+1 are discarded.**