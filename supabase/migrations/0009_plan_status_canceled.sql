-- ============================================================================
-- FlowRun — Migration 0009: agregar 'canceled' al enum plan_status
-- ============================================================================
-- Necesario para marcar planes viejos al re-asignar (cambiar pista/días).
-- ============================================================================

alter type plan_status add value if not exists 'canceled';
