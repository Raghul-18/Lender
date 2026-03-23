-- ============================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================

-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.originator_applications enable row level security;
alter table public.originator_documents enable row level security;
alter table public.verification_checks enable row level security;
alter table public.audit_logs enable row level security;
alter table public.deals enable row level security;
alter table public.contracts enable row level security;
alter table public.payment_schedule enable row level security;
alter table public.prospects enable row level security;
alter table public.prospect_activities enable row level security;
alter table public.quotes enable row level security;
alter table public.notifications enable row level security;

-- Helper: get current user's role
create or replace function public.current_user_role()
returns text language sql stable security definer as $$
  select role from public.profiles where id = auth.uid()
$$;

-- ── PROFILES ───────────────────────────────────────────────
create policy "Users can view own profile"
  on public.profiles for select using (id = auth.uid());

create policy "Admins can view all profiles"
  on public.profiles for select using (current_user_role() = 'admin');

create policy "Users can update own profile"
  on public.profiles for update using (id = auth.uid());

-- ── ORIGINATOR APPLICATIONS ────────────────────────────────
create policy "Originators can view own application"
  on public.originator_applications for select
  using (user_id = auth.uid());

create policy "Originators can insert own application"
  on public.originator_applications for insert
  with check (user_id = auth.uid());

create policy "Originators can update own draft application"
  on public.originator_applications for update
  using (user_id = auth.uid() and status in ('draft', 'info_requested'));

create policy "Admins can view all applications"
  on public.originator_applications for select
  using (current_user_role() = 'admin');

create policy "Admins can update any application"
  on public.originator_applications for update
  using (current_user_role() = 'admin');

-- ── ORIGINATOR DOCUMENTS ───────────────────────────────────
create policy "Originators can view own documents"
  on public.originator_documents for select
  using (application_id in (
    select id from public.originator_applications where user_id = auth.uid()
  ));

create policy "Originators can insert own documents"
  on public.originator_documents for insert
  with check (application_id in (
    select id from public.originator_applications where user_id = auth.uid()
  ));

create policy "Originators can update own documents"
  on public.originator_documents for update
  using (application_id in (
    select id from public.originator_applications where user_id = auth.uid()
  ));

create policy "Admins can view all documents"
  on public.originator_documents for select
  using (current_user_role() = 'admin');

-- ── VERIFICATION CHECKS ────────────────────────────────────
create policy "Originators can view own checks"
  on public.verification_checks for select
  using (application_id in (
    select id from public.originator_applications where user_id = auth.uid()
  ));

create policy "Admins can view and update all checks"
  on public.verification_checks for all
  using (current_user_role() = 'admin');

create policy "System can insert checks"
  on public.verification_checks for insert
  with check (true);

create policy "System can update checks"
  on public.verification_checks for update
  using (true);

-- ── DEALS ──────────────────────────────────────────────────
create policy "Originators can manage own deals"
  on public.deals for all
  using (originator_id = auth.uid());

create policy "Admins can view all deals"
  on public.deals for select
  using (current_user_role() = 'admin');

-- ── CONTRACTS ──────────────────────────────────────────────
create policy "Originators can view contracts they originated"
  on public.contracts for select
  using (originator_id = auth.uid());

create policy "Customers can view their own contracts"
  on public.contracts for select
  using (customer_id = auth.uid());

create policy "Admins can view all contracts"
  on public.contracts for all
  using (current_user_role() = 'admin');

-- ── PAYMENT SCHEDULE ───────────────────────────────────────
create policy "Users can view payment schedule for their contracts"
  on public.payment_schedule for select
  using (contract_id in (
    select id from public.contracts
    where originator_id = auth.uid() or customer_id = auth.uid()
  ));

create policy "Admins can view all payment schedules"
  on public.payment_schedule for all
  using (current_user_role() = 'admin');

-- ── PROSPECTS ──────────────────────────────────────────────
create policy "Originators can manage own prospects"
  on public.prospects for all
  using (originator_id = auth.uid());

create policy "Admins can view all prospects"
  on public.prospects for select
  using (current_user_role() = 'admin');

-- ── PROSPECT ACTIVITIES ────────────────────────────────────
create policy "Originators can manage activities for their prospects"
  on public.prospect_activities for all
  using (prospect_id in (
    select id from public.prospects where originator_id = auth.uid()
  ));

-- ── QUOTES ─────────────────────────────────────────────────
create policy "Originators can manage own quotes"
  on public.quotes for all
  using (originator_id = auth.uid());

create policy "Admins can view all quotes"
  on public.quotes for select
  using (current_user_role() = 'admin');

-- ── NOTIFICATIONS ──────────────────────────────────────────
create policy "Users can view own notifications"
  on public.notifications for select
  using (user_id = auth.uid());

create policy "Users can update own notifications (mark read)"
  on public.notifications for update
  using (user_id = auth.uid());

create policy "System can insert notifications"
  on public.notifications for insert
  with check (true);

-- ── AUDIT LOGS ─────────────────────────────────────────────
create policy "Admins can view audit logs"
  on public.audit_logs for select
  using (current_user_role() = 'admin');

create policy "System can insert audit logs"
  on public.audit_logs for insert
  with check (true);

-- ── STORAGE RLS ────────────────────────────────────────────
-- Run these after creating storage buckets in the dashboard:
-- create policy "Originators can upload own documents"
--   on storage.objects for insert
--   with check (bucket_id = 'documents' and auth.uid()::text = (storage.foldername(name))[1]);
-- create policy "Originators can view own documents"
--   on storage.objects for select
--   using (bucket_id = 'documents' and auth.uid()::text = (storage.foldername(name))[1]);
-- create policy "Admins can view all documents"
--   on storage.objects for select
--   using (bucket_id = 'documents' and current_user_role() = 'admin');
