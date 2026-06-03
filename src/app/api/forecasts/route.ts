import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api";
import { requireUser } from "@/lib/supabase/server";

export async function GET() {
  const { supabase, user } = await requireUser();

  if (!user) {
    return jsonError("Unauthorized", 401);
  }

  const { data, error } = await supabase
    .from("forecasts")
    .select("*, products(name, sku, category)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    return jsonError(error.message, 500);
  }

  return NextResponse.json({ forecasts: data ?? [] });
}
