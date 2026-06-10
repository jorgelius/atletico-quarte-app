// ============================================================
// InicioPage — pantalla de inicio enriquecida con datos reales
// ============================================================
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, Dumbbell, LayoutGrid, ChevronRight, ClipboardList,
  Shield, Calendar, MapPin,
} from 'lucide-react';
import { usePerfilStore }       from '@/stores/perfilStore';
import { usePartidosStore }     from '@/stores/partidosStore';
import { useEstadisticasStore } from '@/stores/estadisticasStore';
import { useConvocatoriaStore } from '@/stores/convocatoriaStore';
import { Avatar } from '@/components/ui/Avatar';
import escudoImg from '@/assets/escudo.png';
import { supabase } from '@/data/supabaseClient';

// ── Secciones de acceso rápido ───────────────────────────────
const SECCIONES = [
  { to: '/plantilla',      Icon: Users,      label: 'Plantilla',  color: 'bg-quarte-azul'  },
  { to: '/partidos',       Icon: Shield,     label: 'Partidos',   color: 'bg-quarte-negro'  },
  { to: '/entrenamientos', Icon: Dumbbell,   label: 'Biblioteca', color: 'bg-quarte-rojo'  },
  { to: '/tacticas',       Icon: LayoutGrid, label: 'Tácticas',   color: 'bg-quarte-verde' },
] as const;

// ── Helper ───────────────────────────────────────────────────
function formatFecha(d: string): string {
  const [y, m, day] = d.split('-');
  const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  return `${day} ${meses[parseInt(m) - 1]} ${y}`;
}

interface UltimoEntreno {
  titulo:    string;
  presentes: number;
  total:     number;
}

