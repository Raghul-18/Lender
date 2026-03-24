-- ── PRODUCT RATES TABLE ───────────────────────────────────────
-- Stores configurable APR rates by product type and term range.
-- Admins can manage these through the /admin/rates UI.

create table public.product_rates (
  id              uuid primary key default gen_random_uuid(),
  product_type    text not null,
  rate_type       text not null default 'Fixed',
  min_term_months int  not null default 1,
  max_term_months int  not null default 120,
  apr_pct         numeric(5,2) not null,
  is_active       boolean not null default true,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- ── RLS ───────────────────────────────────────────────────────
alter table public.product_rates enable row level security;

-- Any authenticated user can read active rates (needed for deal wizard)
create policy "Authenticated users can read active rates"
  on public.product_rates for select
  to authenticated
  using (is_active = true);

-- Admins can read all rates (including inactive)
create policy "Admins can read all rates"
  on public.product_rates for select
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Admins can insert / update / delete rates
create policy "Admins can manage rates"
  on public.product_rates for all
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- ── updated_at trigger ────────────────────────────────────────
create trigger set_product_rates_updated_at
  before update on public.product_rates
  for each row execute function public.set_updated_at();

-- ── DEFAULT SEED RATES ────────────────────────────────────────
insert into public.product_rates (product_type, rate_type, min_term_months, max_term_months, apr_pct) values
  ('Asset Finance — Hire Purchase', 'Fixed',    1,  36, 6.90),
  ('Asset Finance — Hire Purchase', 'Fixed',   37,  60, 7.20),
  ('Asset Finance — Hire Purchase', 'Fixed',   61, 120, 7.90),
  ('Asset Finance — Finance Lease', 'Fixed',    1,  36, 6.50),
  ('Asset Finance — Finance Lease', 'Fixed',   37,  60, 6.90),
  ('Asset Finance — Finance Lease', 'Fixed',   61, 120, 7.50),
  ('Operating Lease',               'Fixed',    1,  60, 6.20),
  ('Refinance',                     'Fixed',    1,  60, 8.50),
  ('Working Capital',               'Fixed',    1,  36, 9.90),
  ('Invoice Finance',               'Variable', 1,  12, 5.50);
