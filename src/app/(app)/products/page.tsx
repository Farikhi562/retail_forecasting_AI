import { redirect } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { ProductsManager } from "@/components/ProductsManager";
import { requireUser } from "@/lib/supabase/server";
import type { Product } from "@/types/database";

export default async function ProductsPage() {
  const { supabase, user } = await requireUser();

  if (!user) {
    redirect("/login");
  }

  const { data } = await supabase
    .from("products")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <>
      <PageHeader
        title="Products"
        description="Create, update, and monitor the product catalog used by sales tracking and demand forecasting."
      />
      <ProductsManager initialProducts={(data ?? []) as Product[]} />
    </>
  );
}
