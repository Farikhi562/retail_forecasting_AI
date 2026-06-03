import { NextResponse } from "next/server";
import { productSchema } from "@/lib/validators";
import { jsonError, parseApiError } from "@/lib/api";
import { requireUser } from "@/lib/supabase/server";

type Params = {
  params: Promise<{ id: string }>;
};

export async function PUT(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const { supabase, user } = await requireUser();

    if (!user) {
      return jsonError("Unauthorized", 401);
    }

    const payload = productSchema.parse(await request.json());
    const { data, error } = await supabase
      .from("products")
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq("id", id)
      .eq("user_id", user.id)
      .select("*")
      .single();

    if (error) {
      return jsonError(error.message, 500);
    }

    return NextResponse.json({ product: data });
  } catch (error) {
    return jsonError(parseApiError(error), 400);
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;
  const { supabase, user } = await requireUser();

  if (!user) {
    return jsonError("Unauthorized", 401);
  }

  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return jsonError(error.message, 500);
  }

  return NextResponse.json({ ok: true });
}
