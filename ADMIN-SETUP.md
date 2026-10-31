# Booking and admin setup

The site works without any of this (it runs in **demo mode**: sample hours, bookings are not stored).
Follow these steps once to turn on real bookings, email alerts and the admin at `/admin`.

## 1. Supabase (database and admin login), free

1. Create a free project at https://supabase.com (any region near the Philippines, such as Singapore).
2. **SQL Editor, New query**: paste the whole of `supabase/schema.sql` and press **Run**.
3. **Authentication, Users, Add user**: create one user per admin with an email and a password.
   Tick **Auto Confirm User**.
4. **Project Settings, API**: copy the **Project URL**, the **anon public** key and the **service_role** key.
   The service_role key is a secret. Never put it in the browser, in the repo or in a screenshot.

## 2. Email alerts (Resend), free

1. Create an account at https://resend.com and make an API key.
2. Out of the box emails send from `onboarding@resend.dev` and only reach the email address you signed up to
   Resend with. To email customers and any studio address, verify a domain in Resend and set `EMAIL_FROM`.
3. Bookings are always saved, even if email is not set up or fails.

## 3. Environment variables

Add these in Vercel: **Project, Settings, Environment Variables** (then redeploy).
For local testing copy `.env.example` to `.env.local`.

| Name | What it is |
| --- | --- |
| `SUPABASE_URL` | Project URL |
| `SUPABASE_ANON_KEY` | anon public key (only used to check an admin's password) |
| `SUPABASE_SERVICE_ROLE_KEY` | service_role key (server only) |
| `ADMIN_EMAILS` | emails allowed into the admin, comma separated. They must also exist in Supabase Users |
| `SESSION_SECRET` | a long random phrase, 16+ characters |
| `RESEND_API_KEY` | from Resend (optional) |
| `EMAIL_FROM` | for example `AQP Beauty Studio <bookings@yourdomain.com>` (optional) |
| `NOTIFY_EMAIL` | where new-booking alerts go (can also be set in the admin, Content page) |

## 4. First sign-in

1. Open `/admin` and sign in.
2. **Services**: press **Import the current price list** once, then edit prices as needed.
3. **Hours**: set the real opening hours, how many customers fit in one time slot, and closed days.
4. **Content**: set the alert email, the deposit and cancellation notes, the FAQ, and add real reviews if any.

## What the admin can do

- **Bookings**: see new requests, confirm, mark done or cancel. Confirming or cancelling emails the customer
  if they left an email address.
- **Hours**: weekly opening times, slot length, places per slot, how far ahead people can book, closed dates.
  The booking form only offers what is open and not full.
- **Services**: add, edit, hide or delete services and prices. The price list, booking form and totals follow.
- **Content**: alert email, deposit and cancellation notes, FAQ and reviews.

## Notes

- Opening hours, the deposit and cancellation notes, and the FAQ ship as **sample wording**. The studio must
  confirm them in the admin before launch.
- Sign-in attempts and public booking requests are rate limited on a best-effort basis; a hidden field also
  catches simple spam bots.
- Bookings are stored in Supabase. Export them any time from Supabase (Table Editor, bookings, Export).
