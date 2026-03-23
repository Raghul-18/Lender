-- ============================================================
-- ZORO CAPITAL — SEED DATA
-- Self-contained: uses email lookups instead of hardcoded UUIDs
-- Run AFTER: 001_schema.sql, 002_rls.sql
-- Run AFTER: creating the three users in Supabase Auth dashboard
-- ============================================================

-- ── STEP 1: Set roles & display names on profiles ──────────
update public.profiles
set role = 'admin', full_name = 'Sarah Phillips', company_name = 'Zoro Capital',
    avatar_initials = 'SP', onboarding_status = 'approved'
where email = 'admin@zorocapital.com';

update public.profiles
set role = 'originator', full_name = 'James Davies', company_name = 'Acme Finance Ltd',
    avatar_initials = 'JD', onboarding_status = 'approved'
where email = 'james@acmefinance.co.uk';

update public.profiles
set role = 'customer', full_name = 'TechWorks Solutions', company_name = 'TechWorks Solutions Ltd',
    avatar_initials = 'TW'
where email = 'contact@techworks.co.uk';

-- ── STEP 2: Originator application (approved) ──────────────
insert into public.originator_applications (
  user_id, company_name, company_reg_number, company_type,
  registered_address, contact_first_name, contact_last_name,
  contact_email, contact_job_title, product_lines,
  status, risk_score, reviewed_at
)
values (
  (select id from public.profiles where email = 'james@acmefinance.co.uk'),
  'Acme Finance Ltd', '04321789', 'Limited company (Ltd)',
  '14 Fleet Street, London, EC4Y 1AA',
  'James', 'Davies', 'james@acmefinance.co.uk', 'Managing Director',
  array['asset_finance', 'vehicle_finance', 'equipment_lease'],
  'approved', 88, now()
);

-- ── STEP 3: Sample contracts ───────────────────────────────
insert into public.contracts (
  originator_id, customer_id, customer_name, asset_description,
  asset_value, monthly_payment, term_months,
  start_date, end_date, next_payment_date, payments_made,
  status, reference_number
)
values
(
  (select id from public.profiles where email = 'james@acmefinance.co.uk'),
  (select id from public.profiles where email = 'contact@techworks.co.uk'),
  'TechWorks Solutions Ltd',
  '2024 Mercedes-Benz Sprinter 316 CDI',
  42000, 1089, 36,
  '2025-01-14', '2028-01-14', '2025-03-15', 2,
  'active', 'ZC-2025-08741'
),
(
  (select id from public.profiles where email = 'james@acmefinance.co.uk'),
  null,
  'Green Valley Farms',
  '2023 JCB 3CX Backhoe Loader',
  65000, 890, 48,
  '2024-08-01', '2028-08-01', '2025-03-01', 19,
  'overdue', 'ZC-2025-07823'
),
(
  (select id from public.profiles where email = 'james@acmefinance.co.uk'),
  null,
  'Apex Logistics Ltd',
  '2022 DAF XF 480 FT Tractor Unit',
  78000, 1340, 60,
  '2020-03-01', '2025-03-01', '2025-03-10', 59,
  'maturing', 'ZC-2024-06512'
),
(
  (select id from public.profiles where email = 'james@acmefinance.co.uk'),
  null,
  'Sunrise Bakeries',
  '2023 Rational SCC WE Combi Oven',
  18500, 420, 36,
  '2023-02-01', '2026-02-01', '2025-03-20', 25,
  'active', 'ZC-2024-05901'
),
(
  (select id from public.profiles where email = 'james@acmefinance.co.uk'),
  null,
  'MedTech Devices Ltd',
  '2023 Siemens MAGNETOM Altea MRI Scanner',
  280000, 2180, 60,
  '2024-06-01', '2029-06-01', '2025-03-05', 9,
  'active', 'ZC-2024-04720'
);

-- ── STEP 4: Payment schedule (for TechWorks contract) ──────
insert into public.payment_schedule (contract_id, payment_number, due_date, amount, status)
select
  c.id,
  gs,
  (c.start_date + ((gs - 1) * interval '1 month'))::date,
  c.monthly_payment,
  case
    when gs <= 2 then 'paid'
    when gs = 3  then 'due_soon'
    else 'upcoming'
  end
from public.contracts c
cross join generate_series(1, 36) as gs
where c.reference_number = 'ZC-2025-08741';

-- ── STEP 5: Sample prospects (CRM) ────────────────────────
insert into public.prospects (
  originator_id, company_name, city, industry,
  annual_turnover, employee_count, contact_name, contact_email,
  pipeline_stage, product_interest, estimated_value, qualification_score, notes
)
values
(
  (select id from public.profiles where email = 'james@acmefinance.co.uk'),
  'Fresh Harvest Ltd', 'Bristol', 'Food & agriculture',
  2400000, 48, 'Mark Owen', 'mark@freshharvest.co.uk',
  'Proposal', 'Asset Finance', 85000, 87,
  'Interested in financing a new refrigerated fleet. Demo booked for next week.'
),
(
  (select id from public.profiles where email = 'james@acmefinance.co.uk'),
  'BuildRight Construction', 'Leeds', 'Construction',
  12000000, 210, 'Sarah Kim', 'sarah@buildright.co.uk',
  'Qualified', 'Equipment Leasing', 220000, 72,
  'Looking to lease excavators and dump trucks for a 3-year infrastructure project.'
),
(
  (select id from public.profiles where email = 'james@acmefinance.co.uk'),
  'CityFleet Services', 'London', 'Transport & logistics',
  3500000, 65, 'Peter Grant', 'peter@cityfleet.co.uk',
  'New lead', 'Asset Finance', 45000, null,
  'Initial enquiry via referral. Follow up call scheduled.'
),
(
  (select id from public.profiles where email = 'james@acmefinance.co.uk'),
  'Solaris Renewables', 'Edinburgh', 'Energy',
  8900000, 134, 'Amy Chen', 'amy@solaris.co.uk',
  'Won', 'Equipment Leasing', 310000, 95,
  'Contract signed. First payment received. Great relationship.'
),
(
  (select id from public.profiles where email = 'james@acmefinance.co.uk'),
  'Horizon Dental Group', 'Manchester', 'Healthcare',
  1800000, 32, 'Dr. Liam Walsh', 'liam@horizondental.co.uk',
  'Negotiation', 'Asset Finance', 60000, 80,
  'Three-chair dental fit-out. Finalising rate terms.'
);

