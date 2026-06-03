# Retail Forecast AI ML Pipeline

This folder proves the training workflow used by the production app. Vercel does
not run Python for inference. Instead, Python trains a simple Ridge Regression
model and exports coefficients to `src/ml-artifacts/demand_model.json`.

## Files

- `generate_dataset.py` creates a realistic synthetic retail sales dataset.
- `train_model.py` trains a scikit-learn Ridge Regression model and exports JSON.
- `evaluate_model.py` validates the exported artifact by running JSON-style inference.
- `requirements.txt` pins the Python dependencies.

## Run locally

```bash
pip install -r requirements.txt
python generate_dataset.py
python train_model.py
python evaluate_model.py
```

## Feature Set

The model predicts `predicted_sales_next_7_days` from:

- `current_stock`
- `price`
- `min_stock`
- `sales_last_7_days`
- `sales_last_14_days`
- `sales_last_30_days`
- `average_daily_sales_7_days`
- `average_daily_sales_30_days`
- `day_of_week`
- `month`

Stockout risk is intentionally handled by a transparent business rule in the
Node.js inference layer:

- High: predicted 7-day sales are greater than or equal to current stock.
- Medium: predicted 7-day sales are at least 70% of current stock.
- Low: all other cases.
