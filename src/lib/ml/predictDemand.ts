import artifact from "@/ml-artifacts/demand_model.json";
import type { StockoutRisk } from "@/types/database";

export type DemandFeatures = {
  current_stock: number;
  price: number;
  min_stock: number;
  sales_last_7_days: number;
  sales_last_14_days: number;
  sales_last_30_days: number;
  average_daily_sales_7_days: number;
  average_daily_sales_30_days: number;
  day_of_week: number;
  month: number;
};

export type DemandPrediction = {
  predictedSalesNext7Days: number;
  estimatedDaysUntilStockout: number;
  stockoutRisk: StockoutRisk;
  recommendedRestockQuantity: number;
  explanation: string;
  modelVersion: string;
};

type Artifact = {
  model_version: string;
  feature_names: (keyof DemandFeatures)[];
  coefficients: number[];
  intercept: number;
};

const model = artifact as Artifact;

function assertModelShape() {
  if (model.feature_names.length !== model.coefficients.length) {
    throw new Error("Demand model artifact has mismatched features and weights.");
  }
}

function validateFeatures(features: DemandFeatures) {
  for (const featureName of model.feature_names) {
    const value = features[featureName];
    if (!Number.isFinite(value)) {
      throw new Error(`Invalid ML feature: ${featureName}`);
    }
  }
}

function getRisk(predictedSales: number, currentStock: number): StockoutRisk {
  if (currentStock <= 0 || predictedSales >= currentStock) {
    return "high";
  }

  if (predictedSales >= currentStock * 0.7) {
    return "medium";
  }

  return "low";
}

export function predictDemand(features: DemandFeatures): DemandPrediction {
  assertModelShape();
  validateFeatures(features);

  const rawPrediction = model.feature_names.reduce((sum, featureName, index) => {
    return sum + features[featureName] * model.coefficients[index];
  }, model.intercept);

  const predictedSalesNext7Days = Math.max(0, Math.round(rawPrediction));
  const dailyDemand = Math.max(
    predictedSalesNext7Days / 7,
    features.average_daily_sales_30_days,
    0.1
  );
  const estimatedDaysUntilStockout =
    features.current_stock <= 0
      ? 0
      : Math.round((features.current_stock / dailyDemand) * 10) / 10;
  const stockoutRisk = getRisk(
    predictedSalesNext7Days,
    features.current_stock
  );
  const targetStock = Math.ceil(
    Math.max(predictedSalesNext7Days * 1.4, features.min_stock * 1.5)
  );
  const recommendedRestockQuantity = Math.max(
    0,
    targetStock - features.current_stock
  );

  const explanation =
    stockoutRisk === "high"
      ? `High stockout risk: predicted 7-day demand (${predictedSalesNext7Days} units) meets or exceeds current stock (${features.current_stock} units).`
      : stockoutRisk === "medium"
        ? `Medium stockout risk: predicted 7-day demand (${predictedSalesNext7Days} units) is above 70% of current stock (${features.current_stock} units).`
        : `Low stockout risk: current stock (${features.current_stock} units) is comfortably above predicted 7-day demand (${predictedSalesNext7Days} units).`;

  return {
    predictedSalesNext7Days,
    estimatedDaysUntilStockout,
    stockoutRisk,
    recommendedRestockQuantity,
    explanation,
    modelVersion: model.model_version
  };
}
