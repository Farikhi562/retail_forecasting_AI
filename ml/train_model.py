import json
from datetime import datetime, timezone
from pathlib import Path

import pandas as pd
from sklearn.linear_model import Ridge
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import train_test_split


ROOT_DIR = Path(__file__).resolve().parents[1]
DATA_PATH = Path(__file__).resolve().parent / "data" / "synthetic_retail_sales.csv"
ARTIFACT_PATH = ROOT_DIR / "src" / "ml-artifacts" / "demand_model.json"

FEATURE_NAMES = [
    "current_stock",
    "price",
    "min_stock",
    "sales_last_7_days",
    "sales_last_14_days",
    "sales_last_30_days",
    "average_daily_sales_7_days",
    "average_daily_sales_30_days",
    "day_of_week",
    "month",
]
TARGET = "predicted_sales_next_7_days"


def train_model():
    if not DATA_PATH.exists():
        raise FileNotFoundError(
            f"Dataset not found at {DATA_PATH}. Run python generate_dataset.py first."
        )

    data = pd.read_csv(DATA_PATH)
    x = data[FEATURE_NAMES]
    y = data[TARGET]

    x_train, x_test, y_train, y_test = train_test_split(
        x, y, test_size=0.2, random_state=42
    )

    model = Ridge(alpha=1.0)
    model.fit(x_train, y_train)
    predictions = model.predict(x_test)

    metrics = {
        "mae": round(float(mean_absolute_error(y_test, predictions)), 4),
        "rmse": round(float(mean_squared_error(y_test, predictions, squared=False)), 4),
        "r2": round(float(r2_score(y_test, predictions)), 4),
    }

    artifact = {
        "model_version": "ridge-regression-synthetic-v1",
        "feature_names": FEATURE_NAMES,
        "coefficients": [round(float(value), 8) for value in model.coef_],
        "intercept": round(float(model.intercept_), 8),
        "model_metrics": metrics,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }

    ARTIFACT_PATH.parent.mkdir(parents=True, exist_ok=True)
    ARTIFACT_PATH.write_text(json.dumps(artifact, indent=2), encoding="utf-8")
    return metrics


if __name__ == "__main__":
    model_metrics = train_model()
    print(f"Saved model artifact to {ARTIFACT_PATH}")
    print(json.dumps(model_metrics, indent=2))
