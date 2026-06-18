-- ============================================================
-- Fix: elimina la foreign key constraint en lineups.coach_id
-- Motivo: coach_id almacena UUIDs de equipo (10000000-…),
-- no UUIDs de usuarios de auth.users. La FK impedía el insert.
-- ============================================================

ALTER TABLE public.lineups
  DROP CONSTRAINT IF EXISTS lineups_coach_id_fkey;
