// ============================================================
// InicioPage — pantalla de inicio enriquecida con datos reales
// Mobile: layout vertical (igual que antes)
// Desktop (md+): Próximo Partido + Pasar Lista en fila,
//                grid de secciones, estadísticas en columnas
// ============================================================
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, Dumbbell, LayoutGrid, ChevronRight, ClipboardList,
  Shield, Calendar, MapPin, ArrowRight,
} from 'lucide-react';
import { usePerfilStore }       from '@/stores/perfilStore';
import { usePartidosStore }     from '@/stores/partidosStore';
import { useEstadisticasStore } from '@/stores/estadisticasStore';
import { useConvocatoriaStore } from '@/stores/convocatoriaStore';
import { TeamSwitcher }         from '@/components/ui/TeamSwitcher';
import { Avatar }               from '@/components/ui/Avatar';
import escudoImg                from '@/assets/escudo.png';
import { supabase }             from '@/data/supabaseClient';

// ── Secciones de acceso rápido ───────────────────────────────
const SECCIONES = [
  { to: '/plantilla',      Icon: Users,      label: 'Plantilla',  desc: 'Gestiona el equipo',  color: 'bg-quarte-azul'  },
  { to: '/partidos',       Icon: Shield,     label: 'Partidos',   desc: 'Calendario y actas',  color: 'bg-quarte-negro' },
  { to: '/entrenamientos', Icon: Dumbbell,   label: 'Biblioteca', desc: 'Ejercicios y vídeos', color: 'bg-quarte-rojo'  },
  { to: '/tacticas',       Icon: LayoutGrid, label: 'Tácticas',   desc: 'Formaciones',         color: 'bg-quarte-verde' },
] as const;

// ── Helper ───────────────────────────────────────────────────
function formatFecha(d: string): string {
  const [y, m, day] = d.split('-');
  const meses = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
  return `${day} ${meses[parseInt(m) - 1]} ${y}`;
}

interface UltimoEntreno { titulo: string; presentes: number; total: number }

