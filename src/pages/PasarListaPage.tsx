// ============================================================
// PasarListaPage — Pase de lista independiente
// Ruta: /pasar-lista
// ============================================================
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckSquare, Users, Trash2, Calendar, ChevronDown, ChevronUp, AlertCircle, X } from 'lucide-react';
import { usePerfilStore } from '@/stores/perfilStore';
import { TeamSwitcher } from '@/components/ui/TeamSwitcher';
import { usePlantillaStore } from '@/stores/plantillaStore';
import { supabase } from '@/data/supabaseClient';
import type { Jugador, AttendanceStatus } from '@/types';

// ── Configuración de estados ─────────────────────────────────
const ESTADOS: { status: AttendanceStatus; emoji: string; label: string; bg: string; text: string }[] = [
  { status: 'present',   emoji: '✅', label: 'Presente',   bg: 'bg-green-100', text: 'text-green-700'  },
  { status: 'late',      emoji: '⚠️', label: 'Tarde',      bg: 'bg-amber-100', text: 'text-amber-700'  },
  { status: 'justified', emoji: '📋', label: 'Justificado',bg: 'bg-blue-100',  text: 'text-blue-700'   },
  { status: 'absent',    emoji: '❌', label: 'Ausente',    bg: 'bg-red-100',   text: 'text-red-700'    },
];

// ── Orden de posiciones ──────────────────────────────────────
const ORDEN: Record<string, number> = { POR: 0, DEF: 1, MED: 2, DEL: 3 };

function hoy(): string {
  return new Date().toISOString().split('T')[0];
}

function formatFechaLarga(dateStr: string): string {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('es-ES', {
    weekday: 'long', day: 'numeric', month: 'long',
  });
}

function formatFechaCorta(dateStr: string): string {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('es-ES', {
    weekday: 'short', day: 'numeric', month: 'short',
  });
}

// ── Tipos historial ──────────────────────────────────────────
interface SesionHistorial {
  id:        string;
  date:      string;
  records:   Record<string, AttendanceStatus>;
  presentes: number;
  marcados:  number;
}

