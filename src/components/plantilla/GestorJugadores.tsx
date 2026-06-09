// CRUD de jugadores — lista + formulario de alta/edición
import { useState } from 'react';
import { Plus, Edit2, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import type { Jugador, Posicion } from '@/types';
import type { EstadisticaJugador } from '@/stores/asistenciaStore';
import { Avatar } from '@/components/ui/Avatar';

const COLOR_POS: Record<Posicion, string> = {
  POR: 'bg-amber-400 text-white',
  DEF: 'bg-blue-500 text-white',
  MED: 'bg-green-500 text-white',
  DEL: 'bg-red-500 text-white',
};

const POSICIONES: { value: Posicion; label: string }[] = [
  { value: 'POR', label: 'Portero' },
  { value: 'DEF', label: 'Defensa' },
  { value: 'MED', label: 'Mediocampista' },
  { value: 'DEL', label: 'Delantero' },
];

interface Props {
  jugadores: Jugador[];
  ownerId: string;
  onAgregar: (j: Jugador) => Promise<void>;
  onEditar:  (j: Jugador) => Promise<void>;
  onBorrar:  (id: string) => Promise<void>;
  estadisticasAsistencia?: EstadisticaJugador[];
}

function JugadorForm({
  inicial, ownerId, onGuardar, onCancelar,
}: {
  inicial?: Jugador;
  ownerId: string;
  onGuardar: (j: Jugador) => Promise<void>;
  onCancelar: () => void;
}) {
  const [nombre,   setNombre]   = useState(inicial?.nombre ?? '');
  const [dorsal,   setDorsal]   = useState(inicial?.dorsal ?? 1);
  const [posicion, setPosicion] = useState<Posicion>(inicial?.posicion ?? 'DEF');
  const [guardando, setGuardando] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nombre.trim()) return;
    setGuardando(true);
    await onGuardar({
      id:        inicial?.id ?? crypto.randomUUID(),
      owner_id:  ownerId,
      nombre:    nombre.trim(),
      apellidos: '',
      dorsal,
      posicion,
      creado_en: inicial?.creado_en ?? Date.now(),
    });
    setGuardando(false);
  }

  return (
    <form onSubmit={handleSubmit}
      className="bg-quarte-azulClaro rounded-xl p-4 flex flex-col gap-3">
      <p className="font-titulo font-bold text-quarte-azul text-sm">
        {inicial ? 'Editar jugador' : 'Nuevo jugador'}
      </p>
      <div className="flex gap-2">
        <input value={nombre} onChange={e => setNombre(e.target.value)}
          placeholder="Nombre" required
          className="flex-1 min-h-[44px] px-3 rounded-xl border-2 border-gray-200
                     focus:border-quarte-azul outline-none text-sm font-cuerpo" />
        <input type="number" value={dorsal} min={1} max={99}
          onChange={e => setDorsal(Number(e.target.value))}
          className="w-16 min-h-[44px] px-2 rounded-xl border-2 border-gray-200
                     focus:border-quarte-azul outline-none text-sm font-cuerpo text-center" />
      </div>
      <div className="flex gap-2 flex-wrap">
        {POSICIONES.map(p => (
          <button key={p.value} type="button"
            onClick={() => setPosicion(p.value)}
            className={`px-3 py-1.5 rounded-full text-xs font-titulo font-semibold transition-colors
              ${posicion === p.value ? COLOR_POS[p.value] : 'bg-gray-200 text-gray-600'}`}>
            {p.label}
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        <button type="button" onClick={onCancelar}
          className="btn-outline flex-1 text-sm py-2">Cancelar</button>
        <button type="submit" disabled={guardando}
          className="btn-primario flex-1 text-sm py-2">
          {guardando ? '…' : inicial ? 'Guardar' : 'Añadir'}
        </button>
      </div>
    </form>
  );
}

export default function GestorJugadores({ jugadores, ownerId, onAgregar, onEditar, onBorrar, estadisticasAsistencia }: Props) {
  const [editando,  setEditando]  = useState<Jugador | null>(null);
  const [mostrando, setMostrando] = useState(true);
  const [nuevo,     setNuevo]     = useState(false);
  const [confirmarBorrar, setConfirmar] = useState<string | null>(null);

  const ordenados = [...jugadores].sort((a, b) => a.dorsal - b.dorsal);

  return (
    <div className="flex flex-col gap-3">
      {/* Cabecera */}
      <div className="flex items-center justify-between">
        <button onClick={() => setMostrando(v => !v)}
          className="flex items-center gap-2 font-titulo font-bold text-quarte-negro text-sm">
          {mostrando ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          Plantilla ({jugadores.length} jugadores)
        </button>
        <button onClick={() => { setNuevo(true); setEditando(null); }}
          className="flex items-center gap-1.5 text-quarte-azul font-titulo font-semibold text-sm
                     hover:underline">
          <Plus size={16} /> Añadir
        </button>
      </div>

      {/* Formulario nuevo */}
      {nuevo && !editando && (
        <JugadorForm ownerId={ownerId}
          onGuardar={async j => { await onAgregar(j); setNuevo(false); }}
          onCancelar={() => setNuevo(false)} />
      )}

      {/* Lista */}
      {mostrando && (
        <div className="flex flex-col gap-2">
          {ordenados.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-4">Sin jugadores. Añade el primero.</p>
          )}
          {ordenados.map(j => (
            <div key={j.id}>
              {editando?.id === j.id ? (
                <JugadorForm inicial={j} ownerId={ownerId}
                  onGuardar={async jj => { await onEditar(jj); setEditando(null); }}
                  onCancelar={() => setEditando(null)} />
              ) : (
                <div className="flex items-center gap-3 bg-white rounded-xl px-3 py-2.5 shadow-sm">
                  <Avatar nombre={j.nombre} foto={j.foto_b64} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="font-titulo font-semibold text-sm text-quarte-negro truncate">{j.nombre}</p>
                    <p className="text-xs text-gray-400">#{j.dorsal}
                      {(() => {
                        const stat = estadisticasAsistencia?.find(e => e.player_id === j.id);
                        if (!stat) return null;
                        const pct = stat.total > 0 ? Math.round((stat.asistidos / stat.total) * 100) : 0;
                        const color = pct >= 80 ? 'text-green-600' : pct >= 60 ? 'text-amber-500' : 'text-quarte-rojo';
                        return <span className={`ml-1.5 font-semibold ${color}`}>{pct}% asist.</span>;
                      })()}
                    </p>
                  </div>
                  <span className={`text-xs font-titulo font-bold px-2 py-0.5 rounded-full ${COLOR_POS[j.posicion]}`}>
                    {j.posicion}
                  </span>
                  <div className="flex gap-1">
                    <button onClick={() => { setEditando(j); setNuevo(false); }}
                      className="w-8 h-8 flex items-center justify-center rounded-lg
                                 bg-quarte-azulClaro text-quarte-azul hover:bg-blue-100 transition-colors">
                      <Edit2 size={14} />
                    </button>
                    {confirmarBorrar === j.id ? (
                      <button onClick={async () => { await onBorrar(j.id); setConfirmar(null); }}
                        className="w-8 h-8 flex items-center justify-center rounded-lg
                                   bg-quarte-rojo text-white text-xs font-bold">
                        ✓
                      </button>
                    ) : (
                      <button onClick={() => setConfirmar(j.id)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg
                                   bg-red-50 text-quarte-rojo hover:bg-red-100 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
