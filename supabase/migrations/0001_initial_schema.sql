-- ============================================================================
-- FlowRun — Migration 0001: Core profiles
-- ============================================================================
-- Crea profiles + user_profile_metrics, linkeados a auth.users.
-- Activa RLS con políticas owner-only.
-- Trigger auto-crea profile cuando se inserta un usuario en auth.users.
-- ============================================================================

-- Enums --------------------------------------------------------------------

create type experience_level as enum ('new', 'base', 'advanced');
create type goal_type        as enum ('calle', 'calle_trail', 'trail');
create type perceived_base   as enum ('low', 'medium', 'solid');
create type effort_mode      as enum ('hr', 'rpe', 'talk_test');

-- profiles -----------------------------------------------------------------

create table public.profiles (
  id                uuid primary key references auth.users(id) on delete cascade,
  email             text not null,
  name              text,
  age               int check (age is null or age between 12 and 120),
  experience_level  experience_level,
  goal_type         goal_type,
  weekly_days       int check (weekly_days is null or weekly_days between 2 and 7),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- user_profile_metrics -----------------------------------------------------

create table public.user_profile_metrics (
  user_id                uuid primary key references public.profiles(id) on delete cascade,
  perceived_base         perceived_base,
  injury_history         boolean not null default false,
  preferred_effort_mode  effort_mode,
  zone2_hr_min           int check (zone2_hr_min is null or zone2_hr_min between 60 and 220),
  zone2_hr_max           int check (zone2_hr_max is null or zone2_hr_max between 60 and 220),
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now(),
  constraint zone2_range check (
    zone2_hr_min is null or zone2_hr_max is null or zone2_hr_min < zone2_hr_max
  )
);

-- updated_at trigger -------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger user_profile_metrics_set_updated_at
  before update on public.user_profile_metrics
  for each row execute function public.set_updated_at();

-- Auto-create profile + metrics on signup ----------------------------------

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
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Row Level Security -------------------------------------------------------

alter table public.profiles              enable row level security;
alter table public.user_profile_metrics  enable row level security;

create policy "profiles: owner can read"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles: owner can update"
  on public.profiles for update
  using (auth.uid() = id);

create policy "profiles: owner can insert"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "metrics: owner can read"
  on public.user_profile_metrics for select
  using (auth.uid() = user_id);

create policy "metrics: owner can update"
  on public.user_profile_metrics for update
  using (auth.uid() = user_id);

create policy "metrics: owner can insert"
  on public.user_profile_metrics for insert
  with check (auth.uid() = user_id);
