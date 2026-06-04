// ============================================================
// STORE: Perfil + Autenticación Supabase (Zustand)
// ============================================================
import { create } from 'zustand';
import type { Session } from '@supabase/supabase-js';
import type { Profile } from '@/types';
import { dataProvider } from '@/data';
import { supabase } from '@/data/supabaseClient';
import { setRemotePerfilId } from '@/data/RemoteDataProvider';

interface PerfilState {
  perfil:   Profile | null;
  session:  Session | null;
  cargando: boolean;
  error:    string | null;

  // Inicia el listener de sesión; devuelve la función de cleanup
  inicializarAuth: () => () => void;

  // Auth
  login:    (email: string, password: string) => Promise<void>;
  registrar: (email: string, password: string, nombre: string) => Promise<{ needsConfirmation: boolean }>;
  cerrarSesion: () => Promise<void>;

  // Perfil
  guardarPerfil: (p: Profile) => Promise<void>;
}

export const usePerfilStore = create<PerfilState>((set) => ({
  perfil:   null,
  session:  null,
  cargando: true,
  error:    null,

  inicializarAuth: () => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // Solo actualizar el token sin recargar el perfil
        if (event === 'TOKEN_REFRESHED') {
          set({ session });
          return;
        }

        if (session?.user) {
          setRemotePerfilId(session.user.id);
          set({ session, cargando: true, error: null });
          const p = await dataProvider.getPerfil();
          set({ perfil: p, cargando: false });
        } else {
          setRemotePerfilId(null);
          set({ session: null, perfil: null, cargando: false });
        }
      }
    );

    return () => subscription.unsubscribe();
  },

  login: async (email, password) => {
    set({ error: null });
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      set({ error: error.message });
      throw error;
    }
    // onAuthStateChange se encarga del resto
  },

  registrar: async (email, password, nombre) => {
    set({ error: null });
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { nombre } },
    });
    if (error) {
      set({ error: error.message });
      throw error;
    }
    return { needsConfirmation: !data.session };
  },

  cerrarSesion: async () => {
    await supabase.auth.signOut();
    setRemotePerfilId(null);
    set({ perfil: null, session: null });
  },

  guardarPerfil: async (p) => {
    await dataProvider.savePerfil(p);
    setRemotePerfilId(p.id);
    set({ perfil: p });
  },
}));
