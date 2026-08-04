# Atelier Lume Photography

Full-stack photography booking & lead-generation site: Next.js 14 (App Router) +
TypeScript + Prisma + Tailwind, Stripe payments, Resend email, Twilio WhatsApp.

## Quickstart (local)

```bash
npm install
cp .env.example .env        # fill in at least SESSION_SECRET; everything else has safe local defaults
npm run db:push             # creates dev.db (SQLite)
npm run db:seed             # creates admin login + 4 sample packages
npm run dev
```

Visit `http://localhost:3000`. Admin dashboard: `http://localhost:3000/admin/login`
using the email/password printed by the seed script (default
`owner@atelierlume.com` / `ChangeMe123!` — **change this immediately**).

Without real Stripe/Resend/Twilio keys, the booking flow will fail at the
payment step and notifications will log as "failed" — that's expected until
you add real keys (see below). Everything else (portfolio, services, leads,
admin dashboard, availability calendar) works fully offline.

## Going to production

### 1. Database — switch to Postgres + enable the double-booking guarantee

This ships with SQLite for zero-config local dev. For production:

1. In `prisma/schema.prisma`, change `provider = "sqlite"` to `provider = "postgresql"`.
2. Point `DATABASE_URL` at your Postgres instance (Supabase, Neon, RDS, etc).
3. Run `npx prisma db push`.
4. Run the SQL in `prisma/migrations_manual/001_booking_exclusion_constraint.sql`
   directly against your database. This adds a Postgres `EXCLUDE USING gist`
   constraint that makes overlapping bookings *impossible at the database
   layer* — not just checked by app code — even under concurrent requests.

The app-level unique constraint on `(date, startTime)` and the transactional
hold logic in `src/lib/booking.ts` work on SQLite too, and cover the exact-
match case; the Postgres constraint additionally guarantees no *overlapping*
bookings regardless of duration.

### 2. Payments — Stripe

1. Get test keys from the [Stripe dashboard](https://dashboard.stripe.com/test/apikeys).
2. Set `STRIPE_SECRET_KEY`.
3. Create a webhook endpoint pointing at `https://yourdomain.com/api/webhooks/stripe`,
   subscribed to `checkout.session.completed`. Set `STRIPE_WEBHOOK_SECRET` to the
   signing secret Stripe gives you.
4. For local testing, use the Stripe CLI: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`.

If operating primarily in Kenya, swap `src/lib/stripe.ts` for a Paystack or
M-Pesa (Daraja API) adapter with the same `createCheckoutSession` interface —
the rest of the booking flow doesn't need to change.

### 3. Email — Resend

Sign up at [resend.com](https://resend.com), verify your sending domain, set
`RESEND_API_KEY` and `FROM_EMAIL`. (SendGrid is a drop-in alternative — swap
the import in `src/lib/notifications.ts`.)

### 4. WhatsApp — Twilio

1. Set up [Twilio WhatsApp Business API](https://www.twilio.com/docs/whatsapp) sandbox or production sender.
2. Create **Meta-approved message templates** in the Twilio Content API (or
   directly in Meta Business Manager) for each of the 5 notification types —
   free-form WhatsApp messages only work inside a 24h customer-initiated
   window, so scheduled reminders *must* use approved templates.
3. Set `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_WHATSAPP_FROM`, and
   the five `TWILIO_TEMPLATE_*` content SIDs.
4. Set `OWNER_WHATSAPP_NUMBER` in E.164 format.

If a WhatsApp send fails, or the client didn't opt in, the relevant function
automatically falls back to email and logs the fallback — see
`src/lib/notifications.ts`.

### 5. Scheduled reminders (cron)

Reminders are never triggered by the browser. Two options:

- **Vercel**: `vercel.json` already defines a cron hitting
  `/api/cron/reminders` every 10 minutes. Set `CRON_SECRET` in your Vercel
  project env vars — Vercel Cron sends it automatically as a Bearer token.
- **Self-hosted**: run `npm run cron:reminders` on a system crontab (see the
  comment at the top of `scripts/run-reminders.ts`).

### 6. Deploy

Any Node host works (Vercel is the path of least resistance given the cron
config). Set all variables from `.env.example` in your host's environment
variable settings — never commit `.env` to source control.

## What's real vs. stubbed in this deliverable

Everything is fully implemented and production-shaped — the schema, booking
logic, payment/webhook handling, notification functions, auth, rate limiting,
and every page. What you still need to supply are your own **API keys**
(Stripe, Resend, Twilio) and a **provisioned Postgres database** — this
sandbox environment can't create live third-party accounts or run a
persistent server on your behalf.

## Architecture notes

- `src/lib/booking.ts` — availability calculation, transactional hold
  creation, server-side revalidation before payment confirms.
- `src/lib/notifications.ts` — the 5 brief-specified functions
  (`sendBookingConfirmationClient`, `sendBookingConfirmationOwner`,
  `sendReminder24hClient`, `sendReminder1hClient`, `sendReminder24hOwner`),
  each logging to `NotificationLog` and falling back to email on WhatsApp
  failure.
- `src/lib/reminders.ts` — cron-safe scan for due reminders, deduplicated
  against `NotificationLog` so re-running the job never double-sends.
- `src/app/api/webhooks/stripe/route.ts` — idempotent webhook handler; a
  booking is saved as confirmed *before* any notification is attempted, so a
  notification failure never rolls back a paid booking.
- `src/lib/auth.ts` — JWT session cookies (admin + client), bcrypt password
  hashing, CSRF double-submit tokens. Every admin page/route re-checks the
  session server-side (`requireAdminSession`) rather than trusting the UI.
- `src/lib/rateLimit.ts` — in-memory rate limiting; swap for
  `@upstash/ratelimit` if you deploy multiple serverless instances.

## Design system

Palette: charcoal `#1C1B19`, cream `#F7F4EE`, stone `#EDE8DF`, aged-brass
accent `#A6803D`. Display serif: Bodoni Moda. Body/utility sans: Inter. See
`tailwind.config.ts` for the full token set.
