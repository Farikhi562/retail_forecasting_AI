"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import type { Product, SalesRecord } from "@/types/database";
import { formatCurrency, formatDate } from "@/lib/utils";

export function SalesManager({
  initialProducts,
  initialSales
}: {
  initialProducts: Product[];
  initialSales: SalesRecord[];
}) {
  const [sales, setSales] = useState(initialSales);
  const [productId, setProductId] = useState(initialProducts[0]?.id ?? "");
  const [quantitySold, setQuantitySold] = useState(1);
  const [saleDate, setSaleDate] = useState(new Date().toISOString().slice(0, 10));
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submitSale(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const response = await fetch("/api/sales", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        product_id: productId,
        quantity_sold: quantitySold,
        sale_date: saleDate
      })
    });
    const payload = await response.json();
    setLoading(false);

    if (!response.ok) {
      setError(payload.error ?? "Unable to save sale.");
      return;
    }

    setSales((current) => [payload.sale, ...current]);
    setQuantitySold(1);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
      <form
        onSubmit={submitSale}
        className="rounded-lg border border-line bg-white p-5"
      >
        <h2 className="text-base font-semibold text-ink">Add daily sale</h2>
        <div className="mt-4 space-y-4">
          <label className="block">
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
          <label className="block">
            <span className="text-sm font-medium text-slate-700">
              Quantity sold
            </span>
            <input
              type="number"
              min={1}
              value={quantitySold}
              onChange={(event) => setQuantitySold(Number(event.target.value))}
              className="focus-ring mt-1 h-10 w-full rounded-md border border-line px-3"
              required
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Sale date</span>
            <input
              type="date"
              value={saleDate}
              onChange={(event) => setSaleDate(event.target.value)}
              className="focus-ring mt-1 h-10 w-full rounded-md border border-line px-3"
              required
            />
          </label>
        </div>
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
          <Plus className="h-4 w-4" aria-hidden="true" />
          {loading ? "Saving..." : "Record sale"}
        </Button>
      </form>

      <div className="rounded-lg border border-line bg-white">
        {sales.length === 0 ? (
          <div className="p-5">
            <EmptyState
              title="No sales records"
              description="Add daily sales to build the history used by the forecasting model."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-line text-sm">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Quantity</th>
                  <th className="px-4 py-3">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {sales.map((sale) => (
                  <tr key={sale.id}>
                    <td className="px-4 py-3">{formatDate(sale.sale_date)}</td>
                    <td className="px-4 py-3">
                      {sale.products?.name ?? "Deleted product"}
                    </td>
                    <td className="px-4 py-3">{sale.quantity_sold}</td>
                    <td className="px-4 py-3">
                      {formatCurrency(sale.revenue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
