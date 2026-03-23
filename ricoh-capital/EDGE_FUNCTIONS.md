# Supabase Edge Functions — Deployment Guide

Three Edge Functions power features that require a **service role key** (admin operations not possible from the browser):

| Function | Purpose |
|---|---|
| `invite-customer` | Invites end-clients to the customer portal when a deal is approved |
| `invite-admin` | Invites new admin users to the platform |
| `update-payment-statuses` | Marks payments/contracts as overdue, due_soon, maturing, completed |

---

## Prerequisites

1. Install Supabase CLI: https://supabase.com/docs/guides/cli
2. Login: `npx supabase login`
3. Link your project: `npx supabase link --project-ref YOUR_PROJECT_REF`
   - Project ref is the part after `https://` and before `.supabase.co` in your URL

---

## Deploy all functions

```bash
cd ricoh-capital

# Deploy all three
npx supabase functions deploy invite-customer
npx supabase functions deploy invite-admin
npx supabase functions deploy update-payment-statuses
```

---

## Set environment secrets

Each function needs `SUPABASE_SERVICE_ROLE_KEY` and `SITE_URL`:

```bash
# Get your service role key from:
# Supabase Dashboard → Project Settings → API → service_role (secret)

npx supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
npx supabase secrets set SITE_URL=https://your-production-domain.com
```

> `SUPABASE_URL` is automatically injected by the Supabase runtime — you don't need to set it.

---

## Schedule automatic payment status updates

After deploying `update-payment-statuses`, set up a daily cron via the Supabase dashboard:

1. Go to **Database → Extensions** → enable `pg_cron`
2. Go to **SQL Editor** and run `supabase/migrations/008_payment_status_cron.sql`
3. Uncomment the `cron.schedule(...)` block at the bottom of that file and run it

This will automatically refresh all payment and contract statuses every day at 02:00 UTC.

**Alternatively**, use the "Refresh payment statuses" button on the Admin → User Management page for manual runs.

---

## Test locally

```bash
npx supabase functions serve --env-file .env.local
```

Create `.env.local`:
```
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SITE_URL=http://localhost:5173
```

---

## How customer invitations work

1. Originator fills in **Client email** on the New Deal form (optional)
2. Admin approves the deal → enters customer email if not pre-filled → clicks **Approve & create contract**
3. The `invite-customer` Edge Function:
   - Calls `supabase.auth.admin.inviteUserByEmail()` — sends a set-password email
   - Sets the new profile's role to `customer`
   - Links the contract's `customer_id` to the new user
4. Customer clicks the email link, sets their password, and logs into the portal
5. They see their contract, payment schedule, and account actions immediately

If the customer's email is already registered, the function links the existing account to the contract instead of sending a new invite.
