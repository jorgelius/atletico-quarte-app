// Selector de equipo activo — se muestra solo si el usuario gestiona 2+ equipos
import { useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { usePerfilStore } from '@/stores/perfilStore';
import { getEquipoNombre } from '@/data/equipos';

interface Props {
  /** true = sobre fondo azul oscuro (headers), false = sobre fondo claro */
  dark?: boolean;
}

export function TeamSwitcher({ dark = true }: Props) {
  const { perfil, activeTeamId, setActiveTeamId } = usePerfilStore();
  const [open, setOpen] = useState(false);

  if (!perfil || !activeTeamId) return null;

  const hasMulti = perfil.team_ids.length > 1;
  const nombre   = getEquipoNombre(activeTeamId);

  const pillBase  = 'text-xs font-titulo font-semibold px-3 py-1 rounded-full';
  const pillDark  = 'bg-white/15 border border-white/20 text-white';
  const pillLight = 'bg-quarte-azulClaro border border-quarte-azul/20 text-quarte-azul';

  if (!hasMulti) {
    return (
      <span className={`${pillBase} ${dark ? pillDark : pillLight}`}>
        {nombre}
      </span>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className={`flex items-center gap-1.5 transition-colors
                    ${pillBase}
                    ${dark
                      ? `${pillDark} hover:bg-white/25`
                      : `${pillLight} hover:bg-blue-100`}`}
      >
        {nombre}
        <ChevronDown size={12} className={open ? 'rotate-180 transition-transform' : 'transition-transform'} />
      </button>

      {open && (
        <>
          {/* Overlay para cerrar al tocar fuera */}
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute top-full mt-2 left-0 bg-white rounded-2xl shadow-xl
                          border border-gray-100 overflow-hidden z-50 min-w-[190px]">
            {perfil.team_ids.map(id => (
              <button
                key={id}
                onClick={() => { setActiveTeamId(id); setOpen(false); }}
                className={`w-full flex items-center gap-2 px-4 py-3 text-left text-sm
                            font-titulo font-semibold transition-colors
                            ${id === activeTeamId
                              ? 'bg-quarte-azulClaro text-quarte-azul'
                              : 'text-quarte-negro hover:bg-gray-50'}`}
              >
                <span className="flex-1">{getEquipoNombre(id)}</span>
                {id === activeTeamId && <Check size={14} className="text-quarte-azul flex-shrink-0" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
