-- ============================================================================
-- FlowRun — Migration 0014: Tabla user_session_tips (tracking de tips)
-- ============================================================================
-- 1 tip persistido por user_session. La función getTipForSession se vuelve
-- idempotente: si ya hay row → retorna ese tip; si no → elige uno respetando
-- show_max_times (cap por user × tip) y persiste.
--
-- Idempotente vía IF NOT EXISTS y guards en policies.
-- ============================================================================

create table if not exists public.user_session_tips (
  user_session_id  uuid primary key references public.user_sessions(id) on delete cascade,
  user_id          uuid not null references public.profiles(id) on delete cascade,
  tip_id           uuid not null references public.education_tips(id) on delete cascade,
  created_at       timestamptz not null default now()
);

create index if not exists user_session_tips_user_tip
  on public.user_session_tips(user_id, tip_id);

alter table public.user_session_tips enable row level security;

do $$ begin
  create policy "user_session_tips: owner read"
    on public.user_session_tips for select
    using (user_id = auth.uid());
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "user_session_tips: owner insert"
    on public.user_session_tips for insert
    with check (user_id = auth.uid());
exception when duplicate_object then null;
end $$;
