-- ============================================================================
-- FlowRun — Migration 0011: Tabla education_tips + seed
-- ============================================================================
-- Micro-educación integrada en el detalle de sesión: un tip rotativo según
-- bloques de la sesión + nivel del user + goal_type.
--
-- Schema mínimo del spec en dynamic-blocks-schema.md sección 7.
-- show_max_times se guarda pero no se trackea aún (slice futuro).
--
-- RLS: lectura abierta a authenticated, no hay writes desde el cliente.
-- Idempotente: enums con DO $$ guard, tabla con IF NOT EXISTS, seed con
-- DELETE + INSERT (los tips son catálogo, no datos de usuario).
-- ============================================================================

-- 1) Enums --------------------------------------------------------------

do $$ begin
  create type tip_category as enum
    ('respiracion','esfuerzo','tecnica_trail','nutricion','prevencion','motivacion');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type tip_level as enum ('new','base','advanced','all');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type tip_goal_context as enum ('calle','calle_trail','trail','all');
exception when duplicate_object then null;
end $$;


-- 2) Tabla --------------------------------------------------------------

create table if not exists public.education_tips (
  id                uuid primary key default gen_random_uuid(),
  category          tip_category not null,
  applicable_blocks text[] not null,         -- códigos de workout_blocks; 'ANY' = todos
  level             tip_level not null,
  goal_context      tip_goal_context not null,
  content_es        text not null,
  content_en        text,
  show_max_times    int not null default 3,
  created_at        timestamptz not null default now()
);

create index if not exists education_tips_blocks_idx
  on public.education_tips using gin (applicable_blocks);

-- RLS
alter table public.education_tips enable row level security;

do $$ begin
  create policy "education_tips_read_auth"
    on public.education_tips
    for select
    to authenticated
    using (true);
exception when duplicate_object then null;
end $$;


-- 3) Seed --------------------------------------------------------------
-- Catálogo: limpiamos y re-insertamos para que la migración sea repetible
-- y siempre quede sincronizada con el spec.

truncate table public.education_tips;

insert into public.education_tips (category, applicable_blocks, level, goal_context, content_es) values
  -- RESPIRACIÓN
  ('respiracion', ARRAY['RS','TL','TLM'], 'new', 'all',
   'Si no podés respirar por la nariz, estás yendo demasiado rápido.'),
  ('respiracion', ARRAY['RS','TL'], 'base', 'all',
   'Probá 3 pasos inspirando, 3 pasos exhalando. Encontrá tu ritmo.'),
  ('respiracion', ARRAY['SC','CF'], 'all', 'trail',
   'En subida es normal respirar por la boca. El esfuerzo se mide por habla, no por respiración.'),

  -- ESFUERZO
  ('esfuerzo', ARRAY['RS','RA'], 'new', 'all',
   'Hoy no importa la distancia. Importa que termines con ganas de volver mañana.'),
  ('esfuerzo', ARRAY['RS','TL'], 'base', 'all',
   'Si podés hablar en frases completas, estás en tu Ritmo Real.'),
  ('esfuerzo', ARRAY['RP'], 'base', 'all',
   'El bloque firme debe sentirse controlado, no máximo. Podrías sostenerlo 5 minutos más.'),
  ('esfuerzo', ARRAY['TLM'], 'base', 'trail',
   'Tu zona 2 en subida no es la misma que en llano. Dejá que el ritmo baje.'),

  -- TÉCNICA TRAIL
  ('tecnica_trail', ARRAY['SC','CF'], 'all', 'trail',
   'Subida: pasos cortos, apoyá todo el pie, usá los brazos.'),
  ('tecnica_trail', ARRAY['TB'], 'all', 'trail',
   'Bajada: rodillas flexionadas, mirada adelante (no al pie), pasos rápidos y cortos.'),
  ('tecnica_trail', ARRAY['SMC'], 'all', 'trail',
   'Las escaleras son tu mejor simulador de montaña en ciudad.'),
  ('tecnica_trail', ARRAY['TLM'], 'base', 'trail',
   'En montaña caminar fuerte en subida es válido. Los ultras lo hacen.'),

  -- PREVENCIÓN
  ('prevencion', ARRAY['FE'], 'all', 'all',
   'Los excéntricos protegen tus rodillas en bajadas. Es tu seguro de vida trail.'),
  ('prevencion', ARRAY['ANY'], 'all', 'trail',
   'Si sentís dolor agudo, pará. Dolor muscular post-entreno es normal. Dolor articular no.'),
  ('prevencion', ARRAY['TL','TLM'], 'all', 'all',
   'Si tus piernas están destruidas 2 días después, la próxima tirada bajá 10%.'),

  -- NUTRICIÓN
  ('nutricion', ARRAY['TL','TLM'], 'base', 'trail',
   'En salidas de +60 minutos llevá agua. En +90 minutos, algo de comer.'),
  ('nutricion', ARRAY['TLM'], 'base', 'trail',
   'Practicá comer caminando en subida. En carrera va a ser tu momento de recarga.'),

  -- MOTIVACIÓN
  ('motivacion', ARRAY['RS'], 'new', 'all',
   'El 80% de los runners corren demasiado rápido. Vos estás aprendiendo a hacerlo bien.'),
  ('motivacion', ARRAY['ANY'], 'new', 'all',
   'Cada sesión que completás te acerca. No importa si fue lenta.'),
  ('motivacion', ARRAY['TLM'], 'base', 'trail',
   'Hoy estás entrenando para disfrutar la montaña. Eso ya te hace diferente.'),

  -- NIVEL CERO — RUN-WALK
  ('esfuerzo', ARRAY['RW'], 'new', 'all',
   'Caminar no es hacer trampa. Es parte del plan.'),
  ('esfuerzo', ARRAY['RW'], 'new', 'all',
   'Si podés hablar mientras trotás, vas perfecto. Si no, caminá más.'),
  ('motivacion', ARRAY['RW'], 'new', 'all',
   'No mires la velocidad. Hoy solo importa completar los minutos.'),
  ('motivacion', ARRAY['RW'], 'new', 'all',
   'Cada bloque de trote que completás está construyendo tu motor aeróbico.'),
  ('prevencion', ARRAY['RW'], 'new', 'all',
   'La gente que camina entre bloques de trote se lesiona 60% menos que la que fuerza.'),
  ('prevencion', ARRAY['FG'], 'new', 'all',
   'La fuerza ahora te va a proteger después. Es tu inversión a futuro.');
