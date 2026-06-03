create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  business_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  category text not null,
  sku text not null,
  price numeric not null default 0 check (price >= 0),
  current_stock integer not null default 0 check (current_stock >= 0),
  min_stock integer not null default 0 check (min_stock >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, sku)
);

create table if not exists public.sales_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  quantity_sold integer not null check (quantity_sold > 0),
  revenue numeric not null default 0 check (revenue >= 0),
  sale_date date not null,
  created_at timestamptz not null default now()
);

create table if not exists public.forecasts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  predicted_sales_next_7_days numeric not null default 0,
  estimated_days_until_stockout numeric not null default 0,
  stockout_risk text not null check (stockout_risk in ('low', 'medium', 'high')),
  recommended_restock_quantity integer not null default 0,
  explanation text not null,
  model_version text not null,
  created_at timestamptz not null default now()
);

create index if not exists products_user_id_idx on public.products(user_id);
create index if not exists sales_records_user_id_sale_date_idx
  on public.sales_records(user_id, sale_date desc);
create index if not exists sales_records_product_id_idx
  on public.sales_records(product_id);
create index if not exists forecasts_user_id_created_at_idx
  on public.forecasts(user_id, created_at desc);
create index if not exists forecasts_product_id_idx
  on public.forecasts(product_id);

alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.sales_records enable row level security;
alter table public.forecasts enable row level security;

create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can read own products"
  on public.products for select
  using (auth.uid() = user_id);

create policy "Users can insert own products"
  on public.products for insert
  with check (auth.uid() = user_id);

create policy "Users can update own products"
  on public.products for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own products"
  on public.products for delete
  using (auth.uid() = user_id);

create policy "Users can read own sales records"
  on public.sales_records for select
  using (auth.uid() = user_id);

create policy "Users can insert own sales records"
  on public.sales_records for insert
  with check (auth.uid() = user_id);

create policy "Users can update own sales records"
  on public.sales_records for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own sales records"
  on public.sales_records for delete
  using (auth.uid() = user_id);

create policy "Users can read own forecasts"
  on public.forecasts for select
  using (auth.uid() = user_id);

create policy "Users can insert own forecasts"
  on public.forecasts for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own forecasts"
  on public.forecasts for delete
  using (auth.uid() = user_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, business_name)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'business_name'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
