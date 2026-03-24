# Email Templates — Setup Guide

These HTML templates replace Supabase's default auth emails with Zoro Capital branding.

## How to apply

1. Go to **Supabase Dashboard → Authentication → Email Templates**
2. For each template below, click the template name, paste the HTML, and save.

| Template file           | Supabase template name  |
|-------------------------|-------------------------|
| `confirmation.html`     | Confirm signup          |
| `password-reset.html`   | Reset password          |
| `magic-link.html`       | Magic link              |
| `invite.html`           | Invite user             |

## Template variables (filled by Supabase)

| Variable              | Description                    |
|-----------------------|--------------------------------|
| `{{ .ConfirmationURL }}` | One-time confirmation link  |
| `{{ .Email }}`        | Recipient email address        |
| `{{ .SiteURL }}`      | Your app's base URL            |
| `{{ .Token }}`        | Raw token (avoid if possible)  |

## Custom SMTP (recommended for production)

To send from `no-reply@zorocapital.com` instead of `no-reply@mail.supabase.io`:

1. Supabase Dashboard → Project Settings → Auth → SMTP Settings
2. Enter your SMTP server credentials (e.g. SendGrid, Postmark, Amazon SES)
3. Set "From" to `Zoro Capital <no-reply@zorocapital.com>`
