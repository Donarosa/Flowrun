-- ============================================================================
-- FlowRun — Migration 0015: Seed plan nuevo_calletrail_3d
-- ============================================================================
-- Para principiantes (new) que apuntan a trail (calle_trail). Hoy esa celda
-- de la matriz cae en desde_cero_3d (run-walk puro). Este plan mezcla
-- run-walk con técnica trail temprana (FE + caminata fuerte + SMC corto),
-- siguiendo el spec "Calle→Trail 🌱 Nuevo: primero técnica, luego volumen".
--
-- Estructura 8 sem × 3 días con deload sem 4 y 8.
-- Idempotente vía ON CONFLICT.
-- Ref: discovery/training-plans.md líneas 73-83 + 172-174
-- ============================================================================

insert into public.plan_templates (code, name, description, goal_type, experience_level, weekly_days, total_weeks)
values
  (
    'nuevo_calletrail_3d',
    'Calle a Trail desde cero · 3 días',
    'Tu primer plan si querés llegar al trail sin haber corrido antes. 8 semanas con run-walk progresivo + fuerza excéntrica + caminata fuerte en desnivel. Primero técnica, después volumen.',
    'calle_trail',
    'new',
    3,
    8
  )
on conflict (code) do nothing;

with t as (
  select id from public.plan_templates where code = 'nuevo_calletrail_3d'
)
insert into public.template_sessions
  (template_id, week_number, day_index, session_name, blocks, total_duration_min, is_deload)
select t.id, w, d, name, b::jsonb, dur, deload from t,
(values
  -- SEM 1 — adaptación al movimiento, base + fuerza
  (1, 1, 'Empezar a Moverse',
   '[{"code":"RW","duration_min":25,"note":"Caminar 5'' + alternar 1''trote/4''caminata por 15'' + caminar 5''. Si te cansás, caminá más."}]',
   25, false),
  (1, 2, 'Fuerza para Trail',
   '[{"code":"FE","duration_min":15,"note":"Sentadillas lentas, step downs, glute bridges. Suave, sin equipamiento."},{"code":"MF","duration_min":5}]',
   20, false),
  (1, 3, 'Caminar Fuerte',
   '[{"code":"CF","duration_min":25,"note":"Caminata sostenida en zona con desnivel suave (cerro o puente). Sentí los cuádriceps."}]',
   25, false),

  -- SEM 2 — sumar volumen mínimo
  (2, 1, 'Empezar a Moverse',
   '[{"code":"RW","duration_min":30,"note":"Ratio 1''trote/4''caminata. Si la respiración se va, caminá hasta recuperar."}]',
   30, false),
  (2, 2, 'Fuerza para Trail',
   '[{"code":"FE","duration_min":15},{"code":"MF","duration_min":5}]',
   20, false),
  (2, 3, 'Caminar Fuerte',
   '[{"code":"CF","duration_min":30,"note":"Mismo desnivel, 5'' más. Sumar postura: brazos a los costados, mirada adelante."}]',
   30, false),

  -- SEM 3 — primera intro a SMC (escaleras y cambios de terreno)
  (3, 1, 'Más Trote',
   '[{"code":"RW","duration_min":30,"note":"Ratio 3''trote/2''caminata. Si podés hablar mientras trotás, vas bien."}]',
   30, false),
  (3, 2, 'Fuerza Excéntrica',
   '[{"code":"FE","duration_min":20,"note":"Foco en bajadas controladas: step down lento, sentadilla excéntrica 4 segundos."}]',
   20, false),
  (3, 3, 'Sesión Mixta Suave',
   '[{"code":"SMC","duration_min":30,"note":"30'' caminando-trotando con 2 bloques de escaleras (subida + bajada controlada)."}]',
   30, false),

  -- SEM 4 — DELOAD
  (4, 1, 'Recuperación',
   '[{"code":"RA","duration_min":20}]',
   20, true),
  (4, 2, 'Movilidad',
   '[{"code":"MF","duration_min":15},{"code":"FE","duration_min":10}]',
   25, true),
  (4, 3, 'Caminar Suave',
   '[{"code":"CF","duration_min":25,"note":"Semana de descarga. Disfrutá el paisaje, sin forzar."}]',
   25, true),

  -- SEM 5 — empezar trote continuo + SMC más exigente
  (5, 1, 'Trote Continuo Corto',
   '[{"code":"RS","duration_min":20,"note":"Primer trote sin caminar. Si necesitás caminar, está bien. Ritmo conversacional."}]',
   20, false),
  (5, 2, 'Fuerza + Subidas Suaves',
   '[{"code":"FE","duration_min":15},{"code":"SC","duration_min":15,"note":"6x45'' subida caminando fuerte + bajada controlada."}]',
   30, false),
  (5, 3, 'Sesión Mixta',
   '[{"code":"SMC","duration_min":40,"note":"40'' con 3 bloques de escaleras y/o subidas suaves."}]',
   40, false),

  -- SEM 6 — extender el trote y el SMC
  (6, 1, 'Trote Continuo',
   '[{"code":"RS","duration_min":25,"note":"5'' más que la sem pasada. Conversacional."}]',
   25, false),
  (6, 2, 'Fuerza + Subidas',
   '[{"code":"FE","duration_min":15},{"code":"SC","duration_min":20,"note":"6x1'' subida caminando fuerte."}]',
   35, false),
  (6, 3, 'Sesión Mixta',
   '[{"code":"SMC","duration_min":45,"note":"45'' con escaleras y terreno mixto."}]',
   45, false),

  -- SEM 7 — pico
  (7, 1, 'Trote Sostenido',
   '[{"code":"RS","duration_min":30,"note":"30'' continuos. Tu nueva base."}]',
   30, false),
  (7, 2, 'Técnica Bajada',
   '[{"code":"TB","duration_min":15,"note":"Bajadas controladas: rodillas flexionadas, pasos cortos, mirada adelante."},{"code":"FE","duration_min":15}]',
   30, false),
  (7, 3, 'Tirada Mixta',
   '[{"code":"SMC","duration_min":50,"note":"50'' en terreno mixto. Si tenés cerro suave, mejor que ciudad."}]',
   50, false),

  -- SEM 8 — DELOAD final + cierre
  (8, 1, 'Trote Suave',
   '[{"code":"RS","duration_min":25,"note":"Mantenemos lo logrado."}]',
   25, true),
  (8, 2, 'Movilidad + Fuerza',
   '[{"code":"MF","duration_min":15},{"code":"FE","duration_min":10}]',
   25, true),
  (8, 3, 'Cierre Mixto',
   '[{"code":"SMC","duration_min":45,"note":"45'' celebrando lo logrado. Estás listo para algo más exigente."}]',
   45, true)
) as s(w, d, name, b, dur, deload)
on conflict (template_id, week_number, day_index) do nothing;
