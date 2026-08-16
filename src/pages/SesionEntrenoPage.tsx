// ============================================================
// SesionEntrenoPage — /sesion-entreno
// Gestión completa de la sesión de entrenamiento:
// horario recurrente, preparación, jugadores y notas
// ============================================================
import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Settings, Dumbbell, Users, FileText, History,
  Play, CheckCircle2, Star, Plus, Trash2, X, RotateCcw,
  MapPin, Clock, Check, Search, ChevronDown, ChevronUp, AlertTriangle,
} from 'lucide-react';
import { usePerfilStore }          from '@/stores/perfilStore';
import { useSesionEntrenoStore }   from '@/stores/sesionEntrenoStore';
import { useEntrenamientosStore }  from '@/stores/entrenamientosStore';
import { usePlantillaStore }       from '@/stores/plantillaStore';
import { getEquipoNombre }         from '@/data/equipos';
import type {
  HorarioEntrenamiento,
  RegistroJugadorSesion,
} from '@/types';

// Lee registros de una sesión pasada desde localStorage (solo lectura)
function getRegsResumen(sesionId: string): { presentes: number; total: number } {
  try {
    const regs: RegistroJugadorSesion[] = JSON.parse(localStorage.getItem(`aq_reg_${sesionId}`) ?? '[]');
    return { presentes: regs.filter(r => r.asistencia !== 'ausente').length, total: regs.length };
  } catch { return { presentes: 0, total: 0 }; }
}

type MainTab = 'ejercicios' | 'jugadores' | 'notas' | 'historial';