// ── Fila de jugador ──────────────────────────────────────────
function JugadorFila({
  jugador,
  status,
  onCambiar,
}: {
  jugador:   Jugador;
  status:    AttendanceStatus | null;
  onCambiar: (s: AttendanceStatus) => void;
}) {
  const cfg = ESTADOS.find(e => e.status === status);
  const [lastTapped, setLastTapped] = useState<AttendanceStatus | null>(null);

  function handleCambiar(s: AttendanceStatus) {
    setLastTapped(s);
    setTimeout(() => setLastTapped(null), 380);
    onCambiar(s);
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 px-3 py-2.5">
        <div className="w-10 h-10 rounded-full bg-quarte-azulClaro flex items-center justify-center flex-shrink-0 overflow-hidden">
          {jugador.foto_b64
            ? <img src={jugador.foto_b64} alt={jugador.nombre} className="w-full h-full object-cover" />
            : <span className="font-titulo font-bold text-quarte-azul text-sm">{jugador.dorsal}</span>
          }
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-titulo font-semibold text-sm text-quarte-negro truncate">
            {jugador.nombre} {jugador.apellidos}
          </p>
          <p className="text-xs text-gray-400">#{jugador.dorsal} · {jugador.posicion}</p>
        </div>
        {cfg && (
          <span className={`text-xs font-titulo font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${cfg.bg} ${cfg.text}`}>
            {cfg.emoji} {cfg.label}
          </span>
        )}
      </div>

      <div className="flex border-t border-gray-100">
        {ESTADOS.map(est => (
          <button key={est.status} onClick={() => handleCambiar(est.status)}
            className={`flex-1 py-2 text-base transition-colors
              ${status === est.status ? `${est.bg}` : 'hover:bg-gray-50'}`}
            style={lastTapped === est.status ? { animation: 'aq-pop .35s cubic-bezier(.34,1.6,.5,1)' } : undefined}>
            {est.emoji}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Tarjeta de historial ─────────────────────────────────────
function SesionCard({
  sesion,
  jugadores,
  onEliminar,
}: {
  sesion:     SesionHistorial;
  jugadores:  Jugador[];
  onEliminar: () => void;
}) {
  const [expandido, setExpandido] = useState(false);
  const total = jugadores.length;
  const pct = total > 0 ? Math.round((sesion.presentes / total) * 100) : 0;

  const resumenEstados = ESTADOS.map(e => ({
    ...e,
    count: Object.values(sesion.records).filter(s => s === e.status).length,
  })).filter(e => e.count > 0);

  const filas = (Object.entries(sesion.records) as [string, AttendanceStatus][])
    .map(([pid, s]) => {
      const jug = jugadores.find(j => j.id === pid);
      return { pid, s, nombre: jug ? `${jug.nombre} ${jug.apellidos}` : '—', dorsal: jug?.dorsal };
    })
    .sort((a, b) => (ORDEN[jugadores.find(j => j.id === a.pid)?.posicion ?? ''] ?? 4) - (ORDEN[jugadores.find(j => j.id === b.pid)?.posicion ?? ''] ?? 4));

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="w-9 h-9 rounded-xl bg-quarte-azulClaro flex items-center justify-center flex-shrink-0">
          <Calendar size={16} className="text-quarte-azul" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-titulo font-semibold text-sm text-quarte-negro capitalize">
            {formatFechaCorta(sesion.date)}
          </p>
          <p className="text-xs text-gray-400">
            {sesion.presentes}/{total} presentes · {pct}%
          </p>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setExpandido(v => !v)}
            className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors text-gray-400">
            {expandido ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          <button
            onClick={onEliminar}
            className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-red-50 transition-colors text-red-400">
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {resumenEstados.length > 0 && (
        <div className="px-4 pb-2 flex gap-2 flex-wrap">
          {resumenEstados.map(e => (
            <span key={e.status} className={`text-xs font-titulo font-semibold px-2 py-0.5 rounded-full ${e.bg} ${e.text}`}>
              {e.emoji} {e.count}
            </span>
          ))}
        </div>
      )}

      {expandido && filas.length > 0 && (
        <div className="border-t border-gray-100 px-4 py-2 flex flex-col gap-1">
          {filas.map(({ pid, s, nombre, dorsal }) => {
            const cfg = ESTADOS.find(e => e.status === s);
            return (
              <div key={pid} className="flex items-center gap-2 py-0.5">
                <span className="text-sm">{cfg?.emoji}</span>
                {dorsal !== undefined && (
                  <span className="text-[10px] font-titulo font-bold text-gray-400 w-5 text-center">#{dorsal}</span>
                )}
                <span className="text-xs font-titulo font-semibold text-quarte-negro">{nombre}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Modal de confirmación de borrado ──────────────────────────
function ConfirmDeleteModal({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 px-4 pb-6"
      style={{ animation: 'aq-fadeIn .2s ease both' }}>
      <div className="bg-white rounded-2xl w-full max-w-sm p-5 flex flex-col gap-4 shadow-xl"
        style={{ animation: 'aq-slideUp .32s cubic-bezier(.5,0,.2,1) both' }}>
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
            <Trash2 size={18} className="text-red-500" />
          </div>
          <div>
            <p className="font-titulo font-bold text-quarte-negro">¿Borrar este pase de lista?</p>
            <p className="text-sm text-gray-500 mt-0.5">Esta acción no se puede deshacer.</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-titulo font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
            Cancelar
          </button>
          <button onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-titulo font-semibold hover:bg-red-600 transition-colors">
            Borrar
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// PasarListaPage
// ============================================================
export default function PasarListaPage() {
  const navigate                   = useNavigate();
  const { perfil, activeTeamId }   = usePerfilStore();
  const plantillaStore             = usePlantillaStore();

  const [records,         setRecords]         = useState<Record<string, AttendanceStatus>>({});
  const [sessionId,       setSessionId]       = useState<string | null>(null);
  const [guardando,       setGuardando]       = useState(false);
  const [errorMsg,        setErrorMsg]        = useState<string | null>(null);
  const [historial,       setHistorial]       = useState<SesionHistorial[]>([]);
  const [cargandoHist,    setCargandoHist]    = useState(false);
  const [confirmDelete,   setConfirmDelete]   = useState<string | null>(null);
  const [mostrarHistorial, setMostrarHistorial] = useState(false);

  const fecha = hoy();

  // ── Carga inicial ────────────────────────────────────────
  useEffect(() => {
    if (!perfil || !activeTeamId) return;
    if (plantillaStore.jugadores.length === 0) {
      plantillaStore.cargar(activeTeamId);
    }
    (async () => {
      // Sesión de hoy
      const { data } = await supabase
        .from('lista_sesiones')
        .select('id, records')
        .eq('coach_id', activeTeamId)
        .eq('date', fecha)
        .maybeSingle();
      if (data) {
        setSessionId(data.id as string);
        setRecords((data.records as Record<string, AttendanceStatus>) ?? {});
      }
      // Historial (sin hoy)
      cargarHistorial(activeTeamId);
    })();
  }, [activeTeamId]);

  async function cargarHistorial(teamId: string) {
    setCargandoHist(true);
    const { data } = await supabase
      .from('lista_sesiones')
      .select('id, date, records')
      .eq('coach_id', teamId)
      .neq('date', fecha)
      .order('date', { ascending: false })
      .limit(30);
    if (data) {
      const sesiones: SesionHistorial[] = (data as { id: string; date: string; records: Record<string, AttendanceStatus> }[]).map(d => ({
        id:        d.id,
        date:      d.date,
        records:   d.records ?? {},
        presentes: Object.values(d.records ?? {}).filter(s => s === 'present' || s === 'late').length,
        marcados:  Object.values(d.records ?? {}).length,
      }));
      setHistorial(sesiones);
    }
    setCargandoHist(false);
  }

  if (!perfil) return null;

  const jugadores = [...plantillaStore.jugadores]
    .sort((a, b) => (ORDEN[a.posicion] ?? 4) - (ORDEN[b.posicion] ?? 4));

  const presentes = Object.values(records).filter(s => s === 'present' || s === 'late').length;
  const total     = jugadores.length;

  // ── Persistir en Supabase ──────────────────────────────
  async function persistir(newRecords: Record<string, AttendanceStatus>) {
    if (!perfil || !activeTeamId) return;
    setGuardando(true);
    setErrorMsg(null);
    const now = new Date().toISOString();
    const upsertId = sessionId ?? crypto.randomUUID();
    const { data, error } = await supabase
      .from('lista_sesiones')
      .upsert(
        {
          id:         upsertId,
          coach_id:   activeTeamId,
          date:       fecha,
          records:    newRecords,
          updated_at: now,
        },
        { onConflict: 'coach_id,date' }
      )
      .select('id')
      .maybeSingle();
    if (error) {
      setErrorMsg('No se pudo guardar. Comprueba la conexión.');
    } else if (data && !sessionId) {
      setSessionId((data as { id: string }).id);
    }
    setGuardando(false);
  }

  function cambiarEstado(playerId: string, status: AttendanceStatus) {
    const next = { ...records, [playerId]: status };
    setRecords(next);
    persistir(next);
  }

  async function marcarTodos() {
    const next: Record<string, AttendanceStatus> = {};
    jugadores.forEach(j => { next[j.id] = 'present'; });
    setRecords(next);
    await persistir(next);
  }

  // ── Borrar sesión del historial ────────────────────────
  async function eliminarSesion(id: string) {
    const { error } = await supabase
      .from('lista_sesiones')
      .delete()
      .eq('id', id);
    if (!error) {
      setHistorial(prev => prev.filter(s => s.id !== id));
      // Si borraron la sesión de hoy
      if (id === sessionId) {
        setSessionId(null);
        setRecords({});
      }
    } else {
      setErrorMsg('No se pudo borrar. Intenta de nuevo.');
    }
    setConfirmDelete(null);
  }

  // ── Grupos por posición ────────────────────────────────
  const grupos = [
    { label: 'Porteros',       items: jugadores.filter(j => j.posicion === 'POR') },
    { label: 'Defensas',       items: jugadores.filter(j => j.posicion === 'DEF') },
    { label: 'Mediocampistas', items: jugadores.filter(j => j.posicion === 'MED') },
    { label: 'Delanteros',     items: jugadores.filter(j => j.posicion === 'DEL') },
  ].filter(g => g.items.length > 0);

  const fechaDisplay = formatFechaLarga(fecha);

  return (
    <div className="flex flex-col min-h-screen bg-quarte-gris">
      {/* Cabecera */}
      <div className="bg-quarte-azul text-white px-4 pt-4 pb-4">
        <div className="flex items-center gap-3 mb-3">
          <button onClick={() => navigate('/inicio')}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/20 hover:bg-white/30">
            <ArrowLeft size={20} />
          </button>
          <div className="flex-1">
            <h1 className="font-titulo text-lg font-bold leading-tight">Pase de lista</h1>
            <div className="flex items-center gap-2 flex-wrap mt-0.5">
              <span className="text-blue-200 text-xs capitalize">{fechaDisplay}</span>
              <TeamSwitcher />
            </div>
          </div>
          {guardando && (
            <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          )}
          {sessionId && !guardando && (
            <button
              onClick={() => setConfirmDelete(sessionId)}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/20 hover:bg-red-400/60 transition-colors"
              title="Borrar lista de hoy">
              <Trash2 size={18} />
            </button>
          )}
        </div>

        {/* Contador + botón marcar todos */}
        <div className="bg-white/10 rounded-2xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users size={18} />
            <span className="font-titulo font-bold text-lg">{presentes} / {total}</span>
            <span className="text-blue-200 text-sm font-cuerpo">presentes</span>
          </div>
          <button onClick={marcarTodos}
            disabled={total === 0}
            className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 px-3 py-1.5
                       rounded-xl text-xs font-titulo font-semibold transition-colors disabled:opacity-50">
            <CheckSquare size={14} /> Todos presentes
          </button>
        </div>
      </div>

      {/* Error banner */}
      {errorMsg && (
        <div className="mx-4 mt-3 bg-red-50 border border-red-200 rounded-2xl px-4 py-3 flex items-center gap-3">
          <AlertCircle size={16} className="text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-700 font-cuerpo flex-1">{errorMsg}</p>
          <button onClick={() => setErrorMsg(null)} className="text-red-400 hover:text-red-600">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Lista del día */}
      <div className="flex-1 overflow-y-auto p-4 max-w-lg mx-auto w-full flex flex-col gap-5">
        {plantillaStore.cargando ? (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="flex items-center gap-3 px-3 py-2.5">
                  <div className="w-10 h-10 rounded-full aq-shimmer flex-shrink-0" />
                  <div className="flex-1 flex flex-col gap-2">
                    <div className="h-3.5 rounded-full aq-shimmer w-3/4" />
                    <div className="h-2.5 rounded-full aq-shimmer w-2/5" />
                  </div>
                  <div className="h-5 w-16 rounded-full aq-shimmer" />
                </div>
                <div className="h-9 aq-shimmer" />
              </div>
            ))}
          </div>
        ) : jugadores.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-gray-400 gap-3">
            <Users size={48} className="opacity-20" />
            <p className="font-titulo font-semibold">Sin jugadores en la plantilla</p>
            <p className="text-sm text-center">Añade jugadores en la sección Plantilla.</p>
          </div>
        ) : (
          grupos.map(grupo => (
            <div key={grupo.label} className="flex flex-col gap-2">
              <p className="font-titulo text-xs font-bold text-gray-400 uppercase tracking-wider px-1">
                {grupo.label} ({grupo.items.length})
              </p>
              {grupo.items.map(j => (
                <JugadorFila
                  key={j.id}
                  jugador={j}
                  status={records[j.id] ?? null}
                  onCambiar={s => cambiarEstado(j.id, s)}
                />
              ))}
            </div>
          ))
        )}

        {/* ── Historial ─────────────────────────────────── */}
        {(historial.length > 0 || cargandoHist) && (
          <div className="flex flex-col gap-2 pt-2 border-t border-gray-200">
            <button
              onClick={() => setMostrarHistorial(v => !v)}
              className="flex items-center justify-between px-1 py-1">
              <p className="font-titulo text-xs font-bold text-gray-400 uppercase tracking-wider">
                Historial ({historial.length})
              </p>
              {mostrarHistorial ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
            </button>

            {mostrarHistorial && (
              cargandoHist ? (
                <div className="flex justify-center py-4">
                  <div className="w-6 h-6 border-2 border-quarte-azul border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                historial.map(sesion => (
                  <SesionCard
                    key={sesion.id}
                    sesion={sesion}
                    jugadores={jugadores}
                    onEliminar={() => setConfirmDelete(sesion.id)}
                  />
                ))
              )
            )}
          </div>
        )}
      </div>

      {/* Modal de confirmación de borrado */}
      {confirmDelete && (
        <ConfirmDeleteModal
          onConfirm={() => eliminarSesion(confirmDelete)}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  );
}
