import { Calendar, Users } from 'lucide-react';
import type { Match } from '@/types';

export function getOutcome(m: Match): 'victoria' | 'empate' | 'derrota' | null {
  if (m.status !== 'played') return null;
  if (m.goals_for > m.goals_against) return 'victoria';
  if (m.goals_for === m.goals_against) return 'empate';
  return 'derrota';
}

export function formatFecha(d: string): string {
  const [y, m, day] = d.split('-');
  return `${day}/${m}/${y}`;
}

interface Props {
  partido:        Match;
  onClick:        () => void;
  squadCount?:    number;   // undefined = no se ha cargado, 0 = sin convocatoria
}

export default function PartidoCard({ partido, onClick, squadCount }: Props) {
  const outcome = getOutcome(partido);

  const borderColor =
    outcome === 'victoria'            ? 'border-l-quarte-verde' :
    outcome === 'derrota'             ? 'border-l-quarte-rojo'  :
    outcome === 'empate'              ? 'border-l-gray-400'     :
    partido.status === 'scheduled'    ? 'border-l-quarte-azul'  :
    'border-l-gray-300';

  return (
    <div
      onClick={onClick}
      className={`card border-l-4 ${borderColor} cursor-pointer active:scale-[0.98] transition-transform`}
    >
      <div className="flex items-center justify-between gap-3">
        {/* Info izquierda */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className={`text-[10px] font-titulo font-bold px-1.5 py-0.5 rounded-md
              ${partido.location === 'home'
                ? 'bg-green-100 text-green-700'
                : partido.location === 'away'
                ? 'bg-red-100 text-red-700'
                : 'bg-gray-100 text-gray-600'}`}>
              {partido.location === 'home' ? 'LOCAL' : partido.location === 'away' ? 'VISITANTE' : 'NEUTRO'}
            </span>
            {partido.competition && (
              <span className="text-[10px] text-gray-400 truncate max-w-[120px]">{partido.competition}</span>
            )}
          </div>
          <p className="font-titulo font-bold text-quarte-negro text-sm">vs {partido.rival_name}</p>
          <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-400 flex-wrap">
            <div className="flex items-center gap-1">
              <Calendar size={10} />
              <span>{formatFecha(partido.date)}</span>
              {partido.time && <span>· {partido.time}</span>}
            </div>
            {/* Indicador de convocatoria */}
            {squadCount !== undefined && (
              <div className={`flex items-center gap-1 text-[10px] font-titulo font-semibold
                ${squadCount > 0 ? 'text-quarte-verde' : 'text-gray-400'}`}>
                <Users size={10} />
                {squadCount > 0 ? `${squadCount} conv.` : 'Sin conv.'}
              </div>
            )}
          </div>
        </div>

        {/* Resultado / Estado derecha */}
        <div className="flex-shrink-0 text-right">
          {partido.status === 'played' ? (
            <div>
              <p className="font-titulo font-bold text-2xl leading-none text-quarte-negro">
                {partido.goals_for} – {partido.goals_against}
              </p>
              <span className={`text-[10px] font-titulo font-bold mt-0.5 block
                ${outcome === 'victoria' ? 'text-quarte-verde' :
                  outcome === 'derrota'  ? 'text-quarte-rojo'  :
                  'text-gray-500'}`}>
                {outcome === 'victoria' ? 'VICTORIA' :
                 outcome === 'derrota'  ? 'DERROTA'  : 'EMPATE'}
              </span>
            </div>
          ) : partido.status === 'scheduled' ? (
            <span className="text-xs font-titulo font-semibold text-quarte-azul bg-quarte-azulClaro px-2 py-1 rounded-lg">
              Próximo
            </span>
          ) : partido.status === 'cancelled' ? (
            <span className="text-xs font-titulo font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded-lg">
              Cancelado
            </span>
          ) : (
            <span className="text-xs font-titulo font-semibold text-amber-600 bg-amber-50 px-2 py-1 rounded-lg">
              Aplazado
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
