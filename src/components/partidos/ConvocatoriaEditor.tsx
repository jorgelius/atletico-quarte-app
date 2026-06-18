// ============================================================
// ConvocatoriaEditor — editor de convocatoria de partido
// Dos paneles: plantilla disponible (izq) ↔ convocados (der)
// ============================================================
import { useState, useCallback, useRef } from 'react';
import {
  ArrowLeft, Save, Users, ChevronDown, ChevronUp,
  Minus, Share2, Check, AlertCircle, FileDown,
} from 'lucide-react';
import type { Match, MatchSquad, MatchSquadStatus, Jugador } from '@/types';
import type { EstadisticaJugador } from '@/stores/asistenciaStore';
import ConvocatoriaPDFTemplate from './ConvocatoriaPDFTemplate';

// ── Helpers ──────────────────────────────────────────────────

const POSICION_ORDEN: Record<string, number> = { POR: 0, DEF: 1, MED: 2, DEL: 3 };
const POSICION_LABEL: Record<string, string> = {
  POR: 'Portero', DEF: 'Defensa', MED: 'Mediocampista', DEL: 'Delantero',
};
const POSICION_COLOR: Record<string, string> = {
  POR: 'bg-amber-100 text-amber-700',
  DEF: 'bg-blue-100 text-blue-700',
  MED: 'bg-green-100 text-green-700',
  DEL: 'bg-red-100 text-red-700',
};

const STATUS_INFO: Record<MatchSquadStatus, { icon: string; label: string; color: string }> = {
  called:    { icon: '📋', label: 'Convocado',  color: 'text-gray-500'     },
  confirmed: { icon: '✅', label: 'Confirmado', color: 'text-quarte-verde' },
  declined:  { icon: '❌', label: 'Baja',       color: 'text-quarte-rojo'  },
  doubt:     { icon: '⚠️', label: 'Duda',       color: 'text-amber-500'    },
  injured:   { icon: '🏥', label: 'Lesionado',  color: 'text-quarte-rojo'  },
};

function detectarLimites(equipo: string): { maxConvocados: number; numTitulares: number } {
  const lower = equipo.toLowerCase();
  if (lower.includes('prebenjamin') || lower.includes('prebenjamín')) {
    return { maxConvocados: 20, numTitulares: 7 };
  }
  if (
    lower.includes('benjamin') || lower.includes('benjamín') ||
    lower.includes('alevin')   || lower.includes('alevín')  ||
    lower.includes('infantil')
  ) {
    return { maxConvocados: 14, numTitulares: 7 };
  }
  return { maxConvocados: 18, numTitulares: 11 };
}

function formatFechaCorta(d: string): string {
  const [y, m, day] = d.split('-');
  return `${day}/${m}/${y}`;
}

// ── Avatar mini ───────────────────────────────────────────────
function MiniAvatar({ foto, nombre, posicion }: { foto?: string; nombre: string; posicion: string }) {
  if (foto) {
    return (
      <img src={foto} alt={nombre}
        className="w-9 h-9 rounded-xl object-cover flex-shrink-0" />
    );
  }
  const bgMap: Record<string, string> = {
    POR: 'bg-amber-400', DEF: 'bg-blue-500', MED: 'bg-green-500', DEL: 'bg-red-500',
  };
  return (
    <div className={`w-9 h-9 rounded-xl ${bgMap[posicion] ?? 'bg-gray-400'} flex items-center justify-center
                     font-titulo font-bold text-white text-sm flex-shrink-0`}>
      {nombre.charAt(0).toUpperCase()}
    </div>
  );
}

