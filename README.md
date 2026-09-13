# FollowUp AI

Follow up on **Jobber** quotes before they go cold.

**You** always click send. The app never emails a customer on its own.

## How it works

1. Sign up
2. Connect Jobber
3. Sent quotes appear in FollowUp AI (import, or Jobber webhook on a public URL)
4. Quotes still open after **72 hours** become **follow-up due**. You get an email at your login address (your customers are not emailed).
5. AI drafts a short email
6. You review and edit
7. You send via Resend (replies go to your login email)

## What it is not

It does not auto-send, sync Gmail, or replace Jobber. Billing (Stripe Checkout) lives in Settings and is optional — the dashboard is not paywalled.

## Run locally

```bash
npm install
cp .env.example .env.local
# fill in the values (see below)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment variables

Copy names from `.env.example`. You need:

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Browser-safe anon key (RLS must stay on) |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only — Jobber tokens, webhooks, cron |
| `GEMINI_API_KEY` | Drafts |
| `RESEND_API_KEY` | Sending |
| `RESEND_FROM_EMAIL` | From address. For real customers, a verified Resend domain. Default test sender often only delivers to your Resend inbox |
| `JOBBER_CLIENT_ID` / `JOBBER_CLIENT_SECRET` | Jobber OAuth |
| `NEXT_PUBLIC_JOBBER_CLIENT_ID` | Optional; connect uses the server id |
| `JOBBER_WEBHOOK_SECRET` | Optional; Jobber signs webhooks with the client secret |
| `CRON_SECRET` | Required. Protects `/api/cron/process-followups`. Cron is rejected if this is empty |
| `NEXT_PUBLIC_APP_URL` | Optional. Used in the owner “quotes are due” email. Defaults to your Vercel URL |
| `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` / `STRIPE_PRICE_ID` | Optional billing in Settings |

Never commit `.env.local`.

## Database

In the Supabase SQL editor, run `supabase/schema.sql` (`profiles`, `integrations`, `leads`, RLS). If you use Settings → Subscribe, also run `supabase/billing.sql`.

Auth → URL configuration: add `http://localhost:3000/auth/callback` and your production `/auth/callback`. Password reset uses the same callback, then `/update-password`.

## Jobber

In the Jobber developer app:

- OAuth callback: `http://localhost:3000/api/auth/jobber/callback` (and the same path on production)
- Scopes: quotes read, clients read
- Webhook (public URL only): `https://YOUR-DOMAIN/api/webhooks/jobber` for `QUOTE_SENT`, `QUOTE_APPROVED`, `QUOTE_REJECTED` (and `APP_DISCONNECT` if listed)

On localhost, use **Import from Jobber**. Import pages through Jobber (50 quotes at a time, up to 1,000). Jobber cannot reach `localhost` for webhooks. If import fails because the login expired, reconnect Jobber — the green “connected” badge is not shown in that case.

## Email

Until you verify a domain in Resend and set `RESEND_FROM_EMAIL` to it, sends often only work to the email on your Resend account. Put that address on a test quote first. A quote with no client email cannot be sent. Send always uses the email stored on the quote, not a value typed in the request.

## Deploy

Production is Vercel. Cron in `vercel.json` runs daily: it marks due quotes **and emails you** (not your customers) if anything became due. The dashboard also marks quotes due when you open it. Set `CRON_SECRET` on Vercel or the cron route refuses to run.

1. Deploy this repo (`main` on GitHub: [nemanja2410/followup-ai](https://github.com/nemanja2410/followup-ai))
2. Set the same env vars as `.env.example` on Vercel
3. Supabase Site URL + redirect URLs for production and localhost
4. Jobber production OAuth callback + webhook
5. Stripe webhook (if billing): `https://YOUR-DOMAIN/api/webhooks/stripe`

### First real loop

1. Sign in on production
2. Connect Jobber
3. Import sent quotes (or wait for the webhook)
4. Quotes newer than 3 days stay **Waiting**. To test **due**, set `quote_sent_at` four days ago in Supabase, then refresh
5. Draft follow-up → Send
6. Confirm the inbox. Status becomes **Followed up** on the server (the row shows last sent). Test sender often only delivers to your Resend account email.
