-- ============================================================
-- ZORO CAPITAL — Deal review admin fields + RLS additions
-- Run after 001_schema.sql, 002_rls.sql, 003_seed.sql
-- ============================================================

-- Add admin decision fields to deals
alter table public.deals
  add column if not exists admin_notes      text,
  add column if not exists reviewed_by      uuid references public.profiles(id),
  add column if not exists reviewed_at      timestamptz;

-- Allow admins to update deal records (credit decisions)
do $$ begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'deals' and policyname = 'Admins can update all deals'
  ) then
    create policy "Admins can update all deals"
      on public.deals for update
      using (current_user_role() = 'admin');
  end if;
end $$;

-- Allow admins to create contracts (when approving deals)
do $$ begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'contracts' and policyname = 'Admins can insert contracts'
  ) then
    create policy "Admins can insert contracts"
      on public.contracts for insert
      with check (current_user_role() = 'admin');
  end if;
end $$;

-- Allow admins to insert payment schedule entries
do $$ begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'payment_schedule' and policyname = 'Admins can insert payment schedules'
  ) then
    create policy "Admins can insert payment schedules"
      on public.payment_schedule for insert
      with check (current_user_role() = 'admin');
  end if;
end $$;
