-- FollowUp AI — Stripe Billing columns on profiles
-- Run in the Supabase SQL Editor. Does not change RLS (own-row policies still apply).

alter table public.profiles
  add column if not exists stripe_customer_id text,
  add column if not exists stripe_subscription_id text,
  add column if not exists stripe_subscription_status text;

create unique index if not exists profiles_stripe_customer_id_idx
  on public.profiles (stripe_customer_id)
  where stripe_customer_id is not null;
