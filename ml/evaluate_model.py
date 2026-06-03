import json
from pathlib import Path

import pandas as pd
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score


ROOT_DIR = Path(__file__).resolve().parents[1]
DATA_PATH = Path(__file__).resolve().parent / "data" / "synthetic_retail_sales.csv"
ARTIFACT_PATH = ROOT_DIR / "src" / "ml-artifacts" / "demand_model.json"
TARGET = "predicted_sales_next_7_days"


def predict_from_artifact(features: pd.DataFrame, artifact: dict) -> pd.Series:
    predictions = artifact["intercept"]
    for feature_name, coefficient in zip(
        artifact["feature_names"], artifact["coefficients"]
    ):
        predictions = predictions + features[feature_name] * coefficient
    return predictions.clip(lower=0)


if __name__ == "__main__":
    if not DATA_PATH.exists():
        raise FileNotFoundError("Run python generate_dataset.py before evaluation.")
    if not ARTIFACT_PATH.exists():
        raise FileNotFoundError("Run python train_model.py before evaluation.")

    data = pd.read_csv(DATA_PATH)
    artifact = json.loads(ARTIFACT_PATH.read_text(encoding="utf-8"))
    x = data[artifact["feature_names"]]
    y = data[TARGET]
    predictions = predict_from_artifact(x, artifact)

    metrics = {
        "mae": round(float(mean_absolute_error(y, predictions)), 4),
        "rmse": round(float(mean_squared_error(y, predictions, squared=False)), 4),
        "r2": round(float(r2_score(y, predictions)), 4),
    }

    print("Evaluation against the generated dataset")
    print(json.dumps(metrics, indent=2))
    print("Model metadata")
    print(json.dumps(artifact.get("model_metrics", {}), indent=2))
