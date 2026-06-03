"use client";

import { useState } from "react";
import { BrainCircuit } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { RiskBadge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import type { Forecast, Product } from "@/types/database";
import { formatDate } from "@/lib/utils";

export function ForecastGenerator({
  initialProducts,
  initialForecasts
}: {
  initialProducts: Product[];
  initialForecasts: Forecast[];
}) {
  const [forecasts, setForecasts] = useState(initialForecasts);
  const [productId, setProductId] = useState(initialProducts[0]?.id ?? "");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function generateForecast(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const response = await fetch(`/api/forecast/${productId}`, {
      method: "POST"
    });
    const payload = await response.json();
    setLoading(false);

    if (!response.ok) {
      setError(payload.error ?? "Unable to generate forecast.");
      return;
    }

    setForecasts((current) => [payload.forecast, ...current]);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
      <form
        onSubmit={generateForecast}
        className="rounded-lg border border-line bg-white p-5"
      >
        <h2 className="text-base font-semibold text-ink">Generate forecast</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Select a product and the backend will calculate recent demand
          features, run JSON model inference, and save the prediction.
        </p>
        <label className="mt-4 block">
          <span className="text-sm font-medium text-slate-700">Product</span>
          <select
            value={productId}
            onChange={(event) => setProductId(event.target.value)}
            className="focus-ring mt-1 h-10 w-full rounded-md border border-line px-3"
            required
          >
            {initialProducts.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name} ({product.sku})
              </option>
            ))}
          </select>
        </label>
        {error ? (
          <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        ) : null}
        <Button
          type="submit"
          className="mt-5"
          disabled={loading || initialProducts.length === 0}
        >
          <BrainCircuit className="h-4 w-4" aria-hidden="true" />
          {loading ? "Forecasting..." : "Generate Forecast"}
        </Button>
      </form>

      <div className="space-y-4">
        {forecasts.length === 0 ? (
          <EmptyState
            title="No forecasts yet"
            description="Generate a product forecast to see stockout risk, days until stockout, and restock guidance."
          />
        ) : (
          forecasts.map((forecast) => (
            <article
              key={forecast.id}
              className="rounded-lg border border-line bg-white p-5"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3 className="text-base font-semibold text-ink">
                    {forecast.products?.name ?? "Product forecast"}
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    {formatDate(forecast.created_at)} - {forecast.model_version}
                  </p>
                </div>
                <RiskBadge risk={forecast.stockout_risk} />
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div className="rounded-md bg-mist p-3">
                  <p className="text-xs font-medium text-slate-500">
                    Predicted 7-day sales
                  </p>
                  <p className="mt-2 text-xl font-bold text-ink">
                    {Math.round(forecast.predicted_sales_next_7_days)}
                  </p>
                </div>
                <div className="rounded-md bg-mist p-3">
                  <p className="text-xs font-medium text-slate-500">
                    Days until stockout
                  </p>
                  <p className="mt-2 text-xl font-bold text-ink">
                    {forecast.estimated_days_until_stockout}
                  </p>
                </div>
                <div className="rounded-md bg-mist p-3">
                  <p className="text-xs font-medium text-slate-500">
                    Restock quantity
                  </p>
                  <p className="mt-2 text-xl font-bold text-ink">
                    {forecast.recommended_restock_quantity}
                  </p>
                </div>
              </div>
              <p className="mt-4 text-sm leading-6 text-slate-700">
                {forecast.explanation}
              </p>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
