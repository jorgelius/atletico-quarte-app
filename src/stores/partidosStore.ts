// ============================================================
// STORE: Partidos (Zustand)
// Llama directamente a Supabase — las tablas matches / match_events
// son nuevas y no están en la capa DataProvider legacy.
// ============================================================
import { create } from 'zustand';
import { supabase } from '@/data/supabaseClient';
import type { Match, MatchEvent, MatchEventType } from '@/types';

export interface EventoDraft {
  id:          string;
  player_id?:  string;
  player_name?: string;
  event_type:  MatchEventType;
  minute?:     number;
}

interface PartidosState {
  partidos:  Match[];
  eventos:   Record<string, MatchEvent[]>;  // match_id → events
  cargando:  boolean;
  guardando: boolean;

  cargar:          (teamId: string) => Promise<void>;
  guardarPartido:  (p: Match) => Promise<void>;
  eliminarPartido: (id: string) => Promise<void>;
  cambiarEstado:   (id: string, status: Match['status']) => Promise<void>;
  cargarEventos:   (matchId: string) => Promise<void>;
  guardarResultado: (
    matchId: string,
    goalsFor: number,
    goalsAgainst: number,
    eventos: EventoDraft[]
  ) => Promise<void>;
}

export const usePartidosStore = create<PartidosState>((set) => ({
  partidos:  [],
  eventos:   {},
  cargando:  false,
  guardando: false,

  cargar: async (teamId) => {
    set({ cargando: true });
    const { data, error } = await supabase
      .from('matches')
      .select('*')
      .eq('team_id', teamId)
      .order('date', { ascending: false });
    if (error) console.error('[Supabase] cargar partidos:', error.message);
    set({ partidos: (data ?? []) as Match[], cargando: false });
  },

  guardarPartido: async (p) => {
    set({ guardando: true });
    const { error } = await supabase.from('matches').upsert(p);
    set({ guardando: false });
    if (error) { console.error('[Supabase] guardarPartido:', error.message); throw new Error(error.message); }
    set(s => ({
      partidos: s.partidos.find(x => x.id === p.id)
        ? s.partidos.map(x => x.id === p.id ? p : x).sort(byDateDesc)
        : [p, ...s.partidos].sort(byDateDesc),
    }));
  },

  eliminarPartido: async (id) => {
    const { error } = await supabase.from('matches').delete().eq('id', id);
    if (error) { console.error('[Supabase] eliminarPartido:', error.message); throw new Error(error.message); }
    set(s => ({
      partidos: s.partidos.filter(p => p.id !== id),
      eventos:  Object.fromEntries(Object.entries(s.eventos).filter(([k]) => k !== id)),
    }));
  },

  cambiarEstado: async (id, status) => {
    const now = new Date().toISOString();
    const { error } = await supabase
      .from('matches')
      .update({ status, updated_at: now })
      .eq('id', id);
    if (error) { console.error('[Supabase] cambiarEstado:', error.message); throw new Error(error.message); }
    set(s => ({
      partidos: s.partidos.map(p =>
        p.id === id ? { ...p, status, updated_at: now } : p
      ),
    }));
  },

  cargarEventos: async (matchId) => {
    const { data, error } = await supabase
      .from('match_events')
      .select('*')
      .eq('match_id', matchId)
      .order('minute', { ascending: true, nullsFirst: false });
    if (error) console.error('[Supabase] cargarEventos:', error.message);
    set(s => ({ eventos: { ...s.eventos, [matchId]: (data ?? []) as MatchEvent[] } }));
  },

  guardarResultado: async (matchId, goalsFor, goalsAgainst, borradores) => {
    set({ guardando: true });
    const now = new Date().toISOString();
    try {
      const { error: matchErr } = await supabase
        .from('matches')
        .update({ goals_for: goalsFor, goals_against: goalsAgainst, status: 'played', updated_at: now })
        .eq('id', matchId);
      if (matchErr) throw new Error(matchErr.message);

      await supabase.from('match_events').delete().eq('match_id', matchId);

      if (borradores.length > 0) {
        const rows = borradores.map(e => ({
          id:          crypto.randomUUID(),
          match_id:    matchId,
          player_id:   e.player_id ?? null,
          player_name: e.player_name ?? null,
          event_type:  e.event_type,
          minute:      e.minute ?? null,
          created_at:  now,
        }));
        const { error: evErr } = await supabase.from('match_events').insert(rows);
        if (evErr) throw new Error(evErr.message);
      }

      set(s => ({
        guardando: false,
        partidos:  s.partidos.map(p =>
          p.id === matchId
            ? { ...p, goals_for: goalsFor, goals_against: goalsAgainst, status: 'played', updated_at: now }
            : p
        ),
        eventos: {
          ...s.eventos,
          [matchId]: borradores.map(e => ({
            id:          crypto.randomUUID(),
            match_id:    matchId,
            player_id:   e.player_id,
            player_name: e.player_name,
            event_type:  e.event_type,
            minute:      e.minute,
            created_at:  now,
          })) as MatchEvent[],
        },
      }));
    } catch (err) {
      set({ guardando: false });
      throw err;
    }
  },
}));

function byDateDesc(a: Match, b: Match) {
  return b.date.localeCompare(a.date);
}
