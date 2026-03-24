-- ── ENABLE AUTOMATED PAYMENT STATUS UPDATES ──────────────────
--
-- PREREQUISITES (one-time setup in Supabase dashboard):
--   1. Go to: Database → Extensions → search "pg_cron" → Enable
--   2. Then run this file in the SQL Editor
--
-- The function refresh_payment_statuses() was created in 008_payment_status_cron.sql
-- This migration schedules it to run automatically every day at 02:00 UTC.

-- Schedule: every day at 02:00 UTC
select cron.schedule(
  'refresh-payment-statuses',           -- job name (must be unique)
  '0 2 * * *',                          -- cron expression: daily at 02:00 UTC
  $$ select public.refresh_payment_statuses(); $$
);

-- ── Useful management queries (run manually as needed) ─────────

-- View all scheduled jobs:
-- select * from cron.job;

-- View recent job runs:
-- select * from cron.job_run_details order by start_time desc limit 20;

-- Remove the schedule (if you need to change it):
-- select cron.unschedule('refresh-payment-statuses');

-- Run immediately (manual trigger):
-- select public.refresh_payment_statuses();
