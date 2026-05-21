-- ============================================================================
-- FlowRun — Migration 0004: Seed catálogo + primer plan
-- ============================================================================
-- 17 workout_blocks (catálogo completo del spec).
-- 1 plan_template "nuevo_calle_3d" + 24 template_sessions (8 sem × 3 días).
-- Idempotente vía ON CONFLICT en code.
-- ============================================================================

-- 1) workout_blocks --------------------------------------------------------

insert into public.workout_blocks (code, name, category, description, is_trail_specific) values
  -- Carrera
  ('RW',  'Run-Walk Progresivo',     'carrera',  'Alternancia trote/caminata, progresión por bloque.', false),
  ('RS',  'Rodaje Sostenible',       'carrera',  'Trote conversacional para construir base aeróbica.', false),
  ('RP',  'Rodaje Progresivo',       'carrera',  'Rodaje con un bloque firme controlado al final.',    false),
  ('IU',  'Intervalos Umbral',       'carrera',  'Intervalos cortos a ritmo de umbral con pausas.',    false),
  ('ST',  'Strides',                 'carrera',  'Pasadas cortas de 20-30s, técnica y velocidad.',     false),
  ('TL',  'Tirada Larga',            'carrera',  'Rodaje largo a ritmo conversacional, resistencia.',  false),
  ('RA',  'Recuperación Activa',     'carrera',  'Trote muy suave o caminata rápida, regeneración.',   false),
  -- Trail
  ('SC',  'Subidas Conversacionales','trail',    'Repeticiones de subida controladas.',                true),
  ('SF',  'Subidas Fuertes',         'trail',    'Repeticiones de subida intensas.',                   true),
  ('TB',  'Técnica de Bajada',       'trail',    'Trabajo específico de bajadas controladas.',         true),
  ('SMC', 'Sesión Mixta Ciudad',     'trail',    'Simulación de trail en ciudad: escaleras, cambios.', true),
  ('TLM', 'Tirada Larga Montaña',    'trail',    'Tirada larga en terreno mixto o montaña.',           true),
  ('CF',  'Caminata Fuerte',         'trail',    'Caminata sostenida en terreno con desnivel.',        true),
  -- Fuerza / movilidad
  ('FG',  'Fuerza General',          'fuerza',   'Trabajo de fuerza para todo el cuerpo del runner.',  false),
  ('FE',  'Fuerza Excéntrica',       'fuerza',   'Énfasis en bajadas controladas, prevención lesión.', false),
  ('PL',  'Pliometría Suave',        'fuerza',   'Saltos suaves, potencia elástica.',                  false),
  ('MF',  'Movilidad/Flexibilidad',  'movilidad','Estiramientos y rango de movimiento.',               false)
on conflict (code) do nothing;

-- 2) plan_templates --------------------------------------------------------

insert into public.plan_templates (code, name, description, goal_type, experience_level, weekly_days, total_weeks) values
  (
    'nuevo_calle_3d',
    'Base aeróbica · calle · 3 días',
    'Plan de 8 semanas para construir resistencia sostenible en calle. Base aeróbica + fuerza preventiva. Termina con un test de 50 minutos.',
    'calle',
    'new',
    3,
    8
  )
on conflict (code) do nothing;

-- 3) template_sessions ----------------------------------------------------
-- Mapea el plan nuevo_calle_3d del spec (training-plans.md).
-- day_index 1/2/3 = primer/segundo/tercer día de entreno de la semana.
-- blocks JSONB: [{code, duration_min, note?}], lookup de name/description al
-- frontend desde workout_blocks.
-- ============================================================================

with t as (
  select id from public.plan_templates where code = 'nuevo_calle_3d'
)
insert into public.template_sessions
  (template_id, week_number, day_index, session_name, blocks, total_duration_min, is_deload)
select t.id, w, d, name, b::jsonb, dur, deload from t,
(values
  -- SEM 1
  (1, 1, 'Empezar a Moverse',  '[{"code":"RA","duration_min":25}]',                                 25, false),
  (1, 2, 'Fuerza Base',        '[{"code":"FG","duration_min":15},{"code":"MF","duration_min":5}]',  20, false),
  (1, 3, 'Primer Rodaje',      '[{"code":"RS","duration_min":25,"note":"Conversacional"}]',         25, false),

  -- SEM 2 (+5 min RS)
  (2, 1, 'Moverse Más',        '[{"code":"RA","duration_min":25}]',                                 25, false),
  (2, 2, 'Fuerza Base',        '[{"code":"FG","duration_min":15},{"code":"MF","duration_min":5}]',  20, false),
  (2, 3, 'Rodaje Sostenible',  '[{"code":"RS","duration_min":30,"note":"Conversacional"}]',         30, false),

  -- SEM 3 (rodaje creciendo)
  (3, 1, 'Rodaje Suave',       '[{"code":"RS","duration_min":25}]',                                 25, false),
  (3, 2, 'Fuerza + Core',      '[{"code":"FG","duration_min":25}]',                                 25, false),
  (3, 3, 'Rodaje Creciendo',   '[{"code":"RS","duration_min":35,"note":"+5 vs semana pasada"}]',    35, false),

  -- SEM 4 — DELOAD (-20%)
  (4, 1, 'Recuperación',       '[{"code":"RA","duration_min":20}]',                                 20, true),
  (4, 2, 'Movilidad',          '[{"code":"MF","duration_min":15}]',                                 15, true),
  (4, 3, 'Rodaje Suave',       '[{"code":"RS","duration_min":25,"note":"Semana de descarga"}]',     25, true),

  -- SEM 5 — introducimos RP
  (5, 1, 'Rodaje Base',        '[{"code":"RS","duration_min":30}]',                                 30, false),
  (5, 2, 'Fuerza',             '[{"code":"FG","duration_min":25}]',                                 25, false),
  (5, 3, 'Rodaje + Progresivo','[{"code":"RP","duration_min":35,"note":"Bloque firme controlado al final"}]', 35, false),

  -- SEM 6 — primera tirada larga
  (6, 1, 'Rodaje Base',        '[{"code":"RS","duration_min":35}]',                                 35, false),
  (6, 2, 'Fuerza',             '[{"code":"FG","duration_min":25}]',                                 25, false),
  (6, 3, 'Rodaje Largo',       '[{"code":"TL","duration_min":45,"note":"Primera tirada larga"}]',   45, false),

  -- SEM 7 — pico
  (7, 1, 'Rodaje Firme',       '[{"code":"RS","duration_min":35}]',                                 35, false),
  (7, 2, 'Fuerza + Pliometría','[{"code":"FG","duration_min":20},{"code":"PL","duration_min":10}]', 30, false),
  (7, 3, 'Tu Primer Test',     '[{"code":"TL","duration_min":50,"note":"Tu test de 50 minutos"}]',  50, false),

  -- SEM 8 — DELOAD final
  (8, 1, 'Regenerativo',       '[{"code":"RA","duration_min":20}]',                                 20, true),
  (8, 2, 'Movilidad',          '[{"code":"MF","duration_min":15}]',                                 15, true),
  (8, 3, 'Rodaje Celebración', '[{"code":"RS","duration_min":30,"note":"Cierre del plan"}]',        30, true)
) as s(w, d, name, b, dur, deload)
on conflict (template_id, week_number, day_index) do nothing;
