// ============================================================
// InicioPage — pantalla de inicio
// ============================================================
import { useNavigate } from 'react-router-dom';
import { Users, Dumbbell, LayoutGrid, ChevronRight, ClipboardList, Shield } from 'lucide-react';
import { usePerfilStore } from '@/stores/perfilStore';
import { Avatar } from '@/components/ui/Avatar';
import escudoImg from '@/assets/escudo.png';

const SECCIONES = [
  { to: '/plantilla',      Icon: Users,      label: 'Plantilla',  color: 'bg-quarte-azul'  },
  { to: '/partidos',       Icon: Shield,     label: 'Partidos',   color: 'bg-quarte-negro'  },
  { to: '/entrenamientos', Icon: Dumbbell,   label: 'Biblioteca', color: 'bg-quarte-rojo'  },
  { to: '/tacticas',       Icon: LayoutGrid, label: 'Tácticas',   color: 'bg-quarte-verde' },
] as const;

export default function InicioPage() {
  const { perfil } = usePerfilStore();
  const navigate   = useNavigate();

  return (
    <div className="min-h-screen bg-quarte-gris">

      {/* Hero header */}
      <div className="bg-gradient-to-b from-quarte-azul to-blue-900 px-4 pt-8 pb-8 relative">
        <div className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'%3E%3Ccircle cx='20' cy='20' r='1'/%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        <div className="max-w-lg mx-auto relative">
          {perfil && (
            <button onClick={() => navigate('/perfil')}
              className="flex items-center gap-2.5 mb-6 group">
              <Avatar nombre={perfil.nombre} foto={perfil.avatar_b64} size="sm" />
              <div className="text-left">
                <p className="text-blue-200 text-xs">Bienvenido de nuevo</p>
                <p className="text-white font-titulo font-bold text-sm leading-tight group-hover:underline">
                  {perfil.nombre}
                </p>
              </div>
              <ChevronRight size={14} className="text-blue-300 ml-auto" />
            </button>
          )}

          <div className="flex flex-col items-center text-center gap-3">
            <img src={escudoImg} alt="Escudo CD Atlético Quarte"
              className="w-20 h-20 object-contain drop-shadow-xl" />
            <h1 className="font-titulo text-2xl font-extrabold tracking-tight text-white">
              CD Atlético Quarte
            </h1>
            {perfil?.equipo && (
              <span className="bg-white/15 border border-white/20 text-white text-xs
                               font-titulo font-semibold px-3 py-1 rounded-full">
                {perfil.equipo}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 mt-4 pb-8 flex flex-col gap-4">

        {/* Accesos rápidos */}
        <div className="grid grid-cols-4 gap-2">
          {SECCIONES.map(({ to, Icon, label, color }) => (
            <button key={to} onClick={() => navigate(to)}
              className="card flex flex-col items-center gap-2 py-3 px-1 text-center
                         hover:shadow-md transition-shadow active:scale-[0.97]">
              <div className={`${color} w-10 h-10 rounded-xl flex items-center justify-center shadow`}>
                <Icon size={20} className="text-white" />
              </div>
              <p className="font-titulo font-bold text-quarte-negro text-[10px] leading-tight">{label}</p>
            </button>
          ))}
        </div>

        {/* Botón pasar lista */}
        <button onClick={() => navigate('/pasar-lista')}
          className="card flex items-center gap-4 w-full text-left active:scale-[0.98] transition-transform
                     hover:shadow-md">
          <div className="w-12 h-12 rounded-2xl bg-quarte-azul flex items-center justify-center flex-shrink-0">
            <ClipboardList size={24} className="text-white" />
          </div>
          <div className="flex-1">
            <p className="font-titulo font-bold text-quarte-negro">Pasar lista</p>
            <p className="text-xs text-gray-400">Registra la asistencia del equipo</p>
          </div>
          <ChevronRight size={18} className="text-gray-400" />
        </button>

      </div>
    </div>
  );
}
