-- ============================================================
-- ZORO CAPITAL — SUPABASE SCHEMA
-- Run in order: 001_schema → 002_rls → 003_seed
-- ============================================================

-- ── PROFILES ───────────────────────────────────────────────
create table if not exists public.profiles (
  id            uuid references auth.users on delete cascade primary key,
  email         text unique not null,
  full_name     text,
  role          text check (role in ('originator', 'admin', 'customer')) not null default 'originator',
  company_name  text,
  onboarding_status text check (onboarding_status in (
    'pending', 'submitted', 'under_review', 'info_requested', 'approved', 'rejected'
  )) default 'pending',
  avatar_initials text,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- ── ORIGINATOR APPLICATIONS ────────────────────────────────
create table if not exists public.originator_applications (
  id                          uuid primary key default gen_random_uuid(),
  user_id                     uuid references public.profiles(id) on delete cascade not null,
  company_name                text,
  company_reg_number          text,
  company_type                text,
  registered_address          text,
  contact_first_name          text,
  contact_last_name           text,
  contact_email               text,
  contact_job_title           text,
  product_lines               text[] default '{}',
  status                      text check (status in (
    'draft', 'submitted', 'under_review', 'info_requested', 'approved', 'rejected'
  )) default 'draft',
  risk_score                  integer,
  admin_notes                 text,
  reviewed_by                 uuid references public.profiles(id),
  reviewed_at                 timestamptz,
  rejection_reason            text,
  created_at                  timestamptz default now(),
  updated_at                  timestamptz default now()
);

-- ── ORIGINATOR DOCUMENTS ───────────────────────────────────
create table if not exists public.originator_documents (
  id              uuid primary key default gen_random_uuid(),
  application_id  uuid references public.originator_applications(id) on delete cascade not null,
  document_type   text not null,
  display_name    text not null,
  file_name       text,
  file_path       text,
  file_size       bigint,
  mime_type       text,
  status          text check (status in ('pending', 'uploading', 'uploaded', 'verified', 'failed')) default 'pending',
  failure_reason  text,
  uploaded_at     timestamptz,
  created_at      timestamptz default now()
);

-- ── VERIFICATION CHECKS ────────────────────────────────────
create table if not exists public.verification_checks (
  id              uuid primary key default gen_random_uuid(),
  application_id  uuid references public.originator_applications(id) on delete cascade not null,
  check_type      text not null,
  display_name    text not null,
  status          text check (status in ('queued', 'running', 'passed', 'failed')) default 'queued',
  result_detail   text,
  checked_at      timestamptz,
  created_at      timestamptz default now()
);

-- ── AUDIT LOGS ─────────────────────────────────────────────
create table if not exists public.audit_logs (
  id            uuid primary key default gen_random_uuid(),
  entity_type   text not null,
  entity_id     uuid,
  action        text not null,
  performed_by  uuid references public.profiles(id),
  details       jsonb,
  created_at    timestamptz default now()
);

-- ── DEALS ──────────────────────────────────────────────────
create table if not exists public.deals (
  id                   uuid primary key default gen_random_uuid(),
  originator_id        uuid references public.profiles(id) not null,
  customer_name        text not null,
  product_type         text not null,
  originator_reference text,
  preferred_start_date date,
  notes                text,
  asset_type           text,
  asset_make           text,
  asset_model          text,
  asset_year           integer,
  asset_value          numeric,
  term_months          integer,
  deposit              numeric default 0,
  balloon              numeric default 0,
  rate_type            text default 'Fixed',
  monthly_payment      numeric,
  apr                  numeric default 7.2,
  total_payable        numeric,
  status               text check (status in (
    'draft', 'submitted', 'under_review', 'approved', 'rejected'
  )) default 'draft',
  reference_number     text unique,
  created_at           timestamptz default now(),
  updated_at           timestamptz default now()
);

-- ── CONTRACTS ──────────────────────────────────────────────
create table if not exists public.contracts (
  id                uuid primary key default gen_random_uuid(),
  deal_id           uuid references public.deals(id),
  originator_id     uuid references public.profiles(id) not null,
  customer_id       uuid references public.profiles(id),
  customer_name     text not null,
  asset_description text not null,
  asset_value       numeric,
  monthly_payment   numeric,
  term_months       integer,
  start_date        date,
  end_date          date,
  next_payment_date date,
  payments_made     integer default 0,
  status            text check (status in (
    'active', 'overdue', 'maturing', 'completed', 'cancelled'
  )) default 'active',
  reference_number  text unique not null,
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);

-- ── PAYMENT SCHEDULE ───────────────────────────────────────
create table if not exists public.payment_schedule (
  id              uuid primary key default gen_random_uuid(),
  contract_id     uuid references public.contracts(id) on delete cascade not null,
  payment_number  integer not null,
  due_date        date not null,
  amount          numeric not null,
  status          text check (status in ('upcoming', 'due_soon', 'paid', 'overdue')) default 'upcoming',
  paid_at         timestamptz,
  created_at      timestamptz default now()
);

-- ── PROSPECTS (CRM) ────────────────────────────────────────
create table if not exists public.prospects (
  id                  uuid primary key default gen_random_uuid(),
  originator_id       uuid references public.profiles(id) not null,
  company_name        text not null,
  city                text,
  industry            text,
  annual_turnover     numeric,
  employee_count      integer,
  contact_name        text,
  contact_email       text,
  contact_phone       text,
  secondary_contact_name  text,
  secondary_contact_email text,
  pipeline_stage      text check (pipeline_stage in (
    'New lead', 'Qualified', 'Proposal', 'Negotiation', 'Won', 'Lost'
  )) default 'New lead',
  product_interest    text,
  estimated_value     numeric,
  qualification_score integer,
  notes               text,
  assigned_to         uuid references public.profiles(id),
  created_at          timestamptz default now(),
  updated_at          timestamptz default now()
);

-- ── PROSPECT ACTIVITIES ────────────────────────────────────
create table if not exists public.prospect_activities (
  id            uuid primary key default gen_random_uuid(),
  prospect_id   uuid references public.prospects(id) on delete cascade not null,
  activity_type text check (activity_type in (
    'call', 'email', 'note', 'quote', 'created', 'stage_change'
  )) not null,
  description   text not null,
  created_by    uuid references public.profiles(id),
  created_at    timestamptz default now()
);

-- ── QUOTES ─────────────────────────────────────────────────
create table if not exists public.quotes (
  id               uuid primary key default gen_random_uuid(),
  originator_id    uuid references public.profiles(id) not null,
  prospect_id      uuid references public.prospects(id),
  customer_name    text not null,
  asset_type       text,
  asset_value      numeric,
  scenarios        jsonb default '[]',
  reference_number text unique,
  status           text check (status in (
    'draft', 'sent', 'accepted', 'rejected', 'expired'
  )) default 'draft',
  valid_until      date,
  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);

-- ── NOTIFICATIONS ──────────────────────────────────────────
create table if not exists public.notifications (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references public.profiles(id) on delete cascade not null,
  title       text not null,
  body        text,
  type        text check (type in (
    'payment_reminder', 'deal_update', 'quote_update',
    'contract_update', 'onboarding_update', 'system'
  )) default 'system',
  read        boolean default false,
  related_id  uuid,
  created_at  timestamptz default now()
);

-- ── TRIGGERS & FUNCTIONS ───────────────────────────────────

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, role, company_name, avatar_initials)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'role', 'originator'),
    coalesce(new.raw_user_meta_data->>'company_name', ''),
    coalesce(upper(substring(coalesce(new.raw_user_meta_data->>'full_name', 'U') for 1) ||
             substring(split_part(coalesce(new.raw_user_meta_data->>'full_name', 'U U'), ' ', 2) for 1)), 'U')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Auto-generate deal reference numbers
