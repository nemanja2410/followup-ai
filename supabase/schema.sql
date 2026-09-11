-- FollowUp AI — canonical database (run in Supabase SQL Editor)
-- Product: Jobber quote follow-up. A human always clicks Send.
--
-- If you already have a `leads` table with `name` / `email` columns,
-- do not run the CREATE TABLE for leads blindly. Rename first, e.g.:
--   alter table public.leads rename column name to client_name;
--   alter table public.leads rename column email to client_email;

create table if not exists public.profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  business_name text,
  created_at timestamptz not null default now()
);

create table if not exists public.integrations (
  user_id uuid primary key references auth.users (id) on delete cascade,
  jobber_account_id text,
  jobber_access_token text,
  jobber_refresh_token text,
  token_expires_at timestamptz,
  updated_at timestamptz not null default now()
);

create unique index if not exists integrations_jobber_account_id_idx
  on public.integrations (jobber_account_id)
  where jobber_account_id is not null;

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  jobber_quote_id text,
  client_name text not null,
  client_email text,
  quote_value numeric,
  -- open = quote sent, waiting
  -- due = time to follow up (set by cron, not auto-emailed)
  -- followed_up = human sent a follow-up
  -- won / lost = closed
  status text not null default 'open',
  quote_sent_at timestamptz,
  last_followed_up_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  constraint leads_status_check check (status in ('open', 'due', 'followed_up', 'won', 'lost'))
);

-- Multiple manual leads may have NULL jobber_quote_id (Postgres unique allows that).
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'leads_user_jobber_quote_key'
  ) then
    alter table public.leads
      add constraint leads_user_jobber_quote_key unique (user_id, jobber_quote_id);
  end if;
end $$;

create index if not exists leads_user_id_idx on public.leads (user_id);
create index if not exists leads_due_idx on public.leads (status, quote_sent_at);

-- New signups get a profile row
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (user_id)
  values (new.id)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.leads enable row level security;
alter table public.integrations enable row level security;

-- Profiles: you only see your own row
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select to authenticated
  using (user_id = auth.uid());

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
  for insert to authenticated
  with check (user_id = auth.uid());

-- Leads: you only see and change your own leads
drop policy if exists "leads_select_own" on public.leads;
create policy "leads_select_own" on public.leads
  for select to authenticated
  using (user_id = auth.uid());

drop policy if exists "leads_insert_own" on public.leads;
create policy "leads_insert_own" on public.leads
  for insert to authenticated
  with check (user_id = auth.uid());

drop policy if exists "leads_update_own" on public.leads;
create policy "leads_update_own" on public.leads
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "leads_delete_own" on public.leads;
create policy "leads_delete_own" on public.leads
  for delete to authenticated
  using (user_id = auth.uid());

-- Integrations store Jobber tokens. The browser must never read them.
-- Server routes use SUPABASE_SERVICE_ROLE_KEY (bypasses RLS).
revoke all on public.integrations from anon, authenticated;
grant select, insert, update, delete on public.integrations to service_role;

-- Browser/anon never get table access except through RLS as authenticated
grant select, insert, update, delete on public.leads to authenticated;
grant select, insert, update on public.profiles to authenticated;

-- Stripe Billing (optional until you run supabase/billing.sql)
alter table public.profiles
  add column if not exists stripe_customer_id text,
  add column if not exists stripe_subscription_id text,
  add column if not exists stripe_subscription_status text;
