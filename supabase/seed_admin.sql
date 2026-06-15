-- ============================================================
-- Seed: Cuenta Admin — CD Atlético Quarte
-- Ejecutar en el panel SQL de Supabase (una sola vez)
--
-- Credenciales de acceso a la app:
--   Usuario/Email : admin
--   Contraseña    : admin
--
-- Internamente usa:
--   Email real    : admin@atleticoquarte.local
--   UUID          : a0000000-0000-0000-0000-000000000000
-- ============================================================

-- ── 1. Usuario en auth.users ─────────────────────────────────
INSERT INTO auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
)
VALUES (
  'a0000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'admin@atleticoquarte.local',
  crypt('admin', gen_salt('bf')),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"nombre":"Admin"}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
)
ON CONFLICT (id) DO NOTHING;

-- ── 2. Identidad email en auth.identities ────────────────────
INSERT INTO auth.identities (
  id,
  user_id,
  provider_id,
  identity_data,
  provider,
  last_sign_in_at,
  created_at,
  updated_at
)
VALUES (
  'a0000000-0000-0000-0000-000000000000',
  'a0000000-0000-0000-0000-000000000000',
  'admin@atleticoquarte.local',
  '{"sub":"a0000000-0000-0000-0000-000000000000","email":"admin@atleticoquarte.local","email_verified":true}',
  'email',
  NOW(),
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- ── 3. Perfil con todos los equipos ──────────────────────────
-- equipo almacena JSON array de todos los team_ids
INSERT INTO profiles (id, nombre, equipo, rol)
VALUES (
  'a0000000-0000-0000-0000-000000000000',
  'Admin',
  '[
    "10000000-0000-0000-0000-000000000001",
    "10000000-0000-0000-0000-000000000002",
    "10000000-0000-0000-0000-000000000003",
    "10000000-0000-0000-0000-000000000004",
    "10000000-0000-0000-0000-000000000005",
    "10000000-0000-0000-0000-000000000006",
    "10000000-0000-0000-0000-000000000007",
    "10000000-0000-0000-0000-000000000008",
    "10000000-0000-0000-0000-000000000009",
    "10000000-0000-0000-0000-00000000000a",
    "10000000-0000-0000-0000-00000000000b",
    "10000000-0000-0000-0000-00000000000c",
    "10000000-0000-0000-0000-00000000000d"
  ]',
  'admin'
)
ON CONFLICT (id) DO NOTHING;
