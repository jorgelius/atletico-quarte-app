// ============================================================
// PartidosPage — Módulo A: Gestión de partidos
// Vistas: lista → detalle → form (nuevo/editar)
// Modal overlay: editor de resultado
// ============================================================
import { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Shield, Plus, ArrowLeft, Edit2, Trash2, X,
  Save, Trophy, AlertTriangle,
  ChevronDown, Check, ClipboardList, Users,
} from 'lucide-react';
import { usePerfilStore }       from '@/stores/perfilStore';
import { usePartidosStore, type EventoDraft } from '@/stores/partidosStore';
import { usePlantillaStore }    from '@/stores/plantillaStore';
import { useConvocatoriaStore } from '@/stores/convocatoriaStore';
import PartidoCard, { getOutcome, formatFecha } from '@/components/partidos/PartidoCard';
import type { Match, MatchEventType, MatchLocation } from '@/types';

// ── Tipos de vistas ──────────────────────────────────────────
type View =
  | { mode: 'list' }
  | { mode: 'form';    partido?: Match }
  | { mode: 'detalle'; id: string };

type TabFiltro = 'todos' | 'proximos' | 'jugados' | 'temporada';

// ── Helpers ──────────────────────────────────────────────────
const TEMPORADA_ACTUAL = '2025/26';

const EVENT_LABELS: Record<MatchEventType, { icon: string; label: string; color: string }> = {
  goal:        { icon: '⚽', label: 'Gol',              color: 'text-quarte-verde' },
  assist:      { icon: '🎯', label: 'Asistencia',        color: 'text-blue-600'    },
  yellow_card: { icon: '🟨', label: 'Tarjeta amarilla',  color: 'text-yellow-500'  },
  red_card:    { icon: '🟥', label: 'Tarjeta roja',      color: 'text-quarte-rojo' },
  mvp:         { icon: '⭐', label: 'Jugador del partido',color: 'text-amber-500'  },
};

