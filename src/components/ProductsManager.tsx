"use client";

import { useMemo, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import type { Product } from "@/types/database";
import { formatCurrency } from "@/lib/utils";

type ProductForm = Pick<
  Product,
  "name" | "category" | "sku" | "price" | "current_stock" | "min_stock"
>;

const blankForm: ProductForm = {
  name: "",
  category: "",
  sku: "",
  price: 0,
  current_stock: 0,
  min_stock: 0
};

export function ProductsManager({
  initialProducts
}: {
  initialProducts: Product[];
}) {
  const [products, setProducts] = useState(initialProducts);
  const [form, setForm] = useState<ProductForm>(blankForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const editingProduct = useMemo(
    () => products.find((product) => product.id === editingId),
    [editingId, products]
  );

  function updateField(field: keyof ProductForm, value: string) {
    setForm((current) => ({
      ...current,
      [field]: ["price", "current_stock", "min_stock"].includes(field)
        ? Number(value)
        : value
    }));
  }

  function startEdit(product: Product) {
    setEditingId(product.id);
    setForm({
      name: product.name,
      category: product.category,
      sku: product.sku,
      price: Number(product.price),
      current_stock: product.current_stock,
      min_stock: product.min_stock
    });
  }

  function resetForm() {
    setEditingId(null);
    setForm(blankForm);
    setError(null);
  }

  async function submitProduct(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const response = await fetch(
      editingId ? `/api/products/${editingId}` : "/api/products",
      {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      }
    );
    const payload = await response.json();
    setLoading(false);

    if (!response.ok) {
      setError(payload.error ?? "Unable to save product.");
      return;
    }

    setProducts((current) =>
      editingId
        ? current.map((product) =>
            product.id === editingId ? payload.product : product
          )
        : [payload.product, ...current]
    );
    resetForm();
  }

  async function deleteProduct(productId: string) {
    setError(null);
    const response = await fetch(`/api/products/${productId}`, {
      method: "DELETE"
    });

    if (!response.ok) {
      const payload = await response.json();
      setError(payload.error ?? "Unable to delete product.");
      return;
    }

    setProducts((current) =>
      current.filter((product) => product.id !== productId)
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
      <form
        onSubmit={submitProduct}
        className="rounded-lg border border-line bg-white p-5"
      >
        <h2 className="text-base font-semibold text-ink">
          {editingProduct ? "Edit product" : "Add product"}
        </h2>
        <div className="mt-4 space-y-4">
          {[
            ["name", "Product name", "text"],
            ["category", "Category", "text"],
            ["sku", "SKU", "text"],
            ["price", "Price", "number"],
            ["current_stock", "Current stock", "number"],
            ["min_stock", "Minimum stock", "number"]
          ].map(([field, label, type]) => (
            <label key={field} className="block">
              <span className="text-sm font-medium text-slate-700">
                {label}
              </span>
              <input
                type={type}
                min={type === "number" ? 0 : undefined}
                step={field === "price" ? "0.01" : undefined}
                value={form[field as keyof ProductForm]}
                onChange={(event) =>
                  updateField(
                    field as keyof ProductForm,
                    event.target.value
                  )
                }
                className="focus-ring mt-1 h-10 w-full rounded-md border border-line px-3"
                required
              />
            </label>
          ))}
        </div>
        {error ? (
          <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        ) : null}
        <div className="mt-5 flex gap-2">
          <Button type="submit" disabled={loading}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            {loading ? "Saving..." : editingId ? "Update" : "Create"}
          </Button>
          {editingId ? (
            <Button type="button" variant="secondary" onClick={resetForm}>
              Cancel
            </Button>
          ) : null}
        </div>
      </form>

      <div className="rounded-lg border border-line bg-white">
        {products.length === 0 ? (
          <div className="p-5">
            <EmptyState
              title="No products yet"
              description="Add your first product to start tracking inventory and generating forecasts."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-line text-sm">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">SKU</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Stock</th>
                  <th className="px-4 py-3">Minimum</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {products.map((product) => (
                  <tr key={product.id}>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-ink">{product.name}</p>
                      <p className="text-xs text-slate-500">
                        {product.category}
                      </p>
                    </td>
                    <td className="px-4 py-3">{product.sku}</td>
                    <td className="px-4 py-3">
                      {formatCurrency(product.price)}
                    </td>
                    <td className="px-4 py-3">{product.current_stock}</td>
                    <td className="px-4 py-3">{product.min_stock}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={() => startEdit(product)}
                        >
                          <Pencil className="h-4 w-4" aria-hidden="true" />
                        </Button>
                        <Button
                          type="button"
                          variant="danger"
                          size="sm"
                          onClick={() => deleteProduct(product.id)}
                        >
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                        </Button>
                      </div>
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
