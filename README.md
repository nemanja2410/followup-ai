# FollowUp AI

Follow up on **Jobber** quotes before they go cold. After three days, open quotes show as due. AI drafts a short email. **You** click send.

## What it does

1. Sign up and connect Jobber
2. Import (or receive) sent quotes
3. Quotes still waiting after 72 hours become **follow-up due**
4. Draft → edit → send via Resend

It does **not** auto-email clients, sync Gmail, or charge via Stripe yet.

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
| `RESEND_FROM_EMAIL` | Optional. Default is Resend’s test sender |
| `JOBBER_CLIENT_ID` / `JOBBER_CLIENT_SECRET` | Jobber OAuth |
| `NEXT_PUBLIC_JOBBER_CLIENT_ID` | Optional; connect uses the server id |
| `JOBBER_WEBHOOK_SECRET` | Optional; Jobber signs webhooks with the client secret |
| `CRON_SECRET` | Protects `/api/cron/process-followups` |

Never commit `.env.local`.

## Database

In the Supabase SQL editor, run `supabase/schema.sql`. That creates `profiles`, `integrations`, and `leads` with row-level security.

Auth → URL configuration: add `http://localhost:3000/auth/callback` (and your production URL later).

## Jobber

In the Jobber developer app:

- OAuth callback: `http://localhost:3000/api/auth/jobber/callback`
- Scopes: quotes read, clients read
- Webhook (needs a public URL, e.g. production or a tunnel): `https://YOUR-DOMAIN/api/webhooks/jobber` for `QUOTE_SENT` (and `QUOTE_APPROVED` / `APP_DISCONNECT` if available)

On localhost, use **Import from Jobber** on the dashboard. Jobber cannot reach `localhost` for webhooks.

## Email

Until you verify a domain in Resend, sends often only work to the email on your Resend account. Put that address on a test quote first.

## Deploy (launch)

Production is Vercel. **Hourly cron may need a paid Vercel plan.** The dashboard still marks quotes due when you open it, so the product works on Hobby without cron.

### 1. Put this code on Vercel

GitHub still has the old app. Either:

- Ask me to **commit and push** `main`, then import/reconnect [nemanja2410/followup-ai](https://github.com/nemanja2410/followup-ai) in Vercel, or
- From this folder: `npx vercel --prod` (deploys your local files)

### 2. Environment variables in Vercel

Project → Settings → Environment Variables → add every key from `.env.example` (Production). Use the **same** Supabase project you tested locally. Generate a long random `CRON_SECRET`.

Redeploy after saving env vars.

### 3. Supabase Auth URLs

Authentication → URL configuration:

- Site URL: `https://YOUR-VERCEL-DOMAIN`
- Redirect URLs:  
  `https://YOUR-VERCEL-DOMAIN/auth/callback`  
  `http://localhost:3000/auth/callback`

### 4. Jobber developer app

Add production URLs (keep localhost for local work):

- OAuth callback: `https://YOUR-VERCEL-DOMAIN/api/auth/jobber/callback`
- Webhook: `https://YOUR-VERCEL-DOMAIN/api/webhooks/jobber`  
  Topics: `QUOTE_SENT`, plus `QUOTE_APPROVED` and `APP_DISCONNECT` if listed

### 5. First real loop

1. Open the production site, sign in
2. Connect Jobber
3. **Import from Jobber** (or send a quote in Jobber and wait for the webhook)
4. If the quote is newer than 3 days, it stays **Waiting**. To test **due** immediately, in Supabase set that row’s `quote_sent_at` to four days ago, then refresh the dashboard
5. Draft follow-up → Send
6. Status should become **Followed up**
7. Confirm the email (Resend test sender often only delivers to your Resend login inbox)

Do not add Stripe or auto-send until that loop works once on production.

