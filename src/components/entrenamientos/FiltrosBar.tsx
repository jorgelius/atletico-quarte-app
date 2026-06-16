import { Search, X } from 'lucide-react';
import type { FiltroEntrenamiento } from '@/data';

const CATEGORIAS = ['ataque','defensa','porteros','posesion','finalizacion','fisico','otros'];
interface Props {
  filtro: FiltroEntrenamiento;
  onChange: (f: Partial<FiltroEntrenamiento>) => void;
}

export default function FiltrosBar({ filtro, onChange }: Props) {
  return (
    <div className="flex flex-col gap-2">
      {/* Buscador */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input value={filtro.texto ?? ''}
          onChange={e => onChange({ texto: e.target.value || undefined })}
          placeholder="Buscar ejercicios…"
          className="w-full pl-9 pr-9 py-2.5 rounded-xl border-2 border-gray-200
                     focus:border-quarte-azul outline-none text-sm font-cuerpo bg-white" />
        {filtro.texto && (
          <button onClick={() => onChange({ texto: undefined })}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            <X size={14} />
          </button>
        )}
      </div>

      {/* Chips de categoría */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
        <button onClick={() => onChange({ categoria: undefined })}
          className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-titulo font-semibold transition-colors
            ${!filtro.categoria ? 'bg-quarte-azul text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
          Todos
        </button>
        {CATEGORIAS.map(c => (
          <button key={c} onClick={() => onChange({ categoria: filtro.categoria === c ? undefined : c })}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-titulo font-semibold capitalize transition-colors
              ${filtro.categoria === c ? 'bg-quarte-rojo text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {c}
          </button>
        ))}
      </div>

    </div>
  );
}
