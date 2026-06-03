import { AlertTriangle, Boxes, ChartNoAxesCombined, DollarSign } from "lucide-react";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { RiskBadge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/PageHeader";
import { SalesTrendChart } from "@/components/SalesTrendChart";
import { ButtonLink } from "@/components/ui/Button";
import { requireUser } from "@/lib/supabase/server";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Forecast, Product, SalesRecord } from "@/types/database";

function monthStart() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
}

function trendFromSales(sales: SalesRecord[]) {
  const buckets = new Map<string, { date: string; quantity: number; revenue: number }>();

  for (let index = 13; index >= 0; index -= 1) {
    const date = new Date();
    date.setDate(date.getDate() - index);
    const key = date.toISOString().slice(0, 10);
    buckets.set(key, {
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      quantity: 0,
      revenue: 0
    });
  }

  sales.forEach((sale) => {
    const key = sale.sale_date;
    const bucket = buckets.get(key);
    if (bucket) {
      bucket.quantity += Number(sale.quantity_sold);
      bucket.revenue += Number(sale.revenue);
    }
  });

  return Array.from(buckets.values());
}

export default async function DashboardPage() {
  const { supabase, user } = await requireUser();

  if (!user) {
    redirect("/login");
  }

  const [productsResult, salesResult, forecastsResult, monthlySalesResult] =
    await Promise.all([
      supabase
        .from("products")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("sales_records")
        .select("*")
        .eq("user_id", user.id)
        .gte("sale_date", new Date(Date.now() - 13 * 86400000).toISOString().slice(0, 10)),
      supabase
        .from("forecasts")
        .select("*, products(name, sku, category)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5),
      supabase
        .from("sales_records")
        .select("quantity_sold, revenue, sale_date")
        .eq("user_id", user.id)
        .gte("sale_date", monthStart())
    ]);

  const products = (productsResult.data ?? []) as Product[];
  const sales = (salesResult.data ?? []) as SalesRecord[];
  const forecasts = (forecastsResult.data ?? []) as Forecast[];
  const monthlySales = (monthlySalesResult.data ?? []) as SalesRecord[];
  const totalSalesThisMonth = monthlySales.reduce(
    (sum, sale) => sum + Number(sale.revenue),
    0
  );
  const lowStockProducts = products.filter(
    (product) => product.current_stock <= product.min_stock
  );
  const highRiskForecasts = forecasts.filter(
    (forecast) => forecast.stockout_risk === "high"
  );

  const summary = [
    {
      label: "Total products",
      value: products.length,
      icon: Boxes,
      accent: "text-teal-700"
    },
    {
      label: "Sales this month",
      value: formatCurrency(totalSalesThisMonth),
      icon: DollarSign,
      accent: "text-ink"
    },
    {
      label: "Low stock products",
      value: lowStockProducts.length,
      icon: AlertTriangle,
      accent: "text-amber"
    },
    {
      label: "High risk stockouts",
      value: highRiskForecasts.length,
      icon: ChartNoAxesCombined,
      accent: "text-danger"
    }
  ];

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Monitor product demand, sales velocity, inventory risk, and the latest machine learning forecasts."
        action={<ButtonLink href="/forecasts">Generate Forecast</ButtonLink>}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summary.map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.label}>
              <CardContent>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      {item.label}
                    </p>
                    <p className="mt-2 text-2xl font-bold text-ink">
                      {item.value}
                    </p>
                  </div>
                  <Icon className={`h-6 w-6 ${item.accent}`} aria-hidden="true" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_420px]">
        <Card>
          <CardHeader>
            <CardTitle>Sales trend</CardTitle>
          </CardHeader>
          <CardContent>
            <SalesTrendChart data={trendFromSales(sales)} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent predictions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {forecasts.length === 0 ? (
              <EmptyState
                title="No predictions yet"
                description="Generate a forecast for a product to see AI-powered restock recommendations here."
                action={<ButtonLink href="/forecasts">Generate Forecast</ButtonLink>}
              />
            ) : (
              forecasts.map((forecast) => (
                <div
                  key={forecast.id}
                  className="rounded-md border border-line p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-ink">
                        {forecast.products?.name ?? "Product"}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {formatDate(forecast.created_at)}
                      </p>
                    </div>
                    <RiskBadge risk={forecast.stockout_risk} />
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    {forecast.explanation}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Product stock status</CardTitle>
        </CardHeader>
        <CardContent>
          {products.length === 0 ? (
            <EmptyState
              title="No products tracked"
              description="Create products to start monitoring inventory health."
              action={<ButtonLink href="/products">Add Product</ButtonLink>}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-line text-sm">
                <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Product</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Current stock</th>
                    <th className="px-4 py-3">Minimum stock</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {products.map((product) => {
                    const low = product.current_stock <= product.min_stock;
                    return (
                      <tr key={product.id}>
                        <td className="px-4 py-3 font-semibold text-ink">
                          {product.name}
                        </td>
                        <td className="px-4 py-3">{product.category}</td>
                        <td className="px-4 py-3">{product.current_stock}</td>
                        <td className="px-4 py-3">{product.min_stock}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                              low
                                ? "bg-amber-50 text-amber-700"
                                : "bg-teal-50 text-teal-700"
                            }`}
                          >
                            {low ? "Low stock" : "Healthy"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
