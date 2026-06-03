import { NextResponse } from "next/server";
import { productSchema } from "@/lib/validators";
import { jsonError, parseApiError } from "@/lib/api";
import { requireUser } from "@/lib/supabase/server";

export async function GET() {
  const { supabase, user } = await requireUser();

  if (!user) {
    return jsonError("Unauthorized", 401);
  }

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return jsonError(error.message, 500);
  }

  return NextResponse.json({ products: data ?? [] });
}

export async function POST(request: Request) {
  try {
    const { supabase, user } = await requireUser();

    if (!user) {
      return jsonError("Unauthorized", 401);
    }

    const payload = productSchema.parse(await request.json());
    const { data, error } = await supabase
      .from("products")
      .insert({ ...payload, user_id: user.id })
      .select("*")
      .single();

    if (error) {
      return jsonError(error.message, 500);
    }

    return NextResponse.json({ product: data }, { status: 201 });
  } catch (error) {
    return jsonError(parseApiError(error), 400);
  }
}