export default function InicioPage() {
  const { perfil, activeTeamId } = usePerfilStore();
  const navigate                 = useNavigate();
  const partidosStore            = usePartidosStore();
  const estadStore               = useEstadisticasStore();
  const convocStore              = useConvocatoriaStore();

  const [ultimoEntreno, setUltimoEntreno] = useState<UltimoEntreno | null>(null);

  useEffect(() => {
    if (!perfil || !activeTeamId) return;
    partidosStore.cargar(activeTeamId);
    estadStore.cargar(activeTeamId);
    cargarUltimoEntreno(perfil.id);
  }, [activeTeamId]);

  async function cargarUltimoEntreno(teamId: string) {
    const { data: trainings } = await supabase
      .from('trainings').select('id, titulo')
      .eq('coach_id', teamId).order('creado_en', { ascending: false }).limit(5);
    if (!trainings || trainings.length === 0) return;
    for (const t of trainings as { id: string; titulo: string }[]) {
      const { data: att } = await supabase
        .from('training_attendance').select('status').eq('training_id', t.id);
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

  // ── Computados ────────────────────────────────────────────
  const hoy            = new Date().toISOString().split('T')[0];
  const proximoPartido = partidosStore.partidos
    .filter(p => p.status === 'scheduled' && p.date >= hoy)
    .sort((a, b) => a.date.localeCompare(b.date))[0] ?? null;

  const jugados        = partidosStore.partidos.filter(p => p.status === 'played');
  const victorias      = jugados.filter(p => p.goals_for > p.goals_against).length;
  const empates        = jugados.filter(p => p.goals_for === p.goals_against).length;
  const derrotas       = jugados.filter(p => p.goals_for < p.goals_against).length;
  const golesMarcados  = jugados.reduce((s, p) => s + p.goals_for,    0);
  const golesEncajados = jugados.reduce((s, p) => s + p.goals_against, 0);

  const convocCount = proximoPartido ? convocStore.getCount(proximoPartido.id) : undefined;
  useEffect(() => {
    if (proximoPartido && convocCount === undefined)
      convocStore.cargarCuentas([proximoPartido.id]);
  }, [proximoPartido?.id]);

  const topGoleadores = estadStore.getTopGoleadores(3).filter(p => p.goals > 0);

  // ── Bloque reutilizable: próximo partido ──────────────────
  const ProximoPartidoInner = () => (
    <div className="flex flex-col gap-3">
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
  );

  return (
    <div className="min-h-screen bg-quarte-gris">

      {/* ── HERO HEADER ─────────────────────────────────────── */}
      <div className="bg-gradient-to-b from-quarte-azul to-blue-900 px-4 pt-8 pb-8 relative">
        <div className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'%3E%3Ccircle cx='20' cy='20' r='1'/%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        <div className="max-w-5xl mx-auto relative">
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

          <div className="flex flex-col items-center text-center gap-3">
            <img src={escudoImg} alt="Escudo CD Atlético Quarte"
              className="w-20 h-20 object-contain drop-shadow-xl" />
            <h1 className="font-titulo text-2xl font-extrabold tracking-tight text-white">
              CD Atlético Quarte
            </h1>
            <TeamSwitcher />
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          MOBILE LAYOUT  (< md)  — igual que antes
      ══════════════════════════════════════════════════════ */}
      <div className="md:hidden max-w-lg mx-auto px-4 mt-4 pb-8 flex flex-col gap-4">

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

        {/* Próximo partido */}
        <div className="card"><ProximoPartidoInner /></div>

        {/* Último entrenamiento */}
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

        {/* Estadísticas */}
        {jugados.length > 0 && (
          <div className="card flex flex-col gap-3">
            <p className="font-titulo font-bold text-sm text-quarte-negro">Temporada 2026/27</p>
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: 'PJ', value: jugados.length, color: 'text-quarte-negro' },
                { label: 'V',  value: victorias,      color: 'text-quarte-verde' },
                { label: 'E',  value: empates,        color: 'text-gray-500'     },
                { label: 'D',  value: derrotas,       color: 'text-quarte-rojo'  },
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

        {/* Top goleadores */}
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
                const badgeIcons = ['🥇','🥈','🥉'];
                const bgMap: Record<number, string> = { 0: 'bg-yellow-50', 1: 'bg-gray-50', 2: 'bg-amber-50' };
                return (
                  <div key={p.player_id}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 ${bgMap[i] ?? 'bg-gray-50'}`}>
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
                    <span className="font-titulo font-extrabold text-lg text-quarte-negro">{p.goals}</span>
                    <span className="text-xs text-gray-400">⚽</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Pasar lista */}
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

      {/* ══════════════════════════════════════════════════════
          DESKTOP LAYOUT  (≥ md)  — nuevo diseño
      ══════════════════════════════════════════════════════ */}
      <div className="hidden md:block max-w-5xl mx-auto px-6 mt-6 pb-10">

        {/* FILA 1: Próximo Partido (grande) + Pasar Lista (lateral) */}
        <div className="grid grid-cols-[1fr_260px] gap-4 mb-4">

          {/* Próximo Partido */}
          <div className="card"><ProximoPartidoInner /></div>

          {/* Pasar Lista — tarjeta vertical */}
          <button onClick={() => navigate('/pasar-lista')}
            className="card flex flex-col items-start justify-between gap-3 p-5 text-left
                       hover:shadow-lg active:scale-[0.98] transition-all min-h-[160px]">
            <div className="w-14 h-14 rounded-2xl bg-quarte-verde flex items-center justify-center shadow">
              <ClipboardList size={28} className="text-white" />
            </div>
            <div>
              <p className="font-titulo font-bold text-xl text-quarte-negro leading-tight">Pasar lista</p>
              <p className="text-xs text-gray-400 mt-1">Registra la asistencia del equipo</p>
            </div>
            <span className="flex items-center gap-1 text-xs font-titulo font-bold text-quarte-azul tracking-wide">
              ABRIR <ArrowRight size={12} />
            </span>
          </button>
        </div>

        {/* FILA 2: Grid de secciones */}
        <div className="grid grid-cols-4 gap-4 mb-4">
          {SECCIONES.map(({ to, Icon, label, desc, color }) => (
            <button key={to} onClick={() => navigate(to)}
              className="card flex flex-col items-start gap-4 p-5 text-left
                         hover:shadow-lg active:scale-[0.98] transition-all">
              <div className={`${color} w-12 h-12 rounded-xl flex items-center justify-center shadow`}>
                <Icon size={24} className="text-white" />
              </div>
              <div>
                <p className="font-titulo font-bold text-base text-quarte-negro">{label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
              </div>
            </button>
          ))}
        </div>

        {/* FILA 3: Estadísticas + Top goleadores (lado a lado) */}
        {(jugados.length > 0 || topGoleadores.length > 0) && (
          <div className={`grid gap-4 mb-4 ${jugados.length > 0 && topGoleadores.length > 0 ? 'grid-cols-2' : 'grid-cols-1'}`}>

            {jugados.length > 0 && (
              <div className="card flex flex-col gap-4">
                <p className="font-titulo font-bold text-sm text-quarte-negro">Temporada 2026/27</p>
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { label: 'PJ', value: jugados.length, color: 'text-quarte-negro' },
                    { label: 'V',  value: victorias,      color: 'text-quarte-verde' },
                    { label: 'E',  value: empates,        color: 'text-gray-500'     },
                    { label: 'D',  value: derrotas,       color: 'text-quarte-rojo'  },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="flex flex-col items-center bg-quarte-gris rounded-xl py-3">
                      <span className={`font-titulo font-extrabold text-2xl leading-none ${color}`}>{value}</span>
                      <span className="text-[10px] text-gray-400 font-titulo font-semibold mt-1">{label}</span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-4 pt-1 border-t border-gray-100">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-titulo font-bold text-quarte-verde">⚽ {golesMarcados}</span>
                    <span className="text-xs text-gray-400">marcados</span>
                  </div>
                  <span className="text-gray-300">·</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-titulo font-bold text-quarte-rojo">⚽ {golesEncajados}</span>
                    <span className="text-xs text-gray-400">encajados</span>
                  </div>
                  <span className="text-gray-300">·</span>
                  <div className="flex items-center gap-1.5">
                    <span className={`text-sm font-titulo font-bold
                      ${golesMarcados - golesEncajados >= 0 ? 'text-quarte-verde' : 'text-quarte-rojo'}`}>
                      {golesMarcados - golesEncajados > 0 ? '+' : ''}{golesMarcados - golesEncajados}
                    </span>
                    <span className="text-xs text-gray-400">DG</span>
                  </div>
                </div>
              </div>
            )}

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
                    const badgeIcons = ['🥇','🥈','🥉'];
                    const bgMap: Record<number, string> = { 0: 'bg-yellow-50', 1: 'bg-gray-50', 2: 'bg-amber-50' };
                    return (
                      <div key={p.player_id}
                        className={`flex items-center gap-3 rounded-xl px-3 py-2.5 ${bgMap[i] ?? 'bg-gray-50'}`}>
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
                        <span className="font-titulo font-extrabold text-lg text-quarte-negro">{p.goals}</span>
                        <span className="text-xs text-gray-400">⚽</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* FILA 4: Último entrenamiento (ancho completo) */}
        {ultimoEntreno && (
          <div className="card flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-quarte-verde flex items-center justify-center flex-shrink-0">
              <ClipboardList size={24} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-titulo font-bold text-sm text-quarte-negro">Último entrenamiento</p>
              <p className="text-xs text-gray-500 truncate">{ultimoEntreno.titulo}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="font-titulo font-bold text-lg text-quarte-negro">
                {ultimoEntreno.presentes}/{ultimoEntreno.total}
              </p>
              <p className="text-[10px] text-gray-400">jugadores</p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
