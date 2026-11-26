# How to Download Datasets (Manual — Free, No API Key)

Open each Kaggle link below in your browser, sign in (a free Kaggle account
is enough), click **Download**, unzip, and place the CSV in the exact path
shown. Then run `python scripts/prepare_data.py` from `backend/`.

| # | Dataset | Place file at | Download URL |
|---|---------|---------------|--------------|
| 1 | CarDekho Used Cars (India) | `backend/data/raw/cardekho/used_cars.csv` | https://www.kaggle.com/datasets/nehalbirla/vehicle-dataset-from-cardekho |
| 2 | CarDekho New Cars (India) | `backend/data/raw/cardekho/new_cars.csv` | Same link, second file (`Car details v3.csv` or similar) |
| 3 | Craigslist Vehicles (USA) | `backend/data/raw/craigslist/vehicles.csv` | https://www.kaggle.com/datasets/austinreese/craigslist-carstrucks-data |
| 4 | European Used Cars (optional) | `backend/data/raw/europe/used_cars_europe.csv` | Search Kaggle for "used cars germany" or "used cars uk" |

**Notes:**
- Only #1 and #3 are required for a working pipeline. #2 improves new-car support, #4 extends Europe.
- The pipeline skips any file that is missing — it never crashes on incomplete data.
- You can rename columns in your CSVs to match the required schema (see `docs/dataset_documentation.md`).

### Quick verification

```bash
cd backend
ls data/raw/cardekho/ data/raw/craigslist/ data/raw/europe/