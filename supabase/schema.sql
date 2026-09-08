-- "Παραγγελίες" — αρχικό schema + multi-tenant RLS
-- Τρέξε ολόκληρο αυτό το αρχείο στο Supabase SQL editor (project > SQL Editor > New query).

create extension if not exists "pgcrypto";

-- 1. Ένα "restaurant" ανά λογαριασμό/tenant
create table if not exists public.restaurants (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  name text not null default 'Το εστιατόριο μου',
  created_at timestamptz not null default now()
);

create table if not exists public.suppliers (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  name text not null,
  contact_phone text,
  contact_email text,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  supplier_id uuid not null references public.suppliers (id) on delete cascade,
  name text not null,
  unit text not null default 'τεμάχια',
  last_known_price numeric(10, 2),
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  product_id uuid references public.products (id) on delete set null,
  supplier_id uuid not null references public.suppliers (id) on delete cascade,
  product_name_snapshot text not null,
  unit text not null,
  quantity numeric(10, 2) not null,
  price_at_order numeric(10, 2),
  created_at timestamptz not null default now()
);

create index if not exists suppliers_restaurant_id_idx on public.suppliers (restaurant_id);
create index if not exists products_restaurant_id_idx on public.products (restaurant_id);
create index if not exists products_supplier_id_idx on public.products (supplier_id);
create index if not exists orders_restaurant_id_idx on public.orders (restaurant_id);
create index if not exists order_items_order_id_idx on public.order_items (order_id);
create index if not exists order_items_supplier_id_idx on public.order_items (supplier_id);

-- 2. Row Level Security — κάθε tenant βλέπει μόνο τα δικά του δεδομένα
alter table public.restaurants enable row level security;
alter table public.suppliers enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

create policy "owner_select_own_restaurant" on public.restaurants
  for select using (owner_id = auth.uid());
create policy "owner_update_own_restaurant" on public.restaurants
  for update using (owner_id = auth.uid());

create policy "tenant_all_suppliers" on public.suppliers
  for all using (
    restaurant_id in (select id from public.restaurants where owner_id = auth.uid())
  );

create policy "tenant_all_products" on public.products
  for all using (
    restaurant_id in (select id from public.restaurants where owner_id = auth.uid())
  );

create policy "tenant_all_orders" on public.orders
  for all using (
    restaurant_id in (select id from public.restaurants where owner_id = auth.uid())
  );

create policy "tenant_all_order_items" on public.order_items
  for all using (
    supplier_id in (
      select s.id from public.suppliers s
      join public.restaurants r on r.id = s.restaurant_id
      where r.owner_id = auth.uid()
    )
  );

-- 3. Αυτόματη δημιουργία restaurant row στο signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.restaurants (owner_id, name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'restaurant_name', 'Το εστιατόριο μου'));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
