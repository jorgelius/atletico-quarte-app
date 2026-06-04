// ============================================================
// Cliente Supabase — CD Atlético Quarte
// Las credenciales se leen de las variables de entorno (.env)
// ============================================================
import { createClient } from '@supabase/supabase-js';

const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL  as string;
const supabaseKey  = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseKey) {
  console.error('[Supabase] Faltan VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY en el .env');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
