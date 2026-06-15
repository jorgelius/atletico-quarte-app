// ============================================================
// NavBar — barra de navegación responsive
// Móvil/tablet: barra inferior fija
// Desktop (lg+): barra lateral izquierda
// ============================================================
import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Users, Dumbbell, LayoutGrid, UserCircle,
  PencilRuler, House, Shield, ChevronDown, Check, BarChart2, Trophy,
} from 'lucide-react';
import { usePerfilStore } from '@/stores/perfilStore';
import { getEquipoNombre } from '@/data/equipos';
import escudoImg from '@/assets/escudo.png';

const itemsDesktop = [
  { to: '/plantilla',        icon: Users,        label: 'Plantilla'    },
  { to: '/partidos',         icon: Shield,       label: 'Partidos'     },
  { to: '/clasificacion',    icon: Trophy,       label: 'Clasificación'},
  { to: '/estadisticas',     icon: BarChart2,    label: 'Estadísticas' },
  { to: '/entrenamientos',   icon: Dumbbell,     label: 'Entrenam.'    },
  { to: '/tacticas',         icon: LayoutGrid,   label: 'Tácticas'     },
  { to: '/pizarra-tactica',  icon: PencilRuler,  label: 'Pizarra'      },
  { to: '/perfil',           icon: UserCircle,   label: 'Perfil'       },
];

const itemsMovil = [
  { to: '/inicio',           icon: House,        label: 'Inicio'       },
  { to: '/plantilla',        icon: Users,        label: 'Plantilla'    },
  { to: '/partidos',         icon: Shield,       label: 'Partidos'     },
  { to: '/estadisticas',     icon: BarChart2,    label: 'Stats'        },
  { to: '/perfil',           icon: UserCircle,   label: 'Perfil'       },
];

export default function NavBar() {
  const { perfil, activeTeamId, setActiveTeamId } = usePerfilStore();
  const navigate = useNavigate();
  const [showTeamMenu, setShowTeamMenu] = useState(false);

  const hasMultiTeam = (perfil?.team_ids.length ?? 0) > 1;
  const activeNombre = activeTeamId ? getEquipoNombre(activeTeamId) : (perfil?.team_ids[0] ? getEquipoNombre(perfil.team_ids[0]) : '—');

  function handleSelectTeam(id: string) {
    setActiveTeamId(id);
    setShowTeamMenu(false);
  }

  return (
    <>
      {/* ── BARRA LATERAL DESKTOP ───────────────────────────── */}
      <nav className="hidden lg:flex flex-col w-20 xl:w-56 min-h-screen
                      bg-quarte-azul text-white fixed top-0 left-0 z-40
                      shadow-lg select-none">

        {/* Logo */}
        <button
          onClick={() => navigate('/inicio')}
          className="flex items-center gap-3 px-4 py-5 border-b border-blue-800
                     hover:bg-blue-800 transition-colors w-full text-left"
        >
          <img src={escudoImg} alt="Escudo CD Atlético Quarte" className="w-9 h-9 object-contain drop-shadow-sm" />
          <span className="hidden xl:block font-titulo font-bold text-sm leading-tight text-white">
            CD Atlético<br/>Quarte
          </span>
        </button>

        {/* Items */}
        <div className="flex flex-col gap-1 mt-4 px-2 flex-1">
          {itemsDesktop.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-3 rounded-xl transition-colors
                 ${isActive
                   ? 'bg-quarte-rojo text-white font-semibold'
                   : 'text-blue-200 hover:bg-blue-800 hover:text-white'
                 }`
              }
            >
              <Icon size={22} />
              <span className="hidden xl:block font-cuerpo text-sm">{label}</span>
            </NavLink>
          ))}
        </div>

        {/* Equipo activo — con switcher si hay más de uno */}
        {perfil && (
          <div className="px-3 py-4 border-t border-blue-800 relative">
            <p className="text-[10px] text-blue-400 font-titulo font-semibold truncate mb-1">
              {perfil.nombre}
            </p>
            {hasMultiTeam ? (
              <>
                <button
                  onClick={() => setShowTeamMenu(v => !v)}
                  className="w-full flex items-center justify-between gap-1 text-left
                             hover:bg-blue-800 rounded-lg px-1 py-0.5 transition-colors"
                >
                  <span className="text-xs text-white font-titulo font-semibold truncate">
                    {activeNombre}
                  </span>
                  <ChevronDown size={12} className="text-blue-300 flex-shrink-0" />
                </button>
                {showTeamMenu && (
                  <div className="absolute bottom-full left-2 right-2 mb-1 bg-white rounded-xl
                                  shadow-xl border border-gray-100 overflow-hidden z-50">
                    {perfil.team_ids.map(id => (
                      <button
                        key={id}
                        onClick={() => handleSelectTeam(id)}
                        className={`w-full flex items-center gap-2 px-3 py-2.5 text-left text-sm
                                    font-titulo font-semibold transition-colors
                                    ${id === activeTeamId
                                      ? 'bg-quarte-azulClaro text-quarte-azul'
                                      : 'text-quarte-negro hover:bg-gray-50'}`}
                      >
                        <span className="flex-1 truncate">{getEquipoNombre(id)}</span>
                        {id === activeTeamId && <Check size={14} className="text-quarte-azul flex-shrink-0" />}
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <p className="text-xs text-white font-titulo font-semibold truncate">
                {activeNombre}
              </p>
            )}
          </div>
        )}
      </nav>

      {/* ── BARRA INFERIOR MÓVIL ────────────────────────────── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40
                      bg-quarte-azul shadow-nav flex justify-around
                      safe-area-padding-bottom">
        {itemsMovil.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 py-2.5 px-3 flex-1 transition-colors
               ${isActive ? 'text-white' : 'text-blue-300'}`
            }
          >
            {({ isActive }) => (
              <>
                <span className={`p-1.5 rounded-lg transition-colors ${isActive ? 'bg-quarte-rojo' : ''}`}>
                  <Icon size={20} />
                </span>
                <span className="text-[10px] font-cuerpo font-medium">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </>
  );
}
