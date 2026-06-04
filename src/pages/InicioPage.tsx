// Pantalla de inicio / bienvenida
import { useNavigate } from 'react-router-dom';
import { usePerfilStore } from '@/stores/perfilStore';
import { Users, Dumbbell, LayoutGrid } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import escudoImg from '@/assets/escudo.png';

const secciones = [
  {
    to: '/plantilla',
    icon: Users,
    titulo: 'Plantilla',
    desc: 'Gestiona jugadores y alineaciones',
    color: 'bg-quarte-azul',
  },
  {
    to: '/entrenamientos',
    icon: Dumbbell,
    titulo: 'Entrenamientos',
    desc: 'Biblioteca compartida del club',
    color: 'bg-quarte-rojo',
  },
  {
    to: '/tacticas',
    icon: LayoutGrid,
    titulo: 'Tácticas',
    desc: 'Sistemas y jugadas animadas',
    color: 'bg-quarte-verde',
  },
];

export default function InicioPage() {
  const { perfil } = usePerfilStore();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-quarte-gris">
      {/* Cabecera */}
      <div className="bg-quarte-azul text-white px-4 pt-10 pb-8">
        <div className="max-w-lg mx-auto flex flex-col items-center text-center gap-4">
          <img src={escudoImg} alt="Escudo CD Atlético Quarte" className="w-24 h-24 object-contain drop-shadow-md" />
          <div>
            <h1 className="font-titulo text-2xl font-extrabold tracking-tight">
              CD Atlético Quarte
            </h1>
            <p className="text-blue-200 text-sm mt-1">Cuarte de Huerva · Los Halcones</p>
          </div>
          {perfil && (
            <button
              onClick={() => navigate('/perfil')}
              className="flex items-center gap-3 bg-blue-800/60 hover:bg-blue-700/60
                         rounded-xl px-4 py-2.5 transition-colors"
            >
              <Avatar nombre={perfil.nombre} foto={perfil.avatar_b64} size="sm" />
              <div className="text-left text-sm">
                <p className="font-semibold">{perfil.nombre}</p>
                <p className="text-blue-200 text-xs">{perfil.equipo}</p>
              </div>
            </button>
          )}
        </div>
      </div>

      {/* Secciones */}
      <div className="max-w-lg mx-auto px-4 py-6 grid gap-4">
        {secciones.map(({ to, icon: Icon, titulo, desc, color }) => (
          <button
            key={to}
            onClick={() => navigate(to)}
            className="card flex items-center gap-4 text-left hover:shadow-md
                       transition-shadow active:scale-[0.98]"
          >
            <div className={`${color} w-14 h-14 rounded-xl flex items-center
                             justify-center flex-shrink-0 shadow-md`}>
              <Icon size={26} className="text-white" />
            </div>
            <div>
              <p className="font-titulo font-bold text-quarte-negro">{titulo}</p>
              <p className="text-sm text-gray-500">{desc}</p>
            </div>
          </button>
        ))}
      </div>

      <p className="text-center text-xs text-gray-400 pb-6">
        v0.2 · Fase 1 — Perfil local
      </p>
    </div>
  );
}
