-- ============================================================================
-- FlowRun — Migration 0005: Seed plan desde_cero_3d
-- ============================================================================
-- Plan de 8 semanas con Run-Walk Progresivo para usuarios que nunca corrieron.
-- Estructura: 4 bloques de 2 semanas cada uno (A → B → C → D).
-- Sin gate criteria en este slice — el avance es por calendario fijo.
-- Idempotente vía ON CONFLICT.
-- Ref: discovery/training-plans.md líneas 611-635
-- ============================================================================

insert into public.plan_templates (code, name, description, goal_type, experience_level, weekly_days, total_weeks) values
  (
    'desde_cero_3d',
    'Empezá a correr · 8 semanas',
    'Tu primer plan si nunca corriste o hace mucho que no corrés. 8 semanas de alternancia trote-caminata progresiva (Run-Walk), hasta que puedas correr 30 minutos continuos a tu Ritmo Real.',
    'calle',
    'new',
    3,
    8
  )
on conflict (code) do nothing;

with t as (
  select id from public.plan_templates where code = 'desde_cero_3d'
)
insert into public.template_sessions
  (template_id, week_number, day_index, session_name, blocks, total_duration_min, is_deload)
select t.id, w, d, name, b::jsonb, dur, deload from t,
(values
  -- BLOQUE A — ADAPTACIÓN (sem 1-2): 1' trote / 4' caminata
  (1, 1, 'Empezar a Moverse',
   '[{"code":"RW","duration_min":30,"note":"Calentamiento 5min caminando + bloque 20min alternando 1''trote/4''caminata + 5min vuelta a calma. Si te cansás, caminá más."}]',
   30, false),
  (1, 2, 'Fuerza Básica',
   '[{"code":"FG","duration_min":15,"note":"Sentadillas, plancha, glute bridges. Suave, sin equipamiento."},{"code":"MF","duration_min":5}]',
   20, false),
  (1, 3, 'Segundo Paso',
   '[{"code":"RW","duration_min":30,"note":"Misma alternancia: 1''trote / 4''caminata"}]',
   30, false),

  (2, 1, 'Empezar a Moverse',
   '[{"code":"RW","duration_min":30,"note":"Ratio 1''/4''. Si la respiración se va, caminá hasta recuperar."}]',
   30, false),
  (2, 2, 'Fuerza Básica',
   '[{"code":"FG","duration_min":15},{"code":"MF","duration_min":5}]',
   20, false),
  (2, 3, 'Segundo Paso',
   '[{"code":"RW","duration_min":30,"note":"Ratio 1''/4''. Última semana antes del próximo bloque."}]',
   30, false),

  -- BLOQUE B — PROGRESIÓN 1 (sem 3-4): 3' trote / 2' caminata
  (3, 1, 'Más Trote',
   '[{"code":"RW","duration_min":30,"note":"Ratio nuevo: 3''trote / 2''caminata. Sentí cómo el cuerpo se adapta."}]',
   30, false),
  (3, 2, 'Fuerza + Core',
   '[{"code":"FG","duration_min":15},{"code":"MF","duration_min":5}]',
   20, false),
  (3, 3, 'Rodaje Run-Walk',
   '[{"code":"RW","duration_min":30,"note":"Ratio 3''/2''. Si podés hablar mientras trotás, vas bien."}]',
   30, false),

  (4, 1, 'Más Trote',
   '[{"code":"RW","duration_min":30,"note":"Ratio 3''/2''. Foco en respirar por la nariz cuando podés."}]',
   30, false),
  (4, 2, 'Fuerza + Core',
   '[{"code":"FG","duration_min":15},{"code":"MF","duration_min":5}]',
   20, false),
  (4, 3, 'Rodaje Run-Walk',
   '[{"code":"RW","duration_min":30,"note":"Ratio 3''/2''. Cierra el bloque B."}]',
   30, false),

  -- BLOQUE C — PROGRESIÓN 2 (sem 5-6): 5' trote / 2' caminata
  (5, 1, 'Bloques Más Largos',
   '[{"code":"RW","duration_min":35,"note":"Ratio nuevo: 5''trote / 2''caminata. Estás corriendo más de lo que caminás."}]',
   35, false),
  (5, 2, 'Fuerza',
   '[{"code":"FG","duration_min":20},{"code":"FE","duration_min":5,"note":"Intro a fuerza excéntrica"}]',
   25, false),
  (5, 3, 'Run-Walk Sostenido',
   '[{"code":"RW","duration_min":35,"note":"Ratio 5''/2''. Tu cuerpo se está adaptando."}]',
   35, false),

  (6, 1, 'Bloques Más Largos',
   '[{"code":"RW","duration_min":35,"note":"Ratio 5''/2''. Mantener el ritmo conversacional."}]',
   35, false),
  (6, 2, 'Fuerza',
   '[{"code":"FG","duration_min":20},{"code":"FE","duration_min":5}]',
   25, false),
  (6, 3, 'Run-Walk Sostenido',
   '[{"code":"RW","duration_min":35,"note":"Ratio 5''/2''. Última semana de RW antes del rodaje continuo."}]',
   35, false),

  -- BLOQUE D — CORRER CONTINUO (sem 7-8)
  (7, 1, 'Primer Rodaje Continuo',
   '[{"code":"RS","duration_min":20,"note":"Trote suave continuo, sin caminar. Si necesitás caminar, está bien."}]',
   20, false),
  (7, 2, 'Fuerza',
   '[{"code":"FG","duration_min":25}]',
   25, false),
  (7, 3, 'Construyendo Resistencia',
   '[{"code":"RS","duration_min":25,"note":"5 min más que el día 1. Conversacional."}]',
   25, false),

  (8, 1, 'Rodaje Suave',
   '[{"code":"RS","duration_min":25,"note":"Mantenemos lo logrado."}]',
   25, false),
  (8, 2, 'Fuerza',
   '[{"code":"FG","duration_min":25}]',
   25, false),
  (8, 3, 'Tu Primera Media Hora',
   '[{"code":"RS","duration_min":30,"note":"30 minutos continuos a Ritmo Real. Esto es tu nueva base."}]',
   30, false)
) as s(w, d, name, b, dur, deload)
on conflict (template_id, week_number, day_index) do nothing;
