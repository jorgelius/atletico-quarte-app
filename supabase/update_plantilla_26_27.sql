-- ============================================================
-- UPDATE PLANTILLA CD Atlético Quarte — Temporada 26/27 (FINAL)
-- Ejecutar UNA VEZ en el panel SQL de Supabase
-- ============================================================
-- Resumen de cambios:
--   - Elimina jugadores que ya no están en la plantilla
--   - Corrige asignación de equipo (Infantil B/C estaban mezclados)
--   - Mueve jugadores de Inf. A y C que estaban en equipo Inf. B
--   - Añade jugadores nuevos no registrados aún
-- ============================================================


-- ────────────────────────────────────────────────────────────
-- 1. BAJAS — jugadores que ya no están en la plantilla final
-- ────────────────────────────────────────────────────────────

-- 2ª Benjamín A (-2)
DELETE FROM players WHERE id IN (
  '20000002-0000-0000-0000-000000000006', -- Oliver Remon Salguero  (baja)
  '20000002-0000-0000-0000-00000000000a'  -- Leo Enguix Bueno       (baja)
);

-- 2ª Benjamín B (-1)
DELETE FROM players WHERE id = '20000003-0000-0000-0000-000000000001'; -- Andony Cardona Toro (baja)

-- Alevín B (-2)
DELETE FROM players WHERE id IN (
  '20000005-0000-0000-0000-00000000000d', -- Mateo Castro Argota           (baja)
  '20000005-0000-0000-0000-000000000011'  -- Catalin Vasile Maris Florescu (baja)
);

-- Cadete A (-7)
DELETE FROM players WHERE id IN (
  '20000006-0000-0000-0000-000000000008', -- Rodrigo Bernal Cabrera      (baja)
  '20000006-0000-0000-0000-00000000000e', -- Lucas Albero Perna           (baja)
  '20000006-0000-0000-0000-000000000015', -- Gabriel Mancia Remacha       (baja)
  '20000006-0000-0000-0000-000000000016', -- Oscar Gabriel Blanco Segnine (baja)
  '20000006-0000-0000-0000-000000000017', -- Mario Arroyo Valero          (baja)
  '20000006-0000-0000-0000-000000000018', -- Jose Marí Sanchéz Llado      (baja)
  '20000006-0000-0000-0000-000000000019'  -- Hugo Lahoz Gil               (baja)
);

-- Infantil A (-2 mal asignados)
DELETE FROM players WHERE id IN (
  '20000007-0000-0000-0000-000000000002', -- Eric Sánchez Heredia (pertenece a Infantil C, se re-inserta abajo)
  '20000007-0000-0000-0000-00000000000e'  -- Daniel López Gil     (baja)
);

-- Juvenil A (-1)
DELETE FROM players WHERE id = '2000000c-0000-0000-0000-000000000001'; -- Hugo Navarro Lajoux (baja)


-- ────────────────────────────────────────────────────────────
-- 2. CORRECCIÓN DE EQUIPO — Infantil C estaba en equipo Inf. B
--    Mover 16 jugadores de team 008 → team 009 (Infantil C)
-- ────────────────────────────────────────────────────────────
UPDATE players
SET owner_id = '10000000-0000-0000-0000-000000000009'
WHERE id IN (
  '20000008-0000-0000-0000-000000000001', -- Mario Serrano Serrano
  '20000008-0000-0000-0000-000000000002', -- Pablo Gracia Tena
  '20000008-0000-0000-0000-000000000003', -- Martín Ruata Alierta
  '20000008-0000-0000-0000-000000000004', -- Javier Nueda Acin
  '20000008-0000-0000-0000-000000000005', -- Alejandro Pamplona Sanchez
  '20000008-0000-0000-0000-000000000006', -- Marcos Aznar Díaz
  '20000008-0000-0000-0000-000000000007', -- Ismael Serrano Campo
  '20000008-0000-0000-0000-000000000008', -- Hansel Yoel López Franco
  '20000008-0000-0000-0000-000000000014', -- Jorge Barea Valiño
  '20000008-0000-0000-0000-000000000015', -- Jorge Sardaña Salazar
  '20000008-0000-0000-0000-000000000016', -- Asier Sardon Utrera
  '20000008-0000-0000-0000-000000000017', -- Daniel Bolaños
  '20000008-0000-0000-0000-000000000018', -- Pablo Hueso Escartín
  '20000008-0000-0000-0000-00000000001e', -- Adrián López Aguirre
  '20000008-0000-0000-0000-000000000020', -- Ian Sebastían Maya
  '20000008-0000-0000-0000-000000000021'  -- Sergio Sabroso Gimeno
);