-- ── STEP 6: Prospect activities ───────────────────────────
insert into public.prospect_activities (prospect_id, activity_type, description, created_by)
select
  p.id,
  'created',
  'Prospect added to CRM',
  (select id from public.profiles where email = 'james@acmefinance.co.uk')
from public.prospects p
where p.originator_id = (select id from public.profiles where email = 'james@acmefinance.co.uk');

insert into public.prospect_activities (prospect_id, activity_type, description, created_by)
values (
  (select id from public.prospects where company_name = 'Fresh Harvest Ltd' limit 1),
  'call',
  'Spoke with Mark about refrigerated fleet requirements. Needs 4 x 7.5t vans. Budget £80-90k.',
  (select id from public.profiles where email = 'james@acmefinance.co.uk')
),
(
  (select id from public.prospects where company_name = 'Fresh Harvest Ltd' limit 1),
  'email',
  'Sent product brochure and rate card for HP and finance lease options.',
  (select id from public.profiles where email = 'james@acmefinance.co.uk')
),
(
  (select id from public.prospects where company_name = 'BuildRight Construction' limit 1),
  'note',
  'CFO confirmed budget approved for Q2. Decision by end of March.',
  (select id from public.profiles where email = 'james@acmefinance.co.uk')
),
(
  (select id from public.prospects where company_name = 'Solaris Renewables' limit 1),
  'stage_change',
  'Stage moved to Won',
  (select id from public.profiles where email = 'james@acmefinance.co.uk')
);

-- ── STEP 7: Sample quotes ──────────────────────────────────
insert into public.quotes (
  originator_id, prospect_id, customer_name,
  asset_type, asset_value, scenarios, status
)
values (
  (select id from public.profiles where email = 'james@acmefinance.co.uk'),
  (select id from public.prospects where company_name = 'Fresh Harvest Ltd' limit 1),
  'Fresh Harvest Ltd',
  'Commercial vehicle',
  85000,
  '[
    {"termMonths": 36, "deposit": 5000, "aprPct": 7.2, "rateType": "Fixed", "monthlyPayment": 2489, "totalPayable": 89604},
    {"termMonths": 48, "deposit": 5000, "aprPct": 7.2, "rateType": "Fixed", "monthlyPayment": 1934, "totalPayable": 92832},
    {"termMonths": 60, "deposit": 0,    "aprPct": 7.2, "rateType": "Fixed", "monthlyPayment": 1683, "totalPayable": 100980}
  ]'::jsonb,
  'sent'
),
(
  (select id from public.profiles where email = 'james@acmefinance.co.uk'),
  null,
  'Horizon Dental Group',
  'Medical equipment',
  60000,
  '[
    {"termMonths": 36, "deposit": 3000, "aprPct": 7.2, "rateType": "Fixed", "monthlyPayment": 1773, "totalPayable": 63828},
    {"termMonths": 48, "deposit": 3000, "aprPct": 7.2, "rateType": "Fixed", "monthlyPayment": 1378, "totalPayable": 66144}
  ]'::jsonb,
  'draft'
);

-- ── STEP 8: Notifications ──────────────────────────────────
insert into public.notifications (user_id, title, body, type, read)
values
(
  (select id from public.profiles where email = 'james@acmefinance.co.uk'),
  'Payment reminder — ZC-2025-08741 due in 3 days',
  'TechWorks Solutions Ltd · Mercedes-Benz Sprinter · £1,089 due 15 Mar',
  'payment_reminder', false
),
(
  (select id from public.profiles where email = 'james@acmefinance.co.uk'),
  'Quote sent to Fresh Harvest Ltd',
  '3 finance scenarios · Valid for 30 days',
  'quote_update', false
),
(
  (select id from public.profiles where email = 'james@acmefinance.co.uk'),
  'Green Valley Farms payment is overdue',
  'ZC-2025-07823 · JCB 3CX · £890 was due 1 Mar. Please follow up.',
  'payment_reminder', true
),
(
  (select id from public.profiles where email = 'james@acmefinance.co.uk'),
  'Application approved! 🎉',
  'Your Acme Finance Ltd application has been approved. You now have full portal access.',
  'onboarding_update', true
),
(
  (select id from public.profiles where email = 'contact@techworks.co.uk'),
  'Your next payment is due soon',
  'ZC-2025-08741 · Mercedes-Benz Sprinter · £1,089 due 15 Mar 2025',
  'payment_reminder', false
),
(
  (select id from public.profiles where email = 'contact@techworks.co.uk'),
  'Finance agreement confirmed',
  'Your agreement ZC-2025-08741 is now active. Welcome to Zoro Capital.',
  'contract_update', true
);

-- ── STEP 9: Audit log entries ──────────────────────────────
insert into public.audit_logs (entity_type, entity_id, action, performed_by, details)
values
(
  'application',
  (select id from public.originator_applications where company_reg_number = '04321789'),
  'approved',
  (select id from public.profiles where email = 'admin@zorocapital.com'),
  '{"note": "All verification checks passed. Strong financials."}'::jsonb
);
