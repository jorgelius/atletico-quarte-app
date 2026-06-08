// ============================================================
// NavBar — barra de navegación responsive
// Móvil/tablet: barra inferior fija
// Desktop (lg+): barra lateral izquierda
// ============================================================
import { NavLink } from 'react-router-dom';
import {
  Users,
  Dumbbell,
  LayoutGrid,
  UserCircle,
  PencilRuler,
} from 'lucide-react';
import { usePerfilStore } from '@/stores/perfilStore';
import escudoImg from '@/assets/escudo.png';

const items = [
  { to: '/plantilla',        icon: Users,        label: 'Plantilla' },
  { to: '/entrenamientos',   icon: Dumbbell,     label: 'Entrenam.' },
  { to: '/tacticas',         icon: LayoutGrid,   label: 'Tácticas'  },
  { to: '/pizarra-tactica',  icon: PencilRuler,  label: 'Pizarra'   },
  { to: '/perfil',           icon: UserCircle,   label: 'Perfil'    },
];

export default function NavBar() {
  const { perfil } = usePerfilStore();

  return (
    <>
      {/* ── BARRA LATERAL DESKTOP ───────────────────────────── */}
      <nav className="hidden lg:flex flex-col w-20 xl:w-56 min-h-screen
                      bg-quarte-azul text-white fixed top-0 left-0 z-40
                      shadow-lg select-none">

        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-blue-800">
          <img src={escudoImg} alt="Escudo CD Atlético Quarte" className="w-9 h-9 object-contain drop-shadow-sm" />
          <span className="hidden xl:block font-titulo font-bold text-sm leading-tight text-white">
            CD Atlético<br/>Quarte
          </span>
        </div>

        {/* Items */}
        <div className="flex flex-col gap-1 mt-4 px-2 flex-1">
          {items.map(({ to, icon: Icon, label }) => (
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

        {/* Equipo activo */}
        {perfil && (
          <div className="px-3 py-4 border-t border-blue-800 text-xs text-blue-300">
            <p className="font-semibold text-white truncate">{perfil.nombre}</p>
            <p className="truncate">{perfil.equipo}</p>
          </div>
        )}
      </nav>

      {/* ── BARRA INFERIOR MÓVIL ────────────────────────────── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40
                      bg-quarte-azul shadow-nav flex justify-around
                      safe-area-padding-bottom">
        {items.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 py-2.5 px-3 flex-1 transition-colors
               ${isActive
                 ? 'text-white'
                 : 'text-blue-300'
               }`
            }
          >
            {({ isActive }) => (
              <>
                <span className={`p-1.5 rounded-lg transition-colors ${
                  isActive ? 'bg-quarte-rojo' : ''
                }`}>
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
