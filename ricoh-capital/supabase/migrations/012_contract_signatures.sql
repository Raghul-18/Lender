-- ── CONTRACT SIGNATURES ───────────────────────────────────────
-- Stores electronic signature records for contracts.
-- When a customer clicks "Sign", we record: their user ID, contract ID,
-- typed name, timestamp, and user-agent. This constitutes a legally
-- binding electronic signature in most jurisdictions.

create table public.contract_signatures (
  id             uuid primary key default gen_random_uuid(),
  contract_id    uuid not null references public.contracts(id) on delete cascade,
  signed_by      uuid not null references auth.users(id),
  full_name_typed text not null,
  user_agent     text,
  signed_at      timestamptz not null default now(),
  agreement_text text not null default
    'I have read, understood, and agree to be bound by the terms of this finance agreement.'
);

-- Only one signature per contract
create unique index contract_signatures_contract_id_key on public.contract_signatures(contract_id);

-- ── RLS ───────────────────────────────────────────────────────
alter table public.contract_signatures enable row level security;

-- Customer can insert their own signature
create policy "Customers can sign their own contracts"
  on public.contract_signatures for insert
  to authenticated
  with check (
    signed_by = auth.uid() and
    exists (
      select 1 from public.contracts
      where id = contract_id and customer_id = auth.uid()
    )
  );

-- Customer can read their own signatures
create policy "Users can read their own signatures"
  on public.contract_signatures for select
  to authenticated
  using (signed_by = auth.uid());

-- Admins can read all signatures
create policy "Admins can read all signatures"
  on public.contract_signatures for select
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- ── Add signed_at column to contracts ────────────────────────
-- Track whether a contract has been signed at a glance
alter table public.contracts
  add column if not exists signed_at timestamptz;

-- Automatically stamp contracts.signed_at when a signature is inserted
create or replace function public.stamp_contract_signed()
returns trigger language plpgsql security definer as $$
begin
  update public.contracts
  set signed_at = new.signed_at
  where id = new.contract_id;
  return new;
end;
$$;

create trigger after_contract_signature
  after insert on public.contract_signatures
  for each row execute function public.stamp_contract_signed();
