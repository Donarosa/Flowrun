-- ============================================================================
-- FlowRun — Migration 0010: Seed 3 planes adicionales
-- ============================================================================
-- Cubre las celdas faltantes de la matriz experience_level × goal_type:
--   - calle_trail_base_3d        (base × calle_trail, 24 sesiones)
--   - nuevo_montana_3d           (base × trail,       24 sesiones)
--   - calle_trail_avanzado_4d    (advanced,           32 sesiones, 4 días)
--
-- Estructura 8 semanas con deload (sem 4 y sem 8).
-- Refs: discovery/training-plans.md (Grupo 2 Plan A/B, Grupo 3 Plan A)
-- Idempotente vía ON CONFLICT.
-- ============================================================================

-- 1) PLAN calle_trail_base_3d ----------------------------------------------
-- Spec: Calle→Trail 🌿 Base. RS + SC + SMC + TSL 60'. Desnivel antes que ritmo.
-- Distribución 75% Z2 / 15% subidas / 10% fuerza excéntrica.

insert into public.plan_templates (code, name, description, goal_type, experience_level, weekly_days, total_weeks) values
  (
    'calle_trail_base_3d',
    'Calle a Trail · base · 3 días',
    'Plan de 8 semanas para vos que corrés en calle y querés llevar la cabeza a la montaña. Base aeróbica + subidas conversacionales + fuerza excéntrica preventiva. Termina con una tirada de 75 minutos en terreno mixto.',
    'calle_trail',
    'base',
    3,
    8
  )
on conflict (code) do nothing;

with t as (
  select id from public.plan_templates where code = 'calle_trail_base_3d'
)
insert into public.template_sessions
  (template_id, week_number, day_index, session_name, blocks, total_duration_min, is_deload)
select t.id, w, d, name, b::jsonb, dur, deload from t,
(values
  -- SEM 1 — adaptación al desnivel
  (1, 1, 'Rodaje Base',         '[{"code":"RS","duration_min":40,"note":"Conversacional, todo en calle plana"}]', 40, false),
  (1, 2, 'Subidas Suaves',      '[{"code":"SC","duration_min":25,"note":"8x1'' subida caminata fuerte + bajada controlada"},{"code":"FE","duration_min":10}]', 35, false),
  (1, 3, 'Sesión Mixta',        '[{"code":"SMC","duration_min":40,"note":"40'' incluyendo 3 bloques de escaleras"}]', 40, false),

  -- SEM 2 — más volumen aeróbico
  (2, 1, 'Rodaje Sostenible',   '[{"code":"RS","duration_min":45}]', 45, false),
  (2, 2, 'Subidas + Fuerza',    '[{"code":"SC","duration_min":25,"note":"8x1'' subida"},{"code":"FE","duration_min":15,"note":"Sentadilla lenta, step downs"}]', 40, false),
  (2, 3, 'Sesión Mixta',        '[{"code":"SMC","duration_min":45,"note":"45'' con escaleras y puentes"}]', 45, false),

  -- SEM 3 — primer terreno mixto largo
  (3, 1, 'Rodaje Sostenible',   '[{"code":"RS","duration_min":50}]', 50, false),
  (3, 2, 'Subidas Más Largas',  '[{"code":"SC","duration_min":30,"note":"6x90'''' subida sostenida"},{"code":"FE","duration_min":15}]', 45, false),
  (3, 3, 'Tirada Mixta',        '[{"code":"SMC","duration_min":60,"note":"Primer 60'' de terreno mixto"}]', 60, false),

  -- SEM 4 — DELOAD
  (4, 1, 'Recuperación',        '[{"code":"RA","duration_min":30}]', 30, true),
  (4, 2, 'Movilidad + Fuerza',  '[{"code":"MF","duration_min":15},{"code":"FE","duration_min":10}]', 25, true),
  (4, 3, 'Rodaje Suave',        '[{"code":"RS","duration_min":40,"note":"Semana de descarga, no fuerces"}]', 40, true),

  -- SEM 5 — introducimos técnica de bajada
  (5, 1, 'Rodaje Base',         '[{"code":"RS","duration_min":45}]', 45, false),
  (5, 2, 'Subidas + Bajadas',   '[{"code":"SC","duration_min":25,"note":"6x90'''' subida"},{"code":"TB","duration_min":15,"note":"Trabajo de bajada controlada"}]', 40, false),
  (5, 3, 'Tirada Mixta',        '[{"code":"SMC","duration_min":60}]', 60, false),

  -- SEM 6 — tirada larga creciendo
  (6, 1, 'Rodaje Sostenible',   '[{"code":"RS","duration_min":50}]', 50, false),
  (6, 2, 'Subidas + Fuerza',    '[{"code":"SC","duration_min":30},{"code":"FE","duration_min":15}]', 45, false),
  (6, 3, 'Tirada Mixta Larga',  '[{"code":"SMC","duration_min":70,"note":"Si tenés cerro o sierra, mejor que ciudad"}]', 70, false),

  -- SEM 7 — pico
  (7, 1, 'Rodaje Firme',        '[{"code":"RS","duration_min":50}]', 50, false),
  (7, 2, 'Técnica + Subidas',   '[{"code":"TB","duration_min":20,"note":"Bajadas controladas, escaleras"},{"code":"SC","duration_min":20,"note":"4x2'' subida"}]', 40, false),
  (7, 3, 'Tirada Pico',         '[{"code":"SMC","duration_min":75,"note":"75'' en terreno mixto, tu primer trail largo"}]', 75, false),

  -- SEM 8 — DELOAD final
  (8, 1, 'Regenerativo',        '[{"code":"RA","duration_min":25}]', 25, true),
  (8, 2, 'Fuerza Excéntrica',   '[{"code":"FE","duration_min":15},{"code":"MF","duration_min":10}]', 25, true),
  (8, 3, 'Rodaje Celebración',  '[{"code":"RS","duration_min":40,"note":"Cierre del plan, sentí lo logrado"}]', 40, true)
) as s(w, d, name, b, dur, deload)
on conflict (template_id, week_number, day_index) do nothing;


