// ============================================================
// PasarListaPage — Pase de lista independiente
// Ruta: /pasar-lista
// Sin relación con la biblioteca de entrenamientos.
// Guarda automáticamente al marcar cada jugador.
// ============================================================
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckSquare, Users } from 'lucide-react';
import { usePerfilStore } from '@/stores/perfilStore';
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

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      {/* Info jugador */}
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

      {/* Botones de estado */}
      <div className="flex border-t border-gray-100">
        {ESTADOS.map(est => (
          <button key={est.status} onClick={() => onCambiar(est.status)}
            className={`flex-1 py-2 text-base transition-colors
              ${status === est.status ? `${est.bg}` : 'hover:bg-gray-50'}`}>
            {est.emoji}
          </button>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// PasarListaPage
// ============================================================
export default function PasarListaPage() {
  const navigate       = useNavigate();
  const { perfil }     = usePerfilStore();
  const plantillaStore = usePlantillaStore();

  // records: { [player_id]: AttendanceStatus }
  const [records,    setRecords]    = useState<Record<string, AttendanceStatus>>({});
  const [sessionId,  setSessionId]  = useState<string | null>(null);
  const [guardando,  setGuardando]  = useState(false);

  const fecha = hoy();

  // Carga jugadores y sesión de hoy
  useEffect(() => {
    if (!perfil) return;
    if (plantillaStore.jugadores.length === 0) {
      plantillaStore.cargar(perfil.id);
    }
    (async () => {
      const { data } = await supabase
        .from('lista_sesiones')
        .select('id, records')
        .eq('coach_id', perfil.id)
        .eq('date', fecha)
        .maybeSingle();
      if (data) {
        setSessionId(data.id as string);
        setRecords((data.records as Record<string, AttendanceStatus>) ?? {});
      }
    })();
  }, [perfil?.id]);

  if (!perfil) return null;

  const jugadores = [...plantillaStore.jugadores]
    .sort((a, b) => (ORDEN[a.posicion] ?? 4) - (ORDEN[b.posicion] ?? 4));

  const presentes = Object.values(records).filter(s => s === 'present' || s === 'late').length;
  const total     = jugadores.length;

  // Guarda (upsert) en Supabase
  async function persistir(newRecords: Record<string, AttendanceStatus>) {
    if (!perfil) return;
    setGuardando(true);
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from('lista_sesiones')
      .upsert(
        {
          id:         sessionId ?? crypto.randomUUID(),
          coach_id:   perfil.id,
          date:       fecha,
          records:    newRecords,
          updated_at: now,
        },
        { onConflict: 'coach_id,date' }
      )
      .select('id')
      .maybeSingle();
    if (!error && data && !sessionId) setSessionId((data as { id: string }).id);
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

  // Grupos por posición
  const grupos = [
    { label: 'Porteros',       items: jugadores.filter(j => j.posicion === 'POR') },
    { label: 'Defensas',       items: jugadores.filter(j => j.posicion === 'DEF') },
    { label: 'Mediocampistas', items: jugadores.filter(j => j.posicion === 'MED') },
    { label: 'Delanteros',     items: jugadores.filter(j => j.posicion === 'DEL') },
  ].filter(g => g.items.length > 0);

  const fechaDisplay = new Date(fecha + 'T12:00:00').toLocaleDateString('es-ES', {
    weekday: 'long', day: 'numeric', month: 'long',
  });

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
            <p className="text-blue-200 text-xs capitalize">{fechaDisplay}</p>
          </div>
          {guardando && (
            <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
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

      {/* Lista */}
      <div className="flex-1 overflow-y-auto p-4 max-w-lg mx-auto w-full flex flex-col gap-5">
        {plantillaStore.cargando ? (
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
      </div>
    </div>
  );
}
