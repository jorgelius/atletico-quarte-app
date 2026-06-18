// ============================================================
// EstadisticasPage — /estadisticas
// Resumen de temporada, racha, gráfica de forma, tarta V/E/D y
// tabla completa de estadísticas individuales sortable.
// ============================================================
import { useEffect, useState } from 'react';
import { BarChart2 } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import { usePerfilStore }       from '@/stores/perfilStore';
import { usePartidosStore }     from '@/stores/partidosStore';
import { useEstadisticasStore } from '@/stores/estadisticasStore';
import { TeamSwitcher }         from '@/components/ui/TeamSwitcher';
import type { PlayerStats }     from '@/stores/estadisticasStore';

type SortCol = 'matches_played' | 'goals' | 'assists' | 'yellow_cards' | 'red_cards' | 'mvps';
type SortDir = 'desc' | 'asc';

const COL_HEADERS: { col: SortCol; label: string }[] = [
  { col: 'matches_played', label: 'PJ' },
  { col: 'goals',          label: '⚽' },
  { col: 'assists',        label: '🎯' },
  { col: 'yellow_cards',   label: '🟨' },
  { col: 'red_cards',      label: '🟥' },
  { col: 'mvps',           label: '⭐' },
];

export default function EstadisticasPage() {
  const { perfil, activeTeamId } = usePerfilStore();
  const partidosStore = usePartidosStore();
  const estadStore    = useEstadisticasStore();

  const [sortCol, setSortCol] = useState<SortCol>('goals');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  useEffect(() => {
    if (!activeTeamId) return;
    partidosStore.cargar(activeTeamId);
    estadStore.cargar(activeTeamId);
  }, [activeTeamId]);

  if (!perfil) return null;

  // ── Computados de partidos ───────────────────────────────────
  const jugados = partidosStore.partidos.filter(p => p.status === 'played');
  const victorias = jugados.filter(p => p.goals_for > p.goals_against).length;
  const empates   = jugados.filter(p => p.goals_for === p.goals_against).length;
  const derrotas  = jugados.filter(p => p.goals_for < p.goals_against).length;
  const golesMarcados  = jugados.reduce((s, p) => s + p.goals_for,    0);
  const golesEncajados = jugados.reduce((s, p) => s + p.goals_against, 0);
  const pctVictorias = jugados.length > 0 ? Math.round((victorias / jugados.length) * 100) : 0;

  // Racha: últimos 5 jugados, en orden cronológico → izquierda = más antiguo
  const ultimos5 = [...jugados]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5)
    .reverse();

  // Datos gráfica de forma (cronológico, más reciente a la derecha)
  const datosForma = [...jugados]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map(p => ({
      rival: p.rival_name.length > 7 ? p.rival_name.slice(0, 7) + '.' : p.rival_name,
      gf:    p.goals_for,
      gc:    p.goals_against,
    }));

  // Datos tarta
  const datosTarta = [
    { name: 'Victorias', value: victorias, color: '#328F3B' },
    { name: 'Empates',   value: empates,   color: '#9CA3AF' },
    { name: 'Derrotas',  value: derrotas,  color: '#D9161E' },
  ];

  // Tabla jugadores ordenada
  const statsOrdenadas = [...estadStore.stats].sort((a: PlayerStats, b: PlayerStats) => {
    const aVal = a[sortCol] as number;
    const bVal = b[sortCol] as number;
    return sortDir === 'desc' ? bVal - aVal : aVal - bVal;
  });

  function toggleSort(col: SortCol) {
    if (sortCol === col) setSortDir(d => d === 'desc' ? 'asc' : 'desc');
    else { setSortCol(col); setSortDir('desc'); }
  }

  const cargando = partidosStore.cargando || estadStore.cargando;

  return (
    <div className="flex flex-col min-h-screen bg-quarte-gris">

      {/* Header */}
      <div className="bg-quarte-azul text-white px-4 pt-4 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
            <BarChart2 size={20} />
          </div>
          <div className="flex-1">
            <h1 className="font-titulo text-lg font-bold">Estadísticas</h1>
            <div className="flex items-center gap-2 flex-wrap mt-0.5">
              <TeamSwitcher />
              <span className="text-blue-200 text-xs">Temporada 2026/27</span>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="flex-1 overflow-y-auto p-4 max-w-lg mx-auto w-full flex flex-col gap-4">

        {/* ── Loading ── */}
        {cargando && (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-quarte-azul border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* ── Empty state ── */}
        {!cargando && jugados.length === 0 && (
          <div className="flex flex-col items-center py-20 text-gray-400 gap-3">
            <BarChart2 size={48} className="opacity-20" />
            <p className="font-titulo font-semibold text-sm">Sin datos todavía</p>
            <p className="text-xs text-center">
              Registra resultados en Partidos para ver las estadísticas aquí.
            </p>
          </div>
        )}

        {!cargando && jugados.length > 0 && (
          <>
            {/* ── Resumen temporada ── */}
            <div className="card flex flex-col gap-3">
              <p className="font-titulo font-bold text-sm text-quarte-negro">Resumen temporada</p>

              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: 'PJ', value: jugados.length, color: 'text-quarte-negro' },
                  { label: 'V',  value: victorias,      color: 'text-quarte-verde' },
                  { label: 'E',  value: empates,         color: 'text-gray-500'    },
                  { label: 'D',  value: derrotas,        color: 'text-quarte-rojo' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="flex flex-col items-center bg-quarte-gris rounded-xl py-3">
                    <span className={`font-titulo font-extrabold text-2xl leading-none ${color}`}>{value}</span>
                    <span className="text-[10px] text-gray-400 font-titulo font-semibold mt-1">{label}</span>
                  </div>
                ))}
              </div>

              <div className="flex gap-0 justify-around pt-2 border-t border-gray-100">
                {[
                  { label: 'Marcados',  value: golesMarcados,                            color: 'text-quarte-verde' },
                  { label: 'Encajados', value: golesEncajados,                           color: 'text-quarte-rojo'  },
                  { label: 'DG',        value: (golesMarcados - golesEncajados > 0 ? '+' : '') + (golesMarcados - golesEncajados), color: golesMarcados >= golesEncajados ? 'text-quarte-verde' : 'text-quarte-rojo' },
                  { label: '% Victoria', value: `${pctVictorias}%`,                      color: 'text-quarte-azul'  },
                ].map(({ label, value, color }) => (
                  <div key={label} className="flex flex-col items-center gap-0.5">
                    <span className={`font-titulo font-extrabold text-lg leading-tight ${color}`}>{value}</span>
                    <span className="text-[9px] text-gray-400 font-titulo">{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Forma reciente (últimos 5) ── */}
            {ultimos5.length > 0 && (
              <div className="card flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <p className="font-titulo font-bold text-sm text-quarte-negro">Forma reciente</p>
                  <span className="text-[10px] text-gray-400 font-titulo">← más antiguo · más reciente →</span>
                </div>
                <div className="flex gap-2 justify-center">
                  {ultimos5.map(p => {
                    const outcome = p.goals_for > p.goals_against ? 'V'
                      : p.goals_for < p.goals_against ? 'D' : 'E';
                    const cls = {
                      V: 'bg-quarte-verde text-white',
                      E: 'bg-gray-200 text-gray-600',
                      D: 'bg-quarte-rojo text-white',
                    }[outcome];
                    return (
                      <div key={p.id}
                        className={`flex flex-col items-center gap-0.5 rounded-xl px-3 py-2.5 flex-1 ${cls}`}>
                        <span className="font-titulo font-extrabold text-base leading-none">{outcome}</span>
                        <span className="font-titulo font-semibold text-[11px] opacity-80 leading-none mt-1">
                          {p.goals_for}–{p.goals_against}
                        </span>
                        <span className="text-[9px] opacity-60 mt-0.5 truncate max-w-full px-1 text-center">
                          {p.rival_name.length > 6 ? p.rival_name.slice(0, 6) + '.' : p.rival_name}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── Gráfica de forma ── */}
            {datosForma.length > 1 && (
              <div className="card flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <p className="font-titulo font-bold text-sm text-quarte-negro">Goles por partido</p>
                  <div className="flex gap-3">
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-0.5 bg-quarte-verde rounded-full" />
                      <span className="text-[10px] text-gray-400 font-titulo">Marcados</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-0.5 bg-quarte-rojo rounded-full" />
                      <span className="text-[10px] text-gray-400 font-titulo">Encajados</span>
                    </div>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={180}>
                  <LineChart data={datosForma} margin={{ top: 4, right: 8, bottom: 0, left: -28 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                    <XAxis
                      dataKey="rival"
                      tick={{ fontSize: 9, fontFamily: 'Space Grotesk, sans-serif', fill: '#9CA3AF' }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{ fontSize: 9, fontFamily: 'Space Grotesk, sans-serif', fill: '#9CA3AF' }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: '0.75rem',
                        border: 'none',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                        fontSize: 12,
                        fontFamily: 'Space Grotesk, sans-serif',
                      }}
                      labelStyle={{ fontWeight: 700, color: '#1A1A1A', marginBottom: 4 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="gf"
                      name="Marcados"
                      stroke="#328F3B"
                      strokeWidth={2.5}
                      dot={{ r: 4, fill: '#328F3B', strokeWidth: 0 }}
                      activeDot={{ r: 6, strokeWidth: 0 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="gc"
                      name="Encajados"
                      stroke="#D9161E"
                      strokeWidth={2.5}
                      dot={{ r: 4, fill: '#D9161E', strokeWidth: 0 }}
                      activeDot={{ r: 6, strokeWidth: 0 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* ── Balance V/E/D (tarta + leyenda) ── */}
            <div className="card flex items-center gap-4">
              <PieChart width={120} height={120}>
                <Pie
                  data={datosTarta}
                  cx={55}
                  cy={55}
                  innerRadius={33}
                  outerRadius={52}
                  paddingAngle={3}
                  dataKey="value"
                  startAngle={90}
                  endAngle={-270}
                >
                  {datosTarta.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: '0.75rem',
                    border: 'none',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                    fontSize: 11,
                  }}
                />
              </PieChart>

              <div className="flex flex-col gap-2.5 flex-1">
                {[
                  { label: 'Victorias', value: victorias, dotColor: 'bg-quarte-verde', textColor: 'text-quarte-verde' },
                  { label: 'Empates',   value: empates,   dotColor: 'bg-gray-400',     textColor: 'text-gray-500'     },
                  { label: 'Derrotas',  value: derrotas,  dotColor: 'bg-quarte-rojo',  textColor: 'text-quarte-rojo'  },
                ].map(({ label, value, dotColor, textColor }) => {
                  const pct = jugados.length > 0 ? Math.round((value / jugados.length) * 100) : 0;
                  return (
                    <div key={label} className="flex items-center gap-2">
                      <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${dotColor}`} />
                      <span className="text-xs font-titulo text-gray-500 flex-1">{label}</span>
                      <span className={`font-titulo font-bold text-sm ${textColor}`}>{value}</span>
                      <span className="text-[10px] text-gray-400 w-9 text-right">{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── Tabla estadísticas individuales ── */}
            {estadStore.stats.length > 0 && (
              <div className="card p-0 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="font-titulo font-bold text-sm text-quarte-negro">Estadísticas individuales</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">Toca una columna para ordenar</p>
                </div>

                {/* Cabecera con sort */}
                <div className="flex items-center gap-1 px-3 py-2 bg-quarte-azulClaro border-b border-gray-100">
                  <span className="flex-1 text-xs font-titulo font-bold text-quarte-azul">Jugador</span>
                  {COL_HEADERS.map(({ col, label }) => (
                    <button
                      key={col}
                      onClick={() => toggleSort(col)}
                      className={`w-9 text-right text-xs font-titulo font-semibold transition-colors leading-tight
                        ${sortCol === col
                          ? 'text-quarte-azul font-bold'
                          : 'text-gray-400 hover:text-quarte-negro'}`}
                    >
                      {label}
                      {sortCol === col && (
                        <span className="text-[8px] ml-px">{sortDir === 'desc' ? '↓' : '↑'}</span>
                      )}
                    </button>
                  ))}
                </div>

                {/* Filas */}
                {statsOrdenadas.length === 0 ? (
                  <div className="flex flex-col items-center py-8 text-gray-400 gap-2">
                    <p className="text-xs text-center px-4">
                      Sin estadísticas individuales todavía. Añade eventos al registrar resultados.
                    </p>
                  </div>
                ) : (
                  statsOrdenadas.map((p, i) => (
                    <div key={p.player_id}
                      className={`flex items-center gap-1 px-3 py-2.5 ${i % 2 === 0 ? '' : 'bg-gray-50'}`}>
                      {p.player_foto ? (
                        <img src={p.player_foto} alt={p.player_name}
                          className="w-7 h-7 rounded-lg object-cover flex-shrink-0" />
                      ) : (
                        <div className="w-7 h-7 rounded-lg bg-quarte-azul flex items-center justify-center
                                        font-titulo font-bold text-white text-[10px] flex-shrink-0">
                          {p.player_name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span className="flex-1 font-titulo font-semibold text-xs text-quarte-negro truncate ml-1">
                        {p.player_name}
                      </span>
                      {COL_HEADERS.map(({ col }) => {
                        const val = p[col] as number;
                        return (
                          <span
                            key={col}
                            className={`w-9 text-right font-titulo text-xs
                              ${sortCol === col
                                ? 'text-quarte-azul font-bold'
                                : val > 0 ? 'text-quarte-negro font-semibold' : 'text-gray-300 font-normal'}`}
                          >
                            {val > 0 ? val : '—'}
                          </span>
                        );
                      })}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Nota si no hay estadísticas individuales pero sí partidos */}
            {estadStore.stats.length === 0 && !estadStore.cargando && (
              <div className="card flex flex-col items-center py-8 text-gray-400 gap-2">
                <p className="text-xs text-center">
                  Sin estadísticas individuales. Añade eventos (goles, asistencias…) al registrar resultados.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
