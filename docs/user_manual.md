# User Manual

## Home

Landing page with quick-start links to New Car and Used Car prediction.

## Predict Price

### New Car Prediction

1. Pick **Country** and **Brand**.
2. Enter **Model**, **Manufacturing Year**.
3. Add **Fuel Type**, **Transmission**, **Engine Capacity (cc)**, **Body Type**.
4. Click **Predict Price**.
5. Read the **estimated price** and **range** (MAE band).
6. Download the PDF or save the prediction (auto-saved).

### Used Car Prediction

Same as above plus **Mileage (km)**, **Owner Count**, **Accident History**, **Condition**.

## Dashboard

Live counts (predictions, countries, brands), charts, and model metrics — all from real data.

## Market Analysis

Filters by country, brand, year, type, fuel. Empty states appear until you have saved predictions.

## Prediction History

Search, filter, delete individual records, or clear all. Each row downloads a PDF.

## Compare Prices

Click **Load My Predictions** to pull saved predictions into a comparison table. Prices are normalised to USD for fairness.

## Model Performance

Full table of all 12 trained models with real MAE / RMSE / R² / MAPE. Green checkmark = active model.

## Reports

Generate the **Analytics PDF** for overview stats.

## Settings

Switch theme, default country, default currency. History clearing (same as History page).

## Tips

- Predictions are estimates — check the **range**, not just the number.
- `used_inr` (India used cars) has very few training rows — treat those numbers as rough.
- All data stays on your server. Nothing is uploaded externally.
