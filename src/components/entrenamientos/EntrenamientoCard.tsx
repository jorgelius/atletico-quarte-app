import { Clock, Users, Star, ClipboardList } from 'lucide-react';
import type { Entrenamiento } from '@/types';
import type { ResumenEntrenamiento } from '@/stores/asistenciaStore';

const COLOR_CAT: Record<string, string> = {
  ataque:       'bg-red-100 text-red-700',
  defensa:      'bg-blue-100 text-blue-700',
  porteros:     'bg-amber-100 text-amber-700',
  posesion:     'bg-green-100 text-green-700',
  finalizacion: 'bg-orange-100 text-orange-700',
  fisico:       'bg-purple-100 text-purple-700',
  otros:        'bg-gray-100 text-gray-600',
};

const LABEL_CAT: Record<string, string> = {
  ataque:       'Ataque',
  defensa:      'Defensa',
  porteros:     'Porteros',
  posesion:     'Posesión',
  finalizacion: 'Finalización',
  fisico:       'Físico',
  otros:        'Otros',
};


interface Props {
  item: Entrenamiento;
  isFav: boolean;
  onOpen: () => void;
  onToggleFav: () => void;
  resumenAsistencia?: ResumenEntrenamiento | null;
  onAsistencia?: () => void;
}

export default function EntrenamientoCard({ item, isFav, onOpen, onToggleFav, resumenAsistencia, onAsistencia }: Props) {
  return (
    <div className="card flex flex-col gap-2 active:scale-[0.98] transition-transform cursor-pointer"
         onClick={onOpen}>
      {/* Foto si existe */}
      {item.fotos_b64[0] && (
        <div className="h-28 rounded-xl overflow-hidden -mx-1 -mt-1">
          <img src={item.fotos_b64[0]} alt={item.titulo}
            className="w-full h-full object-cover" />
        </div>
      )}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-titulo font-bold uppercase
                              ${COLOR_CAT[item.categoria] ?? COLOR_CAT.otros}`}>
              {LABEL_CAT[item.categoria] ?? item.categoria}
            </span>
          </div>
          <p className="font-titulo font-bold text-quarte-negro text-sm line-clamp-2">{item.titulo}</p>
        </div>
        <button onClick={e => { e.stopPropagation(); onToggleFav(); }}
          className="w-8 h-8 flex items-center justify-center rounded-full flex-shrink-0
                     hover:bg-yellow-50 transition-colors">
          <Star size={16} fill={isFav ? '#F59E0B' : 'none'} stroke={isFav ? '#F59E0B' : '#9CA3AF'} />
        </button>
      </div>
      <div className="flex items-center gap-3 text-xs text-gray-500">
        <span className="flex items-center gap-1"><Clock size={12}/> {item.duracion_min} min</span>
        <span className="flex items-center gap-1"><Users size={12}/> {item.num_jugadores_min}–{item.num_jugadores_max} jug.</span>
      </div>

      {/* Indicador de asistencia */}
      {onAsistencia !== undefined && (
        <button
          onClick={e => { e.stopPropagation(); onAsistencia(); }}
          className={`flex items-center gap-1.5 self-start px-2.5 py-1 rounded-full text-xs font-titulo font-semibold transition-colors
            ${resumenAsistencia
              ? 'bg-green-100 text-green-700 hover:bg-green-200'
              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
          <ClipboardList size={11} />
          {resumenAsistencia
            ? `✓ ${resumenAsistencia.presentes}/${resumenAsistencia.total} jugadores`
            : 'Pasar lista'}
        </button>
      )}
    </div>
  );
}
