// ============================================================
// RankingEquipo — Clasificación interna del equipo
// Tres pestañas: Goleadores | Asistencias | Asistencia entrenos
// ============================================================
import { useEffect } from 'react';
import { usePerfilStore }       from '@/stores/perfilStore';
import { useEstadisticasStore } from '@/stores/estadisticasStore';
import { useAsistenciaStore }   from '@/stores/asistenciaStore';
import { Trophy } from 'lucide-react';

type SubTab = 'goleadores' | 'asistencias' | 'asistencia';

interface Props {
  subTab:    SubTab;
  onSubTab:  (t: SubTab) => void;
}

const BADGE_COLORS = ['text-yellow-500', 'text-gray-400', 'text-amber-700'];
const BADGE_ICONS  = ['🥇', '🥈', '🥉'];

function Avatar({ foto, nombre, posicion }: { foto?: string; nombre: string; posicion?: string }) {
  const bgMap: Record<string, string> = {
    POR: 'bg-amber-400', DEF: 'bg-blue-500', MED: 'bg-green-500', DEL: 'bg-red-500',
  };
  if (foto) {
    return <img src={foto} alt={nombre} className="w-8 h-8 rounded-lg object-cover flex-shrink-0" />;
  }
  return (
    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-titulo font-bold
                     text-white text-xs flex-shrink-0 ${bgMap[posicion ?? ''] ?? 'bg-gray-400'}`}>
      {nombre.charAt(0).toUpperCase()}
    </div>
  );
}

export default function RankingEquipo({ subTab, onSubTab }: Props) {
  const { perfil }       = usePerfilStore();
  const estadStore       = useEstadisticasStore();
  const asistenciaStore  = useAsistenciaStore();

  useEffect(() => {
    if (!perfil) return;
    if (estadStore.stats.length === 0 && !estadStore.cargando) {
      estadStore.cargar(perfil.id);
    }
    if (asistenciaStore.estadisticasEquipo.length === 0 && !asistenciaStore.cargandoResumen) {
      asistenciaStore.cargarResumenEquipo(perfil.id);
    }
  }, [perfil?.id]);

  const goleadores   = estadStore.getTopGoleadores(10);
  const asistidores  = estadStore.getTopAsistidores(10);
  const asistencia   = [...asistenciaStore.estadisticasEquipo]
    .sort((a, b) => {
      const pA = a.total > 0 ? a.asistidos / a.total : 0;
      const pB = b.total > 0 ? b.asistidos / b.total : 0;
      return pB - pA;
    })
    .slice(0, 10);

  const cargando = estadStore.cargando || asistenciaStore.cargandoResumen;

  return (
    <div className="flex flex-col gap-3">
      {/* Sub-tabs */}
      <div className="flex bg-white rounded-xl shadow-sm overflow-hidden">
        {([
          { id: 'goleadores',  label: '⚽ Goles'     },
          { id: 'asistencias', label: '🎯 Asist.'    },
          { id: 'asistencia',  label: '📋 Asistencia' },
        ] as { id: SubTab; label: string }[]).map(t => (
          <button key={t.id} onClick={() => onSubTab(t.id)}
            className={`flex-1 py-2.5 text-[11px] font-titulo font-semibold transition-colors
              ${subTab === t.id
                ? 'bg-quarte-azul text-white'
                : 'text-gray-500 hover:bg-gray-50'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {cargando ? (
        <div className="flex justify-center py-10">
          <div className="w-6 h-6 border-2 border-quarte-azul border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* ── GOLEADORES ── */}
          {subTab === 'goleadores' && (
            <div className="card p-0 overflow-hidden">
              {goleadores.length === 0 ? (
                <EmptyRanking mensaje="Sin datos de goles. Registra resultados con eventos para ver el ranking." />
              ) : (
                <>
                  <div className="flex items-center gap-2 px-4 py-2.5 bg-quarte-azulClaro border-b border-gray-100">
                    <span className="w-6 text-center" />
                    <span className="flex-1 text-xs font-titulo font-bold text-quarte-azul">Jugador</span>
                    <span className="w-8 text-right text-xs font-titulo font-bold text-quarte-azul">⚽</span>
                    <span className="w-8 text-right text-xs font-titulo font-bold text-quarte-azul">PJ</span>
                    <span className="w-12 text-right text-xs font-titulo font-bold text-quarte-azul">G/P</span>
                  </div>
                  {goleadores.map((p, i) => {
                    const ratio = p.matches_played > 0
                      ? (p.goals / p.matches_played).toFixed(2)
                      : '—';
                    return (
                      <div key={p.player_id}
                        className={`flex items-center gap-2 px-4 py-2.5 ${i % 2 === 0 ? '' : 'bg-gray-50'}`}>
                        <span className="w-6 text-center text-sm">
                          {i < 3 ? BADGE_ICONS[i] : (
                            <span className="font-titulo font-bold text-xs text-gray-400">{i + 1}</span>
                          )}
                        </span>
                        <Avatar foto={p.player_foto} nombre={p.player_name} />
                        <span className="flex-1 font-titulo font-semibold text-sm text-quarte-negro truncate">
                          {p.player_name}
                        </span>
                        <span className={`w-8 text-right font-titulo font-bold text-sm
                          ${i < 3 ? BADGE_COLORS[i] : 'text-quarte-negro'}`}>
                          {p.goals}
                        </span>
                        <span className="w-8 text-right text-xs text-gray-400 font-cuerpo">{p.matches_played}</span>
                        <span className="w-12 text-right text-xs text-gray-500 font-cuerpo">{ratio}</span>
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          )}

          {/* ── ASISTENCIAS ── */}
          {subTab === 'asistencias' && (
            <div className="card p-0 overflow-hidden">
              {asistidores.length === 0 ? (
                <EmptyRanking mensaje="Sin datos de asistencias. Registra resultados con eventos para ver el ranking." />
              ) : (
                <>
                  <div className="flex items-center gap-2 px-4 py-2.5 bg-quarte-azulClaro border-b border-gray-100">
                    <span className="w-6 text-center" />
                    <span className="flex-1 text-xs font-titulo font-bold text-quarte-azul">Jugador</span>
                    <span className="w-8 text-right text-xs font-titulo font-bold text-quarte-azul">🎯</span>
                    <span className="w-8 text-right text-xs font-titulo font-bold text-quarte-azul">PJ</span>
                  </div>
                  {asistidores.filter(p => p.assists > 0).map((p, i) => (
                    <div key={p.player_id}
                      className={`flex items-center gap-2 px-4 py-2.5 ${i % 2 === 0 ? '' : 'bg-gray-50'}`}>
                      <span className="w-6 text-center text-sm">
                        {i < 3 ? BADGE_ICONS[i] : (
                          <span className="font-titulo font-bold text-xs text-gray-400">{i + 1}</span>
                        )}
                      </span>
                      <Avatar foto={p.player_foto} nombre={p.player_name} />
                      <span className="flex-1 font-titulo font-semibold text-sm text-quarte-negro truncate">
                        {p.player_name}
                      </span>
                      <span className={`w-8 text-right font-titulo font-bold text-sm
                        ${i < 3 ? BADGE_COLORS[i] : 'text-quarte-negro'}`}>
                        {p.assists}
                      </span>
                      <span className="w-8 text-right text-xs text-gray-400 font-cuerpo">{p.matches_played}</span>
                    </div>
                  ))}
                  {asistidores.filter(p => p.assists > 0).length === 0 && (
                    <EmptyRanking mensaje="Sin asistencias registradas todavía." />
                  )}
                </>
              )}
            </div>
          )}

          {/* ── ASISTENCIA A ENTRENAMIENTOS ── */}
          {subTab === 'asistencia' && (
            <div className="card p-0 overflow-hidden">
              {asistencia.length === 0 ? (
                <EmptyRanking mensaje="Sin datos de asistencia. Pasa lista en los entrenamientos para ver el ranking." />
              ) : (
                <>
                  <div className="flex items-center gap-2 px-4 py-2.5 bg-quarte-azulClaro border-b border-gray-100">
                    <span className="w-6 text-center" />
                    <span className="flex-1 text-xs font-titulo font-bold text-quarte-azul">Jugador</span>
                    <span className="w-10 text-right text-xs font-titulo font-bold text-quarte-azul">Asist.</span>
                    <span className="w-8  text-right text-xs font-titulo font-bold text-quarte-azul">Total</span>
                    <span className="w-10 text-right text-xs font-titulo font-bold text-quarte-azul">%</span>
                  </div>
                  {asistencia.map((s, i) => {
                    const pct = s.total > 0 ? Math.round((s.asistidos / s.total) * 100) : 0;
                    const textColor = pct >= 80 ? 'text-quarte-verde' : pct >= 60 ? 'text-amber-500' : 'text-quarte-rojo';
                    return (
                      <div key={s.player_id}
                        className={`flex items-center gap-2 px-4 py-2.5 ${i % 2 === 0 ? '' : 'bg-gray-50'}`}>
                        <span className="w-6 text-center text-sm">
                          {i < 3 ? BADGE_ICONS[i] : (
                            <span className="font-titulo font-bold text-xs text-gray-400">{i + 1}</span>
                          )}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="font-titulo font-semibold text-sm text-quarte-negro truncate">
                            {s.player_name}
                          </p>
                          <div className="h-1 bg-gray-200 rounded-full mt-1 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                pct >= 80 ? 'bg-quarte-verde' : pct >= 60 ? 'bg-amber-400' : 'bg-quarte-rojo'
                              }`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                        <span className="w-10 text-right font-titulo font-bold text-sm text-quarte-negro">{s.asistidos}</span>
                        <span className="w-8  text-right text-xs text-gray-400">/{s.total}</span>
                        <span className={`w-10 text-right font-titulo font-bold text-sm ${textColor}`}>{pct}%</span>
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function EmptyRanking({ mensaje }: { mensaje: string }) {
  return (
    <div className="flex flex-col items-center py-10 text-gray-400 gap-3 px-4">
      <Trophy size={32} className="opacity-20" />
      <p className="text-xs text-center font-cuerpo">{mensaje}</p>
    </div>
  );
}
