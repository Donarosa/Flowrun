-- ============================================================================
-- FlowRun — Migration 0008: Motor de adaptación semanal (versión mínima)
-- ============================================================================
-- session_checkins:  + pain (bool) + legs_fatigue (enum)
-- user_sessions:     + duration_modifier (decimal default 1.0) + adaptation_note
-- adaptation_logs:   nueva tabla, 1 fila por (user_plan, week_number)
-- ============================================================================

create type legs_fatigue_level as enum ('low', 'medium', 'high');

alter table public.session_checkins
  add column pain          boolean not null default false,
  add column legs_fatigue  legs_fatigue_level;

alter table public.user_sessions
  add column duration_modifier numeric(3,2) not null default 1.00 check (duration_modifier between 0.50 and 1.50),
  add column adaptation_note   text;

-- adaptation_logs ---------------------------------------------------------

create table public.adaptation_logs (
  id              uuid primary key default gen_random_uuid(),
  user_plan_id    uuid not null references public.user_plans(id) on delete cascade,
  week_number     int  not null check (week_number > 0),         -- semana evaluada
  rule_triggered  text not null,                                  -- 'fatigue_high' | 'sustainable_progression' | 'low_adherence' | 'maintain'
  modifier_applied numeric(3,2),                                  -- 0.90, 1.05, etc. null si no modifica volumen
  sessions_modified int not null default 0,                       -- cuántas sesiones de week+1 cambiaron
  message_es      text not null,
  created_at      timestamptz not null default now(),
  unique (user_plan_id, week_number)
);

create index adaptation_logs_plan on public.adaptation_logs(user_plan_id, week_number desc);

-- RLS owner-only ----------------------------------------------------------

alter table public.adaptation_logs enable row level security;

create policy "adaptation_logs: owner read"
  on public.adaptation_logs for select using (
    exists (
      select 1 from public.user_plans up
      where up.id = adaptation_logs.user_plan_id and up.user_id = auth.uid()
    )
  );

create policy "adaptation_logs: owner insert"
  on public.adaptation_logs for insert with check (
    exists (
      select 1 from public.user_plans up
      where up.id = adaptation_logs.user_plan_id and up.user_id = auth.uid()
    )
  );
