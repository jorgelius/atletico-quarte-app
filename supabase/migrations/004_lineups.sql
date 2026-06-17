-- ============================================================
-- CD Atlético Quarte — Tabla lineups (alineaciones guardadas)
-- Ejecutar en el SQL Editor de Supabase
-- ============================================================

CREATE TABLE IF NOT EXISTS public.lineups (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id       uuid        NOT NULL,          -- team UUID (ej: 10000000-…-0006)
  nombre         text        NOT NULL,
  formato        text        NOT NULL DEFAULT 'F11',   -- 'F7' | 'F11'
  formacion      text        NOT NULL DEFAULT '4-4-2',
  posiciones     jsonb       NOT NULL DEFAULT '[]',    -- [{ jugador_id, x, y, en_campo }]
  creado_en      bigint,
  actualizado_en bigint,
  created_at     timestamptz DEFAULT now(),
  updated_at     timestamptz DEFAULT now()
);

-- Si la tabla ya existía con menos columnas, añadir las que falten:
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='lineups' AND column_name='formato') THEN
    ALTER TABLE public.lineups ADD COLUMN formato text NOT NULL DEFAULT 'F11';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='lineups' AND column_name='formacion') THEN
    ALTER TABLE public.lineups ADD COLUMN formacion text NOT NULL DEFAULT '4-4-2';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='lineups' AND column_name='posiciones') THEN
    ALTER TABLE public.lineups ADD COLUMN posiciones jsonb NOT NULL DEFAULT '[]';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='lineups' AND column_name='creado_en') THEN
    ALTER TABLE public.lineups ADD COLUMN creado_en bigint;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='lineups' AND column_name='actualizado_en') THEN
    ALTER TABLE public.lineups ADD COLUMN actualizado_en bigint;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS lineups_coach_id_idx ON public.lineups (coach_id);

-- RLS
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
