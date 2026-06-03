-- ============================================================================
-- FlowRun — Migration 0018: Lazy subscription + orphan cleanup
-- ============================================================================
-- Cambios:
--   1) handle_new_user() YA NO crea subscription. El trial se crea solo cuando
--      el usuario completa onboarding (último paso). Evita "huérfanos con trial"
--      cuando alguien crea cuenta y se va.
--   2) Función public.cleanup_orphan_profiles() que borra cuentas sin
--      onboarding completado y con > 7 días desde signup.
--   3) Cron job diario (pg_cron) que ejecuta el cleanup a las 03:00 UTC.
--      Si pg_cron no está disponible en este proyecto, el SELECT cron.schedule
--      falla y hay que correr cleanup_orphan_profiles() manualmente o vía
--      Vercel Cron.
-- ============================================================================

-- 1) Actualizar trigger: NO crear subscription en signup
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

-- 2) Función de limpieza de huérfanos
-- Criterio: profile sin experience_level (onboarding incompleto)
-- + > 7 días desde creación + sin sesiones completadas + sin haber aceptado T&C.
-- Es seguro: usuarios reales que completaron onboarding tienen experience_level no nulo.
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
    -- Borrar dependientes en orden (por si hay rows que no cascadean)
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
  'Borra perfiles huérfanos: sin onboarding completado, sin plan, sin T&C aceptados, > 7 días viejos. Idempotente.';

-- 3) Cron job diario (si pg_cron está disponible)
do $$
begin
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    -- desprogramar si ya existía para evitar duplicados
    perform cron.unschedule('flowrun-cleanup-orphans')
    where exists (
      select 1 from cron.job where jobname = 'flowrun-cleanup-orphans'
    );

    perform cron.schedule(
      'flowrun-cleanup-orphans',
      '0 3 * * *',
      $cron$ select public.cleanup_orphan_profiles(); $cron$
    );
  else
    raise notice 'pg_cron no está disponible en este proyecto. Schedule cleanup_orphan_profiles() manualmente o via Vercel Cron.';
  end if;
end $$;