-- 2) PLAN nuevo_montana_3d -------------------------------------------------
-- Spec: Trail 🌱 Base / Sostenible Montaña. 80% conv / 15% técnica / 5% firme.
-- Para: ya entrena en montaña, prevención > performance.

insert into public.plan_templates (code, name, description, goal_type, experience_level, weekly_days, total_weeks) values
  (
    'nuevo_montana_3d',
    'Trail sostenible · 3 días',
    'Plan de 8 semanas para correr en montaña sin lesionarte. 80% conversacional + técnica de bajada + fuerza excéntrica. Termina con una tirada montaña de 100 minutos.',
    'trail',
    'base',
    3,
    8
  )
on conflict (code) do nothing;

with t as (
  select id from public.plan_templates where code = 'nuevo_montana_3d'
)
insert into public.template_sessions
  (template_id, week_number, day_index, session_name, blocks, total_duration_min, is_deload)
select t.id, w, d, name, b::jsonb, dur, deload from t,
(values
  -- SEM 1 — base montañera
  (1, 1, 'Trail Conversacional', '[{"code":"RS","duration_min":50,"note":"En cerro suave o terreno mixto, conversacional"}]', 50, false),
  (1, 2, 'Técnica + Fuerza',     '[{"code":"TB","duration_min":15,"note":"Bajadas controladas, mirá adonde pisás"},{"code":"FE","duration_min":15}]', 30, false),
  (1, 3, 'Tirada Montaña',       '[{"code":"TLM","duration_min":70,"note":"Conversacional, caminá las subidas si hace falta"}]', 70, false),

  -- SEM 2
  (2, 1, 'Trail Conversacional', '[{"code":"RS","duration_min":55}]', 55, false),
  (2, 2, 'Técnica + Fuerza',     '[{"code":"TB","duration_min":20},{"code":"FE","duration_min":15}]', 35, false),
  (2, 3, 'Tirada Montaña',       '[{"code":"TLM","duration_min":75}]', 75, false),

  -- SEM 3 — subidas conversacionales
  (3, 1, 'Trail + Subidas',      '[{"code":"RS","duration_min":35},{"code":"SC","duration_min":20,"note":"6x90'''' subida en cerro"}]', 55, false),
  (3, 2, 'Técnica + Fuerza',     '[{"code":"TB","duration_min":20},{"code":"FE","duration_min":20}]', 40, false),
  (3, 3, 'Tirada Montaña',       '[{"code":"TLM","duration_min":85,"note":"Si hay desnivel, mejor"}]', 85, false),

  -- SEM 4 — DELOAD
  (4, 1, 'Recuperación',         '[{"code":"RA","duration_min":30}]', 30, true),
  (4, 2, 'Movilidad + Fuerza',   '[{"code":"MF","duration_min":15},{"code":"FE","duration_min":15}]', 30, true),
  (4, 3, 'Trail Suave',          '[{"code":"RS","duration_min":50,"note":"Descarga, terreno conocido"}]', 50, true),

  -- SEM 5 — introducimos estímulo firme
  (5, 1, 'Trail + Firme',        '[{"code":"RS","duration_min":40},{"code":"RP","duration_min":15,"note":"Bloque firme controlado en zona plana"}]', 55, false),
  (5, 2, 'Técnica + Fuerza',     '[{"code":"TB","duration_min":25},{"code":"FE","duration_min":15}]', 40, false),
  (5, 3, 'Tirada Montaña',       '[{"code":"TLM","duration_min":85}]', 85, false),

  -- SEM 6
  (6, 1, 'Trail + Subidas',      '[{"code":"RS","duration_min":35},{"code":"SC","duration_min":25,"note":"5x2'' subida sostenida"}]', 60, false),
  (6, 2, 'Técnica + Fuerza',     '[{"code":"TB","duration_min":25},{"code":"FE","duration_min":20}]', 45, false),
  (6, 3, 'Tirada Montaña',       '[{"code":"TLM","duration_min":95}]', 95, false),

  -- SEM 7 — pico
  (7, 1, 'Trail Firme',          '[{"code":"RS","duration_min":35},{"code":"RP","duration_min":20,"note":"2x8'' firme controlado"}]', 55, false),
  (7, 2, 'Técnica + Fuerza',     '[{"code":"TB","duration_min":25,"note":"Tu mejor sesión de bajada"},{"code":"FE","duration_min":20}]', 45, false),
  (7, 3, 'Tirada Pico',          '[{"code":"TLM","duration_min":100,"note":"100'' de montaña sostenida, tu nueva base"}]', 100, false),

  -- SEM 8 — DELOAD final
  (8, 1, 'Regenerativo',         '[{"code":"RA","duration_min":30}]', 30, true),
  (8, 2, 'Fuerza Excéntrica',    '[{"code":"FE","duration_min":20},{"code":"MF","duration_min":10}]', 30, true),
  (8, 3, 'Trail Celebración',    '[{"code":"RS","duration_min":50,"note":"Cierre del plan en tu cerro favorito"}]', 50, true)
) as s(w, d, name, b, dur, deload)
on conflict (template_id, week_number, day_index) do nothing;


-- 3) PLAN calle_trail_avanzado_4d ------------------------------------------
-- Spec: Calle→Trail 🌳 Avanzado. RS + SC + RPC + TSL 75–90' + TT bajadas.
-- Distribución 70% Z2 / 20% subidas / 10% técnica. Bloques 4 sem alternados.

insert into public.plan_templates (code, name, description, goal_type, experience_level, weekly_days, total_weeks) values
  (
    'calle_trail_avanzado_4d',
    'Trail avanzado · 4 días',
    'Plan de 8 semanas para corredores con base sólida que quieren llevar el trail a otro nivel. 4 días: rodajes, subidas y RPC, técnica de bajada, tirada larga. Termina con una tirada de 2 horas.',
    'calle_trail',
    'advanced',
    4,
    8
  )
on conflict (code) do nothing;

with t as (
  select id from public.plan_templates where code = 'calle_trail_avanzado_4d'
)
insert into public.template_sessions
  (template_id, week_number, day_index, session_name, blocks, total_duration_min, is_deload)
select t.id, w, d, name, b::jsonb, dur, deload from t,
(values
  -- SEM 1
  (1, 1, 'Rodaje Base',          '[{"code":"RS","duration_min":50,"note":"Conversacional en calle plana"}]', 50, false),
  (1, 2, 'Subidas + Fuerza',     '[{"code":"SC","duration_min":35,"note":"8x90'''' subida sostenida"},{"code":"FE","duration_min":15}]', 50, false),
  (1, 3, 'Técnica de Bajada',    '[{"code":"TB","duration_min":30,"note":"Bajadas controladas, escaleras"},{"code":"MF","duration_min":10}]', 40, false),
  (1, 4, 'Tirada Larga',         '[{"code":"TLM","duration_min":80,"note":"Terreno mixto, conversacional"}]', 80, false),

  -- SEM 2 — introducimos RPC
  (2, 1, 'Rodaje + Progresivo',  '[{"code":"RP","duration_min":55,"note":"Bloque firme controlado al final"}]', 55, false),
  (2, 2, 'Subidas Sostenidas',   '[{"code":"SC","duration_min":35,"note":"6x2'' subida sostenida"},{"code":"FE","duration_min":15}]', 50, false),
  (2, 3, 'Técnica + Fuerza',     '[{"code":"TB","duration_min":30},{"code":"PL","duration_min":10,"note":"Pliometría suave"}]', 40, false),
  (2, 4, 'Tirada Larga',         '[{"code":"TLM","duration_min":90}]', 90, false),

  -- SEM 3 — pico de carga del primer bloque
  (3, 1, 'Rodaje Sostenido',     '[{"code":"RS","duration_min":60}]', 60, false),
  (3, 2, 'RPC + Subidas',        '[{"code":"RP","duration_min":40,"note":"4x6'' ritmo controlado"},{"code":"FE","duration_min":15}]', 55, false),
  (3, 3, 'Técnica + Bajadas',    '[{"code":"TB","duration_min":35,"note":"Bajadas técnicas, foco en planta del pie"},{"code":"MF","duration_min":10}]', 45, false),
  (3, 4, 'Tirada Larga',         '[{"code":"TLM","duration_min":100,"note":"Si hay desnivel acumulado, mejor"}]', 100, false),

  -- SEM 4 — DELOAD
  (4, 1, 'Recuperación',         '[{"code":"RA","duration_min":35}]', 35, true),
  (4, 2, 'Movilidad + Fuerza',   '[{"code":"MF","duration_min":15},{"code":"FE","duration_min":15}]', 30, true),
  (4, 3, 'Rodaje Suave',         '[{"code":"RS","duration_min":40}]', 40, true),
  (4, 4, 'Trail Suave',          '[{"code":"TLM","duration_min":60,"note":"Descarga, terreno conocido"}]', 60, true),

  -- SEM 5 — segundo bloque arranca con énfasis en intensidad
  (5, 1, 'Rodaje Base',          '[{"code":"RS","duration_min":55}]', 55, false),
  (5, 2, 'RPC + Subidas',        '[{"code":"RP","duration_min":45,"note":"5x5'' ritmo controlado"},{"code":"SC","duration_min":15,"note":"4x1'' subida"}]', 60, false),
  (5, 3, 'Técnica + Pliometría', '[{"code":"TB","duration_min":30},{"code":"PL","duration_min":15}]', 45, false),
  (5, 4, 'Tirada Larga',         '[{"code":"TLM","duration_min":90}]', 90, false),

  -- SEM 6
  (6, 1, 'Rodaje Sostenido',     '[{"code":"RS","duration_min":60}]', 60, false),
  (6, 2, 'Subidas Fuertes',      '[{"code":"SF","duration_min":35,"note":"6x90'''' subida intensa"},{"code":"FE","duration_min":15}]', 50, false),
  (6, 3, 'Técnica Avanzada',     '[{"code":"TB","duration_min":35,"note":"Bajadas con cambios de terreno"},{"code":"MF","duration_min":10}]', 45, false),
  (6, 4, 'Tirada Larga',         '[{"code":"TLM","duration_min":105}]', 105, false),

  -- SEM 7 — pico absoluto
  (7, 1, 'Rodaje + Progresivo',  '[{"code":"RP","duration_min":55,"note":"Último bloque firme al final"}]', 55, false),
  (7, 2, 'Intervalos Umbral',    '[{"code":"IU","duration_min":40,"note":"4x6'' ritmo umbral con 2'' pausa"},{"code":"FE","duration_min":10}]', 50, false),
  (7, 3, 'Técnica + Fuerza',     '[{"code":"TB","duration_min":35},{"code":"PL","duration_min":15}]', 50, false),
  (7, 4, 'Tirada Pico',          '[{"code":"TLM","duration_min":120,"note":"2 horas en montaña, tu nueva base"}]', 120, false),

  -- SEM 8 — DELOAD final
  (8, 1, 'Regenerativo',         '[{"code":"RA","duration_min":30}]', 30, true),
  (8, 2, 'Movilidad',            '[{"code":"MF","duration_min":15},{"code":"FE","duration_min":10}]', 25, true),
  (8, 3, 'Rodaje Suave',         '[{"code":"RS","duration_min":40}]', 40, true),
  (8, 4, 'Trail Celebración',    '[{"code":"TLM","duration_min":70,"note":"Cierre del plan, tu cerro favorito"}]', 70, true)
) as s(w, d, name, b, dur, deload)
on conflict (template_id, week_number, day_index) do nothing;
