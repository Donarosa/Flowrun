-- ============================================================================
-- FlowRun — Migration 0007: Suscripciones + trial 15 días
-- ============================================================================
-- 1 subscription por usuario (UNIQUE). Trial automático al signup.
-- Pricing fijo: monthly $5 USD / $7000 ARS · pack_3m $12 USD / $18000 ARS.
-- AR users pagan ARS (transfer o card). Resto del mundo, USD (solo card).
-- ============================================================================

create type subscription_status as enum ('trialing', 'active', 'canceled', 'expired');
create type subscription_plan   as enum ('monthly', 'pack_3m');
create type payment_method      as enum ('transfer', 'card');
create type currency            as enum ('ARS', 'USD');

create table public.subscriptions (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null unique references public.profiles(id) on delete cascade,
  status              subscription_status not null default 'trialing',
  plan                subscription_plan,                -- null durante trial
  payment_method      payment_method,
  currency            currency,
  amount              int,                              -- centavos USD o pesos enteros ARS
  trial_started_on    date not null default current_date,
  current_period_end  date not null,                    -- fin del trial o periodo pago
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index subscriptions_user on public.subscriptions(user_id);

create trigger subscriptions_set_updated_at
  before update on public.subscriptions
  for each row execute function public.set_updated_at();

-- Extender handle_new_user para crear subscription al hacer signup --------

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name')
  );
  insert into public.user_profile_metrics (user_id) values (new.id);
  insert into public.subscriptions (user_id, status, current_period_end)
  values (new.id, 'trialing', current_date + interval '15 days');
  return new;
end $$;

-- RLS owner-only ----------------------------------------------------------

alter table public.subscriptions enable row level security;

create policy "subscriptions: owner read"
  on public.subscriptions for select using (auth.uid() = user_id);

create policy "subscriptions: owner insert"
  on public.subscriptions for insert with check (auth.uid() = user_id);

create policy "subscriptions: owner update"
  on public.subscriptions for update using (auth.uid() = user_id);
