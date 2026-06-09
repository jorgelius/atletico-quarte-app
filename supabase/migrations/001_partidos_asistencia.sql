-- ============================================================
-- CD Atlético Quarte — Módulo A: Partidos + Módulo B: Asistencia
-- Ejecutar en el SQL Editor de Supabase
-- ============================================================

-- ── MÓDULO A: PARTIDOS ──────────────────────────────────────

CREATE TABLE IF NOT EXISTS matches (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id       uuid NOT NULL,
  season        text NOT NULL DEFAULT '2025/26',
  date          date NOT NULL,
  time          text,
  rival_name    text NOT NULL,
  location      text CHECK (location IN ('home', 'away', 'neutral')) DEFAULT 'home',
  competition   text,
  goals_for     integer DEFAULT 0,
  goals_against integer DEFAULT 0,
  status        text CHECK (status IN ('scheduled', 'played', 'cancelled', 'postponed')) DEFAULT 'scheduled',
  notes         text,
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
);

ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "matches_owner" ON matches;
CREATE POLICY "matches_owner" ON matches
  FOR ALL
  USING  (team_id = auth.uid())
  WITH CHECK (team_id = auth.uid());

CREATE INDEX IF NOT EXISTS matches_team_date_idx ON matches (team_id, date DESC);


CREATE TABLE IF NOT EXISTS match_events (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id    uuid REFERENCES matches(id) ON DELETE CASCADE,
  player_id   uuid REFERENCES players(id) ON DELETE SET NULL,
  player_name text,
  event_type  text CHECK (event_type IN ('goal', 'assist', 'yellow_card', 'red_card', 'mvp')) NOT NULL,
  minute      integer,
  created_at  timestamptz DEFAULT now()
);

ALTER TABLE match_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "match_events_owner" ON match_events;
CREATE POLICY "match_events_owner" ON match_events
  FOR ALL
  USING (
    match_id IN (SELECT id FROM matches WHERE team_id = auth.uid())
  );

CREATE INDEX IF NOT EXISTS match_events_match_idx ON match_events (match_id);


-- ── MÓDULO B: ASISTENCIA A ENTRENAMIENTOS ──────────────────

CREATE TABLE IF NOT EXISTS training_attendance (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  training_id uuid REFERENCES trainings(id) ON DELETE CASCADE,
  player_id   uuid REFERENCES players(id)   ON DELETE CASCADE,
  status      text CHECK (status IN ('present', 'absent', 'justified', 'late')) DEFAULT 'absent',
  notes       text,
  recorded_at timestamptz DEFAULT now(),
  UNIQUE (training_id, player_id)
);

ALTER TABLE training_attendance ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "attendance_owner" ON training_attendance;
CREATE POLICY "attendance_owner" ON training_attendance
  FOR ALL
  USING (
    training_id IN (SELECT id FROM trainings WHERE coach_id = auth.uid())
  );

CREATE INDEX IF NOT EXISTS attendance_training_idx ON training_attendance (training_id);
CREATE INDEX IF NOT EXISTS attendance_player_idx   ON training_attendance (player_id);
