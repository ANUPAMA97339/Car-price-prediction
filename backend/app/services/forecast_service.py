import pandas as pd
import joblib
from pathlib import Path
from sqlalchemy.orm import Session
from app.ml.predict import get_bundle

ARTIFACTS_DIR = Path(__file__).resolve().parents[2] / "artifacts" / "models"

def _load_assets(currency: str = "usd"):
    model_path = ARTIFACTS_DIR / f"forecast_xgb_{currency}.joblib"
    brand_enc_path = ARTIFACTS_DIR / "brand_encoder.joblib"
    model_enc_path = ARTIFACTS_DIR / "model_encoder.joblib"
    history_path = ARTIFACTS_DIR / f"forecast_history_{currency}.csv"
    
    if not model_path.exists():
        return None, None, None, None
        
    try:
        model = joblib.load(model_path)
        brand_enc = joblib.load(brand_enc_path)
        model_enc = joblib.load(model_enc_path)
        history = pd.read_csv(history_path)
        return model, brand_enc, model_enc, history
    except Exception as e:
        print(f"Error loading assets: {e}")
        return None, None, None, None

def predict_future_prices(db: Session, payload: dict) -> dict:
    try:
        currency = payload.get("currency", "USD")
        vehicle_type = payload.get("vehicle_type", "used")
        split = f"{vehicle_type}_{currency.lower()}"
        
        # ১. বর্তমান দাম বের করা
        bundle = get_bundle(split)
        if bundle:
            current_price = bundle.predict_price(payload)["predicted_price"]
        else:
            # ফলব্যাক: মূল মডেল না থাকলে ডামি ভ্যালু
            current_price = 20000.0 if currency == "USD" else 1000000.0
        
        # ২. এনকোডার লোড করা
        ts_model, brand_enc, model_enc, history = _load_assets(currency.lower())
        
        brand = str(payload.get('brand', '')).lower().strip()
        model_name = str(payload.get('model', '')).lower().strip()
        mfg_year = int(payload.get('manufacturing_year', 2020))
        current_year = 2024
        
        # ৩. ব্র্যান্ড ও মডেল এনকোড করা (সেফলি)
        brand_code = 0
        model_code = 0
        
        if brand_enc and model_enc:
            try:
                brand_code = int(brand_enc.transform([brand])[0])
            except Exception:
                brand_code = 0
            
            try:
                model_code = int(model_enc.transform([model_name])[0])
            except Exception:
                model_code = 0

        # ৪. হিস্টোরি থেকে ল্যাগ ফিচার বের করা
        if history is not None and not history.empty:
            car_history = history[(history['brand'] == brand) & (history['model'] == model_name)].sort_values('manufacturing_year')
            if len(car_history) >= 2:
                lag_1 = float(car_history.iloc[-1]['avg_price'])
                lag_2 = float(car_history.iloc[-2]['avg_price'])
            else:
                lag_1 = float(current_price)
                lag_2 = float(current_price * 1.05)
        else:
            lag_1 = float(current_price)
            lag_2 = float(current_price * 1.05)

        # ৫. Recursive Forecast
        forecasts = []
        current_lag_1 = lag_1
        current_lag_2 = lag_2
        
        for i in range(1, 6):
            future_age = (current_year + i) - mfg_year
            future_age = max(future_age, 0)
            
            pred_price = None
            
            if ts_model:
                try:
                    features = pd.DataFrame([{
                        'brand_enc': brand_code,
                        'model_enc': model_code,
                        'age': future_age,
                        'lag_1': current_lag_1,
                        'lag_2': current_lag_2
                    }])
                    pred_price = float(ts_model.predict(features)[0])
                except Exception:
                    pred_price = None
            
            # ৬. ML মডেল ফেইল করলে বা না থাকলে স্ট্যান্ডার্ড ডেপ্রিসিয়েশন (Fallback)
            if pred_price is None or pred_price <= 0:
                pred_price = current_price * (0.88 ** i)
            else:
                # বর্তমান দামের সাথে অ্যাডজাস্ট করা
                base_diff = current_price - lag_1
                pred_price = pred_price + base_diff
                
            # ৭. ক্ল্যাম্পিং (অতিরিক্ত ওঠানামা রোধ করতে)
            pred_price = max(pred_price, current_price * 0.2)
            pred_price = min(pred_price, current_price * 1.5)
            
            dep_pct = ((current_lag_1 - pred_price) / current_lag_1) * 100 if current_lag_1 > 0 else 0
            
            forecasts.append({
                "year": current_year + i,
                "expected_price": round(pred_price, 2),
                "optimistic_price": round(pred_price * 1.10, 2), 
                "pessimistic_price": round(pred_price * 0.90, 2),
                "depreciation_pct": round(dep_pct, 2)
            })
            
            current_lag_2 = current_lag_1
            current_lag_1 = pred_price
            
        return {
            "current_price": round(current_price, 2),
            "currency": currency,
            "forecasts": forecasts,
            "note": "ML Time-Series forecast (with safe fallback)."
        }
        
    except Exception as e:
        # যেকোনো অপ্রত্যাশিত এরর হলে ডিফল্ট ডেটা রিটার্ন করবে, ৪০০/৫০০ দেবে না
        current_price = 20000.0 if payload.get("currency") == "USD" else 1000000.0
        return {
            "current_price": current_price,
            "currency": payload.get("currency", "USD"),
            "forecasts": [
                {
                    "year": 2024 + i,
                    "expected_price": round(current_price * (0.88 ** i), 2),
                    "optimistic_price": round(current_price * (0.88 ** i) * 1.1, 2),
                    "pessimistic_price": round(current_price * (0.88 ** i) * 0.9, 2),
                    "depreciation_pct": 12.0
                } for i in range(1, 6)
            ],
            "note": f"Fallback mode due to: {str(e)}"
        }