-- ────────────────────────────────────────────────────────────
-- 3. CORRECCIÓN DE EQUIPO — Jugadores de Infantil A
--    que estaban registrados en equipo Inf. B → mover a team 007
-- ────────────────────────────────────────────────────────────
UPDATE players
SET owner_id = '10000000-0000-0000-0000-000000000007'
WHERE id IN (
  '20000008-0000-0000-0000-000000000010', -- Mateo Pina Aina
  '20000008-0000-0000-0000-000000000013', -- Nahuel Pajares Frumoso
  '20000008-0000-0000-0000-00000000001c'  -- Arturo Sepúlveda González
);


-- ────────────────────────────────────────────────────────────
-- 4. ALTAS — jugadores nuevos no registrados aún
-- ────────────────────────────────────────────────────────────
INSERT INTO players (id, owner_id, nombre, apellidos, dorsal, posicion)
VALUES

-- ── Alevín A (+1) ───────────────────────────────────────────
('20000004-0000-0000-0000-000000000011', '10000000-0000-0000-0000-000000000004',
  'Joaquín', 'Reolid Comet', 0, 'DEF'),

-- ── Alevín B (+2) ───────────────────────────────────────────
('20000005-0000-0000-0000-000000000015', '10000000-0000-0000-0000-000000000005',
  'Jhon Bryden', 'Castillo Cujilan', 0, 'DEF'),
('20000005-0000-0000-0000-000000000016', '10000000-0000-0000-0000-000000000005',
  'Martín', 'Campoy', 0, 'DEF'),

-- ── Infantil A (+2 que no estaban en ningún equipo) ─────────
('20000007-0000-0000-0000-00000000000f', '10000000-0000-0000-0000-000000000007',
  'Martín', 'Monguilán Gracia', 0, 'DEF'),
('20000007-0000-0000-0000-000000000010', '10000000-0000-0000-0000-000000000007',
  'Izan', 'Corao Lavilla', 0, 'DEF'),

-- ── Infantil B (+3) ─────────────────────────────────────────
('20000008-0000-0000-0000-000000000024', '10000000-0000-0000-0000-000000000008',
  'Noe', 'Moreno Vahl', 0, 'DEF'),
('20000008-0000-0000-0000-000000000025', '10000000-0000-0000-0000-000000000008',
  'Manuel', 'Braojos Moya', 0, 'DEF'),
('20000008-0000-0000-0000-000000000026', '10000000-0000-0000-0000-000000000008',
  'Samuel', 'Fernandez Duce', 0, 'DEF'),

-- ── Infantil C (+2 nuevos; los otros 16 vienen del UPDATE) ──
-- Eric Sánchez Heredia: estaba mal en Infantil A, borrado y re-insertado aquí
('20000009-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000009',
  'Eric', 'Sánchez Heredia', 0, 'DEF'),
-- (PT) Alejandro Aure Sanz: nunca estuvo en ningún seed
('20000009-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000009',
  'Alejandro', 'Aure Sanz', 0, 'POR'),

-- ── Prebenjamín A (+3) ──────────────────────────────────────
('2000000a-0000-0000-0000-000000000009', '10000000-0000-0000-0000-00000000000a',
  'Naider', 'Muñoz Valdes', 0, 'DEF'),
