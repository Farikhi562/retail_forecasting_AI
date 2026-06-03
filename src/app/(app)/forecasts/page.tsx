import { redirect } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { ForecastGenerator } from "@/components/ForecastGenerator";
import { requireUser } from "@/lib/supabase/server";
import type { Forecast, Product } from "@/types/database";

export default async function ForecastsPage() {
  const { supabase, user } = await requireUser();

  if (!user) {
    redirect("/login");
  }

  const [productsResult, forecastsResult] = await Promise.all([
    supabase
      .from("products")
      .select("*")
      .eq("user_id", user.id)
      .order("name", { ascending: true }),
    supabase
      .from("forecasts")
      .select("*, products(name, sku, category)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(100)
  ]);

  return (
    <>
      <PageHeader
        title="Forecasts"
        description="Generate ML demand forecasts from recent sales history and product inventory data."
      />
      <ForecastGenerator
        initialProducts={(productsResult.data ?? []) as Product[]}
        initialForecasts={(forecastsResult.data ?? []) as Forecast[]}
      />
    </>
  );
}
