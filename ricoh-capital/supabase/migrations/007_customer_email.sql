-- Add customer_email to deals so admin can invite the end-client to the portal
alter table public.deals add column if not exists customer_email text;

-- Add deactivated status to originator profiles (admin user management)
alter table public.profiles
  drop constraint if exists profiles_onboarding_status_check;

alter table public.profiles
  add constraint profiles_onboarding_status_check
  check (onboarding_status in (
    'pending', 'submitted', 'under_review', 'info_requested',
    'approved', 'rejected', 'deactivated'
  ));
