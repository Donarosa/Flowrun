-- ============================================================================
-- FlowRun — Migration 0003: Planes + sesiones (slice 1)
-- ============================================================================
-- 5 tablas:
--   workout_blocks      catálogo de bloques (lectura pública)
--   plan_templates      templates de plan (lectura pública)
--   template_sessions   sesiones de cada template (lectura pública)
--   user_plans          plan asignado al usuario (owner-only)
--   user_sessions       instancia diaria del plan (owner-only via user_plan)
-- ============================================================================

-- Enums --------------------------------------------------------------------

create type plan_status    as enum ('active', 'paused', 'completed');
create type session_status as enum ('pending', 'completed', 'skipped');

-- workout_blocks (catálogo) -----------------------------------------------

create table public.workout_blocks (
  id           uuid primary key default gen_random_uuid(),
  code         text not null unique check (char_length(code) <= 6),
  name         text not null,
  category     text not null check (category in ('carrera', 'trail', 'fuerza', 'movilidad')),
  description  text,
  is_trail_specific boolean not null default false,
  created_at   timestamptz not null default now()
);

-- plan_templates -----------------------------------------------------------

create table public.plan_templates (
  id                uuid primary key default gen_random_uuid(),
  code              text not null unique,
  name              text not null,
  description       text,
  goal_type         goal_type not null,
  experience_level  experience_level not null,
  weekly_days       int not null check (weekly_days between 2 and 7),
  total_weeks       int not null check (total_weeks between 1 and 52),
  created_at        timestamptz not null default now()
);

-- template_sessions (qué sesión va en cada día de cada semana) ------------

create table public.template_sessions (
  id                 uuid primary key default gen_random_uuid(),
  template_id        uuid not null references public.plan_templates(id) on delete cascade,
  week_number        int  not null check (week_number > 0),
  day_index          int  not null check (day_index between 1 and 7), -- 1 = primer día de entreno de la semana
  session_name       text not null,
  blocks             jsonb not null,        -- [{code, name, duration_min, structure}, ...]
  total_duration_min int  not null,
  is_deload          boolean not null default false,
  unique (template_id, week_number, day_index)
);

-- user_plans (instancia del usuario) --------------------------------------

create table public.user_plans (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.profiles(id) on delete cascade,
  template_id  uuid not null references public.plan_templates(id),
  started_on   date not null default current_date,
  status       plan_status not null default 'active',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index user_plans_user_active on public.user_plans(user_id) where status = 'active';

-- user_sessions (instancia diaria) ----------------------------------------

create table public.user_sessions (
  id                  uuid primary key default gen_random_uuid(),
  user_plan_id        uuid not null references public.user_plans(id) on delete cascade,
  template_session_id uuid not null references public.template_sessions(id),
  scheduled_date      date not null,
  status              session_status not null default 'pending',
  completed_at        timestamptz,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index user_sessions_plan_date on public.user_sessions(user_plan_id, scheduled_date);

-- updated_at triggers -----------------------------------------------------

create trigger user_plans_set_updated_at
  before update on public.user_plans
  for each row execute function public.set_updated_at();

create trigger user_sessions_set_updated_at
  before update on public.user_sessions
  for each row execute function public.set_updated_at();

-- Row Level Security ------------------------------------------------------

alter table public.workout_blocks    enable row level security;
alter table public.plan_templates    enable row level security;
alter table public.template_sessions enable row level security;
alter table public.user_plans        enable row level security;
alter table public.user_sessions     enable row level security;

-- Contenido del producto: lectura pública para usuarios autenticados.
create policy "workout_blocks: authed read"
  on public.workout_blocks for select to authenticated using (true);

create policy "plan_templates: authed read"
  on public.plan_templates for select to authenticated using (true);

create policy "template_sessions: authed read"
  on public.template_sessions for select to authenticated using (true);

-- user_plans: owner-only.
create policy "user_plans: owner read"
  on public.user_plans for select using (auth.uid() = user_id);

create policy "user_plans: owner insert"
  on public.user_plans for insert with check (auth.uid() = user_id);

create policy "user_plans: owner update"
  on public.user_plans for update using (auth.uid() = user_id);

-- user_sessions: owner-only a través del user_plan asociado.
create policy "user_sessions: owner read"
  on public.user_sessions for select using (
    exists (
      select 1 from public.user_plans up
      where up.id = user_sessions.user_plan_id and up.user_id = auth.uid()
    )
  );

create policy "user_sessions: owner insert"
  on public.user_sessions for insert with check (
    exists (
      select 1 from public.user_plans up
      where up.id = user_sessions.user_plan_id and up.user_id = auth.uid()
    )
  );

create policy "user_sessions: owner update"
  on public.user_sessions for update using (
    exists (
      select 1 from public.user_plans up
      where up.id = user_sessions.user_plan_id and up.user_id = auth.uid()
    )
  );
