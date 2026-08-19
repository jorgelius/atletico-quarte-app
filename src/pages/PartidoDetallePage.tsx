// ============================================================
// PartidoDetallePage — /partidos/:id
// Preparación completa de partido: Plan | Convocatoria | Acta
// ============================================================
import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Edit2, ClipboardList, Users, Trophy,
  Calendar, MapPin, Clock, Plus, Check, ChevronDown,
  AlertTriangle, Trash2, X, Save, Loader2, CheckCircle2, XCircle, RotateCcw,
} from 'lucide-react';
import { usePerfilStore }       from '@/stores/perfilStore';
import { usePartidosStore, type EventoDraft } from '@/stores/partidosStore';
import { usePlantillaStore }    from '@/stores/plantillaStore';
import { useConvocatoriaStore } from '@/stores/convocatoriaStore';
import { useAsistenciaStore }   from '@/stores/asistenciaStore';
import ConvocatoriaEditor       from '@/components/partidos/ConvocatoriaEditor';
import PartidoForm              from '@/components/partidos/PartidoForm';
import { getOutcome, formatFecha } from '@/components/partidos/PartidoCard';
import { getEquipoNombre }      from '@/data/equipos';
import type { Match, MatchEvent, MatchEventType, MatchSquad } from '@/types';

// ── Helpers ──────────────────────────────────────────────────

const EVENT_LABELS: Record<MatchEventType, { icon: string; label: string; color: string }> = {
  goal:        { icon: '⚽', label: 'Gol',               color: 'text-quarte-verde' },
  assist:      { icon: '🎯', label: 'Asistencia',         color: 'text-blue-600'    },
  yellow_card: { icon: '🟨', label: 'Tarjeta amarilla',   color: 'text-yellow-500'  },
  red_card:    { icon: '🟥', label: 'Tarjeta roja',       color: 'text-quarte-rojo' },
  mvp:         { icon: '⭐', label: 'Jugador del partido', color: 'text-amber-500'  },
};

type MainTab = 'plan' | 'convocatoria' | 'acta';

