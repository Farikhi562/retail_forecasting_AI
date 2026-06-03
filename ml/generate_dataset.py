from pathlib import Path

import numpy as np
import pandas as pd


DATA_DIR = Path(__file__).resolve().parent / "data"
OUTPUT_PATH = DATA_DIR / "synthetic_retail_sales.csv"
RANDOM_SEED = 42


def generate_dataset(rows: int = 4000) -> pd.DataFrame:
    rng = np.random.default_rng(RANDOM_SEED)
    categories = np.array(["grocery", "beverage", "personal_care", "household", "snacks"])
    category = rng.choice(categories, size=rows, p=[0.32, 0.2, 0.16, 0.14, 0.18])

    category_base_demand = {
        "grocery": 18,
        "beverage": 16,
        "personal_care": 9,
        "household": 7,
        "snacks": 14,
    }
    category_price_center = {
        "grocery": 6,
        "beverage": 4,
        "personal_care": 12,
        "household": 18,
        "snacks": 3,
    }

    base_demand = np.array([category_base_demand[item] for item in category])
    price_center = np.array([category_price_center[item] for item in category])
    price = np.maximum(1.0, rng.normal(price_center, price_center * 0.22))
    day_of_week = rng.integers(0, 7, size=rows)
    month = rng.integers(1, 13, size=rows)

    weekend_boost = np.where(day_of_week >= 5, 1.18, 1.0)
    seasonal_boost = np.where(np.isin(month, [6, 7, 11, 12]), 1.12, 1.0)
    price_drag = np.maximum(0.65, 1 - (price / (price_center * 7)))
    demand_signal = base_demand * weekend_boost * seasonal_boost * price_drag

    sales_last_7_days = np.maximum(0, rng.normal(demand_signal * 7, demand_signal * 1.4)).round()
    sales_last_14_days = sales_last_7_days + np.maximum(
        0, rng.normal(demand_signal * 7, demand_signal * 1.7)
    ).round()
    sales_last_30_days = sales_last_14_days + np.maximum(
        0, rng.normal(demand_signal * 16, demand_signal * 2.4)
    ).round()
    average_daily_sales_7_days = sales_last_7_days / 7
    average_daily_sales_30_days = sales_last_30_days / 30
    min_stock = np.maximum(5, (average_daily_sales_30_days * rng.uniform(4, 8, rows)).round())
    current_stock = np.maximum(0, rng.normal(min_stock * 2.2, min_stock * 0.85)).round()

    noise = rng.normal(0, 4.0, rows)
    predicted_sales_next_7_days = np.maximum(
        0,
        (
            0.48 * sales_last_7_days
            + 0.18 * sales_last_14_days
            + 0.055 * sales_last_30_days
            + 1.7 * average_daily_sales_7_days
            + 1.2 * average_daily_sales_30_days
            - 0.16 * price
            + 0.08 * day_of_week
            + 0.11 * month
            + noise
        ),
    ).round()

    return pd.DataFrame(
        {
            "product_category": category,
            "price": price.round(2),
            "current_stock": current_stock.astype(int),
            "min_stock": min_stock.astype(int),
            "day_of_week": day_of_week,
            "month": month,
            "sales_last_7_days": sales_last_7_days.astype(int),
            "sales_last_14_days": sales_last_14_days.astype(int),
            "sales_last_30_days": sales_last_30_days.astype(int),
            "average_daily_sales_7_days": average_daily_sales_7_days.round(2),
            "average_daily_sales_30_days": average_daily_sales_30_days.round(2),
            "predicted_sales_next_7_days": predicted_sales_next_7_days.astype(int),
        }
    )


if __name__ == "__main__":
    DATA_DIR.mkdir(exist_ok=True)
    dataset = generate_dataset()
    dataset.to_csv(OUTPUT_PATH, index=False)
    print(f"Generated {len(dataset):,} rows at {OUTPUT_PATH}")
