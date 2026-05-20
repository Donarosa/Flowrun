-- ============================================================================
-- FlowRun — Migration 0002: Datos personales en profiles
-- ============================================================================
-- Suma gender (enum) y country (ISO 3166-1 alpha-2) a profiles.
-- name y age ya existen desde 0001.
-- Todas las columnas son nullable a nivel DB; el frontend exige completarlas
-- en el paso "Sobre vos" del onboarding.
-- ============================================================================

create type gender as enum ('male', 'female', 'other', 'prefer_not_to_say');

alter table public.profiles
  add column gender  gender,
  add column country text check (country is null or char_length(country) = 2);
