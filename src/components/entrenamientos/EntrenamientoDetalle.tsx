// Vista de detalle de un entrenamiento
import { useState } from 'react';
import { ArrowLeft, Star, Clock, Users, Package, Edit2, Trash2 } from 'lucide-react';
import type { Entrenamiento } from '@/types';
import PitchBoard from '@/components/pizarra/PitchBoard';
import DrillAnimator from '@/components/entrenamientos/DrillAnimator';
import { DRILLS } from '@/data/drillAnimations';

interface Props {
  item:        Entrenamiento;
  isFav:       boolean;
  canEdit:     boolean;
  onBack:      () => void;
  onToggleFav: () => void;
  onEdit:      () => void;
  onBorrar:    () => void;
}

export default function EntrenamientoDetalle({ item, isFav, canEdit, onBack, onToggleFav, onEdit, onBorrar }: Props) {
  const [popping, setPopping] = useState(false);

  function handleFav() {
    setPopping(true);
    setTimeout(() => setPopping(false), 500);
    onToggleFav();
  }

  return (
    <div className="flex flex-col min-h-screen bg-quarte-gris">
      {/* Header */}
      <div className="bg-quarte-azul text-white px-4 pt-4 pb-3 flex items-center gap-3">
        <button onClick={onBack}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="font-titulo font-bold text-base leading-tight line-clamp-1">{item.titulo}</h1>
          <p className="text-blue-200 text-xs capitalize">{item.categoria} · {item.nivel}</p>
        </div>
        <button onClick={handleFav} className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/10 relative">
          {isFav && popping && (
            <span className="absolute inset-1 rounded-full border-2 border-amber-400 pointer-events-none"
              style={{ animation: 'aq-ring .55s ease forwards' }} />
          )}
          <Star size={18}
            fill={isFav ? '#F59E0B' : 'none'}
            stroke={isFav ? '#F59E0B' : 'white'}
            style={popping ? { animation: 'aq-pop .4s cubic-bezier(.34,1.6,.5,1)' } : undefined}
          />
        </button>
        {canEdit && (
          <>
            <button onClick={onEdit} className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/10">
              <Edit2 size={16} />
            </button>
            <button onClick={onBorrar} className="w-9 h-9 flex items-center justify-center rounded-xl bg-red-500/30">
              <Trash2 size={16} />
            </button>
          </>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 max-w-lg mx-auto w-full flex flex-col gap-4">
        {/* Animación táctica */}
        {DRILLS[item.id] && (
          <div className="card p-3">
            <p className="font-titulo font-bold text-xs text-gray-400 uppercase tracking-wide mb-2">
              Animación táctica
            </p>
            <DrillAnimator drillId={item.id} />
          </div>
        )}

        {/* Fotos */}
        {item.fotos_b64.length > 0 && (
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {item.fotos_b64.map((f, i) => (
              <img key={i} src={f} alt={`Foto ${i+1}`}
                className="h-40 rounded-xl object-cover flex-shrink-0" />
            ))}
          </div>
        )}

        {/* Métricas */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { icon: <Clock size={16}/>, val: `${item.duracion_min} min`, lbl: 'Duración' },
            { icon: <Users size={16}/>, val: `${item.num_jugadores_min}–${item.num_jugadores_max}`, lbl: 'Jugadores' },
            { icon: <Package size={16}/>, val: item.material.length ? `${item.material.length} ítems` : 'Ninguno', lbl: 'Material' },
          ].map(m => (
            <div key={m.lbl} className="card flex flex-col items-center gap-1 py-3">
              <span className="text-quarte-azul">{m.icon}</span>
              <p className="font-titulo font-bold text-sm text-quarte-negro">{m.val}</p>
              <p className="text-[10px] text-gray-400">{m.lbl}</p>
            </div>
          ))}
        </div>

        {/* Material */}
        {item.material.length > 0 && (
          <div className="card">
            <p className="font-titulo font-bold text-sm text-quarte-negro mb-2">Material necesario</p>
            <div className="flex flex-wrap gap-1.5">
              {item.material.map(m => (
                <span key={m} className="bg-gray-100 text-gray-700 text-xs px-2.5 py-1 rounded-full font-cuerpo">{m}</span>
              ))}
            </div>
          </div>
        )}

        {/* Descripción */}
        <div className="card">
          <p className="font-titulo font-bold text-sm text-quarte-negro mb-2">Descripción</p>
          <p className="text-sm text-gray-700 leading-relaxed font-cuerpo">{item.descripcion}</p>
        </div>

        {/* Instrucciones */}
        {item.instrucciones.length > 0 && (
          <div className="card">
            <p className="font-titulo font-bold text-sm text-quarte-negro mb-3">Pasos</p>
            <ol className="flex flex-col gap-3">
              {item.instrucciones.map((inst, i) => (
                <li key={i} className="flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-quarte-azul text-white text-xs font-titulo
                                   font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                    {i+1}
                  </span>
                  <p className="text-sm text-gray-700 font-cuerpo">{inst}</p>
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Pizarra */}
        {item.pizarra_data && (
          <div>
            <p className="font-titulo font-bold text-sm text-quarte-negro mb-2">Pizarra táctica</p>
            <PitchBoard formato="F11" readOnly initialData={item.pizarra_data} />
          </div>
        )}
      </div>
    </div>
  );
}
