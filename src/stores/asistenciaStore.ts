// ============================================================
// STORE: Asistencia a entrenamientos (Zustand)
// ============================================================
import { create } from 'zustand';
import { supabase } from '@/data/supabaseClient';
import type { TrainingAttendance, AttendanceStatus } from '@/types';

export interface ResumenEntrenamiento {
  presentes: number;
  total:     number;
}

export interface EstadisticaJugador {
  player_id:   string;
  player_name: string;
  asistidos:   number;
  total:       number;
}

interface AsistenciaState {
  // Registros completos por entrenamiento (training_id → lista)
  registros: Record<string, TrainingAttendance[]>;
  // Resumen ligero por entrenamiento (training_id → { presentes, total })
  resumenEntrenamientos: Record<string, ResumenEntrenamiento>;
  // Estadísticas por jugador para la vista de equipo
  estadisticasEquipo: EstadisticaJugador[];

  cargando:       boolean;
  cargandoResumen: boolean;

  cargarAsistencia:       (trainingId: string) => Promise<void>;
  registrarAsistencia:    (trainingId: string, playerId: string, status: AttendanceStatus, notes?: string) => Promise<void>;
  marcarTodosPresentes:   (trainingId: string, playerIds: string[]) => Promise<void>;
  cargarResumenEquipo:    (teamId: string) => Promise<void>;  // carga resumen de todos los entrenos + estadísticas jugadores
  getResumen:             (trainingId: string) => ResumenEntrenamiento | null;
  getEstadistica:         (playerId: string) => EstadisticaJugador | undefined;
}

export const useAsistenciaStore = create<AsistenciaState>((set, get) => ({
  registros:             {},
  resumenEntrenamientos: {},
  estadisticasEquipo:    [],
  cargando:              false,
  cargandoResumen:       false,

  cargarAsistencia: async (trainingId) => {
    set({ cargando: true });
    const { data, error } = await supabase
      .from('training_attendance')
      .select('*')
      .eq('training_id', trainingId);
    if (error) console.error('[Supabase] cargarAsistencia:', error.message);
    const lista = (data ?? []) as TrainingAttendance[];
    set(s => ({
      cargando:  false,
      registros: { ...s.registros, [trainingId]: lista },
    }));
  },

  registrarAsistencia: async (trainingId, playerId, status, notes) => {
    const now = new Date().toISOString();
    const existing = get().registros[trainingId]?.find(r => r.player_id === playerId);
    const record: TrainingAttendance = {
      id:          existing?.id ?? crypto.randomUUID(),
      training_id: trainingId,
      player_id:   playerId,
      status,
      notes:       notes ?? existing?.notes,
      recorded_at: now,
    };

    const { error } = await supabase
      .from('training_attendance')
      .upsert(record, { onConflict: 'training_id,player_id' });
    if (error) { console.error('[Supabase] registrarAsistencia:', error.message); throw new Error(error.message); }

    set(s => {
      const prev = s.registros[trainingId] ?? [];
      const next = prev.find(r => r.player_id === playerId)
        ? prev.map(r => r.player_id === playerId ? record : r)
        : [...prev, record];

      const presentes = next.filter(r => r.status === 'present' || r.status === 'late').length;
      return {
        registros: { ...s.registros, [trainingId]: next },
        resumenEntrenamientos: {
          ...s.resumenEntrenamientos,
          [trainingId]: { presentes, total: next.length },
        },
      };
    });
  },

  marcarTodosPresentes: async (trainingId, playerIds) => {
    const now = new Date().toISOString();
    const existentes = get().registros[trainingId] ?? [];
    const rows: TrainingAttendance[] = playerIds.map(pid => {
      const ex = existentes.find(r => r.player_id === pid);
      return {
        id:          ex?.id ?? crypto.randomUUID(),
        training_id: trainingId,
        player_id:   pid,
        status:      'present',
        notes:       undefined,
        recorded_at: now,
      };
    });

    const { error } = await supabase
      .from('training_attendance')
      .upsert(rows, { onConflict: 'training_id,player_id' });
    if (error) { console.error('[Supabase] marcarTodosPresentes:', error.message); throw new Error(error.message); }

    set(s => ({
      registros: { ...s.registros, [trainingId]: rows },
      resumenEntrenamientos: {
        ...s.resumenEntrenamientos,
        [trainingId]: { presentes: playerIds.length, total: playerIds.length },
      },
    }));
  },

  cargarResumenEquipo: async (teamId) => {
    set({ cargandoResumen: true });
    try {
      // 1. IDs de todos los entrenamientos del equipo
      const { data: trainings, error: tErr } = await supabase
        .from('trainings')
        .select('id')
        .eq('coach_id', teamId);
      if (tErr) throw new Error(tErr.message);

      const trainingIds = (trainings ?? []).map((t: { id: string }) => t.id);
      if (trainingIds.length === 0) {
        set({ cargandoResumen: false, resumenEntrenamientos: {}, estadisticasEquipo: [] });
        return;
      }

      // 2. Todos los registros de asistencia para esos entrenamientos
      const { data: records, error: rErr } = await supabase
        .from('training_attendance')
        .select('training_id, player_id, status')
        .in('training_id', trainingIds);
      if (rErr) throw new Error(rErr.message);

      const lista = (records ?? []) as Pick<TrainingAttendance, 'training_id' | 'player_id' | 'status'>[];

      // 3. Resumen por entrenamiento
      const resumen: Record<string, ResumenEntrenamiento> = {};
      for (const r of lista) {
        if (!resumen[r.training_id]) resumen[r.training_id] = { presentes: 0, total: 0 };
        resumen[r.training_id].total++;
        if (r.status === 'present' || r.status === 'late') resumen[r.training_id].presentes++;
      }

      // 4. Estadísticas por jugador (necesitamos nombres → query players)
      const playerIds = [...new Set(lista.map(r => r.player_id))];
      let jugadoresInfo: { id: string; nombre: string; apellidos: string }[] = [];
      if (playerIds.length > 0) {
        const { data: pData } = await supabase
          .from('players')
          .select('id, nombre, apellidos')
          .in('id', playerIds);
        jugadoresInfo = (pData ?? []) as { id: string; nombre: string; apellidos: string }[];
      }

      const statsMap: Record<string, { asistidos: number; total: number }> = {};
      for (const r of lista) {
        if (!statsMap[r.player_id]) statsMap[r.player_id] = { asistidos: 0, total: 0 };
        statsMap[r.player_id].total++;
        if (r.status === 'present' || r.status === 'late') statsMap[r.player_id].asistidos++;
      }

      const estadisticasEquipo: EstadisticaJugador[] = Object.entries(statsMap).map(([pid, s]) => {
        const jug = jugadoresInfo.find(j => j.id === pid);
        return {
          player_id:   pid,
          player_name: jug ? `${jug.nombre} ${jug.apellidos}`.trim() : 'Jugador eliminado',
          asistidos:   s.asistidos,
          total:       s.total,
        };
      }).sort((a, b) => {
        const pA = a.total > 0 ? a.asistidos / a.total : 0;
        const pB = b.total > 0 ? b.asistidos / b.total : 0;
        return pB - pA;
      });

      set({ cargandoResumen: false, resumenEntrenamientos: resumen, estadisticasEquipo });
    } catch (err) {
      console.error('[asistenciaStore] cargarResumenEquipo:', err);
      set({ cargandoResumen: false });
    }
  },

  getResumen: (trainingId) => get().resumenEntrenamientos[trainingId] ?? null,

  getEstadistica: (playerId) => get().estadisticasEquipo.find(e => e.player_id === playerId),
}));
