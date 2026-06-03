-- ============================================================================
-- FlowRun — Migration 0018: Lazy subscription + orphan cleanup
-- ============================================================================
-- Cambios:
--   1) handle_new_user() YA NO crea subscription. El trial se crea solo cuando
--      el usuario completa onboarding (último paso). Evita huérfanos con trial
--      cuando alguien crea cuenta y se va sin terminar.
--   2) Función public.cleanup_orphan_profiles() borra cuentas sin onboarding
--      completado y con > 7 días desde signup. Llamada por Vercel Cron.
-- ============================================================================

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
  -- subscription NO se crea acá: se crea al finalizar onboarding desde la app.
  return new;
end $$;

create or replace function public.cleanup_orphan_profiles()
returns table (deleted_email text, deleted_at timestamptz)
language plpgsql security definer set search_path = public, auth as $$
declare
  orphan record;
begin
  for orphan in
    select id, email
    from public.profiles
    where experience_level is null
      and accepted_terms_at is null
      and created_at < now() - interval '7 days'
      and not exists (
        select 1 from public.user_plans up where up.user_id = profiles.id
      )
  loop
    delete from public.subscriptions where user_id = orphan.id;
    delete from public.user_profile_metrics where user_id = orphan.id;
    delete from public.profiles where id = orphan.id;
    delete from auth.users where id = orphan.id;

    deleted_email := orphan.email;
    deleted_at := now();
    return next;
  end loop;
  return;
end $$;

comment on function public.cleanup_orphan_profiles is
  'Borra perfiles huérfanos: sin onboarding, sin plan, sin T&C aceptados, > 7 días. Llamado por Vercel Cron diario.';
