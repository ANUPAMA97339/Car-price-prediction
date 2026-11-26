import pandas as pd
import numpy as np
import joblib
from pathlib import Path
from xgboost import XGBRegressor
from sklearn.metrics import mean_absolute_error, r2_score

DATA_PATH = Path(__file__).resolve().parents[1] / "data" / "processed" / "master.csv"
MODEL_DIR = Path(__file__).resolve().parents[1] / "artifacts" / "models"
MODEL_DIR.mkdir(parents=True, exist_ok=True)

print("Loading master dataset...")
df = pd.read_csv(DATA_PATH)

# ১. শুধুমাত্র USA (USD) ডেটা নিচ্ছি, কারণ এখানে ডেটা বেশি
df = df[df['currency'] == 'USD'].copy()

# ২. Time-series এর জন্য ডেটা গ্রুপ করা (Brand + Model + Year)
# যেসব গাড়ির অন্তত ৫ বছরের ডেটা আছে, সেগুলো নিব
grouped = df.groupby(['brand', 'model', 'manufacturing_year']).agg(
    avg_price=('price', 'median')
).reset_index()

# গাড়ির নাম ক্লিন করা
grouped['brand'] = grouped['brand'].astype(str).str.lower()
grouped['model'] = grouped['model'].astype(str).str.lower()

grouped = grouped.sort_values(['brand', 'model', 'manufacturing_year'])

# শুধুমাত্র সেই গাড়িগুলো নেওয়া যাদের ৪+ বছরের ডেটা আছে
valid_cars = grouped.groupby(['brand', 'model']).filter(lambda x: len(x) >= 4)

print(f"Total valid car series: {valid_cars.groupby(['brand', 'model']).ngroups}")

# ৩. ল্যাগ ফিচার তৈরি করা (প্রতিটি গাড়ির জন্য আলাদাভাবে)
valid_cars['lag_1'] = valid_cars.groupby(['brand', 'model'])['avg_price'].shift(1)
valid_cars['lag_2'] = valid_cars.groupby(['brand', 'model'])['avg_price'].shift(2)
valid_cars['age'] = 2024 - valid_cars['manufacturing_year']

# ৪. ক্যাটাগরিক্যাল ফিচার এনকোড করা (Brand ও Model)
from sklearn.preprocessing import LabelEncoder
brand_enc = LabelEncoder()
model_enc = LabelEncoder()

valid_cars['brand_enc'] = brand_enc.fit_transform(valid_cars['brand'])
valid_cars['model_enc'] = model_enc.fit_transform(valid_cars['model'])

valid_cars = valid_cars.dropna()

# ৫. ট্রেন-টেস্ট স্প্লিট (টাইম-সিরিজ তাই র‍্যান্ডম স্প্লিট নয়)
# আমরা ২০২০ এর আগের ডেটা ট্রেনিং এবং ২০২০+ ডেটা টেস্টিং-এ রাখব
train = valid_cars[valid_cars['manufacturing_year'] < 2020]
test = valid_cars[valid_cars['manufacturing_year'] >= 2020]

features = ['brand_enc', 'model_enc', 'age', 'lag_1', 'lag_2']
target = 'avg_price'

print(f"Train shape: {train.shape}, Test shape: {test.shape}")

# ৬. মডেল ট্রেনিং
model = XGBRegressor(n_estimators=200, max_depth=5, learning_rate=0.05, random_state=42)
model.fit(train[features], train[target])

# ৭. ইভালুয়েশন
preds = model.predict(test[features])
mae = mean_absolute_error(test[target], preds)
r2 = r2_score(test[target], preds)

print(f"✅ Time-Series XGBoost -> MAE: ${mae:.2f}, R2: {r2:.4f}")

# ৮. মডেল এবং এনকোডার সেভ করা
joblib.dump(model, MODEL_DIR / "forecast_xgb_usd.joblib")
joblib.dump(brand_enc, MODEL_DIR / "brand_encoder.joblib")
joblib.dump(model_enc, MODEL_DIR / "model_encoder.joblib")
valid_cars.to_csv(MODEL_DIR / "forecast_history_usd.csv", index=False)

print("Model and encoders saved successfully!")