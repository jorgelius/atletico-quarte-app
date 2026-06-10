-- ============================================================
-- Migración: Tabla match_squad (Convocatorias para partidos)
-- Ejecutar en el panel SQL de Supabase
-- ============================================================

CREATE TABLE IF NOT EXISTS match_squad (
  id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id          uuid        NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  player_id         uuid        NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  status            text        NOT NULL DEFAULT 'called'
                                CHECK (status IN ('called', 'confirmed', 'declined', 'doubt', 'injured')),
  position_in_squad integer,        -- orden en la lista (1-18 normalmente)
  is_starter        boolean     NOT NULL DEFAULT false,
  jersey_number     integer,        -- dorsal para este partido
  notes             text,
  created_at        timestamptz NOT NULL DEFAULT now(),
  UNIQUE (match_id, player_id)
);

-- Índices para consultas frecuentes
CREATE INDEX IF NOT EXISTS idx_match_squad_match_id  ON match_squad (match_id);
CREATE INDEX IF NOT EXISTS idx_match_squad_player_id ON match_squad (player_id);

-- RLS: misma política que matches (el propietario puede ver/editar los suyos)
ALTER TABLE match_squad ENABLE ROW LEVEL SECURITY;

-- Policy: leer si el match pertenece al team_id del usuario autenticado
CREATE POLICY "match_squad_select" ON match_squad
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM matches m
      WHERE m.id = match_squad.match_id
        AND m.team_id = auth.uid()
    )
  );

CREATE POLICY "match_squad_insert" ON match_squad
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM matches m
      WHERE m.id = match_squad.match_id
        AND m.team_id = auth.uid()
    )
  );

CREATE POLICY "match_squad_update" ON match_squad
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM matches m
      WHERE m.id = match_squad.match_id
        AND m.team_id = auth.uid()
    )
  );

CREATE POLICY "match_squad_delete" ON match_squad
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM matches m
      WHERE m.id = match_squad.match_id
        AND m.team_id = auth.uid()
    )
  );
