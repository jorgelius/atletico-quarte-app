-- ============================================================
-- CD Atlético Quarte — Pase de lista independiente
-- Ejecutar en el SQL Editor de Supabase
-- ============================================================

CREATE TABLE IF NOT EXISTS lista_sesiones (
  id         uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id   uuid    NOT NULL,
  date       date    NOT NULL DEFAULT CURRENT_DATE,
  records    jsonb   NOT NULL DEFAULT '{}',   -- { [player_id]: 'present'|'absent'|'justified'|'late' }
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (coach_id, date)
);

ALTER TABLE lista_sesiones ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "lista_sesiones_owner" ON lista_sesiones;
CREATE POLICY "lista_sesiones_owner" ON lista_sesiones
  FOR ALL
  USING  (coach_id = auth.uid())
  WITH CHECK (coach_id = auth.uid());
