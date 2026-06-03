import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api";
import { predictDemand, type DemandFeatures } from "@/lib/ml/predictDemand";
import { requireUser } from "@/lib/supabase/server";

type Params = {
  params: Promise<{ productId: string }>;
};

function sumSales(records: { quantity_sold: number; sale_date: string }[], days: number) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);

  return records
    .filter((record) => new Date(record.sale_date) >= cutoff)
    .reduce((sum, record) => sum + Number(record.quantity_sold), 0);
}

export async function POST(_request: Request, { params }: Params) {
  const { productId } = await params;
  const { supabase, user } = await requireUser();

  if (!user) {
    return jsonError("Unauthorized", 401);
  }

  const { data: product, error: productError } = await supabase
    .from("products")
    .select("*")
    .eq("id", productId)
    .eq("user_id", user.id)
    .single();

  if (productError || !product) {
    return jsonError("Product not found.", 404);
  }

  const since = new Date();
  since.setDate(since.getDate() - 30);

  const { data: sales, error: salesError } = await supabase
    .from("sales_records")
    .select("quantity_sold, sale_date")
    .eq("user_id", user.id)
    .eq("product_id", productId)
    .gte("sale_date", since.toISOString().slice(0, 10));

  if (salesError) {
    return jsonError(salesError.message, 500);
  }

  const today = new Date();
  const salesHistory = sales ?? [];
  const salesLast7Days = sumSales(salesHistory, 7);
  const salesLast14Days = sumSales(salesHistory, 14);
  const salesLast30Days = sumSales(salesHistory, 30);

  const features: DemandFeatures = {
    current_stock: Number(product.current_stock),
    price: Number(product.price),
    min_stock: Number(product.min_stock),
    sales_last_7_days: salesLast7Days,
    sales_last_14_days: salesLast14Days,
    sales_last_30_days: salesLast30Days,
    average_daily_sales_7_days: salesLast7Days / 7,
    average_daily_sales_30_days: salesLast30Days / 30,
    day_of_week: today.getDay(),
    month: today.getMonth() + 1
  };

  const prediction = predictDemand(features);

  const { data: forecast, error: insertError } = await supabase
    .from("forecasts")
    .insert({
      user_id: user.id,
      product_id: productId,
      predicted_sales_next_7_days: prediction.predictedSalesNext7Days,
      estimated_days_until_stockout: prediction.estimatedDaysUntilStockout,
      stockout_risk: prediction.stockoutRisk,
      recommended_restock_quantity: prediction.recommendedRestockQuantity,
      explanation: prediction.explanation,
      model_version: prediction.modelVersion
    })
    .select("*, products(name, sku, category)")
    .single();

  if (insertError) {
    return jsonError(insertError.message, 500);
  }

  return NextResponse.json({ forecast, features });
}