const DIAS = ['', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

// ─── Helpers ─────────────────────────────────────────────────
function formatFechaCard(fecha: string): string {
  const d = new Date(fecha + 'T12:00:00');
  const hoy = new Date(); hoy.setHours(0,0,0,0);
  const man = new Date(hoy); man.setDate(man.getDate()+1);
  const fd  = new Date(d);  fd.setHours(0,0,0,0);
  if (fd.getTime() === hoy.getTime()) return 'HOY';
  if (fd.getTime() === man.getTime()) return 'MAÑANA';
  const DAYS  = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
  const MONTHS = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
  return `${DAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

// ─── StarRating ───────────────────────────────────────────────
function StarRating({ value, onChange, size = 16 }: { value: number | null; onChange?: (v: number) => void; size?: number }) {
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(n => (
        <button key={n} type="button"
          onClick={() => onChange?.(value === n ? 0 : n)}
          className={`transition-transform ${onChange ? 'active:scale-125' : ''}`}
          disabled={!onChange}>
          <Star size={size}
            fill={value !== null && value >= n ? '#F59E0B' : 'none'}
            stroke={value !== null && value >= n ? '#F59E0B' : '#D1D5DB'}
          />
        </button>
      ))}
    </div>
  );
}

// ─── HorarioEditor (modal) ────────────────────────────────────
function HorarioEditor({ teamId, horarios, onSave, onDelete, onClose }: {
  teamId: string;
  horarios: HorarioEntrenamiento[];
  onSave:   (h: HorarioEntrenamiento) => void;
  onDelete: (id: string) => void;
  onClose:  () => void;
}) {
  const [form, setForm] = useState<Omit<HorarioEntrenamiento,'id'|'team_id'|'activo'>>({
    dia_semana: 2, hora_inicio: '18:30', hora_fin: '19:30', campo: '',
  });

  function handleAdd() {
    if (!form.hora_inicio || !form.hora_fin) return;
    onSave({
      id: crypto.randomUUID(),
      team_id: teamId,
      activo: true,
      ...form,
    });
    setForm(f => ({ ...f, hora_inicio: '18:30', hora_fin: '19:30', campo: '' }));
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ animation: 'aq-fadeIn .2s both' }}>
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative mt-auto bg-white rounded-t-3xl p-5 flex flex-col gap-4 max-h-[85vh] overflow-y-auto"
        style={{ animation: 'aq-slideUp .3s cubic-bezier(.5,0,.2,1) both' }}>

        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="font-titulo font-bold text-quarte-negro text-lg">Horario semanal</h2>
          <button onClick={onClose} className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center">
            <X size={18} />
          </button>
        </div>

        {/* Slots existentes */}
        {horarios.filter(h => h.activo).length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="text-xs font-titulo font-bold text-gray-400 uppercase tracking-wider">Franjas activas</p>
            {horarios.filter(h => h.activo).map(h => (
              <div key={h.id} className="flex items-center gap-3 bg-quarte-azulClaro rounded-xl px-3 py-2.5">
                <div className="flex-1">
                  <p className="font-titulo font-semibold text-sm text-quarte-negro">{DIAS[h.dia_semana]}</p>
                  <p className="text-xs text-gray-500">{h.hora_inicio} – {h.hora_fin}{h.campo ? ` · ${h.campo}` : ''}</p>
                </div>
                <button onClick={() => onDelete(h.id)} className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-quarte-rojo">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Añadir franja */}
        <div className="flex flex-col gap-3 bg-gray-50 rounded-2xl p-4">
          <p className="text-xs font-titulo font-bold text-gray-400 uppercase tracking-wider">Añadir franja</p>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500 font-titulo font-semibold">Día de la semana</label>
            <select value={form.dia_semana}
              onChange={e => setForm(f => ({ ...f, dia_semana: +e.target.value }))}
              className="w-full px-3 py-2.5 rounded-xl border-2 border-gray-200 focus:border-quarte-azul outline-none text-sm bg-white font-titulo font-semibold">
              {[1,2,3,4,5].map(d => <option key={d} value={d}>{DIAS[d]}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500 font-titulo font-semibold">Inicio</label>
              <input type="time" value={form.hora_inicio}
                onChange={e => setForm(f => ({ ...f, hora_inicio: e.target.value }))}
                className="px-3 py-2.5 rounded-xl border-2 border-gray-200 focus:border-quarte-azul outline-none text-sm bg-white" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500 font-titulo font-semibold">Fin</label>
              <input type="time" value={form.hora_fin}
                onChange={e => setForm(f => ({ ...f, hora_fin: e.target.value }))}
                className="px-3 py-2.5 rounded-xl border-2 border-gray-200 focus:border-quarte-azul outline-none text-sm bg-white" />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500 font-titulo font-semibold">Campo (opcional)</label>
            <input type="text" value={form.campo} placeholder="Ej: Campo F7-1"
              onChange={e => setForm(f => ({ ...f, campo: e.target.value }))}
              className="px-3 py-2.5 rounded-xl border-2 border-gray-200 focus:border-quarte-azul outline-none text-sm bg-white" />
          </div>

          <button onClick={handleAdd} className="btn-secundario w-full flex items-center justify-center gap-2">
            <Plus size={16} /> Añadir franja
          </button>
        </div>

        <button onClick={onClose} className="btn-primario w-full flex items-center justify-center gap-2">
          <Check size={16} /> Listo
        </button>
      </div>
    </div>
  );
}

// ─── ExercisePicker (modal) ───────────────────────────────────
function ExercisePicker({ selectedIds, onToggle, onClose }: {
  selectedIds: string[];
  onToggle: (id: string) => void;
  onClose: () => void;
}) {
  const store = useEntrenamientosStore();
  const [q, setQ] = useState('');
  const items = store.items.filter(e =>
    !q || e.titulo.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ animation: 'aq-fadeIn .2s both' }}>
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative mt-16 bg-white rounded-t-3xl flex flex-col overflow-hidden"
        style={{ animation: 'aq-slideUp .3s cubic-bezier(.5,0,.2,1) both', height: 'calc(100% - 64px)' }}>

        <div className="p-4 border-b border-gray-100 flex items-center gap-3 flex-shrink-0">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input autoFocus value={q} onChange={e => setQ(e.target.value)}
              placeholder="Buscar ejercicios…"
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-gray-100 text-sm outline-none" />
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
          {items.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-8">Sin resultados</p>
          )}
          {items.map(e => {
            const sel = selectedIds.includes(e.id);
            return (
              <button key={e.id} onClick={() => onToggle(e.id)}
                className={`flex items-center gap-3 p-3 rounded-xl text-left transition-colors
                  ${sel ? 'bg-quarte-azulClaro border-2 border-quarte-azul' : 'bg-gray-50 border-2 border-transparent'}`}>
                <div className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0
                  ${sel ? 'bg-quarte-azul' : 'border-2 border-gray-300'}`}>
                  {sel && <Check size={12} className="text-white" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-titulo font-semibold text-sm text-quarte-negro truncate">{e.titulo}</p>
                  <p className="text-xs text-gray-400 capitalize">{e.categoria} · {e.duracion_min} min</p>
                </div>
              </button>
            );
          })}
        </div>

        <div className="p-4 border-t border-gray-100 flex-shrink-0">
          <button onClick={onClose} className="btn-secundario w-full">
            Confirmar ({selectedIds.length} ejercicios)
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── PlayerRow ────────────────────────────────────────────────
function PlayerRow({ reg, onChange }: {
  reg: RegistroJugadorSesion;
  onChange: (upd: Partial<RegistroJugadorSesion>) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  const AST: { v: RegistroJugadorSesion['asistencia']; label: string; active: string; inactive: string }[] = [
    { v: 'presente', label: 'P', active: 'bg-quarte-verde text-white', inactive: 'bg-gray-100 text-gray-400' },
    { v: 'tarde',    label: 'T', active: 'bg-amber-400 text-white',    inactive: 'bg-gray-100 text-gray-400' },
    { v: 'ausente',  label: 'A', active: 'bg-quarte-rojo text-white',  inactive: 'bg-gray-100 text-gray-400' },
  ];

  const nombre = reg.jugador_nombre.split(' ');
  const displayNombre = nombre[0];
  const displayApell  = nombre.slice(1).join(' ').split(' ')[0];

  return (
    <div className={`bg-white rounded-xl border transition-all ${expanded ? 'border-quarte-azul shadow-sm' : 'border-gray-100'}`}>
      <div className="flex items-center gap-2.5 p-3">
        {/* Avatar inicial */}
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 font-titulo font-bold text-sm
          ${reg.asistencia === 'ausente' ? 'bg-gray-100 text-gray-400' : 'bg-quarte-azulClaro text-quarte-azul'}`}>
          {displayNombre.charAt(0).toUpperCase()}
        </div>

        {/* Nombre */}
        <div className="flex-1 min-w-0">
          <p className={`font-titulo font-semibold text-sm leading-tight truncate ${reg.asistencia === 'ausente' ? 'text-gray-400 line-through' : 'text-quarte-negro'}`}>
            {displayNombre} {displayApell}
          </p>
          {reg.observacion && (
            <p className="text-[10px] text-gray-400 truncate italic">{reg.observacion}</p>
          )}
        </div>

        {/* Asistencia */}
        <div className="flex gap-1">
          {AST.map(a => (
            <button key={a.v} onClick={() => onChange({ asistencia: a.v })}
              className={`w-7 h-7 rounded-lg text-xs font-titulo font-bold transition-colors
                ${reg.asistencia === a.v ? a.active : a.inactive}`}>
              {a.label}
            </button>
          ))}
        </div>

        {/* Expand */}
        <button onClick={() => setExpanded(v => !v)} className="w-7 h-7 flex items-center justify-center text-gray-400">
          {expanded ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
        </button>
      </div>

      {/* Expanded section: stars + observation */}
      {expanded && reg.asistencia !== 'ausente' && (
        <div className="px-3 pb-3 flex flex-col gap-2 border-t border-gray-50 pt-2"
          style={{ animation: 'aq-fadeUp .2s both' }}>
          <div className="flex items-center gap-3">
            <span className="text-xs font-titulo font-semibold text-gray-500 w-20">Valoración</span>
            <StarRating value={reg.valoracion} onChange={v => onChange({ valoracion: v || null })} size={18} />
          </div>
          <div className="flex items-start gap-3">
            <span className="text-xs font-titulo font-semibold text-gray-500 w-20 pt-2">Observación</span>
            <textarea
              value={reg.observacion}
              onChange={e => onChange({ observacion: e.target.value })}
              placeholder="Añade una nota sobre este jugador…"
              rows={2}
              className="flex-1 text-xs px-3 py-2 rounded-xl border-2 border-gray-200
                         focus:border-quarte-azul outline-none resize-none bg-white font-cuerpo"
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── PÁGINA PRINCIPAL ─────────────────────────────────────────
export default function SesionEntrenoPage() {
  const navigate                = useNavigate();
  const { perfil, activeTeamId } = usePerfilStore();
  const sesionStore              = useSesionEntrenoStore();
  const entrenamientosStore      = useEntrenamientosStore();
  const plantillaStore           = usePlantillaStore();

  const [tab,              setTab]              = useState<MainTab>('ejercicios');
  const [showHorario,      setShowHorario]      = useState(false);
  const [showPicker,       setShowPicker]       = useState(false);
  const [showFinalizar,    setShowFinalizar]     = useState(false);
  const [guardando,        setGuardando]         = useState(false);
  const [finalizado,       setFinalizado]        = useState(false);
  const [confirmDelete,    setConfirmDelete]     = useState<string | null>(null); // sesionId a eliminar

  // Cargar datos
  useEffect(() => {
    if (!activeTeamId || !perfil) return;
    sesionStore.cargar(activeTeamId);
    if (perfil) entrenamientosStore.cargar(perfil.id);
    plantillaStore.cargar(activeTeamId);
  }, [activeTeamId, perfil?.id]);

  // Inicializar / abrir sesión cuando el store carga
  useEffect(() => {
    if (!activeTeamId || sesionStore.teamId !== activeTeamId) return;
    const { sesion, horario, fecha } = sesionStore.getProximoEntreno();
    if (sesion) {
      sesionStore.abrirSesion(sesion);
    } else if (horario && fecha) {
      sesionStore.crearSesion(activeTeamId, fecha, horario);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sesionStore.teamId, sesionStore.horarios.length, sesionStore.sesiones.length]);

  // Inicializar registros cuando llegan los jugadores
  useEffect(() => {
    if (sesionStore.sesionActual && plantillaStore.jugadores.length > 0) {
      sesionStore.initRegistros(plantillaStore.jugadores);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sesionStore.sesionActual?.id, plantillaStore.jugadores.length]);

  if (!perfil || !activeTeamId) return null;

  const { sesionActual, registros, horarios } = sesionStore;
  const equipoNombre = getEquipoNombre(activeTeamId);
  const hasHorario   = horarios.some(h => h.team_id === activeTeamId && h.activo);
  const ejercicios   = entrenamientosStore.items;

  // ── Handlers ──────────────────────────────────────────────
  const handleToggleEjercicio = useCallback((id: string) => {
    if (!sesionActual) return;
    const ids = sesionActual.exercise_ids.includes(id)
      ? sesionActual.exercise_ids.filter(x => x !== id)
      : [...sesionActual.exercise_ids, id];
    sesionStore.actualizarSesion({ exercise_ids: ids });
  }, [sesionActual, sesionStore]);

  async function handleIniciar() {
    sesionStore.actualizarSesion({ status: 'active' });
    setTab('jugadores');
  }

  async function handleFinalizar() {
    setGuardando(true);
    sesionStore.actualizarSesion({ status: 'completed', finalizado_en: Date.now() });
    setTimeout(() => {
      setGuardando(false);
      setFinalizado(true);
      setShowFinalizar(false);
    }, 600);
  }

  // ── Estado: sin horario configurado ───────────────────────
  if (!hasHorario && !sesionActual) {
    return (
      <div className="flex flex-col min-h-screen bg-quarte-gris">
        <div className="bg-quarte-verde text-white px-4 pt-4 pb-4 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="font-titulo font-bold text-lg">Entrenamientos</h1>
            <p className="text-green-200 text-xs">{equipoNombre}</p>
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6">
          <div className="w-20 h-20 rounded-3xl bg-quarte-verde/10 flex items-center justify-center">
            <Dumbbell size={40} className="text-quarte-verde" />
          </div>
          <div className="text-center">
            <h2 className="font-titulo font-bold text-xl text-quarte-negro mb-2">
              Configura el horario
            </h2>
            <p className="text-sm text-gray-500 leading-relaxed">
              Define los días y horas de entrenamiento de tu equipo
              para que la app calcule automáticamente la próxima sesión.
            </p>
          </div>
          <button onClick={() => setShowHorario(true)}
            className="btn-secundario flex items-center gap-2 px-8">
            <Settings size={16} /> Configurar horario
          </button>
        </div>

        {showHorario && (
          <HorarioEditor
            teamId={activeTeamId}
            horarios={horarios.filter(h => h.team_id === activeTeamId)}
            onSave={sesionStore.guardarHorario}
            onDelete={sesionStore.eliminarHorario}
            onClose={() => setShowHorario(false)}
          />
        )}
      </div>
    );
  }

  // ── Estado: cargando sesión ────────────────────────────────
  if (!sesionActual) {
    return (
      <div className="flex flex-col min-h-screen bg-quarte-gris items-center justify-center">
        <div className="w-8 h-8 border-3 border-quarte-verde border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // ── Status config ─────────────────────────────────────────
  const STATUS_CFG = {
    pending:   { label: 'Pendiente', badge: 'bg-amber-100 text-amber-700',  bg: 'bg-quarte-verde' },
    active:    { label: 'En curso',  badge: 'bg-green-100 text-green-700',   bg: 'bg-quarte-verde' },
    completed: { label: 'Finalizado',badge: 'bg-blue-100 text-blue-700',    bg: 'bg-quarte-verde' },
  };
  const sc = STATUS_CFG[sesionActual.status];
  const fechaLabel = formatFechaCard(sesionActual.fecha);

  // ── Computed stats ─────────────────────────────────────────
  const presentesCount = registros.filter(r => r.asistencia !== 'ausente').length;
  const ausentes       = registros.filter(r => r.asistencia === 'ausente').length;
  const tardes         = registros.filter(r => r.asistencia === 'tarde').length;

  // ── TABS ──────────────────────────────────────────────────
  const TABS = [
    { id: 'ejercicios' as MainTab, icon: Dumbbell, label: 'Sesión'    },
    { id: 'jugadores'  as MainTab, icon: Users,    label: 'Jugadores' },
    { id: 'notas'      as MainTab, icon: FileText, label: 'Notas'     },
    { id: 'historial'  as MainTab, icon: History,  label: 'Historial' },
  ];
  const tabIdx = TABS.findIndex(t => t.id === tab);
  const sesionesOrdenadas = [...sesionStore.sesiones]
    .filter(s => s.team_id === activeTeamId)
    .sort((a, b) => b.creado_en - a.creado_en);

  return (
    <div className="flex flex-col min-h-screen bg-quarte-gris">

      {/* Header */}
      <div className={`${sc.bg} text-white px-4 pt-4 pb-0`}>
        <div className="flex items-center gap-3 pb-3">
          <button onClick={() => navigate(-1)}
            className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <ArrowLeft size={18} />
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="font-titulo font-bold text-base leading-tight">Entrenamiento</h1>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-titulo font-bold ${sc.badge}`}>
                {sc.label}
              </span>
            </div>
            <div className="flex items-center gap-3 text-green-200 text-xs mt-0.5 flex-wrap">
              <span>{fechaLabel}</span>
              <span className="flex items-center gap-1">
                <Clock size={10} /> {sesionActual.hora_inicio} – {sesionActual.hora_fin}
              </span>
              {sesionActual.campo && (
                <span className="flex items-center gap-1">
                  <MapPin size={10} /> {sesionActual.campo}
                </span>
              )}
            </div>
          </div>
          <button onClick={() => setShowHorario(true)}
            className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <Settings size={16} />
          </button>
        </div>

        {/* Tab bar */}
        <div className="relative flex">
          <div className="absolute bottom-0 h-0.5 bg-white pointer-events-none"
            style={{ width: '25%', transform: `translateX(${tabIdx * 100}%)`, transition: 'transform .3s cubic-bezier(.5,0,.2,1)' }} />
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-titulo font-semibold transition-colors
                ${tab === t.id ? 'text-white' : 'text-green-300 hover:text-white'}`}>
              <t.icon size={13} /> {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">

        {/* ── TAB: EJERCICIOS ── */}
        {tab === 'ejercicios' && (
          <div className="p-4 max-w-lg mx-auto flex flex-col gap-3">

            {/* Ejercicios seleccionados */}
            {sesionActual.exercise_ids.length > 0 ? (
              <div className="flex flex-col gap-2">
                <p className="font-titulo text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Ejercicios planificados ({sesionActual.exercise_ids.length})
                </p>
                {sesionActual.exercise_ids.map(eid => {
                  const ej = ejercicios.find(e => e.id === eid);
                  if (!ej) return null;
                  return (
                    <div key={eid} className="card flex items-center gap-3 p-3">
                      <div className="w-9 h-9 rounded-xl bg-quarte-rojo/10 flex items-center justify-center flex-shrink-0">
                        <Dumbbell size={16} className="text-quarte-rojo" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-titulo font-semibold text-sm text-quarte-negro truncate">{ej.titulo}</p>
                        <p className="text-xs text-gray-400 capitalize">{ej.categoria} · {ej.duracion_min} min</p>
                      </div>
                      <button onClick={() => handleToggleEjercicio(eid)}
                        className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center text-quarte-rojo">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center py-10 text-gray-400 gap-3">
                <Dumbbell size={40} className="opacity-20" />
                <p className="font-titulo font-semibold text-sm">Sin ejercicios planificados</p>
                <p className="text-xs text-center text-gray-400">Añade ejercicios de la biblioteca para preparar la sesión</p>
              </div>
            )}

            {/* Botón añadir ejercicios */}
            {sesionActual.status !== 'completed' && (
              <button onClick={() => setShowPicker(true)}
                className="flex items-center gap-2 border-2 border-dashed border-quarte-azul/40
                           rounded-xl py-3 px-4 text-quarte-azul text-sm font-titulo font-semibold
                           hover:bg-quarte-azulClaro transition-colors">
                <Plus size={16} /> Añadir ejercicios de la biblioteca
              </button>
            )}

            {/* Acción principal */}
            {sesionActual.status === 'pending' && (
              <button onClick={handleIniciar}
                className="btn-primario w-full flex items-center justify-center gap-2 mt-2">
                <Play size={16} /> Iniciar entrenamiento
              </button>
            )}
          </div>
        )}

        {/* ── TAB: JUGADORES ── */}
        {tab === 'jugadores' && (
          <div className="p-4 max-w-lg mx-auto flex flex-col gap-3">

            {/* Stats rápidas */}
            {registros.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Presentes', value: presentesCount,    color: 'text-quarte-verde' },
                  { label: 'Tarde',     value: tardes,            color: 'text-amber-500' },
                  { label: 'Ausentes',  value: ausentes,          color: 'text-quarte-rojo' },
                ].map(s => (
                  <div key={s.label} className="card flex flex-col items-center py-2 px-1 gap-0.5">
                    <span className={`font-titulo font-extrabold text-2xl leading-none ${s.color}`}>{s.value}</span>
                    <span className="text-[10px] text-gray-400 font-titulo">{s.label}</span>
                  </div>
                ))}
              </div>
            )}

            {registros.length === 0 ? (
              <div className="flex flex-col items-center py-12 text-gray-400 gap-3">
                <Users size={40} className="opacity-20" />
                <p className="font-titulo font-semibold text-sm">Sin jugadores cargados</p>
                <p className="text-xs text-center">Ve a Plantilla y asegúrate de tener jugadores en el equipo.</p>
              </div>
            ) : (
              <>
                <p className="font-titulo text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Jugadores ({registros.length})
                </p>
                {registros
                  .slice()
                  .sort((a, b) => a.jugador_nombre.localeCompare(b.jugador_nombre))
                  .map(reg => (
                    <PlayerRow
                      key={reg.jugador_id}
                      reg={reg}
                      onChange={upd => sesionStore.actualizarRegistro(reg.jugador_id, upd)}
                    />
                  ))}
              </>
            )}

            {sesionActual.status === 'pending' && (
              <div className="card bg-amber-50 border border-amber-200 flex items-start gap-3">
                <Play size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700 font-cuerpo">
                  Inicia el entrenamiento desde la pestaña <strong>Sesión</strong> para habilitar el registro completo.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ── TAB: NOTAS ── */}
        {tab === 'notas' && (
          <div className="p-4 max-w-lg mx-auto flex flex-col gap-4">

            {/* Valoración sesión */}
            <div className="card">
              <p className="font-titulo font-bold text-sm text-quarte-negro mb-3">Valoración de la sesión</p>
              <div className="flex items-center gap-3">
                <StarRating
                  value={sesionActual.valoracion_sesion}
                  onChange={v => sesionStore.actualizarSesion({ valoracion_sesion: v || null })}
                  size={28}
                />
                <span className="text-sm text-gray-400 font-titulo">
                  {sesionActual.valoracion_sesion
                    ? ['','Muy mala','Mala','Regular','Buena','Excelente'][sesionActual.valoracion_sesion]
                    : 'Sin valorar'}
                </span>
              </div>
            </div>

            {/* Notas generales */}
            <div className="card">
              <p className="font-titulo font-bold text-sm text-quarte-negro mb-3">Notas generales</p>
              <textarea
                value={sesionActual.notas_generales}
                onChange={e => sesionStore.actualizarSesion({ notas_generales: e.target.value })}
                placeholder="Observaciones sobre la sesión: actitud del grupo, ejercicios que funcionaron, aspectos a mejorar…"
                rows={5}
                disabled={sesionActual.status === 'completed'}
                className="w-full text-sm px-3 py-2.5 rounded-xl border-2 border-gray-200
                           focus:border-quarte-azul outline-none resize-none font-cuerpo
                           disabled:bg-gray-50 disabled:text-gray-500"
              />
            </div>

            {/* Resumen si completado */}
            {sesionActual.status === 'completed' && (
              <div className="card bg-blue-50 border border-blue-100">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 size={18} className="text-quarte-azul" />
                  <p className="font-titulo font-bold text-sm text-quarte-azul">Sesión finalizada</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'Asistencia', value: registros.length > 0 ? `${Math.round((presentesCount/registros.length)*100)}%` : '—' },
                    { label: 'Ejercicios', value: sesionActual.exercise_ids.length },
                    { label: 'Valoración', value: sesionActual.valoracion_sesion ? `${sesionActual.valoracion_sesion}/5 ⭐` : '—' },
                    { label: 'Presentes',  value: `${presentesCount}/${registros.length}` },
                  ].map(s => (
                    <div key={s.label} className="bg-white rounded-xl px-3 py-2">
                      <p className="text-[10px] text-gray-400 font-titulo">{s.label}</p>
                      <p className="font-titulo font-bold text-sm text-quarte-negro">{s.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Botón Finalizar */}
            {sesionActual.status === 'active' && (
              <button onClick={() => setShowFinalizar(true)}
                className="btn-primario w-full flex items-center justify-center gap-2">
                <CheckCircle2 size={16} /> Finalizar entrenamiento
              </button>
            )}
          </div>
        )}

        {/* ── TAB: HISTORIAL ── */}
        {tab === 'historial' && (
          <div className="p-4 max-w-lg mx-auto flex flex-col gap-3">

            <p className="font-titulo text-xs font-bold text-gray-400 uppercase tracking-wider">
              Todas las sesiones ({sesionesOrdenadas.length})
            </p>

            {sesionesOrdenadas.length === 0 && (
              <div className="flex flex-col items-center py-14 text-gray-400 gap-3">
                <History size={40} className="opacity-20" />
                <p className="font-titulo font-semibold text-sm">Sin sesiones registradas</p>
                <p className="text-xs text-center">Las sesiones aparecerán aquí una vez las inicies.</p>
              </div>
            )}

            {sesionesOrdenadas.map(s => {
              const { presentes, total } = getRegsResumen(s.id);
              const esCurrent = sesionActual?.id === s.id;
              const STATUS_LABEL: Record<string, { label: string; cls: string }> = {
                pending:   { label: 'Pendiente',  cls: 'bg-amber-100 text-amber-700' },
                active:    { label: 'En curso',   cls: 'bg-green-100 text-green-700' },
                completed: { label: 'Finalizado', cls: 'bg-blue-100 text-blue-700'   },
              };
              const { label: stLabel, cls: stCls } = STATUS_LABEL[s.status] ?? STATUS_LABEL.pending;

              return (
                <div key={s.id}
                  className={`card flex flex-col gap-3 ${esCurrent ? 'border-2 border-quarte-verde' : ''}`}>

                  {/* Fila superior: fecha + badge + botones */}
                  <div className="flex items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-titulo font-bold text-sm text-quarte-negro">
                          {formatFechaCard(s.fecha)}
                        </p>
                        {esCurrent && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-quarte-verde text-white font-titulo font-bold">
                            ACTUAL
                          </span>
                        )}
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-titulo font-bold ${stCls}`}>
                          {stLabel}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1 flex-wrap text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <Clock size={10} /> {s.hora_inicio}–{s.hora_fin}
                        </span>
                        {s.campo && (
                          <span className="flex items-center gap-1">
                            <MapPin size={10} /> {s.campo}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Acciones */}
                    <div className="flex gap-1.5 flex-shrink-0">
                      {s.status === 'completed' && (
                        <button
                          onClick={() => { sesionStore.reabrirSesion(s.id); setTab('jugadores'); }}
                          title="Reabrir para editar"
                          className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200
                                     flex items-center justify-center text-amber-600
                                     hover:bg-amber-100 transition-colors">
                          <RotateCcw size={14} />
                        </button>
                      )}
                      <button
                        onClick={() => setConfirmDelete(s.id)}
                        title="Eliminar sesión"
                        className="w-8 h-8 rounded-xl bg-red-50 border border-red-100
                                   flex items-center justify-center text-quarte-rojo
                                   hover:bg-red-100 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Fila inferior: stats + notas */}
                  <div className="flex items-center gap-3 flex-wrap">
                    {total > 0 && (
                      <span className={`text-xs font-titulo font-bold px-2 py-1 rounded-lg
                        ${presentes === total ? 'bg-green-50 text-quarte-verde' : 'bg-gray-100 text-gray-600'}`}>
                        {presentes}/{total} presentes
                      </span>
                    )}
                    {s.exercise_ids.length > 0 && (
                      <span className="text-xs font-titulo font-semibold text-gray-500">
                        {s.exercise_ids.length} ejercicios
                      </span>
                    )}
                    {s.valoracion_sesion && (
                      <span className="flex items-center gap-1 text-xs font-titulo font-bold text-amber-600">
                        <Star size={12} fill="#F59E0B" stroke="none" />
                        {s.valoracion_sesion}/5
                      </span>
                    )}
                    {s.notas_generales.trim() && (
                      <p className="text-xs text-gray-400 italic truncate w-full">
                        "{s.notas_generales.trim().slice(0, 60)}{s.notas_generales.length > 60 ? '…' : ''}"
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Confirm eliminar sesión */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => setConfirmDelete(null)} />
          <div className="relative w-full bg-white rounded-t-3xl p-6 flex flex-col gap-4"
            style={{ animation: 'aq-slideUp .25s cubic-bezier(.5,0,.2,1) both' }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
                <AlertTriangle size={20} className="text-quarte-rojo" />
              </div>
              <div>
                <p className="font-titulo font-bold text-base text-quarte-negro">¿Eliminar esta sesión?</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Se borrarán todos los registros de jugadores y notas. Las estadísticas se actualizarán.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)} className="btn-outline flex-1">
                Cancelar
              </button>
              <button
                onClick={() => {
                  sesionStore.eliminarSesion(confirmDelete);
                  setConfirmDelete(null);
                }}
                className="flex-1 bg-quarte-rojo text-white rounded-xl py-3 font-titulo font-bold text-sm
                           flex items-center justify-center gap-2 active:scale-[0.98] transition-transform">
                <Trash2 size={15} /> Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm finalizar */}
      {showFinalizar && (
        <div className="fixed inset-0 z-50 flex items-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowFinalizar(false)} />
          <div className="relative w-full bg-white rounded-t-3xl p-6 flex flex-col gap-4"
            style={{ animation: 'aq-slideUp .25s cubic-bezier(.5,0,.2,1) both' }}>
            <p className="font-titulo font-bold text-lg text-quarte-negro">¿Finalizar el entrenamiento?</p>
            <p className="text-sm text-gray-500">
              Se guardarán todos los registros de jugadores, notas y la valoración. Esta acción no se puede deshacer.
            </p>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="font-titulo font-extrabold text-2xl text-quarte-negro">{presentesCount}</p>
                <p className="text-xs text-gray-400">Presentes</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="font-titulo font-extrabold text-2xl text-quarte-negro">{sesionActual.exercise_ids.length}</p>
                <p className="text-xs text-gray-400">Ejercicios</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowFinalizar(false)} disabled={guardando} className="btn-outline flex-1">
                Cancelar
              </button>
              <button onClick={handleFinalizar} disabled={guardando}
                className="btn-primario flex-1 flex items-center justify-center gap-2">
                {guardando
                  ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : <CheckCircle2 size={16} />}
                {guardando ? 'Guardando…' : 'Finalizar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Celebración finalizado */}
      {finalizado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          style={{ animation: 'aq-fadeIn .2s both' }}>
          <div className="bg-white rounded-3xl p-8 mx-6 flex flex-col items-center gap-4 text-center"
            style={{ animation: 'aq-toastIn .35s cubic-bezier(.34,1.6,.5,1) both' }}>
            <div className="w-16 h-16 rounded-full bg-quarte-verde/10 flex items-center justify-center">
              <CheckCircle2 size={36} className="text-quarte-verde" />
            </div>
            <div>
              <p className="font-titulo font-bold text-xl text-quarte-negro">¡Entrenamiento completado!</p>
              <p className="text-sm text-gray-500 mt-1">Los datos se han guardado y aparecerán en Estadísticas.</p>
            </div>
            <div className="flex gap-3 w-full">
              <button onClick={() => { setFinalizado(false); navigate('/estadisticas'); }}
                className="btn-outline flex-1 text-sm">Ver stats</button>
              <button onClick={() => { setFinalizado(false); navigate('/inicio'); }}
                className="btn-primario flex-1 text-sm">Inicio</button>
            </div>
          </div>
        </div>
      )}

      {/* Modales */}
      {showHorario && (
        <HorarioEditor
          teamId={activeTeamId}
          horarios={horarios.filter(h => h.team_id === activeTeamId)}
          onSave={sesionStore.guardarHorario}
          onDelete={sesionStore.eliminarHorario}
          onClose={() => setShowHorario(false)}
        />
      )}

      {showPicker && (
        <ExercisePicker
          selectedIds={sesionActual.exercise_ids}
          onToggle={handleToggleEjercicio}
          onClose={() => setShowPicker(false)}
        />
      )}
    </div>
  );
}
