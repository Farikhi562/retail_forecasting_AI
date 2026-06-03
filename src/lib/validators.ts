import { z } from "zod";

export const productSchema = z.object({
  name: z.string().trim().min(2, "Product name is required."),
  category: z.string().trim().min(2, "Category is required."),
  sku: z.string().trim().min(2, "SKU is required."),
  price: z.coerce.number().min(0, "Price cannot be negative."),
  current_stock: z.coerce.number().int().min(0, "Stock cannot be negative."),
  min_stock: z.coerce.number().int().min(0, "Minimum stock cannot be negative.")
});

export const salesRecordSchema = z.object({
  product_id: z.string().uuid("Select a product."),
  quantity_sold: z.coerce
    .number()
    .int()
    .min(1, "Quantity sold must be at least 1."),
  sale_date: z.string().min(1, "Sale date is required.")
});
