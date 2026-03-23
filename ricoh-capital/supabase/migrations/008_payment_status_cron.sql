-- ── AUTOMATED PAYMENT STATUS UPDATES ────────────────────────
-- Requires the pg_cron extension.
-- Enable it: Supabase Dashboard → Database → Extensions → pg_cron → Enable
-- Then run this file in the SQL Editor.

-- Helper function: update all payment + contract statuses
create or replace function public.refresh_payment_statuses()
returns void language plpgsql security definer as $$
declare
  v_today        date := current_date;
  v_due_soon     date := current_date + interval '7 days';
  v_ninety_days  date := current_date + interval '90 days';
begin
  -- 1. Mark payments due within 7 days as due_soon
  update public.payment_schedule
  set status = 'due_soon'
  where status = 'upcoming'
    and due_date <= v_due_soon
    and due_date >= v_today;

  -- 2. Mark missed payments as overdue
  update public.payment_schedule
  set status = 'overdue'
  where status in ('upcoming', 'due_soon')
    and due_date < v_today;

  -- 3. Mark contracts overdue if they have any overdue payment
  update public.contracts c
  set status = 'overdue'
  where c.status in ('active', 'maturing')
    and exists (
      select 1 from public.payment_schedule ps
      where ps.contract_id = c.id and ps.status = 'overdue'
    );

  -- 4. Mark contracts as maturing (end date within 90 days)
  update public.contracts
  set status = 'maturing'
  where status = 'active'
    and end_date <= v_ninety_days
    and end_date >= v_today;

  -- 5. Mark contracts completed (end date in the past, no overdue payments)
  update public.contracts c
  set status = 'completed'
  where c.status in ('active', 'maturing')
    and c.end_date < v_today
    and not exists (
      select 1 from public.payment_schedule ps
      where ps.contract_id = c.id and ps.status = 'overdue'
    );

  -- 6. Expire quotes past their valid_until date
  update public.quotes
  set status = 'expired'
  where status in ('draft', 'sent')
    and valid_until < v_today;

  -- Log the run
  insert into public.audit_logs (entity_type, action, details)
  values ('system', 'status_change', jsonb_build_object(
    'job', 'refresh_payment_statuses',
    'run_at', v_today::text
  ));
end;
$$;

-- Grant execute to service role (edge function uses service role)
grant execute on function public.refresh_payment_statuses() to service_role;

-- ── Schedule: run every day at 02:00 UTC ─────────────────────
-- Uncomment AFTER enabling pg_cron extension in Supabase dashboard:
--
-- select cron.schedule(
--   'refresh-payment-statuses',
--   '0 2 * * *',
--   $$ select public.refresh_payment_statuses(); $$
-- );
--
-- To check scheduled jobs:  select * from cron.job;
-- To remove:  select cron.unschedule('refresh-payment-statuses');
