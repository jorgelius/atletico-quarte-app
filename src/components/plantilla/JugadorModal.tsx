// Modal de anotaciones / edición rápida de un jugador en campo
import { useState, useRef } from 'react';
import { X, Save } from 'lucide-react';
import type { Jugador, Posicion } from '@/types';

const POSICIONES: { value: Posicion; label: string }[] = [
  { value: 'POR', label: '🧤 Portero' },
  { value: 'DEF', label: '🛡️ Defensa' },
  { value: 'MED', label: '⚙️ Mediocampista' },
  { value: 'DEL', label: '⚽ Delantero' },
];

const COLOR_POS: Record<Posicion, string> = {
  POR: 'bg-amber-400',
  DEF: 'bg-blue-500',
  MED: 'bg-green-500',
  DEL: 'bg-red-500',
};

interface Props {
  jugador: Jugador;
  onGuardar: (j: Jugador) => void;
  onCerrar: () => void;
}

function fileABase64(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result as string);
    r.onerror = rej;
    r.readAsDataURL(file);
  });
}

export default function JugadorModal({ jugador, onGuardar, onCerrar }: Props) {
  const [nombre,   setNombre]   = useState(jugador.nombre);
  const [dorsal,   setDorsal]   = useState(jugador.dorsal);
  const [posicion, setPosicion] = useState<Posicion>(jugador.posicion);
  const [notas,    setNotas]    = useState(jugador.notas ?? '');
  const [foto,     setFoto]     = useState(jugador.foto_b64);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f || f.size > 2_000_000) return;
    setFoto(await fileABase64(f));
  }

  function handleSave() {
    onGuardar({ ...jugador, nombre, dorsal, posicion, notas, foto_b64: foto });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
         onClick={onCerrar}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Panel */}
      <div className="relative w-full sm:max-w-sm bg-white rounded-t-2xl sm:rounded-2xl p-5
                      shadow-2xl max-h-[90vh] overflow-y-auto"
           onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {/* Avatar foto o iniciales */}
            <button onClick={() => fileRef.current?.click()}
              className={`w-14 h-14 rounded-full flex items-center justify-center
                          overflow-hidden flex-shrink-0 text-white font-titulo font-bold text-lg
                          ${foto ? '' : COLOR_POS[posicion]}`}>
              {foto
                ? <img src={foto} alt={nombre} className="w-full h-full object-cover" />
                : nombre[0]?.toUpperCase()
              }
            </button>
            <div>
              <p className="font-titulo font-bold text-quarte-negro">{nombre || '—'}</p>
              <p className="text-xs text-gray-500">#{dorsal} · {posicion}</p>
            </div>
          </div>
          <button onClick={onCerrar}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100
                       hover:bg-gray-200 transition-colors">
            <X size={16} />
          </button>
        </div>

        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFoto} />

        {/* Campos */}
        <div className="flex flex-col gap-3">
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="font-titulo text-xs font-semibold text-gray-500 uppercase">Nombre</label>
              <input value={nombre} onChange={e => setNombre(e.target.value)}
                className="w-full mt-1 px-3 py-2.5 rounded-xl border-2 border-gray-200
                           focus:border-quarte-azul outline-none text-sm font-cuerpo" />
            </div>
            <div className="w-20">
              <label className="font-titulo text-xs font-semibold text-gray-500 uppercase">Dorsal</label>
              <input type="number" min={1} max={99} value={dorsal}
                onChange={e => setDorsal(Number(e.target.value))}
                className="w-full mt-1 px-3 py-2.5 rounded-xl border-2 border-gray-200
                           focus:border-quarte-azul outline-none text-sm font-cuerpo text-center" />
            </div>
          </div>

          {/* Posición */}
          <div>
            <label className="font-titulo text-xs font-semibold text-gray-500 uppercase mb-1.5 block">
              Posición
            </label>
            <div className="grid grid-cols-2 gap-2">
              {POSICIONES.map(p => (
                <button key={p.value} type="button"
                  onClick={() => setPosicion(p.value)}
                  className={`py-2.5 rounded-xl text-sm font-titulo font-semibold transition-colors
                    ${posicion === p.value
                      ? `${COLOR_POS[p.value]} text-white shadow-md`
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}>
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Notas */}
          <div>
            <label className="font-titulo text-xs font-semibold text-gray-500 uppercase mb-1.5 block">
              Notas del entrenador
            </label>
            <textarea value={notas} onChange={e => setNotas(e.target.value)}
              rows={3} placeholder="Observaciones, lesiones, rendimiento…"
              className="w-full px-3 py-2.5 rounded-xl border-2 border-gray-200
                         focus:border-quarte-azul outline-none text-sm font-cuerpo resize-none" />
          </div>

          <button onClick={handleSave}
            className="btn-primario w-full flex items-center justify-center gap-2">
            <Save size={16} /> Guardar cambios
          </button>
        </div>
      </div>
    </div>
  );
}
