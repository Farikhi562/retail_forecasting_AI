export type StockoutRisk = "low" | "medium" | "high";

export type Profile = {
  id: string;
  full_name: string | null;
  business_name: string | null;
  created_at: string;
  updated_at: string;
};

export type Product = {
  id: string;
  user_id: string;
  name: string;
  category: string;
  sku: string;
  price: number;
  current_stock: number;
  min_stock: number;
  created_at: string;
  updated_at: string;
};

export type SalesRecord = {
  id: string;
  user_id: string;
  product_id: string;
  quantity_sold: number;
  revenue: number;
  sale_date: string;
  created_at: string;
  products?: Pick<Product, "name" | "sku" | "price"> | null;
};

export type Forecast = {
  id: string;
  user_id: string;
  product_id: string;
  predicted_sales_next_7_days: number;
  estimated_days_until_stockout: number;
  stockout_risk: StockoutRisk;
  recommended_restock_quantity: number;
  explanation: string;
  model_version: string;
  created_at: string;
  products?: Pick<Product, "name" | "sku" | "category"> | null;
};

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Profile> & { id: string };
        Update: Partial<Profile>;
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey";
            columns: ["id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      products: {
        Row: Product;
        Insert: Omit<Product, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Product, "id" | "user_id" | "created_at">>;
        Relationships: [
          {
            foreignKeyName: "products_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      sales_records: {
        Row: SalesRecord;
        Insert: Omit<SalesRecord, "id" | "created_at" | "products"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<SalesRecord, "id" | "user_id" | "products">>;
        Relationships: [
          {
            foreignKeyName: "sales_records_product_id_fkey";
            columns: ["product_id"];
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "sales_records_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      forecasts: {
        Row: Forecast;
        Insert: Omit<Forecast, "id" | "created_at" | "products"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<Forecast, "id" | "user_id" | "products">>;
        Relationships: [
          {
            foreignKeyName: "forecasts_product_id_fkey";
            columns: ["product_id"];
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "forecasts_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
