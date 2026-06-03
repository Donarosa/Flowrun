-- ============================================================================
-- FlowRun — Migration 0017: tracking de aceptación de T&C
-- ============================================================================
-- Agrega columna accepted_terms_at en profiles para registrar cuándo
-- el usuario aceptó los términos y la política de privacidad.
-- Idempotente: ADD COLUMN IF NOT EXISTS.
-- ============================================================================

alter table public.profiles
  add column if not exists accepted_terms_at timestamptz;

comment on column public.profiles.accepted_terms_at is
  'Timestamp de cuando el usuario aceptó los T&C y la Política de Privacidad. NULL = no aceptados todavía.';
