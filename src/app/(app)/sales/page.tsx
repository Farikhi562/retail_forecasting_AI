import { redirect } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { SalesManager } from "@/components/SalesManager";
import { requireUser } from "@/lib/supabase/server";
import type { Product, SalesRecord } from "@/types/database";

export default async function SalesPage() {
  const { supabase, user } = await requireUser();

  if (!user) {
    redirect("/login");
  }

  const [productsResult, salesResult] = await Promise.all([
    supabase
      .from("products")
      .select("*")
      .eq("user_id", user.id)
      .order("name", { ascending: true }),
    supabase
      .from("sales_records")
      .select("*, products(name, sku, price)")
      .eq("user_id", user.id)
      .order("sale_date", { ascending: false })
      .limit(200)
  ]);

  return (
    <>
      <PageHeader
        title="Sales"
        description="Record daily sales. Revenue is calculated from product price and quantity sold."
      />
      <SalesManager
        initialProducts={(productsResult.data ?? []) as Product[]}
        initialSales={(salesResult.data ?? []) as SalesRecord[]}
      />
    </>
  );
}
