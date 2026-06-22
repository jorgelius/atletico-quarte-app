// ============================================================
// AsistenciaPage — Pase de lista de un entrenamiento
// Ruta: /entrenamientos/:id/asistencia
// ============================================================
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckSquare, Users, FileText } from 'lucide-react';
import { usePerfilStore } from '@/stores/perfilStore';
import { usePlantillaStore } from '@/stores/plantillaStore';
import { useAsistenciaStore } from '@/stores/asistenciaStore';
import { supabase } from '@/data/supabaseClient';
import type { Entrenamiento, Jugador, AttendanceStatus } from '@/types';

// Orden posiciones: porteros primero, luego defensas, medios, delanteros
const ORDEN_POSICION: Record<string, number> = { POR: 0, DEF: 1, MED: 2, DEL: 3 };

const ESTADO_CONFIG: {
  status: AttendanceStatus;
  label:  string;
  emoji:  string;
  bg:     string;
  text:   string;
}[] = [
  { status: 'present',   label: 'Presente',   emoji: '✅', bg: 'bg-green-100',  text: 'text-green-700'  },
  { status: 'late',      label: 'Tarde',       emoji: '⚠️', bg: 'bg-amber-100',  text: 'text-amber-700'  },
  { status: 'justified', label: 'Justificado', emoji: '📋', bg: 'bg-blue-100',   text: 'text-blue-700'   },
  { status: 'absent',    label: 'Ausente',     emoji: '❌', bg: 'bg-red-100',    text: 'text-red-700'    },
];

function getEstadoConfig(status: AttendanceStatus) {
  return ESTADO_CONFIG.find(c => c.status === status) ?? ESTADO_CONFIG[3];
}