// ── PlanTab ──────────────────────────────────────────────────
function PlanTab({
  partido,
  squad,
  onGoToConv,
  onGoToActa,
}: {
  partido: Match;
  squad:   MatchSquad[];
  onGoToConv: () => void;
  onGoToActa: () => void;
}) {
  const store = usePartidosStore();
  const [notes,    setNotes]    = useState(partido.notes ?? '');
  const [saving,   setSaving]   = useState(false);
  const [saved,    setSaved]    = useState(false);
  const [confirmCancel,  setConfirmCancel]  = useState(false);
  const [confirmLimpiar, setConfirmLimpiar] = useState(false);
  const navigate = useNavigate();

  async function handleSaveNotes() {
    if (saving) return;
    setSaving(true);
    try {
      await store.guardarPartido({ ...partido, notes: notes.trim() || undefined, updated_at: new Date().toISOString() });
      setSaved(true);
      setTimeout(() => setSaved(false), 2200);
    } finally {
      setSaving(false);
    }
  }

  async function handleCancelar() {
    await store.cambiarEstado(partido.id, 'cancelled');
    navigate('/partidos');
  }

  const outcome = getOutcome(partido);
  const titulares = squad.filter(s => s.is_starter).length;
  const suplentes = squad.filter(s => !s.is_starter).length;

  const statusInfo: Record<string, { label: string; cls: string }> = {
    scheduled:  { label: '🗓️ Pendiente',   cls: 'bg-blue-50 text-quarte-azul'    },
    played:     { label: '✅ Jugado',       cls: 'bg-green-50 text-quarte-verde'  },
    cancelled:  { label: '❌ Cancelado',    cls: 'bg-red-50 text-quarte-rojo'     },
    postponed:  { label: '⏸️ Aplazado',    cls: 'bg-amber-50 text-amber-700'     },
  };
  const si = statusInfo[partido.status] ?? { label: partido.status, cls: 'bg-gray-100 text-gray-600' };

  return (
    <div className="p-4 max-w-lg mx-auto flex flex-col gap-4 pb-8">

      {/* Info del partido */}
      <div className="card flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <p className="font-titulo font-bold text-sm text-quarte-negro">Información</p>
          <span className={`text-xs font-titulo font-bold px-2.5 py-1 rounded-full ${si.cls}`}>
            {si.label}
          </span>
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar size={14} className="text-quarte-azul flex-shrink-0" />
            <span className="font-cuerpo">{formatFecha(partido.date)}</span>
            {partido.time && <span className="font-cuerpo">· {partido.time}</span>}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin size={14} className="text-quarte-azul flex-shrink-0" />
            <span className="font-cuerpo">
              {partido.location === 'home' ? 'Local (campo propio)'
               : partido.location === 'away' ? 'Visitante (campo rival)'
               : 'Campo neutral'}
            </span>
          </div>
          {partido.time && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock size={14} className="text-quarte-azul flex-shrink-0" />
              <span className="font-cuerpo">{partido.time}</span>
            </div>
          )}
          {partido.competition && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-titulo font-semibold text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">
                {partido.competition}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Resultado si está jugado */}
      {partido.status === 'played' && (
        <button onClick={onGoToActa}
          className="card flex items-center gap-4 text-left hover:bg-gray-50 transition-colors active:scale-[0.99]">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0
            ${outcome === 'victoria' ? 'bg-green-100' : outcome === 'derrota' ? 'bg-red-100' : 'bg-gray-100'}`}>
            <Trophy size={22} className={
              outcome === 'victoria' ? 'text-quarte-verde' : outcome === 'derrota' ? 'text-quarte-rojo' : 'text-gray-500'
            } />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-titulo font-bold text-3xl text-quarte-negro">
              {partido.goals_for} – {partido.goals_against}
            </p>
            <p className={`text-xs font-titulo font-bold mt-0.5
              ${outcome === 'victoria' ? 'text-quarte-verde' : outcome === 'derrota' ? 'text-quarte-rojo' : 'text-gray-500'}`}>
              {outcome === 'victoria' ? '🏆 Victoria' : outcome === 'derrota' ? '💔 Derrota' : '🤝 Empate'}
            </p>
          </div>
          <span className="text-xs text-quarte-azul font-titulo font-semibold flex-shrink-0">Ver acta →</span>
        </button>
      )}

      {/* Plan / notas de partido */}
      <div className="card flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <p className="font-titulo font-bold text-sm text-quarte-negro">Plan de partido</p>
          {saved && (
            <span className="flex items-center gap-1 text-xs text-quarte-verde font-titulo font-semibold">
              <CheckCircle2 size={13} /> Guardado
            </span>
          )}
        </div>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Escribe el plan de juego, observaciones del rival, estrategias para esta semana..."
          rows={4}
          className="w-full px-3 py-2.5 rounded-xl border-2 border-gray-200
                     focus:border-quarte-azul outline-none text-sm font-cuerpo resize-none" />
        <button
          onClick={handleSaveNotes}
          disabled={saving || saved}
          className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-titulo font-semibold transition-colors
            ${saved ? 'bg-quarte-verde text-white' : 'bg-quarte-azul text-white hover:bg-blue-800 disabled:opacity-60'}`}>
          {saving
            ? <Loader2 size={14} className="animate-spin" />
            : saved
            ? <Check size={14} />
            : <Save size={14} />}
          {saving ? 'Guardando…' : saved ? '¡Guardado!' : 'Guardar plan'}
        </button>
      </div>

      {/* Estado de convocatoria */}
      <button
        onClick={onGoToConv}
        className="card flex items-center gap-3 text-left hover:bg-gray-50 transition-colors active:scale-[0.99]">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
          ${squad.length > 0 ? 'bg-quarte-azul' : 'bg-gray-100'}`}>
          <Users size={18} className={squad.length > 0 ? 'text-white' : 'text-gray-400'} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-titulo font-bold text-sm text-quarte-negro">
            {squad.length > 0 ? 'Convocatoria' : 'Crear convocatoria'}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            {squad.length > 0
              ? `${titulares} titulares · ${suplentes} suplentes · ${squad.length} convocados`
              : 'Selecciona los jugadores para este partido'}
          </p>
        </div>
        <span className="text-xs text-quarte-azul font-titulo font-semibold flex-shrink-0">
          {squad.length > 0 ? 'Editar →' : 'Crear →'}
        </span>
      </button>

      {/* Botón registrar resultado si no está jugado */}
      {partido.status === 'scheduled' && (
        <button
          onClick={onGoToActa}
          className="flex items-center justify-center gap-2 py-3 rounded-2xl
                     bg-quarte-negro text-white font-titulo font-bold text-sm
                     hover:bg-gray-900 transition-colors active:scale-[0.98]">
          <Trophy size={16} /> Registrar resultado
        </button>
      )}

      {/* Acciones */}
      <div className="flex flex-col gap-2 mt-2">
        {partido.status === 'played' && (
          <button onClick={() => setConfirmLimpiar(true)}
            className="flex items-center justify-center gap-2 py-2.5 rounded-xl
                       border-2 border-gray-300 text-sm font-titulo font-semibold text-gray-500
                       hover:border-amber-400 hover:text-amber-600 transition-colors">
            <RotateCcw size={16} /> Limpiar resultado
          </button>
        )}

        {partido.status !== 'cancelled' && partido.status !== 'played' && (
          <>
            {!confirmCancel ? (
              <button onClick={() => setConfirmCancel(true)}
                className="flex items-center justify-center gap-2 py-2.5 rounded-xl
                           border-2 border-gray-300 text-sm font-titulo font-semibold text-gray-600
                           hover:border-amber-400 hover:text-amber-600 transition-colors">
                <X size={16} /> Cancelar partido
              </button>
            ) : (
              <div className="card flex flex-col gap-3">
                <p className="text-sm font-cuerpo text-quarte-negro">¿Cancelar este partido?</p>
                <div className="flex gap-2">
                  <button onClick={() => setConfirmCancel(false)}
                    className="flex-1 py-2 rounded-xl border-2 border-gray-300 text-sm font-titulo font-semibold text-gray-600">
                    No
                  </button>
                  <button onClick={handleCancelar}
                    className="flex-1 py-2 rounded-xl bg-amber-500 text-white text-sm font-titulo font-semibold">
                    Sí, cancelar
                  </button>
                </div>
              </div>
            )}
          </>
        )}

      </div>

      {/* Overlay confirmación limpiar resultado */}
      {confirmLimpiar && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setConfirmLimpiar(false)} />
          <div className="relative bg-white w-full max-w-lg rounded-t-[2rem] p-6 flex flex-col gap-4">
            <p className="font-titulo font-bold text-base text-quarte-negro">¿Limpiar el resultado?</p>
            <p className="text-sm font-cuerpo text-gray-500">
              Se borrarán el marcador y todos los eventos del acta. El partido vuelve a estado pendiente.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmLimpiar(false)}
                className="flex-1 py-2.5 rounded-xl border-2 border-gray-300 text-sm font-titulo font-semibold text-gray-600">
                Cancelar
              </button>
              <button onClick={async () => { await store.limpiarResultado(partido.id); setConfirmLimpiar(false); }}
                className="flex-1 py-2.5 rounded-xl bg-amber-500 text-white text-sm font-titulo font-semibold">
                Sí, limpiar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── ActaTab ──────────────────────────────────────────────────
function ActaTab({
  partido,
  eventos,
  jugadores,
  onGuardar,
}: {
  partido:   Match;
  eventos:   MatchEvent[];
  jugadores: { id: string; nombre: string; apellidos: string; dorsal: number }[];
  onGuardar: (gf: number, gc: number, evs: EventoDraft[]) => Promise<void>;
}) {
  const [gf,           setGf]           = useState(partido.goals_for);
  const [gc,           setGc]           = useState(partido.goals_against);
  const [drafts,       setDrafts]       = useState<EventoDraft[]>(() =>
    eventos.map(ev => ({
      id:          ev.id,
      event_type:  ev.event_type,
      player_id:   ev.player_id,
      player_name: ev.player_name,
      minute:      ev.minute,
    }))
  );
  const [guardando,    setGuardando]    = useState(false);
  const [guardado,     setGuardado]     = useState(false);
  const [showAdd,      setShowAdd]      = useState(false);
  const [nuevoTipo,    setNuevoTipo]    = useState<MatchEventType>('goal');
  const [nuevoJug,     setNuevoJug]     = useState('');
  const [nuevoMin,     setNuevoMin]     = useState('');
  const [jugDropdown,  setJugDropdown]  = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);
  const [toast, setToast] = useState<{ tipo: 'ok' | 'error'; msg: string } | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function showToast(tipo: 'ok' | 'error', msg: string) {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ tipo, msg });
    toastTimer.current = setTimeout(() => setToast(null), 3500);
  }

  const golesRegistrados = drafts.filter(e => e.event_type === 'goal').length;
  const advertencia = gf !== golesRegistrados && drafts.some(e => e.event_type === 'goal');

  function addEvento() {
    if (!showAdd) { setShowAdd(true); return; }
    const jugInfo = jugadores.find(j => j.id === nuevoJug);
    const ev: EventoDraft = {
      id:          crypto.randomUUID(),
      event_type:  nuevoTipo,
      player_id:   nuevoJug || undefined,
      player_name: jugInfo ? `${jugInfo.nombre} ${jugInfo.apellidos}`.trim() : undefined,
      minute:      nuevoMin ? parseInt(nuevoMin) : undefined,
    };
    setDrafts(prev => [...prev, ev]);
    setNuevoJug(''); setNuevoMin(''); setShowAdd(false);
  }

  async function handleGuardar() {
    if (guardando) return;
    setGuardando(true);
    try {
      await onGuardar(gf, gc, drafts);
      setGuardado(true);
      showToast('ok', partido.status === 'played' ? '¡Acta actualizada!' : '¡Resultado registrado!');
      setTimeout(() => setGuardado(false), 2500);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      showToast('error', `Error: ${msg.slice(0, 60)}`);
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div className="p-4 max-w-lg mx-auto flex flex-col gap-4 pb-8">

      {/* Badge de estado */}
      {partido.status === 'played' && (
        <div className="flex items-center gap-2 bg-green-50 rounded-xl px-3 py-2.5
                        border border-green-100">
          <CheckCircle2 size={16} className="text-quarte-verde flex-shrink-0" />
          <p className="text-xs font-titulo font-semibold text-quarte-verde">
            Resultado registrado — puedes actualizar el acta
          </p>
        </div>
      )}

      {/* Marcador */}
      <div className="card">
        <p className="font-titulo font-bold text-sm text-quarte-negro mb-4">Marcador</p>
        <div className="flex items-center justify-center gap-8">
          <div className="flex flex-col items-center gap-2">
            <p className="text-xs font-titulo font-semibold text-gray-500 uppercase">Nosotros</p>
            <div className="flex items-center gap-3">
              <button onClick={() => setGf(v => Math.max(0, v - 1))}
                className="w-10 h-10 rounded-full bg-gray-100 font-titulo font-bold text-xl hover:bg-gray-200 flex items-center justify-center">
                −
              </button>
              <span className="font-titulo font-bold text-5xl w-12 text-center text-quarte-negro">{gf}</span>
              <button onClick={() => setGf(v => v + 1)}
                className="w-10 h-10 rounded-full bg-quarte-verde/20 font-titulo font-bold text-xl hover:bg-quarte-verde/30 flex items-center justify-center text-quarte-verde">
                +
              </button>
            </div>
          </div>
          <span className="font-titulo font-bold text-3xl text-gray-300">–</span>
          <div className="flex flex-col items-center gap-2">
            <p className="text-xs font-titulo font-semibold text-gray-500 uppercase">Rival</p>
            <div className="flex items-center gap-3">
              <button onClick={() => setGc(v => Math.max(0, v - 1))}
                className="w-10 h-10 rounded-full bg-gray-100 font-titulo font-bold text-xl hover:bg-gray-200 flex items-center justify-center">
                −
              </button>
              <span className="font-titulo font-bold text-5xl w-12 text-center text-quarte-negro">{gc}</span>
              <button onClick={() => setGc(v => v + 1)}
                className="w-10 h-10 rounded-full bg-quarte-rojo/10 font-titulo font-bold text-xl hover:bg-quarte-rojo/20 flex items-center justify-center text-quarte-rojo">
                +
              </button>
            </div>
          </div>
        </div>
        {advertencia && (
          <div className="flex items-center gap-2 bg-amber-50 rounded-xl px-3 py-2 mt-4 text-xs text-amber-700">
            <AlertTriangle size={14} />
            <span>Los goles registrados ({golesRegistrados}) no coinciden con el marcador ({gf}).</span>
          </div>
        )}
      </div>

      {/* Eventos */}
      <div className="card flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <p className="font-titulo font-bold text-sm text-quarte-negro">Eventos del partido</p>
          <button onClick={addEvento}
            className="flex items-center gap-1 text-xs font-titulo font-semibold text-quarte-azul hover:underline">
            <Plus size={14} /> Añadir
          </button>
        </div>

        {/* Formulario de nuevo evento */}
        {showAdd && (
          <div className="bg-quarte-azulClaro rounded-xl p-3 flex flex-col gap-3">
            {/* Tipo */}
            <div className="flex gap-1.5 flex-wrap">
              {(Object.keys(EVENT_LABELS) as MatchEventType[]).map(tipo => (
                <button key={tipo} type="button" onClick={() => setNuevoTipo(tipo)}
                  className={`px-2.5 py-1.5 rounded-full text-xs font-titulo font-semibold transition-colors
                    ${nuevoTipo === tipo ? 'bg-quarte-azul text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}>
                  {EVENT_LABELS[tipo].icon} {EVENT_LABELS[tipo].label}
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              {/* Jugador dropdown */}
              <div className="flex-1 relative" ref={dropRef}>
                <button type="button" onClick={() => setJugDropdown(v => !v)}
                  className="w-full min-h-[40px] px-3 rounded-xl border-2 border-gray-200 bg-white
                             text-sm font-cuerpo text-left flex items-center justify-between gap-2">
                  <span className={nuevoJug ? 'text-quarte-negro' : 'text-gray-400'}>
                    {nuevoJug
                      ? (() => { const j = jugadores.find(x => x.id === nuevoJug); return j ? `${j.nombre} ${j.apellidos}` : ''; })()
                      : 'Jugador (opcional)'}
                  </span>
                  <ChevronDown size={14} />
                </button>
                {jugDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-lg z-30
                                  border border-gray-100 max-h-40 overflow-y-auto">
                    <button type="button" onClick={() => { setNuevoJug(''); setJugDropdown(false); }}
                      className="w-full text-left px-3 py-2 text-sm font-cuerpo text-gray-400 hover:bg-gray-50">
                      Sin jugador
                    </button>
                    {jugadores.map(j => (
                      <button key={j.id} type="button"
                        onClick={() => { setNuevoJug(j.id); setJugDropdown(false); }}
                        className="w-full text-left px-3 py-2 text-sm font-cuerpo text-quarte-negro hover:bg-quarte-azulClaro">
                        #{j.dorsal} {j.nombre} {j.apellidos}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Minuto */}
              <input type="number" min={1} max={120} value={nuevoMin}
                onChange={e => setNuevoMin(e.target.value)}
                placeholder="Min"
                className="w-16 min-h-[40px] px-2 rounded-xl border-2 border-gray-200 bg-white
                           outline-none text-sm font-cuerpo text-center focus:border-quarte-azul" />
            </div>

            <div className="flex gap-2">
              <button type="button" onClick={() => setShowAdd(false)}
                className="flex-1 py-2 rounded-xl border-2 border-gray-300 text-sm font-titulo font-semibold text-gray-600">
                Cancelar
              </button>
              <button type="button" onClick={addEvento}
                className="flex-1 py-2 rounded-xl bg-quarte-azul text-white text-sm font-titulo font-semibold">
                <Check size={14} className="inline mr-1" /> Añadir
              </button>
            </div>
          </div>
        )}

        {/* Lista de eventos */}
        {drafts.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-3">
            Sin eventos. Añade goles, asistencias y tarjetas.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {drafts.map(ev => (
              <div key={ev.id}
                className="flex items-center gap-3 bg-gray-50 rounded-xl px-3 py-2">
                <span className="text-lg">{EVENT_LABELS[ev.event_type].icon}</span>
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-titulo font-semibold ${EVENT_LABELS[ev.event_type].color}`}>
                    {EVENT_LABELS[ev.event_type].label}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {ev.player_name ?? 'Sin jugador'}
                    {ev.minute != null && ` · min. ${ev.minute}'`}
                  </p>
                </div>
                <button onClick={() => setDrafts(prev => prev.filter(e => e.id !== ev.id))}
                  className="w-7 h-7 flex items-center justify-center rounded-lg
                             bg-red-50 text-quarte-rojo hover:bg-red-100 flex-shrink-0">
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Botón guardar */}
      <button onClick={handleGuardar} disabled={guardando}
        className={`flex items-center justify-center gap-2 py-3 rounded-2xl font-titulo font-bold text-sm
                    transition-colors active:scale-[0.98]
          ${guardado
            ? 'bg-quarte-verde text-white'
            : 'bg-quarte-negro text-white hover:bg-gray-900 disabled:opacity-60'}`}>
        {guardando
          ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          : guardado
          ? <CheckCircle2 size={18} />
          : <Trophy size={18} />}
        {guardando ? 'Guardando…'
         : guardado ? '¡Guardado!'
         : partido.status === 'played' ? 'Actualizar acta' : 'Registrar resultado'}
      </button>

      {/* Toast */}
      {toast && (
        <div className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[999]
                         flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl
                         text-base font-titulo font-bold whitespace-nowrap
                         ${toast.tipo === 'ok' ? 'bg-quarte-verde text-white' : 'bg-quarte-rojo text-white'}`}>
          {toast.tipo === 'ok' ? <CheckCircle2 size={24} /> : <XCircle size={24} />}
          {toast.msg}
        </div>
      )}
    </div>
  );
}

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================
export default function PartidoDetallePage() {
  const { id: matchId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { perfil, activeTeamId } = usePerfilStore();
  const store             = usePartidosStore();
  const plantillaStore    = usePlantillaStore();
  const convocatoriaStore = useConvocatoriaStore();
  const asistenciaStore   = useAsistenciaStore();

  const [tab,      setTab]      = useState<MainTab>('plan');
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    if (!perfil || !matchId || !activeTeamId) return;
    plantillaStore.cargar(activeTeamId);
    if (store.partidos.length === 0) store.cargar(activeTeamId);
    asistenciaStore.cargarEstadisticasLista(activeTeamId);
    convocatoriaStore.cargar(matchId);
    store.cargarEventos(matchId);
  }, [activeTeamId, matchId]);

  if (!perfil || !matchId) return null;

  const partido = store.partidos.find(p => p.id === matchId);

  // ── Modo edición ─────────────────────────────────────────
  if (editMode && partido) {
    return (
      <PartidoForm
        inicial={partido}
        teamId={activeTeamId ?? ''}
        onGuardar={async p => { await store.guardarPartido(p); setEditMode(false); }}
        onCancelar={() => setEditMode(false)}
      />
    );
  }

  // ── Cargando / no encontrado ──────────────────────────────
  if (!partido) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center bg-quarte-gris gap-3">
        {store.cargando
          ? <div className="w-8 h-8 border-3 border-quarte-azul border-t-transparent rounded-full animate-spin" />
          : (
            <>
              <p className="text-gray-400 font-titulo font-semibold">Partido no encontrado</p>
              <button onClick={() => navigate('/partidos')}
                className="text-xs text-quarte-azul font-titulo font-semibold hover:underline">
                ← Volver a partidos
              </button>
            </>
          )}
      </div>
    );
  }

  const squad    = convocatoriaStore.getSquad(matchId);
  const eventos  = store.eventos[matchId] ?? [];
  const outcome  = getOutcome(partido);

  const jugadoresSimple = plantillaStore.jugadores.map(j => ({
    id: j.id, nombre: j.nombre, apellidos: j.apellidos, dorsal: j.dorsal,
  }));

  const headerColor =
    outcome === 'victoria' ? 'bg-quarte-verde' :
    outcome === 'derrota'  ? 'bg-quarte-rojo'  :
    'bg-quarte-azul';

  const TABS = [
    { id: 'plan'         as MainTab, icon: ClipboardList, label: 'Plan'            },
    { id: 'convocatoria' as MainTab, icon: Users,         label: squad.length > 0 ? `Conv. (${squad.length})` : 'Convocatoria' },
    { id: 'acta'         as MainTab, icon: Trophy,        label: 'Acta'            },
  ];
  const tabIdx = TABS.findIndex(t => t.id === tab);

  return (
    <div className="flex flex-col min-h-screen bg-quarte-gris">

      {/* ── Header ─────────────────────────────────────────── */}
      <div className={`${headerColor} text-white px-4 pt-4 pb-0`}>
        <div className="flex items-center gap-3 pb-3">
          <button onClick={() => navigate('/partidos')}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/20 hover:bg-white/30 flex-shrink-0">
            <ArrowLeft size={20} />
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-white/70 text-xs truncate">
              {partido.location === 'home' ? '🏠 Local'
               : partido.location === 'away' ? '✈️ Visitante'
               : '⚖️ Neutro'}
              {partido.competition ? ` · ${partido.competition}` : ''}
            </p>
            <h1 className="font-titulo text-lg font-bold leading-tight truncate">
              vs {partido.rival_name}
            </h1>
            <p className="text-white/70 text-xs">
              {formatFecha(partido.date)}{partido.time ? ` · ${partido.time}` : ''}
            </p>
          </div>
          <button onClick={() => setEditMode(true)}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/20 hover:bg-white/30 flex-shrink-0">
            <Edit2 size={18} />
          </button>
        </div>

        {/* Tab bar con indicador deslizante */}
        <div className="relative flex">
          <div className="absolute bottom-0 h-0.5 bg-white pointer-events-none"
            style={{
              width: '33.333%',
              transform: `translateX(${tabIdx * 100}%)`,
              transition: 'transform .3s cubic-bezier(.5,0,.2,1)',
            }} />
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5
                          text-xs font-titulo font-semibold transition-colors
                ${tab === t.id ? 'text-white' : 'text-white/50 hover:text-white/80'}`}>
              <t.icon size={13} />
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Contenido de tabs ──────────────────────────────── */}
      <div className="flex-1 overflow-y-auto">

        {tab === 'plan' && (
          <PlanTab
            partido={partido}
            squad={squad}
            onGoToConv={() => setTab('convocatoria')}
            onGoToActa={() => setTab('acta')}
          />
        )}

        {tab === 'convocatoria' && (
          <ConvocatoriaEditor
            compact
            partido={partido}
            jugadores={plantillaStore.jugadores}
            statsAsistencia={asistenciaStore.estadisticasLista}
            initialSquad={squad}
            equipo={getEquipoNombre(activeTeamId ?? '') || perfil.equipo}
            onGuardar={async newSquad => {
              await convocatoriaStore.guardarConvocatoria(matchId, newSquad);
            }}
            onBack={() => {}}
          />
        )}

        {tab === 'acta' && (
          <ActaTab
            partido={partido}
            eventos={eventos}
            jugadores={jugadoresSimple}
            onGuardar={async (gf, gc, evs) => {
              await store.guardarResultado(matchId, gf, gc, evs);
            }}
          />
        )}

      </div>
    </div>
  );
}