export default function InicioPage() {
  const { perfil }       = usePerfilStore();
  const navigate         = useNavigate();
  const partidosStore    = usePartidosStore();
  const estadStore       = useEstadisticasStore();
  const convocStore      = useConvocatoriaStore();

  const [ultimoEntreno, setUltimoEntreno] = useState<UltimoEntreno | null>(null);

  useEffect(() => {
    if (!perfil) return;
    if (partidosStore.partidos.length === 0) partidosStore.cargar(perfil.id);
    if (estadStore.stats.length === 0 && !estadStore.cargando) estadStore.cargar(perfil.id);
    cargarUltimoEntreno(perfil.id);
  }, [perfil?.id]);

  // Cargar el último entrenamiento con asistencia pasada
  async function cargarUltimoEntreno(teamId: string) {
    const { data: trainings } = await supabase
      .from('trainings')
      .select('id, titulo')
      .eq('coach_id', teamId)
      .order('created_at', { ascending: false })
      .limit(5);

    if (!trainings || trainings.length === 0) return;

    // Para cada training reciente buscar asistencia
    for (const t of trainings as { id: string; titulo: string }[]) {
      const { data: att } = await supabase
        .from('training_attendance')
        .select('status')
        .eq('training_id', t.id);

      if (att && att.length > 0) {
        const presentes = (att as { status: string }[]).filter(
          r => r.status === 'present' || r.status === 'late'
        ).length;
        setUltimoEntreno({ titulo: t.titulo, presentes, total: att.length });
        return;
      }
    }
  }

  if (!perfil) return null;

  // ── Computados desde el store de partidos ──────────────────
  const hoy = new Date().toISOString().split('T')[0];
  const proximoPartido = partidosStore.partidos
    .filter(p => p.status === 'scheduled' && p.date >= hoy)
    .sort((a, b) => a.date.localeCompare(b.date))[0] ?? null;

  const jugados   = partidosStore.partidos.filter(p => p.status === 'played');
  const victorias = jugados.filter(p => p.goals_for > p.goals_against).length;
  const empates   = jugados.filter(p => p.goals_for === p.goals_against).length;
  const derrotas  = jugados.filter(p => p.goals_for < p.goals_against).length;
  const golesMarcados  = jugados.reduce((s, p) => s + p.goals_for,    0);
  const golesEncajados = jugados.reduce((s, p) => s + p.goals_against, 0);

  // Convocados del próximo partido
  const convocCount = proximoPartido
    ? convocStore.getCount(proximoPartido.id)
    : undefined;

  // Cargar count si hay próximo partido y aún no está cargado
  useEffect(() => {
    if (proximoPartido && convocCount === undefined) {
      convocStore.cargarCuentas([proximoPartido.id]);
    }
  }, [proximoPartido?.id]);

  // Top 3 goleadores
  const topGoleadores = estadStore.getTopGoleadores(3).filter(p => p.goals > 0);

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

        {/* ── PRÓXIMO PARTIDO ───────────────────────────────── */}
        <div className="card flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield size={16} className="text-quarte-azul" />
              <p className="font-titulo font-bold text-sm text-quarte-negro">Próximo partido</p>
            </div>
            <button onClick={() => navigate('/partidos')}
              className="text-xs text-quarte-azul font-titulo font-semibold hover:underline">
              Ver todos
            </button>
          </div>

          {partidosStore.cargando ? (
            <div className="flex justify-center py-3">
              <div className="w-5 h-5 border-2 border-quarte-azul border-t-transparent rounded-full animate-spin" />
            </div>
          ) : proximoPartido ? (
            <button
              onClick={() => navigate('/partidos')}
              className="flex items-start gap-3 bg-quarte-azulClaro rounded-xl p-3 text-left
                         hover:bg-blue-100 transition-colors active:scale-[0.98]">
              <div className="w-10 h-10 rounded-xl bg-quarte-azul flex items-center justify-center flex-shrink-0">
                <Shield size={20} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-titulo font-bold text-sm text-quarte-negro">
                  vs {proximoPartido.rival_name}
                </p>
                <div className="flex items-center gap-3 mt-1 flex-wrap">
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Calendar size={11} />
                    <span>{formatFecha(proximoPartido.date)}</span>
                    {proximoPartido.time && <span>· {proximoPartido.time}</span>}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <MapPin size={11} />
                    <span>
                      {proximoPartido.location === 'home' ? 'Local'
                       : proximoPartido.location === 'away' ? 'Visitante'
                       : 'Neutral'}
                    </span>
                  </div>
                </div>
                {proximoPartido.competition && (
                  <p className="text-[10px] text-gray-400 mt-0.5">{proximoPartido.competition}</p>
                )}
                {convocCount !== undefined && (
                  <div className={`inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-full text-[10px]
                                   font-titulo font-semibold
                    ${convocCount > 0
                      ? 'bg-green-100 text-quarte-verde'
                      : 'bg-gray-100 text-gray-500'}`}>
                    <Users size={9} />
                    {convocCount > 0 ? `Convocatoria lista (${convocCount})` : 'Sin convocatoria'}
                  </div>
                )}
              </div>
            </button>
          ) : (
            <p className="text-sm text-gray-400 font-cuerpo text-center py-2">
              Sin partidos programados esta semana
            </p>
          )}
        </div>

        {/* ── ÚLTIMO ENTRENAMIENTO ────────────────────────── */}
        {ultimoEntreno && (
          <div className="card flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-quarte-verde flex items-center justify-center flex-shrink-0">
              <ClipboardList size={20} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-titulo font-bold text-sm text-quarte-negro">Último entrenamiento</p>
              <p className="text-xs text-gray-500 truncate">{ultimoEntreno.titulo}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="font-titulo font-bold text-sm text-quarte-negro">
                {ultimoEntreno.presentes}/{ultimoEntreno.total}
              </p>
              <p className="text-[10px] text-gray-400">jugadores</p>
            </div>
          </div>
        )}

        {/* ── ESTADÍSTICAS RÁPIDAS DEL EQUIPO ─────────────── */}
        {jugados.length > 0 && (
          <div className="card flex flex-col gap-3">
            <p className="font-titulo font-bold text-sm text-quarte-negro">
              Temporada 2025/26
            </p>
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: 'PJ',   value: jugados.length, color: 'text-quarte-negro' },
                { label: 'V',    value: victorias,       color: 'text-quarte-verde' },
                { label: 'E',    value: empates,         color: 'text-gray-500'     },
                { label: 'D',    value: derrotas,        color: 'text-quarte-rojo'  },
              ].map(({ label, value, color }) => (
                <div key={label} className="flex flex-col items-center bg-quarte-gris rounded-xl py-2.5 px-1">
                  <span className={`font-titulo font-extrabold text-xl leading-none ${color}`}>{value}</span>
                  <span className="text-[10px] text-gray-400 font-titulo font-semibold mt-0.5">{label}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-3 justify-center pt-1">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-titulo font-bold text-quarte-verde">⚽ {golesMarcados}</span>
                <span className="text-xs text-gray-400">marcados</span>
              </div>
              <span className="text-gray-300">·</span>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-titulo font-bold text-quarte-rojo">⚽ {golesEncajados}</span>
                <span className="text-xs text-gray-400">encajados</span>
              </div>
              <span className="text-gray-300">·</span>
              <div className="flex items-center gap-1.5">
                <span className={`text-xs font-titulo font-bold
                  ${golesMarcados - golesEncajados >= 0 ? 'text-quarte-verde' : 'text-quarte-rojo'}`}>
                  {golesMarcados - golesEncajados > 0 ? '+' : ''}{golesMarcados - golesEncajados}
                </span>
                <span className="text-xs text-gray-400">DG</span>
              </div>
            </div>
          </div>
        )}

        {/* ── TOP GOLEADORES ──────────────────────────────── */}
        {topGoleadores.length > 0 && (
          <div className="card flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <p className="font-titulo font-bold text-sm text-quarte-negro">Top goleadores</p>
              <button onClick={() => navigate('/plantilla')}
                className="text-xs text-quarte-azul font-titulo font-semibold hover:underline">
                Ver ranking
              </button>
            </div>
            <div className="flex flex-col gap-2">
              {topGoleadores.map((p, i) => {
                const badgeIcons = ['🥇', '🥈', '🥉'];
                const bgMap: Record<number, string> = { 0: 'bg-yellow-50', 1: 'bg-gray-50', 2: 'bg-amber-50' };
                const bgColor = bgMap[i] ?? 'bg-gray-50';

                return (
                  <div key={p.player_id}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 ${bgColor}`}>
                    <span className="text-lg w-6 text-center">{badgeIcons[i]}</span>
                    {p.player_foto ? (
                      <img src={p.player_foto} alt={p.player_name}
                        className="w-8 h-8 rounded-lg object-cover flex-shrink-0" />
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-quarte-azul flex items-center justify-center
                                      font-titulo font-bold text-white text-xs flex-shrink-0">
                        {p.player_name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="flex-1 font-titulo font-semibold text-sm text-quarte-negro truncate">
                      {p.player_name}
                    </span>
                    <span className="font-titulo font-extrabold text-lg text-quarte-negro">
                      {p.goals}
                    </span>
                    <span className="text-xs text-gray-400">⚽</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

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