create or replace function public.generate_deal_reference()
returns trigger language plpgsql as $$
begin
  if new.reference_number is null then
    new.reference_number := 'ZC-' || to_char(now(), 'YYYY') || '-' ||
      lpad(floor(random() * 99999 + 10000)::text, 5, '0');
  end if;
  return new;
end;
$$;

drop trigger if exists set_deal_reference on public.deals;
create trigger set_deal_reference
  before insert on public.deals
  for each row execute procedure public.generate_deal_reference();

-- Auto-generate quote reference numbers
create or replace function public.generate_quote_reference()
returns trigger language plpgsql as $$
begin
  if new.reference_number is null then
    new.reference_number := 'QT-' || to_char(now(), 'YYYY') || '-' ||
      lpad(floor(random() * 9999 + 1000)::text, 4, '0');
  end if;
  if new.valid_until is null then
    new.valid_until := (now() + interval '30 days')::date;
  end if;
  return new;
end;
$$;

drop trigger if exists set_quote_reference on public.quotes;
create trigger set_quote_reference
  before insert on public.quotes
  for each row execute procedure public.generate_quote_reference();

-- Update updated_at timestamps
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger handle_updated_at before update on public.profiles
  for each row execute procedure public.handle_updated_at();
create trigger handle_updated_at before update on public.originator_applications
  for each row execute procedure public.handle_updated_at();
create trigger handle_updated_at before update on public.deals
  for each row execute procedure public.handle_updated_at();
create trigger handle_updated_at before update on public.contracts
  for each row execute procedure public.handle_updated_at();
create trigger handle_updated_at before update on public.prospects
  for each row execute procedure public.handle_updated_at();
create trigger handle_updated_at before update on public.quotes
  for each row execute procedure public.handle_updated_at();

-- Sync onboarding_status on profiles when application status changes
create or replace function public.sync_onboarding_status()
returns trigger language plpgsql security definer as $$
begin
  update public.profiles
  set onboarding_status = new.status, updated_at = now()
  where id = new.user_id;
  return new;
end;
$$;

drop trigger if exists sync_status on public.originator_applications;
create trigger sync_status
  after update of status on public.originator_applications
  for each row execute procedure public.sync_onboarding_status();

-- Supabase Storage bucket setup (run manually in Supabase dashboard or via CLI)
-- insert into storage.buckets (id, name, public) values ('documents', 'documents', false);
-- insert into storage.buckets (id, name, public) values ('contracts', 'contracts', false);
