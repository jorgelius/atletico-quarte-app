// ============================================================
// STORE: Convocatorias de partido (Zustand)
// Gestiona la tabla match_squad en Supabase
// ============================================================
import { create } from 'zustand';
import { supabase } from '@/data/supabaseClient';
import type { MatchSquad } from '@/types';

interface ConvocatoriaState {
  squads:    Record<string, MatchSquad[]>; // match_id → convocados
  cuentas:   Record<string, number>;       // match_id → count (carga ligera para la lista)
  cargando:  boolean;
  guardando: boolean;

  cargar(matchId: string): Promise<void>;
  cargarCuentas(matchIds: string[]): Promise<void>;
  agregarJugador(
    entry: Omit<MatchSquad, 'id' | 'created_at'>
  ): Promise<void>;
  actualizarJugador(
    id: string,
    matchId: string,
    updates: Partial<Omit<MatchSquad, 'id' | 'match_id' | 'player_id' | 'created_at'>>
  ): Promise<void>;
  quitarJugador(id: string, matchId: string): Promise<void>;
  getSquad(matchId: string): MatchSquad[];
  getCount(matchId: string): number | undefined;
  // Guarda toda la convocatoria de una vez (upsert completo)
  guardarConvocatoria(matchId: string, squad: MatchSquad[]): Promise<void>;
}

export const useConvocatoriaStore = create<ConvocatoriaState>((set, get) => ({
  squads:    {},
  cuentas:   {},
  cargando:  false,
  guardando: false,

  cargarCuentas: async (matchIds) => {
    if (matchIds.length === 0) return;
    const { data, error } = await supabase
      .from('match_squad')
      .select('match_id')
      .in('match_id', matchIds);
    if (error) {
      console.warn('[Supabase] cargarCuentas convocatoria:', error.message);
      return;
    }
    const counts: Record<string, number> = {};
    for (const id of matchIds) counts[id] = 0;
    for (const row of (data ?? []) as { match_id: string }[]) {
      counts[row.match_id] = (counts[row.match_id] ?? 0) + 1;
    }
    set(s => ({ cuentas: { ...s.cuentas, ...counts } }));
  },

  getCount: (matchId) => get().cuentas[matchId],

  cargar: async (matchId) => {
    set({ cargando: true });
    const { data, error } = await supabase
      .from('match_squad')
      .select('*')
      .eq('match_id', matchId)
      .order('position_in_squad', { ascending: true });
    if (error) console.error('[Supabase] cargar convocatoria:', error.message);
    set(s => ({
      cargando: false,
      squads: { ...s.squads, [matchId]: (data ?? []) as MatchSquad[] },
    }));
  },

  agregarJugador: async (entry) => {
    set({ guardando: true });
    const now = new Date().toISOString();
    const row: MatchSquad = { ...entry, id: crypto.randomUUID(), created_at: now };
    const { error } = await supabase.from('match_squad').insert(row);
    set({ guardando: false });
    if (error) {
      console.error('[Supabase] agregarJugador convocatoria:', error.message);
      throw new Error(error.message);
    }
    set(s => {
      const newSquad = [...(s.squads[entry.match_id] ?? []), row];
      return {
        squads: { ...s.squads, [entry.match_id]: newSquad },
        cuentas: { ...s.cuentas, [entry.match_id]: newSquad.length },
      };
    });
  },

  actualizarJugador: async (id, matchId, updates) => {
    const { error } = await supabase
      .from('match_squad')
      .update(updates)
      .eq('id', id);
    if (error) {
      console.error('[Supabase] actualizarJugador convocatoria:', error.message);
      throw new Error(error.message);
    }
    set(s => ({
      squads: {
        ...s.squads,
        [matchId]: (s.squads[matchId] ?? []).map(item =>
          item.id === id ? { ...item, ...updates } : item
        ),
      },
    }));
  },

  quitarJugador: async (id, matchId) => {
    const { error } = await supabase.from('match_squad').delete().eq('id', id);
    if (error) {
      console.error('[Supabase] quitarJugador convocatoria:', error.message);
      throw new Error(error.message);
    }
    set(s => {
      const newSquad = (s.squads[matchId] ?? []).filter(item => item.id !== id);
      return {
        squads: { ...s.squads, [matchId]: newSquad },
        cuentas: { ...s.cuentas, [matchId]: newSquad.length },
      };
    });
  },

  guardarConvocatoria: async (matchId, squad) => {
    set({ guardando: true });
    try {
      // Borrar toda la convocatoria anterior y reinsertar
      const { error: delErr } = await supabase
        .from('match_squad')
        .delete()
        .eq('match_id', matchId);
      if (delErr) throw new Error(delErr.message);

      if (squad.length > 0) {
        const { error: insErr } = await supabase.from('match_squad').insert(squad);
        if (insErr) throw new Error(insErr.message);
      }

      set(s => ({
        guardando: false,
        squads:  { ...s.squads, [matchId]: squad },
        cuentas: { ...s.cuentas, [matchId]: squad.length },
      }));
    } catch (err) {
      set({ guardando: false });
      throw err;
    }
  },

  getSquad: (matchId) => get().squads[matchId] ?? [],
}));