('2000000a-0000-0000-0000-00000000000a', '10000000-0000-0000-0000-00000000000a',
  'Ruben', 'Arnedo Bernal', 0, 'DEF'),
('2000000a-0000-0000-0000-00000000000b', '10000000-0000-0000-0000-00000000000a',
  'Héctor', 'Zamora Fabián', 0, 'DEF'),

-- ── Prebenjamín B (+11 — equipo sin ningún jugador aún) ─────
('2000000b-0000-0000-0000-000000000001', '10000000-0000-0000-0000-00000000000b',
  'Unai', 'Lison Hernández', 0, 'DEF'),
('2000000b-0000-0000-0000-000000000002', '10000000-0000-0000-0000-00000000000b',
  'Adrián', 'Subijana Gimeno', 0, 'DEF'),
('2000000b-0000-0000-0000-000000000003', '10000000-0000-0000-0000-00000000000b',
  'Cosmin Andrei', 'Purdea', 0, 'DEF'),
('2000000b-0000-0000-0000-000000000004', '10000000-0000-0000-0000-00000000000b',
  'Matei Samuel', 'Dragan', 0, 'DEF'),
('2000000b-0000-0000-0000-000000000005', '10000000-0000-0000-0000-00000000000b',
  'Martín', 'Egea López', 0, 'DEF'),
('2000000b-0000-0000-0000-000000000006', '10000000-0000-0000-0000-00000000000b',
  'Álvaro', 'Navarro Ruiz', 0, 'DEF'),
('2000000b-0000-0000-0000-000000000007', '10000000-0000-0000-0000-00000000000b',
  'Loís', 'Zegrí Solís', 0, 'POR'),
('2000000b-0000-0000-0000-000000000008', '10000000-0000-0000-0000-00000000000b',
  'Fabian Eduardo', 'Dorante Flores', 0, 'DEF'),
('2000000b-0000-0000-0000-000000000009', '10000000-0000-0000-0000-00000000000b',
  'Samuel', 'García Royo', 0, 'DEF'),
('2000000b-0000-0000-0000-00000000000a', '10000000-0000-0000-0000-00000000000b',
  'Guillermo', 'Solanas Bielsa', 0, 'POR'),
('2000000b-0000-0000-0000-00000000000b', '10000000-0000-0000-0000-00000000000b',
  'Danny Ethan', 'Castillo Cujilan', 0, 'DEF'),

-- ── Juvenil A (+2) ──────────────────────────────────────────
('2000000c-0000-0000-0000-000000000014', '10000000-0000-0000-0000-00000000000c',
  'Daniel', 'San Millán Hidalgo', 0, 'DEF'),
('2000000c-0000-0000-0000-000000000015', '10000000-0000-0000-0000-00000000000c',
  'Alejandro', 'Lison Sánchez', 0, 'DEF')

ON CONFLICT (id) DO NOTHING;


-- ────────────────────────────────────────────────────────────
-- VERIFICACIÓN (opcional, ejecutar después para comprobar)
-- ────────────────────────────────────────────────────────────
-- SELECT owner_id, COUNT(*) as total
-- FROM players
-- WHERE owner_id LIKE '10000000%'
-- GROUP BY owner_id
-- ORDER BY owner_id;
--
-- Resultado esperado:
--   ...000001  →  9   (1ª Benjamín A)
--   ...000002  →  8   (2ª Benjamín A)
--   ...000003  →  7   (2ª Benjamín B)
--   ...000004  → 17   (Alevín A)
--   ...000005  → 20   (Alevín B)
--   ...000006  → 19   (Cadete A)
--   ...000007  → 17   (Infantil A)
--   ...000008  → 19   (Infantil B)
--   ...000009  → 18   (Infantil C)
--   ...00000a  → 11   (Prebenjamín A)
--   ...00000b  → 11   (Prebenjamín B)
--   ...00000c  → 20   (Juvenil A)