// ── Tarjeta jugador expandible (panel derecho) ────────────────
function JugadorConvocadoCard({
  squad,
  jugador,
  onToggleStarter,
  onUpdateStatus,
  onUpdateJersey,
  onUpdateNotes,
  onQuitar,
}: {
  squad:            MatchSquad;
  jugador?:         Jugador;
  onToggleStarter:  () => void;
  onUpdateStatus:   (s: MatchSquadStatus) => void;
  onUpdateJersey:   (n: number | undefined) => void;
  onUpdateNotes:    (n: string) => void;
  onQuitar:         () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const nombre = jugador
    ? `${jugador.nombre} ${jugador.apellidos}`.trim()
    : 'Jugador';
  const posicion = jugador?.posicion ?? 'DEF';

  return (
    <div className={`rounded-xl border-2 transition-all
      ${squad.is_starter
        ? 'border-quarte-azul bg-quarte-azulClaro'
        : 'border-gray-200 bg-white'}`}>

      {/* Fila principal */}
      <div className="flex items-center gap-2.5 px-3 py-2.5">
        <span className="font-titulo font-bold text-xs text-gray-400 w-5 text-center flex-shrink-0">
          {squad.position_in_squad}
        </span>

        <MiniAvatar foto={jugador?.foto_b64} nombre={nombre} posicion={posicion} />

        <div className="flex-1 min-w-0">
          <p className="font-titulo font-semibold text-sm text-quarte-negro truncate">{nombre}</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className={`text-[10px] font-titulo font-bold px-1.5 py-0.5 rounded-md ${POSICION_COLOR[posicion]}`}>
              {POSICION_LABEL[posicion]}
            </span>
            {squad.jersey_number && (
              <span className="text-[10px] text-gray-400">#{squad.jersey_number}</span>
            )}
            <span className={`text-[10px] ${STATUS_INFO[squad.status].color}`}>
              {STATUS_INFO[squad.status].icon}
            </span>
          </div>
        </div>

        {/* Toggle titular/suplente */}
        <button
          onClick={onToggleStarter}
          className={`flex-shrink-0 px-2.5 py-1.5 rounded-lg text-[10px] font-titulo font-bold transition-colors
            ${squad.is_starter
              ? 'bg-quarte-azul text-white'
              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
          {squad.is_starter ? 'TITULAR' : 'SUPL.'}
        </button>

        {/* Expandir */}
        <button onClick={() => setExpanded(v => !v)}
          className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 flex-shrink-0">
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>

      {/* Panel expandido */}
      {expanded && (
        <div className="px-3 pb-3 flex flex-col gap-2.5 border-t border-gray-100">
          {/* Dorsal para este partido */}
          <div className="flex items-center gap-2 pt-2.5">
            <label className="text-xs font-titulo font-semibold text-gray-500 w-24 flex-shrink-0">
              Dorsal partido
            </label>
            <input
              type="number" min={1} max={99}
              value={squad.jersey_number ?? ''}
              onChange={e => onUpdateJersey(e.target.value ? parseInt(e.target.value) : undefined)}
              placeholder={String(jugador?.dorsal ?? '')}
              className="w-16 px-2 py-1.5 rounded-lg border-2 border-gray-200
                         focus:border-quarte-azul outline-none text-sm font-cuerpo text-center" />
          </div>

          {/* Estado de disponibilidad */}
          <div>
            <p className="text-xs font-titulo font-semibold text-gray-500 mb-1.5">Disponibilidad</p>
            <div className="flex gap-1.5 flex-wrap">
              {(Object.keys(STATUS_INFO) as MatchSquadStatus[]).map(st => (
                <button key={st} type="button"
                  onClick={() => onUpdateStatus(st)}
                  className={`px-2 py-1 rounded-full text-[10px] font-titulo font-bold transition-colors
                    ${squad.status === st
                      ? 'bg-quarte-azul text-white'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                  {STATUS_INFO[st].icon} {STATUS_INFO[st].label}
                </button>
              ))}
            </div>
          </div>

          {/* Notas del entrenador */}
          <div>
            <label className="text-xs font-titulo font-semibold text-gray-500 mb-1 block">
              Notas
            </label>
            <input
              type="text"
              value={squad.notes ?? ''}
              onChange={e => onUpdateNotes(e.target.value)}
              placeholder="Ej: juega de lateral izquierdo"
              className="w-full px-3 py-2 rounded-lg border-2 border-gray-200
                         focus:border-quarte-azul outline-none text-xs font-cuerpo" />
          </div>

          {/* Quitar */}
          <button onClick={onQuitar}
            className="flex items-center gap-1.5 text-xs font-titulo font-semibold text-quarte-rojo
                       hover:bg-red-50 rounded-lg px-2 py-1.5 transition-colors w-fit">
            <Minus size={12} /> Quitar de la convocatoria
          </button>
        </div>
      )}
    </div>
  );
}

