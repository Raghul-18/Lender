-- ── CUSTOMER PAY-NOW ───────────────────────────────────────
-- Track actual amount paid and any voluntary principal overpayment
alter table public.payment_schedule
  add column if not exists amount_paid     numeric,
  add column if not exists extra_principal numeric default 0;

-- Customers can mark their own instalments as paid (self-service)
do $$
begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'payment_schedule'
      and policyname = 'Customers can pay their own instalments'
  ) then
    create policy "Customers can pay their own instalments"
      on public.payment_schedule for update
      using (
        contract_id in (
          select id from public.contracts
          where customer_id = auth.uid()
        )
      )
      with check (
        contract_id in (
          select id from public.contracts
          where customer_id = auth.uid()
        )
      );
  end if;
end $$;
