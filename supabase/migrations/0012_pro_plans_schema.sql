-- ============================================================================
-- FlowRun — Migration 0012: Schema extension para planes pro Sarah McCormack
-- ============================================================================
-- - plan_templates: + is_pro (default false)
-- - template_sessions: + distance_label (texto descriptivo tipo "5 mi", "10K")
-- - workout_blocks: + FK, TE, PR, HF, HK, RC, SU (sesiones de los pro plans)
--
-- weekly_days y day_index ya aceptan 2..7 y 1..7 — sin cambios de constraint.
-- Idempotente.
-- ============================================================================

alter table public.plan_templates
  add column if not exists is_pro boolean not null default false;

alter table public.template_sessions
  add column if not exists distance_label text;

-- Bloques nuevos (idempotente vía on conflict en code).
insert into public.workout_blocks (code, name, category, description, is_trail_specific) values
  ('FK',  'Fartlek',                'carrera', 'Cambios de ritmo estructurados, alternancia rápido/easy.',     false),
  ('TE',  'Tempo Run',              'carrera', 'Sostenido a ritmo de umbral durante un bloque continuo.',      false),
  ('PR',  'Rodaje Progresivo Pro',  'carrera', 'Subidas de intensidad por bloques (p.ej. 2h race pace → 1h).', false),
  ('HF',  'Hill Fartlek',           'trail',   'Sesión en terreno ondulado: duro en subidas, easy en llanos.', true),
  ('HK',  'Caminata Larga Cerro',   'trail',   'Caminata sostenida en cerro de varias horas (long hike).',     true),
  ('RC',  'Día de Carrera',         'carrera', 'Día de competencia.',                                          false),
  ('SU',  'Surges',                 'carrera', 'Aceleraciones cortas dentro de un rodaje easy.',               false)
on conflict (code) do nothing;
