-- ============================================================
-- CD Atlético Quarte — Políticas RLS correctas
-- Ejecutar en el SQL Editor de Supabase
-- Arregla todas las alertas CRITICAL del Security Advisor
--
-- Motivo del problema anterior:
-- Las políticas originales usaban `auth.uid()` comparando con
-- team_id / coach_id, pero esos campos almacenan UUIDs de equipo
-- (10000000-…-001), no el UUID del usuario autenticado.
-- La solución es comparar contra profiles.equipo, que es el array
-- JSON de equipos que gestiona el usuario autenticado.
-- ============================================================

-- ─── Helper inline utilizado en todas las políticas ───────────
-- (SELECT equipo FROM profiles WHERE id = auth.uid())::jsonb ? columna::text
-- → devuelve true si el UUID de la columna está en el array JSON
--   de equipos del usuario autenticado.

-- ═══════════════════════════════════════════════════════════════
-- 1. TACTICS
-- ═══════════════════════════════════════════════════════════════
ALTER TABLE public.tactics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tactics_select"  ON public.tactics;
DROP POLICY IF EXISTS "tactics_insert"  ON public.tactics;
DROP POLICY IF EXISTS "tactics_update"  ON public.tactics;
DROP POLICY IF EXISTS "tactics_delete"  ON public.tactics;

-- Lectura: tácticas sugeridas (del club) visibles para todos los
-- usuarios autenticados; el resto solo si el equipo es del coach.
CREATE POLICY "tactics_select" ON public.tactics
  FOR SELECT TO authenticated
  USING (
    es_sugerido = true
    OR (SELECT equipo FROM profiles WHERE id = auth.uid())::jsonb ? coach_id::text
  );

CREATE POLICY "tactics_insert" ON public.tactics
  FOR INSERT TO authenticated
  WITH CHECK (
    (SELECT equipo FROM profiles WHERE id = auth.uid())::jsonb ? coach_id::text
  );

CREATE POLICY "tactics_update" ON public.tactics
  FOR UPDATE TO authenticated
  USING (
    (SELECT equipo FROM profiles WHERE id = auth.uid())::jsonb ? coach_id::text
  );

CREATE POLICY "tactics_delete" ON public.tactics
  FOR DELETE TO authenticated
  USING (
    (SELECT equipo FROM profiles WHERE id = auth.uid())::jsonb ? coach_id::text
  );


-- ═══════════════════════════════════════════════════════════════
-- 2. PLAYERS  (columna: owner_id = team UUID)
-- ═══════════════════════════════════════════════════════════════
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "players_owner" ON public.players;

CREATE POLICY "players_owner" ON public.players
  FOR ALL TO authenticated
  USING (
    (SELECT equipo FROM profiles WHERE id = auth.uid())::jsonb ? owner_id::text
  )
  WITH CHECK (
    (SELECT equipo FROM profiles WHERE id = auth.uid())::jsonb ? owner_id::text
  );


-- ═══════════════════════════════════════════════════════════════
-- 3. MATCHES  (columna: team_id = team UUID)
-- ═══════════════════════════════════════════════════════════════
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "matches_owner" ON public.matches;

CREATE POLICY "matches_owner" ON public.matches
  FOR ALL TO authenticated
  USING (
    (SELECT equipo FROM profiles WHERE id = auth.uid())::jsonb ? team_id::text
  )
  WITH CHECK (
    (SELECT equipo FROM profiles WHERE id = auth.uid())::jsonb ? team_id::text
  );


-- ═══════════════════════════════════════════════════════════════
-- 4. LISTA_SESIONES  (columna: coach_id = activeTeamId)
-- ═══════════════════════════════════════════════════════════════
ALTER TABLE public.lista_sesiones ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "lista_sesiones_owner" ON public.lista_sesiones;

CREATE POLICY "lista_sesiones_owner" ON public.lista_sesiones
  FOR ALL TO authenticated
  USING (
    (SELECT equipo FROM profiles WHERE id = auth.uid())::jsonb ? coach_id::text
  )
  WITH CHECK (
    (SELECT equipo FROM profiles WHERE id = auth.uid())::jsonb ? coach_id::text
  );


-- ═══════════════════════════════════════════════════════════════
-- 5. LINEUPS  (columna: coach_id = team UUID)
-- ═══════════════════════════════════════════════════════════════
ALTER TABLE public.lineups ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "lineups_owner" ON public.lineups;

CREATE POLICY "lineups_owner" ON public.lineups
  FOR ALL TO authenticated
  USING (
    (SELECT equipo FROM profiles WHERE id = auth.uid())::jsonb ? coach_id::text
  )
  WITH CHECK (
    (SELECT equipo FROM profiles WHERE id = auth.uid())::jsonb ? coach_id::text
  );


-- ═══════════════════════════════════════════════════════════════
-- 6. PIZARRAS_TACTICAS  (columna: coach_id = team UUID)
-- ═══════════════════════════════════════════════════════════════
ALTER TABLE public.pizarras_tacticas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "pizarras_owner" ON public.pizarras_tacticas;

CREATE POLICY "pizarras_owner" ON public.pizarras_tacticas
  FOR ALL TO authenticated
  USING (
    (SELECT equipo FROM profiles WHERE id = auth.uid())::jsonb ? coach_id::text
  )
  WITH CHECK (
    (SELECT equipo FROM profiles WHERE id = auth.uid())::jsonb ? coach_id::text
  );


-- ═══════════════════════════════════════════════════════════════
-- 7. FAVORITES  (columna: coach_id = auth.uid() del usuario)
-- Esta tabla es la única donde coach_id es el UUID del usuario
-- real (auth.uid()), no un UUID de equipo.
-- ═══════════════════════════════════════════════════════════════
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "favorites_owner" ON public.favorites;

CREATE POLICY "favorites_owner" ON public.favorites
  FOR ALL TO authenticated
  USING (coach_id = auth.uid())
  WITH CHECK (coach_id = auth.uid());
