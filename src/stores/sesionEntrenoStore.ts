// ============================================================
// STORE: Sesión de Entrenamiento (localStorage-first)
// ============================================================
import { create } from 'zustand';
import type {
  HorarioEntrenamiento,
  SesionEntrenamiento,
  RegistroJugadorSesion,
} from '@/types';
import { DEFAULT_HORARIOS } from '@/data/defaultHorarios';

// ── localStorage helpers ─────────────────────────────────────
function lsGet<T>(key: string): T[] {
  try { return JSON.parse(localStorage.getItem(key) ?? '[]'); } catch { return []; }
}
function lsSet(key: string, data: unknown) {
  try { localStorage.setItem(key, JSON.stringify(data)); } catch {}
}
function horariosKey(t: string)  { return `aq_horarios_${t}`; }
function sesionesKey(t: string)  { return `aq_sesiones_${t}`; }
function registrosKey(s: string) { return `aq_reg_${s}`; }

// ── Fecha local YYYY-MM-DD ────────────────────────────────────
function localDate(d = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

// ── Próximo slot de entrenamiento ─────────────────────────────
function computeProximoSlot(
  horarios: HorarioEntrenamiento[],
  sesiones: SesionEntrenamiento[],
  teamId: string,
): { sesion: SesionEntrenamiento | null; horario: HorarioEntrenamiento | null; fecha: string | null } {
  const activos = horarios.filter(h => h.team_id === teamId && h.activo);
  if (!activos.length) return { sesion: null, horario: null, fecha: null };

  const now = new Date();
  let best: { horario: HorarioEntrenamiento; fecha: string; minsAhead: number } | null = null;

  for (let offset = 0; offset <= 13; offset++) {
    const d = new Date(now);
    d.setDate(d.getDate() + offset);
    const jsDay = d.getDay(); // 0=Dom
    const dia   = jsDay === 0 ? 7 : jsDay; // 1=Lun…7=Dom

    for (const h of activos.filter(x => x.dia_semana === dia)) {
      const [hh, mm] = h.hora_inicio.split(':').map(Number);
      const t = new Date(d);
      t.setHours(hh, mm, 0, 0);
      const minsAhead = (t.getTime() - now.getTime()) / 60000;
      if (minsAhead < -30) continue; // ya pasó (salvo 30 min de gracia)
      if (!best || minsAhead < best.minsAhead) {
        best = { horario: h, fecha: localDate(d), minsAhead };
      }
    }
    if (best) break;
  }

  if (!best) return { sesion: null, horario: null, fecha: null };
  const sesion = sesiones.find(s => s.team_id === teamId && s.fecha === best!.fecha) ?? null;
  return { sesion, horario: best.horario, fecha: best.fecha };
}

// ── State ─────────────────────────────────────────────────────
interface SesionEntrenoState {
  teamId: string | null;
  horarios: HorarioEntrenamiento[];
  sesiones: SesionEntrenamiento[];
  sesionActual: SesionEntrenamiento | null;
  registros: RegistroJugadorSesion[];

  cargar: (teamId: string) => void;

  guardarHorario:  (h: HorarioEntrenamiento) => void;
  eliminarHorario: (id: string) => void;

  crearSesion:      (teamId: string, fecha: string, h: HorarioEntrenamiento) => SesionEntrenamiento;
  abrirSesion:      (s: SesionEntrenamiento) => void;
  actualizarSesion: (updates: Partial<SesionEntrenamiento>) => void;
  eliminarSesion:   (sesionId: string) => void;
  reabrirSesion:    (sesionId: string) => void;

  initRegistros:     (jugadores: Array<{ id: string; nombre: string; apellidos: string }>) => void;
  actualizarRegistro:(jugadorId: string, upd: Partial<RegistroJugadorSesion>) => void;

  getProximoEntreno: () => { sesion: SesionEntrenamiento | null; horario: HorarioEntrenamiento | null; fecha: string | null };

  // Devuelve datos de entrenamiento para las estadísticas
  getStatsEquipo: (teamId: string) => {
    sesiones: SesionEntrenamiento[];
    porJugador: Array<{ id: string; nombre: string; sesiones: number; presentes: number; avgRating: number | null; observaciones: string[] }>;
    ejerciciosMasUsados: Array<{ id: string; count: number }>;
  };
}

export const useSesionEntrenoStore = create<SesionEntrenoState>((set, get) => ({
  teamId:      null,
  horarios:    [],
  sesiones:    [],
  sesionActual: null,
  registros:   [],

  cargar: (teamId) => {
    let horarios = lsGet<HorarioEntrenamiento>(horariosKey(teamId));

    // Siembra los horarios predeterminados del club la primera vez
    if (horarios.length === 0 && DEFAULT_HORARIOS[teamId]) {
      horarios = DEFAULT_HORARIOS[teamId].map(h => ({
        ...h,
        id: crypto.randomUUID(),
        team_id: teamId,
        activo: true,
      }));
      lsSet(horariosKey(teamId), horarios);
    }

    const sesiones = lsGet<SesionEntrenamiento>(sesionesKey(teamId));
    set({ teamId, horarios, sesiones, sesionActual: null, registros: [] });
  },

  guardarHorario: (h) => {
    const { teamId, horarios } = get();
    if (!teamId) return;
    const prev = horarios.findIndex(x => x.id === h.id);
    const updated = prev >= 0 ? horarios.map(x => x.id === h.id ? h : x) : [...horarios, h];
    lsSet(horariosKey(teamId), updated);
    set({ horarios: updated });
  },

  eliminarHorario: (id) => {
    const { teamId, horarios } = get();
    if (!teamId) return;
    const updated = horarios.filter(h => h.id !== id);
    lsSet(horariosKey(teamId), updated);
    set({ horarios: updated });
  },

  crearSesion: (teamId, fecha, h) => {
    const nueva: SesionEntrenamiento = {
      id: crypto.randomUUID(),
      team_id: teamId,
      fecha,
      hora_inicio: h.hora_inicio,
      hora_fin:    h.hora_fin,
      campo:       h.campo,
      status:      'pending',
      exercise_ids: [],
      notas_generales: '',
      valoracion_sesion: null,
      creado_en: Date.now(),
      finalizado_en: null,
    };
    const { sesiones } = get();
    const updated = [...sesiones, nueva];
    lsSet(sesionesKey(teamId), updated);
    set({ sesiones: updated, sesionActual: nueva, registros: [] });
    return nueva;
  },

  abrirSesion: (s) => {
    const registros = lsGet<RegistroJugadorSesion>(registrosKey(s.id));
    set({ sesionActual: s, registros });
  },

  actualizarSesion: (updates) => {
    const { sesionActual, sesiones, teamId } = get();
    if (!sesionActual || !teamId) return;
    const updated = { ...sesionActual, ...updates };
    const updatedSesiones = sesiones.map(s => s.id === updated.id ? updated : s);
    lsSet(sesionesKey(teamId), updatedSesiones);
    set({ sesionActual: updated, sesiones: updatedSesiones });
  },

  initRegistros: (jugadores) => {
    const { sesionActual, registros } = get();
    if (!sesionActual) return;
    const existingIds = new Set(registros.map(r => r.jugador_id));
    const nuevos: RegistroJugadorSesion[] = jugadores
      .filter(j => !existingIds.has(j.id))
      .map(j => ({
        id: crypto.randomUUID(),
        sesion_id: sesionActual.id,
        jugador_id: j.id,
        jugador_nombre: `${j.nombre} ${j.apellidos}`.trim(),
        asistencia: 'presente' as const,
        valoracion: null,
        observacion: '',
      }));
    const updated = [...registros, ...nuevos];
    set({ registros: updated });
    lsSet(registrosKey(sesionActual.id), updated);
  },

  eliminarSesion: (sesionId) => {
    const { sesiones, teamId, sesionActual, registros } = get();
    if (!teamId) return;
    const updated = sesiones.filter(s => s.id !== sesionId);
    lsSet(sesionesKey(teamId), updated);
    try { localStorage.removeItem(registrosKey(sesionId)); } catch {}
    set({
      sesiones: updated,
      sesionActual: sesionActual?.id === sesionId ? null : sesionActual,
      registros:    sesionActual?.id === sesionId ? []    : registros,
    });
  },

  reabrirSesion: (sesionId) => {
    const { sesiones, teamId } = get();
    if (!teamId) return;
    const sesion = sesiones.find(s => s.id === sesionId);
    if (!sesion) return;
    const actualizada: SesionEntrenamiento = { ...sesion, status: 'active', finalizado_en: null };
    const updatedSesiones = sesiones.map(s => s.id === sesionId ? actualizada : s);
    lsSet(sesionesKey(teamId), updatedSesiones);
    const registros = lsGet<RegistroJugadorSesion>(registrosKey(sesionId));
    set({ sesiones: updatedSesiones, sesionActual: actualizada, registros });
  },

  actualizarRegistro: (jugadorId, upd) => {
    const { registros, sesionActual } = get();
    if (!sesionActual) return;
    const updated = registros.map(r => r.jugador_id === jugadorId ? { ...r, ...upd } : r);
    set({ registros: updated });
    lsSet(registrosKey(sesionActual.id), updated);
  },

  getProximoEntreno: () => {
    const { horarios, sesiones, teamId } = get();
    if (!teamId) return { sesion: null, horario: null, fecha: null };
    return computeProximoSlot(horarios, sesiones, teamId);
  },

  getStatsEquipo: (teamId) => {
    const sesiones = lsGet<SesionEntrenamiento>(sesionesKey(teamId))
      .filter(s => s.status === 'completed')
      .sort((a, b) => (b.finalizado_en ?? 0) - (a.finalizado_en ?? 0));

    const porJugador = new Map<string, { nombre: string; sesiones: number; presentes: number; sumRating: number; countRating: number; observaciones: string[] }>();

    for (const s of sesiones) {
      const regs = lsGet<RegistroJugadorSesion>(registrosKey(s.id));
      for (const r of regs) {
        const entry = porJugador.get(r.jugador_id) ?? { nombre: r.jugador_nombre, sesiones: 0, presentes: 0, sumRating: 0, countRating: 0, observaciones: [] };
        entry.sesiones++;
        if (r.asistencia !== 'ausente') entry.presentes++;
        if (r.valoracion !== null) { entry.sumRating += r.valoracion; entry.countRating++; }
        if (r.observacion.trim()) entry.observaciones.push(r.observacion.trim());
        porJugador.set(r.jugador_id, entry);
      }
    }

    const ejercicioCount = new Map<string, number>();
    for (const s of sesiones) {
      for (const eid of s.exercise_ids) {
        ejercicioCount.set(eid, (ejercicioCount.get(eid) ?? 0) + 1);
      }
    }

    return {
      sesiones,
      porJugador: [...porJugador.entries()].map(([id, e]) => ({
        id,
        nombre: e.nombre,
        sesiones: e.sesiones,
        presentes: e.presentes,
        avgRating: e.countRating > 0 ? Math.round((e.sumRating / e.countRating) * 10) / 10 : null,
        observaciones: e.observaciones,
      })).sort((a, b) => b.sesiones - a.sesiones),
      ejerciciosMasUsados: [...ejercicioCount.entries()]
        .map(([id, count]) => ({ id, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5),
    };
  },
}));
