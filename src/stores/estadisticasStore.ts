// ============================================================
// STORE: Estadísticas de jugadores por temporada (Zustand)
// Agrega datos de match_events y match_squad para la temporada actual.
// No almacena datos propios — siempre recalcula desde Supabase.
// ============================================================
import { create } from 'zustand';
import { supabase } from '@/data/supabaseClient';

const TEMPORADA_ACTUAL = '2026/27';

export interface PlayerStats {
  player_id:   string;
  player_name: string;
  player_foto?: string;
  goals:           number;
  assists:         number;
  yellow_cards:    number;
  red_cards:       number;
  mvps:            number;
  matches_played:  number; // de match_squad (status != 'injured')
}

interface EstadisticasState {
  stats:    PlayerStats[];
  cargando: boolean;

  cargar(teamId: string): Promise<void>;
  getTopGoleadores(n?: number): PlayerStats[];
  getTopAsistidores(n?: number): PlayerStats[];
}

export const useEstadisticasStore = create<EstadisticasState>((set, get) => ({
  stats:    [],
  cargando: false,

  cargar: async (teamId) => {
    set({ cargando: true });
    try {
      // 1. IDs de los partidos del equipo en la temporada actual
      const { data: matchesData, error: mErr } = await supabase
        .from('matches')
        .select('id')
        .eq('team_id', teamId)
        .eq('season', TEMPORADA_ACTUAL);
      if (mErr) throw new Error(mErr.message);

      const matchIds = (matchesData ?? []).map((m: { id: string }) => m.id);
      if (matchIds.length === 0) {
        set({ cargando: false, stats: [] });
        return;
      }

      // 2. Todos los eventos de esos partidos con player_id
      const { data: eventsData, error: eErr } = await supabase
        .from('match_events')
        .select('player_id, player_name, event_type, match_id')
        .in('match_id', matchIds)
        .not('player_id', 'is', null);
      if (eErr) throw new Error(eErr.message);

      // 3. Partidos jugados por jugador (match_squad, status != 'injured')
      const { data: squadData, error: sErr } = await supabase
        .from('match_squad')
        .select('player_id, match_id, status')
        .in('match_id', matchIds)
        .neq('status', 'injured');
      if (sErr) {
        // La tabla puede no existir todavía — ignoramos el error de matches_played
        console.warn('[estadisticasStore] match_squad no disponible:', sErr.message);
      }

      // 4. Datos de jugadores del equipo (nombre + foto)
      const { data: playersData, error: pErr } = await supabase
        .from('players')
        .select('id, nombre, apellidos, foto_url')
        .eq('owner_id', teamId);
      if (pErr) throw new Error(pErr.message);

      const playerMap = new Map(
        (playersData ?? []).map((p: { id: string; nombre: string; apellidos: string; foto_url?: string }) => [
          p.id,
          { name: `${p.nombre} ${p.apellidos}`.trim(), foto: p.foto_url },
        ])
      );

      // 5. Agregar eventos
      const statsMap = new Map<string, {
        name: string; foto?: string;
        goals: number; assists: number;
        yellow: number; red: number; mvps: number;
      }>();

      const events = (eventsData ?? []) as {
        player_id: string;
        player_name?: string;
        event_type: string;
        match_id: string;
      }[];

      for (const ev of events) {
        if (!ev.player_id) continue;
        if (!statsMap.has(ev.player_id)) {
          const info = playerMap.get(ev.player_id);
          statsMap.set(ev.player_id, {
            name:   info?.name ?? ev.player_name ?? 'Jugador',
            foto:   info?.foto,
            goals: 0, assists: 0, yellow: 0, red: 0, mvps: 0,
          });
        }
        const s = statsMap.get(ev.player_id)!;
        if (ev.event_type === 'goal')        s.goals++;
        if (ev.event_type === 'assist')      s.assists++;
        if (ev.event_type === 'yellow_card') s.yellow++;
        if (ev.event_type === 'red_card')    s.red++;
        if (ev.event_type === 'mvp')         s.mvps++;
      }

      // 6. Partidos jugados desde match_squad
      const matchesPlayedMap = new Map<string, Set<string>>();
      for (const sq of (squadData ?? []) as { player_id: string; match_id: string }[]) {
        if (!matchesPlayedMap.has(sq.player_id)) matchesPlayedMap.set(sq.player_id, new Set());
        matchesPlayedMap.get(sq.player_id)!.add(sq.match_id);
      }
      // Si no hay datos de match_squad, inferir desde match_events (match_ids únicos por jugador)
      if (!squadData || squadData.length === 0) {
        for (const ev of events) {
          if (!matchesPlayedMap.has(ev.player_id)) matchesPlayedMap.set(ev.player_id, new Set());
          matchesPlayedMap.get(ev.player_id)!.add(ev.match_id);
        }
      }

      // 7. Construir array final (solo jugadores de la plantilla actual)
      const stats: PlayerStats[] = [];
      for (const [pid, data] of statsMap.entries()) {
        stats.push({
          player_id:      pid,
          player_name:    data.name,
          player_foto:    data.foto,
          goals:          data.goals,
          assists:        data.assists,
          yellow_cards:   data.yellow,
          red_cards:      data.red,
          mvps:           data.mvps,
          matches_played: matchesPlayedMap.get(pid)?.size ?? 0,
        });
      }

      // Ordenar por goles desc, luego por asistencias
      stats.sort((a, b) => b.goals - a.goals || b.assists - a.assists);

      set({ cargando: false, stats });
    } catch (err) {
      console.error('[estadisticasStore] cargar:', err);
      set({ cargando: false });
    }
  },

  getTopGoleadores: (n = 10) => {
    return [...get().stats]
      .sort((a, b) => b.goals - a.goals || b.assists - a.assists)
      .slice(0, n);
  },

  getTopAsistidores: (n = 10) => {
    return [...get().stats]
      .sort((a, b) => b.assists - a.assists || b.goals - a.goals)
      .slice(0, n);
  },
}));