// ── Props principales ─────────────────────────────────────────
interface Props {
  partido:    Match;
  jugadores:  Jugador[];
  statsAsistencia: EstadisticaJugador[];
  initialSquad: MatchSquad[];
  equipo:     string;
  guardando:  boolean;
  onGuardar:  (squad: MatchSquad[]) => Promise<void>;
  onBack:     () => void;
}

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================
export default function ConvocatoriaEditor({
  partido, jugadores, statsAsistencia, initialSquad,
  equipo, guardando, onGuardar, onBack,
}: Props) {
  const { maxConvocados, numTitulares } = detectarLimites(equipo);
  const jugadoresIds = new Set(jugadores.map(j => j.id));
  const [squad, setSquad] = useState<MatchSquad[]>(() =>
    initialSquad.length > 0
      ? initialSquad.filter(s => jugadoresIds.has(s.player_id))
      : []
  );
  const [panel, setPanel] = useState<'disponibles' | 'convocados'>('disponibles');
  const [copiado, setCopiado] = useState(false);
  const [exportando, setExportando] = useState(false);
  const pdfRef = useRef<HTMLDivElement>(null);

  const convocadosIds = new Set(squad.map(s => s.player_id));

  const disponibles = jugadores
    .filter(j => !convocadosIds.has(j.id))
    .sort((a, b) =>
      (POSICION_ORDEN[a.posicion] ?? 9) - (POSICION_ORDEN[b.posicion] ?? 9) ||
      a.dorsal - b.dorsal
    );

  const titulares  = squad.filter(s => s.is_starter);
  const suplentes  = squad.filter(s => !s.is_starter);

  // ── Acciones ────────────────────────────────────────────────

  const agregarJugador = useCallback((jugador: Jugador) => {
    if (squad.length >= maxConvocados) return;
    const isTitular = titulares.length < numTitulares;
    const newEntry: MatchSquad = {
      id:                crypto.randomUUID(),
      match_id:          partido.id,
      player_id:         jugador.id,
      status:            'called',
      position_in_squad: squad.length + 1,
      is_starter:        isTitular,
      jersey_number:     jugador.dorsal,
      notes:             undefined,
      created_at:        new Date().toISOString(),
    };
    setSquad(prev => [...prev, newEntry]);
    setPanel('convocados');
  }, [squad.length, maxConvocados, titulares.length, numTitulares, partido.id]);

  const quitarJugador = useCallback((id: string) => {
    setSquad(prev => {
      const filtered = prev.filter(s => s.id !== id);
      return filtered.map((s, i) => ({ ...s, position_in_squad: i + 1 }));
    });
  }, []);

  const toggleStarter = useCallback((id: string) => {
    setSquad(prev => prev.map(s =>
      s.id === id ? { ...s, is_starter: !s.is_starter } : s
    ));
  }, []);

  const updateStatus = useCallback((id: string, status: MatchSquadStatus) => {
    setSquad(prev => prev.map(s => s.id === id ? { ...s, status } : s));
  }, []);

  const updateJersey = useCallback((id: string, jersey_number: number | undefined) => {
    setSquad(prev => prev.map(s => s.id === id ? { ...s, jersey_number } : s));
  }, []);

  const updateNotes = useCallback((id: string, notes: string) => {
    setSquad(prev => prev.map(s => s.id === id ? { ...s, notes: notes || undefined } : s));
  }, []);

  // ── Exportar texto ──────────────────────────────────────────
  function generarTexto(): string {
    const fecha = formatFechaCorta(partido.date);
    const hora  = partido.time ? ` · ${partido.time}` : '';
    const local = partido.location === 'home' ? 'Local' : partido.location === 'away' ? 'Visitante' : 'Campo Neutral';
    const jugMap = new Map(jugadores.map(j => [j.id, j]));

    let txt = `⚽ CD ATLÉTICO QUARTE — ${equipo}\n`;
    txt += `📅 ${fecha}${hora} | vs ${partido.rival_name} | ${local}`;
    if (partido.competition) txt += ` | ${partido.competition}`;
    txt += '\n\n';

    if (titulares.length > 0) {
      txt += 'TITULARES:\n';
      titulares.forEach((s, i) => {
        const j = jugMap.get(s.player_id);
        const nombre = j ? `${j.nombre} ${j.apellidos}`.trim() : 'Jugador';
        const pos    = j ? ` — ${POSICION_LABEL[j.posicion]}` : '';
        txt += `${i + 1}. ${nombre}${pos}\n`;
      });
    }

    if (suplentes.length > 0) {
      txt += '\nSUPLENTES:\n';
      suplentes.forEach((s, i) => {
        const j = jugMap.get(s.player_id);
        const nombre = j ? `${j.nombre} ${j.apellidos}`.trim() : 'Jugador';
        txt += `${titulares.length + i + 1}. ${nombre}\n`;
      });
    }

    return txt;
  }

  async function compartir() {
    const texto = generarTexto();
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    } catch {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = texto;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    }
  }

  // ── Helpers de stats ────────────────────────────────────────
  function getPct(playerId: string): number {
    const s = statsAsistencia.find(x => x.player_id === playerId);
    if (!s || s.total === 0) return 0;
    return Math.round((s.asistidos / s.total) * 100);
  }

  // ── Export PDF ──────────────────────────────────────────────
  async function handleExportPDF() {
    if (!pdfRef.current || squad.length === 0) return;
    setExportando(true);
    try {
      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import('html2canvas'),
        import('jspdf'),
      ]);
      const canvas = await html2canvas(pdfRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#ffffff',
        logging: false,
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = (canvas.height * pageW) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pageW, pageH);
      const filename = `convocatoria-${partido.rival_name.toLowerCase().replace(/\s+/g, '-')}.pdf`;
      pdf.save(filename);
    } catch (e) {
      console.error('Error generando PDF:', e);
    } finally {
      setExportando(false);
    }
  }

  // ── Render ───────────────────────────────────────────────────
  const lleno = squad.length >= maxConvocados;

  return (
    <div className="flex flex-col min-h-screen bg-quarte-gris">
      {/* Header */}
      <div className="bg-quarte-azul text-white px-4 pt-4 pb-4 flex items-center gap-3">
        <button onClick={onBack}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/20 hover:bg-white/30">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="font-titulo text-lg font-bold leading-tight">Convocatoria</h1>
          <p className="text-blue-200 text-xs truncate">
            vs {partido.rival_name} · {formatFechaCorta(partido.date)}
          </p>
        </div>
        {/* Copiar texto */}
        <button onClick={compartir} disabled={squad.length === 0}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/20 hover:bg-white/30
                     text-xs font-titulo font-semibold disabled:opacity-40 transition-colors">
          {copiado ? <Check size={14} /> : <Share2 size={14} />}
          {copiado ? 'Copiado' : 'Texto'}
        </button>
        {/* Descargar PDF */}
        <button onClick={handleExportPDF} disabled={squad.length === 0 || exportando}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/20 hover:bg-white/30
                     text-xs font-titulo font-semibold disabled:opacity-40 transition-colors">
          {exportando
            ? <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            : <FileDown size={14} />}
          PDF
        </button>
        {/* Guardar */}
        <button onClick={() => onGuardar(squad)} disabled={guardando}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-quarte-rojo hover:bg-red-700
                     text-xs font-titulo font-semibold disabled:opacity-60 transition-colors">
          {guardando
            ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            : <Save size={14} />}
          Guardar
        </button>
      </div>

      {/* Contador y selector de panel (mobile-first) */}
      <div className="bg-white border-b border-gray-100 px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <Users size={14} className="text-quarte-azul" />
            <span className="font-titulo font-bold text-sm text-quarte-negro">
              {squad.length}/{maxConvocados}
            </span>
          </div>
          <span className="text-xs text-gray-400">
            {titulares.length} titulares · {suplentes.length} suplentes
          </span>
        </div>
        {lleno && (
          <div className="flex items-center gap-1 text-amber-600 text-xs font-titulo font-semibold">
            <AlertCircle size={12} />
            Completa
          </div>
        )}
      </div>

      {/* Tab selector */}
      <div className="flex bg-white border-b border-gray-100">
        <button
          onClick={() => setPanel('disponibles')}
          className={`flex-1 py-2.5 text-xs font-titulo font-semibold transition-colors border-b-2
            ${panel === 'disponibles'
              ? 'text-quarte-azul border-quarte-azul'
              : 'text-gray-400 border-transparent hover:text-gray-600'}`}>
          Plantilla disponible ({disponibles.length})
        </button>
        <button
          onClick={() => setPanel('convocados')}
          className={`flex-1 py-2.5 text-xs font-titulo font-semibold transition-colors border-b-2
            ${panel === 'convocados'
              ? 'text-quarte-azul border-quarte-azul'
              : 'text-gray-400 border-transparent hover:text-gray-600'}`}>
          Convocados ({squad.length})
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">

        {/* ── PANEL IZQUIERDO: Disponibles ── */}
        {panel === 'disponibles' && (
          <div className="p-3 max-w-lg mx-auto flex flex-col gap-2">
            {disponibles.length === 0 ? (
              <div className="flex flex-col items-center py-12 text-gray-400 gap-3">
                <Users size={40} className="opacity-20" />
                <p className="font-titulo font-semibold text-sm">
                  {lleno ? 'Convocatoria completa' : 'Todos los jugadores ya están convocados'}
                </p>
              </div>
            ) : (
              <>
                {lleno && (
                  <div className="flex items-center gap-2 bg-amber-50 rounded-xl px-3 py-2
                                  text-xs text-amber-700 font-titulo font-semibold">
                    <AlertCircle size={14} />
                    Has alcanzado el máximo de {maxConvocados} convocados.
                  </div>
                )}
                {disponibles.map(j => {
                  const pct = getPct(j.id);
                  return (
                    <button
                      key={j.id}
                      onClick={() => agregarJugador(j)}
                      disabled={lleno}
                      className="flex items-center gap-3 bg-white rounded-xl px-3 py-3 shadow-sm
                                 hover:shadow-md active:scale-[0.98] transition-all
                                 disabled:opacity-50 disabled:cursor-not-allowed text-left w-full">
                      <MiniAvatar foto={j.foto_b64} nombre={j.nombre} posicion={j.posicion} />
                      <div className="flex-1 min-w-0">
                        <p className="font-titulo font-semibold text-sm text-quarte-negro truncate">
                          #{j.dorsal} {j.nombre} {j.apellidos}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={`text-[10px] font-titulo font-bold px-1.5 py-0.5 rounded-md ${POSICION_COLOR[j.posicion]}`}>
                            {POSICION_LABEL[j.posicion]}
                          </span>
                          {pct > 0 && (
                            <span className={`text-[10px] font-titulo font-semibold
                              ${pct >= 80 ? 'text-quarte-verde' : pct >= 60 ? 'text-amber-500' : 'text-quarte-rojo'}`}>
                              {pct}% asistencia
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="text-quarte-azul text-xs font-titulo font-semibold flex-shrink-0">
                        + Añadir
                      </span>
                    </button>
                  );
                })}
              </>
            )}
          </div>
        )}

        {/* ── PANEL DERECHO: Convocados ── */}
        {panel === 'convocados' && (
          <div className="p-3 max-w-lg mx-auto flex flex-col gap-3">
            {squad.length === 0 ? (
              <div className="flex flex-col items-center py-12 text-gray-400 gap-3">
                <Users size={40} className="opacity-20" />
                <p className="font-titulo font-semibold text-sm">Sin convocados todavía</p>
                <button onClick={() => setPanel('disponibles')}
                  className="text-xs text-quarte-azul font-titulo font-semibold hover:underline">
                  Ir a la plantilla →
                </button>
              </div>
            ) : (
              <>
                {/* Titulares */}
                {titulares.length > 0 && (
                  <div>
                    <p className="font-titulo text-xs font-bold text-quarte-azul uppercase
                                  tracking-wider mb-2 px-1">
                      Titulares ({titulares.length}/{numTitulares})
                    </p>
                    <div className="flex flex-col gap-1.5">
                      {titulares.map(sq => {
                        const jug = jugadores.find(j => j.id === sq.player_id);
                        return (
                          <JugadorConvocadoCard key={sq.id}
                            squad={sq} jugador={jug}
                            onToggleStarter={() => toggleStarter(sq.id)}
                            onUpdateStatus={s => updateStatus(sq.id, s)}
                            onUpdateJersey={n => updateJersey(sq.id, n)}
                            onUpdateNotes={n => updateNotes(sq.id, n)}
                            onQuitar={() => quitarJugador(sq.id)}
                          />
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Suplentes */}
                {suplentes.length > 0 && (
                  <div>
                    <p className="font-titulo text-xs font-bold text-gray-500 uppercase
                                  tracking-wider mb-2 px-1">
                      Suplentes ({suplentes.length})
                    </p>
                    <div className="flex flex-col gap-1.5">
                      {suplentes.map(sq => {
                        const jug = jugadores.find(j => j.id === sq.player_id);
                        return (
                          <JugadorConvocadoCard key={sq.id}
                            squad={sq} jugador={jug}
                            onToggleStarter={() => toggleStarter(sq.id)}
                            onUpdateStatus={s => updateStatus(sq.id, s)}
                            onUpdateJersey={n => updateJersey(sq.id, n)}
                            onUpdateNotes={n => updateNotes(sq.id, n)}
                            onQuitar={() => quitarJugador(sq.id)}
                          />
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Aviso si faltan titulares */}
                {titulares.length < numTitulares && (
                  <div className="flex items-center gap-2 bg-amber-50 rounded-xl px-3 py-2
                                  text-xs text-amber-700 font-titulo">
                    <AlertCircle size={14} />
                    Faltan {numTitulares - titulares.length} titulares para completar el equipo.
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Template oculto para generación de PDF */}
      <div style={{ position: 'fixed', left: '-9999px', top: '-9999px', zIndex: -1 }}>
        <ConvocatoriaPDFTemplate
          ref={pdfRef}
          partido={partido}
          jugadores={jugadores}
          squad={squad}
          equipo={equipo}
        />
      </div>
    </div>
  );
}
