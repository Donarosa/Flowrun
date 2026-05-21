-- ============================================================================
-- FlowRun — Migration 0006: Check-ins post-sesión
-- ============================================================================
-- 1 check-in por user_session (UNIQUE constraint).
-- Espejo del spec MVP: RPE 1-5, talk test, respiración, intención, notas.
-- RLS owner-only via user_plans → profiles.
-- ============================================================================

create type talk_test_level as enum ('phrases', 'words', 'none');
create type breathing_level as enum ('easy', 'medium', 'hard');
create type session_intent  as enum ('disfrutar', 'mejorar', 'trail');

create table public.session_checkins (
  id              uuid primary key default gen_random_uuid(),
  user_session_id uuid not null unique references public.user_sessions(id) on delete cascade,
  rpe             smallint not null check (rpe between 1 and 5),
  talk_test       talk_test_level not null,
  breathing       breathing_level not null,
  intent          session_intent not null,
  notes           text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index session_checkins_user_session on public.session_checkins(user_session_id);

create trigger session_checkins_set_updated_at
  before update on public.session_checkins
  for each row execute function public.set_updated_at();

-- RLS owner-only chained: checkin → user_session → user_plan → user_id
alter table public.session_checkins enable row level security;

create policy "session_checkins: owner read"
  on public.session_checkins for select using (
    exists (
      select 1
      from public.user_sessions us
      join public.user_plans up on up.id = us.user_plan_id
      where us.id = session_checkins.user_session_id
        and up.user_id = auth.uid()
    )
  );

create policy "session_checkins: owner insert"
  on public.session_checkins for insert with check (
    exists (
      select 1
      from public.user_sessions us
      join public.user_plans up on up.id = us.user_plan_id
      where us.id = session_checkins.user_session_id
        and up.user_id = auth.uid()
    )
  );

create policy "session_checkins: owner update"
  on public.session_checkins for update using (
    exists (
      select 1
      from public.user_sessions us
      join public.user_plans up on up.id = us.user_plan_id
      where us.id = session_checkins.user_session_id
        and up.user_id = auth.uid()
    )
  );

create policy "session_checkins: owner delete"
  on public.session_checkins for delete using (
    exists (
      select 1
      from public.user_sessions us
      join public.user_plans up on up.id = us.user_plan_id
      where us.id = session_checkins.user_session_id
        and up.user_id = auth.uid()
    )
  );
