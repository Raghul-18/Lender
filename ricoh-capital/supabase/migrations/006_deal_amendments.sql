-- ── DEAL AMENDMENTS ─────────────────────────────────────────
-- Customers / originators can request changes to approved deal terms.
create table if not exists public.deal_amendments (
  id              uuid primary key default gen_random_uuid(),
  deal_id         uuid references public.deals(id) on delete cascade not null,
  contract_id     uuid references public.contracts(id) on delete set null,
  requested_by    uuid references public.profiles(id) not null,
  amendment_type  text check (amendment_type in (
    'term_extension', 'payment_holiday', 'settlement', 'rate_change', 'other'
  )) not null,
  description     text not null,
  status          text check (status in (
    'pending', 'under_review', 'approved', 'rejected'
  )) default 'pending',
  admin_notes     text,
  reviewed_by     uuid references public.profiles(id),
  reviewed_at     timestamptz,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

create trigger handle_updated_at before update on public.deal_amendments
  for each row execute procedure public.handle_updated_at();

-- RLS
alter table public.deal_amendments enable row level security;

-- Originators can see amendments for their own deals
create policy "Originators can view their deal amendments"
  on public.deal_amendments for select
  using (
    exists (
      select 1 from public.deals d
      where d.id = deal_id and d.originator_id = auth.uid()
    )
  );

-- Originators can create amendments for their own deals
create policy "Originators can create deal amendments"
  on public.deal_amendments for insert
  with check (
    requested_by = auth.uid() and
    exists (
      select 1 from public.deals d
      where d.id = deal_id and d.originator_id = auth.uid()
    )
  );

-- Admins can view all amendments
create policy "Admins can view all deal amendments"
  on public.deal_amendments for select
  using (current_user_role() = 'admin');

-- Admins can update (approve/reject) amendments
create policy "Admins can update deal amendments"
  on public.deal_amendments for update
  using (current_user_role() = 'admin');