// ============================================================
// PartidoForm — crear / editar partido
// ============================================================
function PartidoForm({
  inicial, teamId, onGuardar, onCancelar,
}: {
  inicial?: Match;
  teamId:   string;
  onGuardar: (p: Match) => Promise<void>;
  onCancelar: () => void;
}) {
  const [rival,       setRival]       = useState(inicial?.rival_name  ?? '');
  const [fecha,       setFecha]       = useState(inicial?.date        ?? new Date().toISOString().split('T')[0]);
  const [hora,        setHora]        = useState(inicial?.time        ?? '');
  const [ubicacion,   setUbicacion]   = useState<MatchLocation>(inicial?.location    ?? 'home');
  const [competicion, setCompeticion] = useState(inicial?.competition ?? '');
  const [notas,       setNotas]       = useState(inicial?.notes       ?? '');
  const [guardando,   setGuardando]   = useState(false);
  const [errorMsg,    setErrorMsg]    = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!rival.trim()) { setErrorMsg('El nombre del rival es obligatorio.'); return; }
    if (!fecha)        { setErrorMsg('La fecha es obligatoria.'); return; }
    setGuardando(true);
    setErrorMsg('');
    try {
      const now = new Date().toISOString();
      await onGuardar({
        id:           inicial?.id ?? crypto.randomUUID(),
        team_id:      teamId,
        season:       TEMPORADA_ACTUAL,
        date:         fecha,
        time:         hora || undefined,
        rival_name:   rival.trim(),
        location:     ubicacion,
        competition:  competicion.trim() || undefined,
        goals_for:    inicial?.goals_for    ?? 0,
        goals_against:inicial?.goals_against ?? 0,
        status:       inicial?.status        ?? 'scheduled',
        notes:        notas.trim()           || undefined,
        created_at:   inicial?.created_at    ?? now,
        updated_at:   now,
      });
    } catch {
      setErrorMsg('Error al guardar. Inténtalo de nuevo.');
      setGuardando(false);
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-quarte-gris">
      <div className="bg-quarte-azul text-white px-4 pt-4 pb-4 flex items-center gap-3">
        <button onClick={onCancelar}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/20 hover:bg-white/30">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <h1 className="font-titulo text-lg font-bold">{inicial ? 'Editar partido' : 'Nuevo partido'}</h1>
          <p className="text-blue-200 text-xs">Temporada {TEMPORADA_ACTUAL}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 max-w-lg mx-auto w-full">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="card flex flex-col gap-4">
            <p className="font-titulo font-bold text-sm text-quarte-negro">Datos del partido</p>

            <div>
              <label className="block text-xs font-titulo font-semibold text-gray-500 mb-1">Rival *</label>
              <input value={rival} onChange={e => setRival(e.target.value)}
                placeholder="Nombre del equipo rival" required
                className="w-full min-h-[44px] px-3 rounded-xl border-2 border-gray-200
                           focus:border-quarte-azul outline-none text-sm font-cuerpo" />
            </div>

            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-xs font-titulo font-semibold text-gray-500 mb-1">Fecha *</label>
                <input type="date" value={fecha} onChange={e => setFecha(e.target.value)} required
                  className="w-full min-h-[44px] px-3 rounded-xl border-2 border-gray-200
                             focus:border-quarte-azul outline-none text-sm font-cuerpo" />
              </div>
              <div className="w-32">
                <label className="block text-xs font-titulo font-semibold text-gray-500 mb-1">Hora</label>
                <input type="time" value={hora} onChange={e => setHora(e.target.value)}
                  className="w-full min-h-[44px] px-3 rounded-xl border-2 border-gray-200
                             focus:border-quarte-azul outline-none text-sm font-cuerpo" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-titulo font-semibold text-gray-500 mb-2">Campo</label>
              <div className="flex gap-2">
                {(['home', 'away', 'neutral'] as MatchLocation[]).map(loc => (
                  <button key={loc} type="button" onClick={() => setUbicacion(loc)}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-titulo font-bold transition-colors
                      ${ubicacion === loc ? 'bg-quarte-azul text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                    {loc === 'home' ? '🏠 Local' : loc === 'away' ? '✈️ Visitante' : '⚖️ Neutro'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-titulo font-semibold text-gray-500 mb-1">Competición</label>
              <input value={competicion} onChange={e => setCompeticion(e.target.value)}
                placeholder="Ej: 3ª Regional Aragón, Copa..."
                className="w-full min-h-[44px] px-3 rounded-xl border-2 border-gray-200
                           focus:border-quarte-azul outline-none text-sm font-cuerpo" />
            </div>
          </div>

          <div className="card flex flex-col gap-3">
            <p className="font-titulo font-bold text-sm text-quarte-negro">Notas previas</p>
            <textarea value={notas} onChange={e => setNotas(e.target.value)}
              placeholder="Observaciones, plan de juego..."
              rows={3}
              className="w-full px-3 py-2.5 rounded-xl border-2 border-gray-200
                         focus:border-quarte-azul outline-none text-sm font-cuerpo resize-none" />
          </div>

          {errorMsg && (
            <p className="text-sm text-quarte-rojo font-cuerpo text-center bg-red-50 rounded-xl py-2">
              {errorMsg}
            </p>
          )}

          <button type="submit" disabled={guardando}
            className="btn-primario flex items-center justify-center gap-2">
            {guardando
              ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : <Save size={18} />}
            {guardando ? 'Guardando...' : 'Guardar partido'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ============================================================
// ResultadoEditor — modal overlay
// ============================================================
function ResultadoEditor({
  partido,
  jugadores,
  onGuardar,
  onCerrar,
}: {
  partido:  Match;
  jugadores: { id: string; nombre: string; apellidos: string; dorsal: number }[];
  onGuardar: (gf: number, gc: number, eventos: EventoDraft[]) => Promise<void>;
  onCerrar:  () => void;
}) {
  const [gf,       setGf]       = useState(partido.goals_for);
  const [gc,       setGc]       = useState(partido.goals_against);
  const [eventos,  setEventos]  = useState<EventoDraft[]>([]);
  const [guardando, setGuardando] = useState(false);
  const [showAddEvento, setShowAdd] = useState(false);
  const [nuevoTipo,  setNuevoTipo]  = useState<MatchEventType>('goal');
  const [nuevoJug,   setNuevoJug]   = useState('');
  const [nuevoMin,   setNuevoMin]   = useState('');
  const [jugDropdown, setJugDropdown] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (partido.status === 'played') {
      // Los eventos ya están en el store, no hace falta recargar aquí.
    }
  }, []);

  const golesRegistrados = eventos.filter(e => e.event_type === 'goal').length;
  const advertencia = gf !== golesRegistrados && eventos.some(e => e.event_type === 'goal');

  function addEvento() {
    if (!showAddEvento) { setShowAdd(true); return; }
    const jugInfo = jugadores.find(j => j.id === nuevoJug);
    const ev: EventoDraft = {
      id:          crypto.randomUUID(),
      event_type:  nuevoTipo,
      player_id:   nuevoJug  || undefined,
      player_name: jugInfo
        ? `${jugInfo.nombre} ${jugInfo.apellidos}`.trim()
        : undefined,
      minute: nuevoMin ? parseInt(nuevoMin) : undefined,
    };
    setEventos(prev => [...prev, ev]);
    setNuevoJug(''); setNuevoMin(''); setShowAdd(false);
  }

  async function handleGuardar() {
    setGuardando(true);
    try {
      await onGuardar(gf, gc, eventos);
    } catch {
      setGuardando(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white z-10 px-5 pt-5 pb-3 border-b border-gray-100 flex items-center justify-between">
          <div>
            <p className="font-titulo font-bold text-quarte-negro">Registrar resultado</p>
            <p className="text-xs text-gray-400">vs {partido.rival_name} · {formatFecha(partido.date)}</p>
          </div>
          <button onClick={onCerrar}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200">
            <X size={16} />
          </button>
        </div>

        <div className="px-5 pb-6 flex flex-col gap-5 pt-4">
          {/* Marcador */}
          <div className="flex items-center justify-center gap-6">
            <div className="flex flex-col items-center gap-2">
              <p className="text-xs font-titulo font-semibold text-gray-500 uppercase">Nuestros</p>
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
            <div className="flex items-center gap-2 bg-amber-50 rounded-xl px-3 py-2 text-xs text-amber-700">
              <AlertTriangle size={14} />
              <span>El nº de goles registrados ({golesRegistrados}) no coincide con el marcador ({gf}).</span>
            </div>
          )}

          {/* Eventos */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="font-titulo font-bold text-sm text-quarte-negro">Eventos del partido</p>
              <button onClick={addEvento}
                className="flex items-center gap-1 text-xs font-titulo font-semibold text-quarte-azul hover:underline">
                <Plus size={14} /> Añadir
              </button>
            </div>

            {/* Formulario de nuevo evento */}
            {showAddEvento && (
              <div className="bg-quarte-azulClaro rounded-xl p-3 mb-3 flex flex-col gap-3">
                {/* Tipo */}
                <div className="flex gap-1.5 flex-wrap">
                  {(Object.keys(EVENT_LABELS) as MatchEventType[]).map(tipo => (
                    <button key={tipo} type="button" onClick={() => setNuevoTipo(tipo)}
                      className={`px-2.5 py-1.5 rounded-full text-xs font-titulo font-semibold transition-colors
                        ${nuevoTipo === tipo
                          ? 'bg-quarte-azul text-white'
                          : 'bg-white text-gray-600 hover:bg-gray-100'}`}>
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
            {eventos.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-3">
                Sin eventos registrados. Añade goles, asistencias y tarjetas.
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {eventos.map(ev => (
                  <div key={ev.id}
                    className="flex items-center gap-3 bg-gray-50 rounded-xl px-3 py-2">
                    <span className="text-lg">{EVENT_LABELS[ev.event_type].icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-titulo font-semibold ${EVENT_LABELS[ev.event_type].color}`}>
                        {EVENT_LABELS[ev.event_type].label}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {ev.player_name ?? 'Jugador no especificado'}
                        {ev.minute != null && ` · min. ${ev.minute}`}
                      </p>
                    </div>
                    <button onClick={() => setEventos(prev => prev.filter(e => e.id !== ev.id))}
                      className="w-7 h-7 flex items-center justify-center rounded-lg
                                 bg-red-50 text-quarte-rojo hover:bg-red-100">
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Botón guardar */}
          <button onClick={handleGuardar} disabled={guardando}
            className="btn-primario flex items-center justify-center gap-2 w-full">
            {guardando
              ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : <Trophy size={18} />}
            {guardando ? 'Guardando...' : 'Guardar resultado'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// SeccionConvocatoria — dentro del DetallePartido
// ============================================================
function SeccionConvocatoria({
  matchId,
  onAbrir,
}: {
  matchId: string;
  onAbrir: () => void;
}) {
  const store = useConvocatoriaStore();
  const squad = store.getSquad(matchId);
  const loaded = matchId in store.squads;

  useEffect(() => {
    if (!loaded) store.cargar(matchId);
  }, [matchId]);

  const titulares = squad.filter(s => s.is_starter);
  const total     = squad.length;

  return (
    <div className="card flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ClipboardList size={16} className="text-quarte-azul" />
          <p className="font-titulo font-bold text-sm text-quarte-negro">Convocatoria</p>
        </div>
        <button onClick={onAbrir}
          className="flex items-center gap-1.5 text-xs font-titulo font-semibold text-quarte-azul hover:underline">
          {total > 0 ? (
            <>
              <Edit2 size={12} /> Editar
            </>
          ) : (
            <>
              <Plus size={12} /> Crear
            </>
          )}
        </button>
      </div>

      {store.cargando && !loaded ? (
        <div className="flex justify-center py-2">
          <div className="w-5 h-5 border-2 border-quarte-azul border-t-transparent rounded-full animate-spin" />
        </div>
      ) : total === 0 ? (
        <button onClick={onAbrir}
          className="flex items-center gap-3 py-3 rounded-xl border-2 border-dashed border-gray-200
                     hover:border-quarte-azul hover:bg-quarte-azulClaro transition-colors">
          <div className="w-10 h-10 rounded-xl bg-quarte-azulClaro flex items-center justify-center ml-2">
            <Users size={20} className="text-quarte-azul" />
          </div>
          <div className="text-left">
            <p className="font-titulo font-semibold text-sm text-quarte-azul">Crear convocatoria</p>
            <p className="text-xs text-gray-400">Selecciona los jugadores para este partido</p>
          </div>
        </button>
      ) : (
        <>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="bg-quarte-azul text-white text-xs font-titulo font-bold
                             px-2.5 py-1 rounded-full">
              {titulares.length} titulares
            </span>
            <span className="bg-gray-100 text-gray-600 text-xs font-titulo font-semibold
                             px-2.5 py-1 rounded-full">
              {total - titulares.length} suplentes
            </span>
            <span className="text-xs text-gray-400 font-titulo ml-1">{total} convocados total</span>
          </div>
          <button onClick={onAbrir}
            className="btn-secundario flex items-center justify-center gap-2 w-full text-sm py-2.5">
            <Edit2 size={14} /> Ver y editar convocatoria
          </button>
        </>
      )}
    </div>
  );
}

// ============================================================
// DetallePartido — vista de detalle
// ============================================================
function DetallePartido({
  partido,
  eventos,
  jugadores,
  onBack,
  onEditar,
  onGuardarResultado,
  onAbrirConvocatoria,
}: {
  partido:  Match;
  eventos:  import('@/types').MatchEvent[];
  jugadores: { id: string; nombre: string; apellidos: string; dorsal: number }[];
  onBack:   () => void;
  onEditar: () => void;
  onGuardarResultado: (gf: number, gc: number, evs: EventoDraft[]) => Promise<void>;
  onAbrirConvocatoria: () => void;
}) {
  const [showResultEditor, setShowResultEditor] = useState(false);
  const [showConfirmCancel, setShowConfirmCancel] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const { cambiarEstado, eliminarPartido } = usePartidosStore();

  const outcome = getOutcome(partido);

  async function handleCancelar() {
    await cambiarEstado(partido.id, 'cancelled');
    setShowConfirmCancel(false);
    onBack();
  }

  async function handleEliminar() {
    await eliminarPartido(partido.id);
    setShowConfirmDelete(false);
    onBack();
  }

  return (
    <div className="flex flex-col min-h-screen bg-quarte-gris">
      {/* Header */}
      <div className={`text-white px-4 pt-4 pb-4 flex items-center gap-3
        ${outcome === 'victoria' ? 'bg-quarte-verde' :
          outcome === 'derrota'  ? 'bg-quarte-rojo'  :
          'bg-quarte-azul'}`}>
        <button onClick={onBack}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/20 hover:bg-white/30">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <p className="text-white/70 text-xs font-cuerpo">
            {partido.location === 'home' ? '🏠 Local' : partido.location === 'away' ? '✈️ Visitante' : '⚖️ Neutro'}
            {partido.competition ? ` · ${partido.competition}` : ''}
          </p>
          <h1 className="font-titulo text-lg font-bold leading-tight">vs {partido.rival_name}</h1>
          <p className="text-white/70 text-xs">{formatFecha(partido.date)}{partido.time ? ` · ${partido.time}` : ''}</p>
        </div>
        <button onClick={onEditar}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/20 hover:bg-white/30">
          <Edit2 size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 max-w-lg mx-auto w-full flex flex-col gap-4">

        {/* Resultado */}
        {partido.status === 'played' && (
          <div className="card text-center">
            <div className="flex items-center justify-center gap-6 py-2">
              <div>
                <p className="font-titulo font-bold text-6xl text-quarte-negro">{partido.goals_for}</p>
                <p className="text-xs text-gray-400 font-titulo">Nosotros</p>
              </div>
              <span className="font-titulo font-bold text-3xl text-gray-300">–</span>
              <div>
                <p className="font-titulo font-bold text-6xl text-quarte-negro">{partido.goals_against}</p>
                <p className="text-xs text-gray-400 font-titulo">Rival</p>
              </div>
            </div>
            <span className={`inline-block px-4 py-1.5 rounded-full font-titulo font-bold text-sm mt-1
              ${outcome === 'victoria' ? 'bg-green-100 text-quarte-verde' :
                outcome === 'derrota'  ? 'bg-red-100 text-quarte-rojo'   :
                'bg-gray-100 text-gray-600'}`}>
              {outcome === 'victoria' ? '🏆 Victoria' :
               outcome === 'derrota'  ? '💔 Derrota'  : '🤝 Empate'}
            </span>
          </div>
        )}

        {/* Botón registrar resultado */}
        {partido.status === 'scheduled' && (
          <button onClick={() => setShowResultEditor(true)}
            className="btn-primario flex items-center justify-center gap-2">
            <Trophy size={18} /> Registrar resultado
          </button>
        )}

        {/* Sección Convocatoria */}
        <SeccionConvocatoria
          matchId={partido.id}
          onAbrir={onAbrirConvocatoria}
        />

        {/* Eventos del partido */}
        {partido.status === 'played' && (
          <div className="card flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <p className="font-titulo font-bold text-sm text-quarte-negro">Eventos del partido</p>
              <button onClick={() => setShowResultEditor(true)}
                className="text-xs font-titulo font-semibold text-quarte-azul hover:underline">
                Editar
              </button>
            </div>
            {eventos.length === 0 ? (
              <p className="text-sm text-gray-400">Sin eventos registrados.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {eventos.map(ev => (
                  <div key={ev.id} className="flex items-center gap-3 bg-gray-50 rounded-xl px-3 py-2">
                    <span className="text-lg">{EVENT_LABELS[ev.event_type].icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-titulo font-semibold ${EVENT_LABELS[ev.event_type].color}`}>
                        {EVENT_LABELS[ev.event_type].label}
                      </p>
                      <p className="text-xs text-gray-600 truncate">
                        {ev.player_name ?? 'Sin jugador'}
                        {ev.minute != null && ` · min. ${ev.minute}'`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Notas */}
        {partido.notes && (
          <div className="card">
            <p className="font-titulo font-bold text-sm text-quarte-negro mb-1">Notas</p>
            <p className="text-sm text-gray-600 font-cuerpo">{partido.notes}</p>
          </div>
        )}

        {/* Acciones */}
        <div className="flex flex-col gap-2 mt-2">
          {partido.status !== 'cancelled' && partido.status !== 'played' && (
            <>
              {!showConfirmCancel ? (
                <button onClick={() => setShowConfirmCancel(true)}
                  className="btn-outline text-sm flex items-center justify-center gap-2">
                  <X size={16} /> Cancelar partido
                </button>
              ) : (
                <div className="card flex flex-col gap-3">
                  <p className="text-sm font-cuerpo text-quarte-negro">¿Cancelar este partido?</p>
                  <div className="flex gap-2">
                    <button onClick={() => setShowConfirmCancel(false)}
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

          {!showConfirmDelete ? (
            <button onClick={() => setShowConfirmDelete(true)}
              className="flex items-center justify-center gap-2 py-2.5 rounded-xl
                         text-quarte-rojo text-sm font-titulo font-semibold hover:bg-red-50 transition-colors">
              <Trash2 size={16} /> Eliminar partido
            </button>
          ) : (
            <div className="card flex flex-col gap-3 border-2 border-red-200">
              <p className="text-sm font-cuerpo text-quarte-negro">
                ¿Eliminar el partido vs <strong>{partido.rival_name}</strong>? Esta acción no se puede deshacer.
              </p>
              <div className="flex gap-2">
                <button onClick={() => setShowConfirmDelete(false)}
                  className="flex-1 py-2 rounded-xl border-2 border-gray-300 text-sm font-titulo font-semibold text-gray-600">
                  Cancelar
                </button>
                <button onClick={handleEliminar}
                  className="flex-1 py-2 rounded-xl bg-quarte-rojo text-white text-sm font-titulo font-semibold">
                  Sí, eliminar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal editor de resultado */}
      {showResultEditor && (
        <ResultadoEditor
          partido={partido}
          jugadores={jugadores}
          onCerrar={() => setShowResultEditor(false)}
          onGuardar={async (gf, gc, evs) => {
            await onGuardarResultado(gf, gc, evs);
            setShowResultEditor(false);
          }}
        />
      )}
    </div>
  );
}

// ============================================================
// PartidosPage — Componente principal
// ============================================================
export default function PartidosPage() {
  const { perfil }    = usePerfilStore();
  const store         = usePartidosStore();
  const plantillaStore = usePlantillaStore();
  const navigate      = useNavigate();
  const location      = useLocation();

  const [view, setView]   = useState<View>({ mode: 'list' });
  const [tab,  setTab]    = useState<TabFiltro>('todos');

  const convocatoriaStore = useConvocatoriaStore();

  useEffect(() => {
    if (!perfil) return;
    store.cargar(perfil.id);
    plantillaStore.cargar(perfil.id);
  }, [perfil?.id]);

  // Cargar counts de convocatoria cuando hay partidos cargados
  useEffect(() => {
    if (store.partidos.length === 0) return;
    const ids = store.partidos.map(p => p.id);
    convocatoriaStore.cargarCuentas(ids);
  }, [store.partidos.length]);

  // Abrir directamente a un detalle si se viene de ConvocatoriaPage
  useEffect(() => {
    const openId = (location.state as { openId?: string } | null)?.openId;
    if (openId) {
      setView({ mode: 'detalle', id: openId });
      // Limpiar el state para no repetir
      window.history.replaceState({}, '');
    }
  }, [location.state]);

  if (!perfil) return null;

  // Cuando pasamos a detalle, cargamos eventos si no están
  function irADetalle(id: string) {
    if (!store.eventos[id]) store.cargarEventos(id);
    setView({ mode: 'detalle', id });
  }

  // Filtros
  const hoy = new Date().toISOString().split('T')[0];
  const filtrados = store.partidos.filter(p => {
    if (tab === 'proximos')  return p.status === 'scheduled' && p.date >= hoy;
    if (tab === 'jugados')   return p.status === 'played';
    if (tab === 'temporada') return p.season === TEMPORADA_ACTUAL;
    return true;
  });

  const jugadoresSimple = plantillaStore.jugadores.map(j => ({
    id:        j.id,
    nombre:    j.nombre,
    apellidos: j.apellidos,
    dorsal:    j.dorsal,
  }));

  // ── Vista FORM ────────────────────────────────────────────
  if (view.mode === 'form') {
    const inicial = view.partido;
    return (
      <PartidoForm
        inicial={inicial}
        teamId={perfil.id}
        onGuardar={async p => {
          await store.guardarPartido(p);
          setView({ mode: 'list' });
        }}
        onCancelar={() => setView({ mode: 'list' })}
      />
    );
  }

  // ── Vista DETALLE ─────────────────────────────────────────
  if (view.mode === 'detalle') {
    const partido = store.partidos.find(p => p.id === view.id);
    if (!partido) { setView({ mode: 'list' }); return null; }
    const eventos = store.eventos[partido.id] ?? [];
    return (
      <DetallePartido
        partido={partido}
        eventos={eventos}
        jugadores={jugadoresSimple}
        onBack={() => setView({ mode: 'list' })}
        onEditar={() => setView({ mode: 'form', partido })}
        onGuardarResultado={async (gf, gc, evs) => {
          await store.guardarResultado(partido.id, gf, gc, evs);
        }}
        onAbrirConvocatoria={() => navigate(`/partidos/${partido.id}/convocatoria`)}
      />
    );
  }

  // ── Vista LISTA ───────────────────────────────────────────
  const tabs: { id: TabFiltro; label: string }[] = [
    { id: 'todos',     label: 'Todos'         },
    { id: 'proximos',  label: 'Próximos'      },
    { id: 'jugados',   label: 'Jugados'       },
    { id: 'temporada', label: TEMPORADA_ACTUAL },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-quarte-gris">
      {/* Cabecera */}
      <div className="bg-quarte-azul text-white px-4 pt-4 pb-0">
        <div className="flex items-center gap-3 pb-3">
          <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
            <Shield size={20} />
          </div>
          <div className="flex-1">
            <h1 className="font-titulo text-lg font-bold">Partidos</h1>
            <p className="text-blue-200 text-xs">{store.partidos.length} partidos · {perfil.equipo}</p>
          </div>
          <button onClick={() => setView({ mode: 'form' })}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/20 hover:bg-white/30">
            <Plus size={20} />
          </button>
        </div>
        {/* Tabs */}
        <div className="flex overflow-x-auto scrollbar-hide gap-1 pb-0">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex-shrink-0 px-4 py-2.5 text-xs font-titulo font-semibold transition-colors border-b-2
                ${tab === t.id ? 'text-white border-white' : 'text-blue-300 border-transparent hover:text-white'}`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Lista */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 max-w-lg mx-auto flex flex-col gap-3">
          {store.cargando ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-3 border-quarte-azul border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filtrados.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-gray-400 gap-3">
              <Shield size={48} className="opacity-20" />
              <p className="font-titulo font-semibold">
                {tab === 'proximos' ? 'Sin partidos próximos' :
                 tab === 'jugados'  ? 'Sin partidos jugados'  :
                 'Sin partidos'}
              </p>
              <p className="text-sm text-center">
                {tab === 'todos' || tab === 'temporada'
                  ? 'Añade el primer partido con el botón +'
                  : 'Prueba con otro filtro'}
              </p>
            </div>
          ) : (
            filtrados.map(p => (
              <PartidoCard
                key={p.id}
                partido={p}
                onClick={() => irADetalle(p.id)}
                squadCount={convocatoriaStore.getCount(p.id)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
