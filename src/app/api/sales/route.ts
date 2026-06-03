import { NextResponse } from "next/server";
import { salesRecordSchema } from "@/lib/validators";
import { jsonError, parseApiError } from "@/lib/api";
import { requireUser } from "@/lib/supabase/server";

export async function GET() {
  const { supabase, user } = await requireUser();

  if (!user) {
    return jsonError("Unauthorized", 401);
  }

  const { data, error } = await supabase
    .from("sales_records")
    .select("*, products(name, sku, price)")
    .eq("user_id", user.id)
    .order("sale_date", { ascending: false })
    .limit(200);

  if (error) {
    return jsonError(error.message, 500);
  }

  return NextResponse.json({ sales: data ?? [] });
}

export async function POST(request: Request) {
  try {
    const { supabase, user } = await requireUser();

    if (!user) {
      return jsonError("Unauthorized", 401);
    }

    const payload = salesRecordSchema.parse(await request.json());
    const { data: product, error: productError } = await supabase
      .from("products")
      .select("id, price, current_stock")
      .eq("id", payload.product_id)
      .eq("user_id", user.id)
      .single();

    if (productError || !product) {
      return jsonError("Product not found.", 404);
    }

    const revenue = Number(product.price) * payload.quantity_sold;
    const { data, error } = await supabase
      .from("sales_records")
      .insert({
        ...payload,
        user_id: user.id,
        revenue
      })
      .select("*, products(name, sku, price)")
      .single();

    if (error) {
      return jsonError(error.message, 500);
    }

    const nextStock = Math.max(0, product.current_stock - payload.quantity_sold);
    await supabase
      .from("products")
      .update({
        current_stock: nextStock,
        updated_at: new Date().toISOString()
      })
      .eq("id", payload.product_id)
      .eq("user_id", user.id);

    return NextResponse.json({ sale: data }, { status: 201 });
  } catch (error) {
    return jsonError(parseApiError(error), 400);
  }
}
