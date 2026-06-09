// ============================================================
// InicioPage — pantalla de inicio
// ============================================================
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Dumbbell, LayoutGrid, ChevronRight, ClipboardList, Shield } from 'lucide-react';
import { usePerfilStore } from '@/stores/perfilStore';
import { useAsistenciaStore } from '@/stores/asistenciaStore';
import { supabase } from '@/data/supabaseClient';
import { Avatar } from '@/components/ui/Avatar';
import escudoImg from '@/assets/escudo.png';

const SECCIONES = [
  { to: '/plantilla',      Icon: Users,      label: 'Plantilla',  color: 'bg-quarte-azul'  },
  { to: '/partidos',       Icon: Shield,     label: 'Partidos',   color: 'bg-quarte-negro'  },
  { to: '/entrenamientos', Icon: Dumbbell,   label: 'Biblioteca', color: 'bg-quarte-rojo'  },
  { to: '/tacticas',       Icon: LayoutGrid, label: 'Tácticas',   color: 'bg-quarte-verde' },
] as const;

interface EntrenoResumen {
  id:       string;
  titulo:   string;
  categoria: string;
}

export default function InicioPage() {
  const { perfil }      = usePerfilStore();
  const asistenciaStore = useAsistenciaStore();
  const navigate        = useNavigate();

  const [misEntrenos, setMisEntrenos] = useState<EntrenoResumen[]>([]);
  const [cargando,    setCargando]    = useState(false);

  useEffect(() => {
    if (!perfil) return;

    // Carga los últimos 6 entrenamientos del coach
    (async () => {
      setCargando(true);
      const { data } = await supabase
        .from('trainings')
        .select('id, nombre, categoria')
        .eq('coach_id', perfil.id)
        .order('created_at', { ascending: false })
        .limit(6);

      setMisEntrenos(
        (data ?? []).map((r: Record<string, unknown>) => ({
          id:        r.id       as string,
          titulo:    (r.nombre  as string) ?? 'Entrenamiento',
          categoria: (r.categoria as string) ?? 'otros',
        }))
      );
      setCargando(false);
    })();

    // Carga resúmenes de asistencia para esos entrenamientos
    asistenciaStore.cargarResumenEquipo(perfil.id);
  }, [perfil?.id]);

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
            <button
              onClick={() => navigate('/perfil')}
              className="flex items-center gap-2.5 mb-6 group"
            >
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
            <img
              src={escudoImg}
              alt="Escudo CD Atlético Quarte"
              className="w-20 h-20 object-contain drop-shadow-xl"
            />
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

      <div className="max-w-lg mx-auto px-4 mt-4 pb-8 flex flex-col gap-5">

        {/* Accesos rápidos */}
        <div className="grid grid-cols-4 gap-2">
          {SECCIONES.map(({ to, Icon, label, color }) => (
            <button
              key={to}
              onClick={() => navigate(to)}
              className="card flex flex-col items-center gap-2 py-3 px-1 text-center
                         hover:shadow-md transition-shadow active:scale-[0.97]"
            >
              <div className={`${color} w-10 h-10 rounded-xl flex items-center justify-center shadow`}>
                <Icon size={20} className="text-white" />
              </div>
              <p className="font-titulo font-bold text-quarte-negro text-[10px] leading-tight">
                {label}
              </p>
            </button>
          ))}
        </div>

        {/* Sección pase de lista */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ClipboardList size={16} className="text-quarte-azul" />
              <p className="font-titulo font-bold text-sm text-quarte-negro">Pase de lista</p>
            </div>
            <p className="text-xs text-gray-400">Mis entrenamientos</p>
          </div>

          {cargando ? (
            <div className="flex justify-center py-6">
              <div className="w-6 h-6 border-2 border-quarte-azul border-t-transparent rounded-full animate-spin" />
            </div>
          ) : misEntrenos.length === 0 ? (
            <div className="card flex flex-col items-center py-8 gap-2 text-gray-400">
              <ClipboardList size={32} className="opacity-20" />
              <p className="font-titulo font-semibold text-sm">Sin entrenamientos propios</p>
              <p className="text-xs text-center">
                Crea un entrenamiento en la Biblioteca para poder pasar lista.
              </p>
            </div>
          ) : (
            misEntrenos.map(entreno => {
              const resumen = asistenciaStore.getResumen(entreno.id);
              return (
                <div key={entreno.id}
                  className="card flex items-center gap-3">
                  {/* Icono */}
                  <div className="w-10 h-10 rounded-xl bg-quarte-azulClaro flex items-center justify-center flex-shrink-0">
                    <Dumbbell size={18} className="text-quarte-azul" />
                  </div>

                  {/* Nombre */}
                  <div className="flex-1 min-w-0">
                    <p className="font-titulo font-semibold text-sm text-quarte-negro truncate">
                      {entreno.titulo}
                    </p>
                    {resumen ? (
                      <p className="text-xs text-quarte-verde font-semibold">
                        ✓ {resumen.presentes}/{resumen.total} jugadores presentes
                      </p>
                    ) : (
                      <p className="text-xs text-gray-400">Lista no pasada</p>
                    )}
                  </div>

                  {/* Botón */}
                  <button
                    onClick={() => navigate(`/entrenamientos/${entreno.id}/asistencia`)}
                    className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl
                      text-xs font-titulo font-semibold transition-colors
                      ${resumen
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-quarte-azul text-white hover:bg-blue-900'}`}>
                    <ClipboardList size={13} />
                    {resumen ? 'Ver lista' : 'Pasar lista'}
                  </button>
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
}