// ── Jugador row ──────────────────────────────────────────────
function JugadorFila({
  jugador,
  status,
  onCambiar,
}: {
  jugador:   Jugador;
  status:    AttendanceStatus | null;
  onCambiar: (status: AttendanceStatus) => void;
}) {
  const cfg = status ? getEstadoConfig(status) : null;
  const [lastTapped, setLastTapped] = useState<AttendanceStatus | null>(null);

  function handleCambiar(s: AttendanceStatus) {
    setLastTapped(s);
    setTimeout(() => setLastTapped(null), 380);
    onCambiar(s);
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 px-3 py-2.5">
        {/* Avatar + dorsal */}
        <div className="w-10 h-10 rounded-full bg-quarte-azulClaro flex items-center justify-center flex-shrink-0 overflow-hidden">
          {jugador.foto_b64 ? (
            <img src={jugador.foto_b64} alt={jugador.nombre}
              className="w-full h-full object-cover" />
          ) : (
            <span className="font-titulo font-bold text-quarte-azul text-sm">{jugador.dorsal}</span>
          )}
        </div>

        {/* Nombre */}
        <div className="flex-1 min-w-0">
          <p className="font-titulo font-semibold text-sm text-quarte-negro truncate">
            {jugador.nombre} {jugador.apellidos}
          </p>
          <p className="text-xs text-gray-400">
            #{jugador.dorsal} · {jugador.posicion}
          </p>
        </div>

        {/* Estado actual */}
        {cfg && (
          <span className={`text-xs font-titulo font-bold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.text}`}>
            {cfg.emoji} {cfg.label}
          </span>
        )}
      </div>

      {/* Botones de estado */}
      <div className="flex border-t border-gray-100">
        {ESTADO_CONFIG.map(est => (
          <button
            key={est.status}
            onClick={() => handleCambiar(est.status)}
            className={`flex-1 py-2 text-xs font-titulo font-semibold transition-colors
              ${status === est.status
                ? `${est.bg} ${est.text}`
                : 'text-gray-400 hover:bg-gray-50'}`}
            style={lastTapped === est.status ? { animation: 'aq-pop .35s cubic-bezier(.34,1.6,.5,1)' } : undefined}>
            {est.emoji}
          </button>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// AsistenciaPage
// ============================================================
export default function AsistenciaPage() {
  const { id: trainingId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { perfil } = usePerfilStore();
  const plantillaStore = usePlantillaStore();
  const asistenciaStore = useAsistenciaStore();

  const [entrenamiento, setEntrenamiento] = useState<Entrenamiento | null>(null);
  const [cargandoEntreno, setCargandoEntreno] = useState(true);
  const [marcandoTodos, setMarcandoTodos] = useState(false);

  // Carga entrenamiento + jugadores + asistencia existente
  useEffect(() => {
    if (!perfil || !trainingId) return;

    // Jugadores del equipo
    if (plantillaStore.jugadores.length === 0) {
      plantillaStore.cargar(perfil.id);
    }

    // Datos del entrenamiento
    (async () => {
      setCargandoEntreno(true);
      const { data, error } = await supabase
        .from('trainings')
        .select('*')
        .eq('id', trainingId)
        .maybeSingle();
      if (error) console.error('[AsistenciaPage] cargar entreno:', error.message);
      if (data) {
        setEntrenamiento({
          id:                data.id,
          author_id:         data.coach_id ?? '',
          titulo:            data.nombre   ?? '',
          categoria:         data.categoria ?? 'otros',
          nivel:             data.nivel    ?? 'todos',
          duracion_min:      data.duracion_min ?? 0,
          num_jugadores_min: data.num_jugadores_min ?? 0,
          num_jugadores_max: data.num_jugadores_max ?? 0,
          material:          [],
          descripcion:       data.descripcion ?? '',
          instrucciones:     [],
          fotos_b64:         [],
          es_sugerido:       data.es_sugerido ?? false,
          creado_en:         data.created_at ? new Date(data.created_at as string).getTime() : Date.now(),
          actualizado_en:    Date.now(),
        });
      }
      setCargandoEntreno(false);
    })();

    // Asistencia existente
    asistenciaStore.cargarAsistencia(trainingId);
  }, [perfil?.id, trainingId]);

  if (!perfil || !trainingId) return null;
  if (cargandoEntreno) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-3">
        <div style={{ animation: 'aq-bob 1s ease-in-out infinite' }}>
          <div className="w-8 h-8 rounded-full border-[3px] border-quarte-azul border-t-transparent"
            style={{ animation: 'aq-spin .8s linear infinite' }} />
        </div>
        <p className="text-xs text-gray-400 font-titulo">Cargando…</p>
      </div>
    );
  }

  const registros     = asistenciaStore.registros[trainingId] ?? [];
  const jugadores     = [...plantillaStore.jugadores]
    .sort((a, b) => (ORDEN_POSICION[a.posicion] ?? 4) - (ORDEN_POSICION[b.posicion] ?? 4));
  const totalJugadores = jugadores.length;
  const presentes     = registros.filter(r => r.status === 'present' || r.status === 'late').length;

  function getStatus(jugadorId: string): AttendanceStatus | null {
    return registros.find(r => r.player_id === jugadorId)?.status ?? null;
  }

  async function handleCambiar(jugadorId: string, status: AttendanceStatus) {
    await asistenciaStore.registrarAsistencia(trainingId!, jugadorId, status);
  }

  async function handleMarcarTodos() {
    setMarcandoTodos(true);
    try {
      await asistenciaStore.marcarTodosPresentes(trainingId!, jugadores.map(j => j.id));
    } finally {
      setMarcandoTodos(false);
    }
  }

  // Agrupar por posición
  const grupos: { label: string; jugadores: Jugador[] }[] = [
    { label: 'Porteros',     jugadores: jugadores.filter(j => j.posicion === 'POR') },
    { label: 'Defensas',     jugadores: jugadores.filter(j => j.posicion === 'DEF') },
    { label: 'Mediocampistas', jugadores: jugadores.filter(j => j.posicion === 'MED') },
    { label: 'Delanteros',   jugadores: jugadores.filter(j => j.posicion === 'DEL') },
  ].filter(g => g.jugadores.length > 0);

  const porcentaje = totalJugadores > 0 ? Math.round((presentes / totalJugadores) * 100) : 0;

  return (
    <div className="flex flex-col min-h-screen bg-quarte-gris">
      {/* Cabecera */}
      <div className="bg-quarte-azul text-white px-4 pt-4 pb-4">
        <div className="flex items-center gap-3 mb-3">
          <button onClick={() => navigate('/entrenamientos')}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/20 hover:bg-white/30">
            <ArrowLeft size={20} />
          </button>
          <div className="flex-1">
            <h1 className="font-titulo text-lg font-bold leading-tight">
              {entrenamiento?.titulo ?? 'Entrenamiento'}
            </h1>
            <p className="text-blue-200 text-xs flex items-center gap-1">
              <FileText size={10} /> Pase de lista
            </p>
          </div>
        </div>

        {/* Contador */}
        <div className="bg-white/10 rounded-2xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users size={18} />
            <span className="font-titulo font-bold text-lg">{presentes} / {totalJugadores}</span>
            <span className="text-blue-200 text-sm font-cuerpo">presentes</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-titulo font-bold text-lg">{porcentaje}%</span>
            <button
              onClick={handleMarcarTodos}
              disabled={marcandoTodos || totalJugadores === 0}
              className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 px-3 py-1.5
                         rounded-xl text-xs font-titulo font-semibold transition-colors disabled:opacity-50">
              {marcandoTodos
                ? <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : <CheckSquare size={14} />}
              Todos presentes
            </button>
          </div>
        </div>
      </div>

      {/* Lista */}
      <div className="flex-1 overflow-y-auto p-4 max-w-lg mx-auto w-full flex flex-col gap-5">
        {asistenciaStore.cargando ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-3 border-quarte-azul border-t-transparent rounded-full animate-spin" />
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
                {grupo.label} ({grupo.jugadores.length})
              </p>
              {grupo.jugadores.map(j => (
                <JugadorFila
                  key={j.id}
                  jugador={j}
                  status={getStatus(j.id)}
                  onCambiar={status => handleCambiar(j.id, status)}
                />
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
