-- ============================================================
-- CD Atlético Quarte — Módulo: Clasificación de liga
-- Ejecutar en el SQL Editor de Supabase
-- ============================================================

CREATE TABLE IF NOT EXISTS clasificaciones (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id       text NOT NULL,
  temporada     text NOT NULL DEFAULT '2025/26',
  posicion      integer NOT NULL,
  equipo_nombre text NOT NULL,
  es_nuestro    boolean DEFAULT false,
  pj            integer DEFAULT 0,
  pg            integer DEFAULT 0,
  pe            integer DEFAULT 0,
  pp            integer DEFAULT 0,
  gf            integer DEFAULT 0,
  gc            integer DEFAULT 0,
  pts           integer DEFAULT 0,
  updated_at    timestamptz DEFAULT now(),
  updated_by    text,
  UNIQUE (team_id, temporada, posicion)
);

ALTER TABLE clasificaciones ENABLE ROW LEVEL SECURITY;

-- Cualquier usuario autenticado puede leer
DROP POLICY IF EXISTS "clasificaciones_read" ON clasificaciones;
CREATE POLICY "clasificaciones_read" ON clasificaciones
  FOR SELECT TO authenticated USING (true);

-- Cualquier usuario autenticado puede escribir
-- (el control de rol se gestiona en la aplicación)
DROP POLICY IF EXISTS "clasificaciones_write" ON clasificaciones;
CREATE POLICY "clasificaciones_write" ON clasificaciones
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_clasificaciones_team_temp
  ON clasificaciones (team_id, temporada);
