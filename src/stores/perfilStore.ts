// ============================================================
// STORE: Perfil + Autenticación Supabase (Zustand)
// ============================================================
import { create } from 'zustand';
import type { Session } from '@supabase/supabase-js';
import type { Profile } from '@/types';
import { dataProvider } from '@/data';
import { supabase } from '@/data/supabaseClient';
import { setRemotePerfilId } from '@/data/RemoteDataProvider';

const ACTIVE_TEAM_KEY = 'atq_active_team_id';

interface PerfilState {
  perfil:       Profile | null;
  session:      Session | null;
  cargando:     boolean;
  error:        string | null;
  activeTeamId: string | null;

  inicializarAuth: () => () => void;
  login:           (email: string, password: string) => Promise<void>;
  registrar:       (email: string, password: string, nombre: string) => Promise<{ needsConfirmation: boolean }>;
  cerrarSesion:    () => Promise<void>;
  guardarPerfil:   (p: Profile) => Promise<void>;
  setActiveTeamId: (id: string) => void;
}

function resolveActiveTeam(profile: Profile): string {
  const saved = localStorage.getItem(ACTIVE_TEAM_KEY);
  // Use saved value only if it belongs to this profile's teams
  if (saved && profile.team_ids.includes(saved)) return saved;
  // Otherwise use the first team
  return profile.team_ids[0] ?? '';
}

export const usePerfilStore = create<PerfilState>((set) => ({
  perfil:       null,
  session:      null,
  cargando:     true,
  error:        null,
  activeTeamId: localStorage.getItem(ACTIVE_TEAM_KEY),

  inicializarAuth: () => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'TOKEN_REFRESHED') {
          set({ session });
          return;
        }

        if (session?.user) {
          setRemotePerfilId(session.user.id);
          set({ session, cargando: true, error: null });
          const p = await dataProvider.getPerfil();
          if (p) {
            const activeTeamId = resolveActiveTeam(p);
            localStorage.setItem(ACTIVE_TEAM_KEY, activeTeamId);
            set({ perfil: p, activeTeamId, cargando: false });
          } else {
            set({ perfil: null, cargando: false });
          }
        } else {
          setRemotePerfilId(null);
          set({ session: null, perfil: null, activeTeamId: null, cargando: false });
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
    localStorage.removeItem(ACTIVE_TEAM_KEY);
    set({ perfil: null, session: null, activeTeamId: null });
  },

  guardarPerfil: async (p) => {
    await dataProvider.savePerfil(p);
    setRemotePerfilId(p.id);
    const activeTeamId = resolveActiveTeam(p);
    localStorage.setItem(ACTIVE_TEAM_KEY, activeTeamId);
    set({ perfil: p, activeTeamId });
  },

  setActiveTeamId: (id) => {
    localStorage.setItem(ACTIVE_TEAM_KEY, id);
    set({ activeTeamId: id });
  },
}));
