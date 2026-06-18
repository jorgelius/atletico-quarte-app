// ============================================================
// ClasificacionPage — Clasificación de liga
//
// Vista (todos):     tabla de clasificación actualizada.
// Edición (admin/coordinador):
//   1. Pega texto copiado de la web de la federación.
//   2. Pulsa "Analizar con IA" → Edge Function → preview.
//   3. Revisa / edita filas, marca tu equipo con ★.
//   4. Pulsa "Guardar" → escribe en Supabase.
// ============================================================
import { useEffect, useState, useCallback } from 'react';
import {
  Trophy, Pencil, Sparkles, Save, X, Star, ArrowLeft,
  RefreshCw, AlertCircle, Clock, User as UserIcon, ChevronUp, ChevronDown,
} from 'lucide-react';
import { useClasificacionStore } from '@/stores/clasificacionStore';
import { usePerfilStore }        from '@/stores/perfilStore';
import { TeamSwitcher }          from '@/components/ui/TeamSwitcher';
import type { ClasificacionRow } from '@/types';

// ── Skeleton ─────────────────────────────────────────────────
function Skeleton() {
  return (
    <div className="animate-pulse space-y-2">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="h-11 bg-quarte-azulClaro rounded-xl" />
      ))}
    </div>
  );
}

// ── Empty state ───────────────────────────────────────────────
function EmptyState({ esAdmin, onEditar }: { esAdmin: boolean; onEditar: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
      <div className="w-20 h-20 rounded-full bg-quarte-azulClaro flex items-center justify-center">
        <Trophy size={36} className="text-quarte-azul opacity-40" />
      </div>
      <div>
        <p className="font-titulo font-bold text-quarte-negro text-lg">
          Sin clasificación disponible
        </p>
        <p className="font-cuerpo text-sm text-gray-500 mt-1 max-w-xs">
          {esAdmin
            ? 'Pulsa "Actualizar con IA" para añadir la clasificación actual de la liga.'
            : 'El coordinador aún no ha publicado la clasificación de esta temporada.'}
        </p>
      </div>
      {esAdmin && (
        <button
          onClick={onEditar}
          className="flex items-center gap-2 bg-quarte-azul text-white font-titulo font-semibold
                     text-sm px-5 py-2.5 rounded-full hover:bg-blue-900 transition-colors"
        >
          <Sparkles size={16} />
          Actualizar con IA
        </button>
      )}
    </div>
  );
}

// ── Standings table (vista) ───────────────────────────────────
function StandingsTable({ rows }: { rows: ClasificacionRow[] }) {
  const cols = ['PJ', 'PG', 'PE', 'PP', 'GF', 'GC', 'Pts'];

  return (
    <div className="overflow-x-auto rounded-2xl border border-quarte-azulClaro">
      <table className="w-full text-sm font-cuerpo min-w-[560px]">
        <thead>
          <tr className="bg-quarte-azul text-white text-xs font-titulo font-semibold uppercase tracking-wider">
            <th className="px-3 py-3 text-center w-10">#</th>
            <th className="px-4 py-3 text-left">Equipo</th>
            {cols.map((c) => (
              <th key={c} className="px-2 py-3 text-center w-12">{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={row.posicion}
              className={`border-t border-quarte-azulClaro transition-colors
                ${row.esNuestroEquipo
                  ? 'bg-quarte-azulClaro'
                  : i % 2 === 0 ? 'bg-white' : 'bg-quarte-gris/50'
                }
                hover:bg-quarte-azulClaro/60`}
            >
              {/* Posición */}
              <td className="px-3 py-3 text-center">
                <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-titulo font-bold
                  ${row.posicion === 1 ? 'bg-yellow-400 text-yellow-900'
                    : row.posicion === 2 ? 'bg-gray-300 text-gray-700'
                    : row.posicion === 3 ? 'bg-amber-600 text-white'
                    : 'text-quarte-negro'}`}
                >
                  {row.posicion}
                </span>
              </td>

              {/* Nombre */}
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  {row.esNuestroEquipo && (
                    <span className="inline-flex items-center gap-1 bg-quarte-azul text-white
                                     text-[10px] font-titulo font-bold px-2 py-0.5 rounded-full">
                      <Trophy size={9} />
                      Quarte
                    </span>
                  )}
                  <span className={`font-${row.esNuestroEquipo ? 'titulo font-bold text-quarte-azul' : 'cuerpo text-quarte-negro'}`}>
                    {row.equipo}
                  </span>
                </div>
              </td>

              {/* Stats */}
              {([row.pj, row.pg, row.pe, row.pp, row.gf, row.gc] as number[]).map((v, j) => (
                <td key={j} className="px-2 py-3 text-center text-quarte-negro">
                  {v}
                </td>
              ))}
              <td className="px-2 py-3 text-center font-titulo font-bold
                             text-quarte-azul tabular-nums">
                {row.pts}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Editable row ──────────────────────────────────────────────
function EditableRow({
  row,
  onChange,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
}: {
  row: ClasificacionRow;
  onChange: (updated: ClasificacionRow) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}) {
  function field(key: keyof ClasificacionRow, numeric = false) {
    return (
      <input
        type={numeric ? 'number' : 'text'}
        min={numeric ? 0 : undefined}
        value={row[key] as string | number}
        onChange={(e) =>
          onChange({ ...row, [key]: numeric ? Number(e.target.value) : e.target.value })
        }
        className={`w-full text-center rounded-lg border border-gray-200 px-1 py-1.5
                    text-xs font-cuerpo focus:outline-none focus:ring-2 focus:ring-quarte-azul
                    bg-white tabular-nums
                    ${row.esNuestroEquipo ? 'border-quarte-azul/40 bg-quarte-azulClaro/40' : ''}`}
      />
    );
  }

  return (
    <tr className={`border-t border-quarte-azulClaro
                    ${row.esNuestroEquipo ? 'bg-quarte-azulClaro/50' : 'bg-white'}`}>
      {/* Posición */}
      <td className="px-2 py-2 text-center">
        <div className="flex flex-col gap-0.5 items-center">
          <button onClick={onMoveUp} disabled={!canMoveUp}
            className="text-gray-400 hover:text-quarte-azul disabled:opacity-20 transition-colors">
            <ChevronUp size={14} />
          </button>
          <span className="text-xs font-titulo font-bold text-quarte-negro w-6 text-center">
            {row.posicion}
          </span>
          <button onClick={onMoveDown} disabled={!canMoveDown}
            className="text-gray-400 hover:text-quarte-azul disabled:opacity-20 transition-colors">
            <ChevronDown size={14} />
          </button>
        </div>
      </td>

      {/* Nuestro equipo toggle */}
      <td className="px-1 py-2 text-center">
        <button
          onClick={() => onChange({ ...row, esNuestroEquipo: !row.esNuestroEquipo })}
          title={row.esNuestroEquipo ? 'Quitar como nuestro equipo' : 'Marcar como nuestro equipo'}
          className={`transition-colors ${row.esNuestroEquipo ? 'text-quarte-azul' : 'text-gray-300 hover:text-quarte-azul'}`}
        >
          <Star size={16} fill={row.esNuestroEquipo ? 'currentColor' : 'none'} />
        </button>
      </td>

      {/* Nombre */}
      <td className="px-2 py-2 min-w-[160px]">
        <input
          type="text"
          value={row.equipo}
          onChange={(e) => onChange({ ...row, equipo: e.target.value })}
          className={`w-full rounded-lg border border-gray-200 px-2 py-1.5
                      text-xs font-cuerpo focus:outline-none focus:ring-2 focus:ring-quarte-azul
                      ${row.esNuestroEquipo ? 'border-quarte-azul/40 bg-quarte-azulClaro/40 font-bold' : 'bg-white'}`}
        />
      </td>

      {/* Numeric fields */}
      <td className="px-1 py-2 w-12">{field('pj', true)}</td>
      <td className="px-1 py-2 w-12">{field('pg', true)}</td>
      <td className="px-1 py-2 w-12">{field('pe', true)}</td>
      <td className="px-1 py-2 w-12">{field('pp', true)}</td>
      <td className="px-1 py-2 w-12">{field('gf', true)}</td>
      <td className="px-1 py-2 w-12">{field('gc', true)}</td>
      <td className="px-1 py-2 w-14">{field('pts', true)}</td>
    </tr>
  );
}

// ── Editable preview table ────────────────────────────────────
function EditableTable({
  rows,
  onChange,
}: {
  rows: ClasificacionRow[];
  onChange: (rows: ClasificacionRow[]) => void;
}) {
  function move(fromIdx: number, toIdx: number) {
    const next = [...rows];
    [next[fromIdx], next[toIdx]] = [next[toIdx], next[fromIdx]];
    // Recalculate positions
    onChange(next.map((r, i) => ({ ...r, posicion: i + 1 })));
  }

  function updateRow(idx: number, updated: ClasificacionRow) {
    const next = [...rows];
    next[idx] = updated;
    onChange(next);
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-quarte-azulClaro">
      <table className="w-full text-xs font-cuerpo min-w-[640px]">
        <thead>
          <tr className="bg-quarte-azul text-white text-[11px] font-titulo font-semibold uppercase tracking-wider">
            <th className="px-2 py-2.5 text-center w-14">Pos</th>
            <th className="px-1 py-2.5 text-center w-8">★</th>
            <th className="px-2 py-2.5 text-left">Equipo</th>
            {['PJ', 'PG', 'PE', 'PP', 'GF', 'GC', 'Pts'].map((c) => (
              <th key={c} className="px-1 py-2.5 text-center w-12">{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <EditableRow
              key={i}
              row={row}
              onChange={(updated) => updateRow(i, updated)}
              onMoveUp={() => move(i, i - 1)}
              onMoveDown={() => move(i, i + 1)}
              canMoveUp={i > 0}
              canMoveDown={i < rows.length - 1}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Página principal ──────────────────────────────────────────
export default function ClasificacionPage() {
  const { perfil, activeTeamId } = usePerfilStore();
  const {
    rows, updatedAt, updatedBy,
    cargando, guardando, parseando, errorParseo,
    cargar, guardar, parsearConIA,
  } = useClasificacionStore();

  const esAdmin = perfil?.rol === 'admin' || perfil?.rol === 'coordinador';
  const teamId  = activeTeamId ?? perfil?.team_ids[0] ?? '';

  const [modo,      setModo]      = useState<'vista' | 'edicion'>('vista');
  const [textoFed,  setTextoFed]  = useState('');
  const [preview,   setPreview]   = useState<ClasificacionRow[]>([]);
  const [guardadoOk, setGuardadoOk] = useState(false);

  useEffect(() => {
    if (teamId) cargar(teamId);
  }, [teamId]);

  const handleAnalizar = useCallback(async () => {
    if (!textoFed.trim()) return;
    const parsed = await parsearConIA(textoFed);
    if (parsed) setPreview(parsed);
  }, [textoFed, parsearConIA]);

  const handleGuardar = useCallback(async () => {
    if (!teamId || preview.length === 0) return;
    await guardar(teamId, preview, perfil!.nombre);
    setGuardadoOk(true);
    setTimeout(() => {
      setGuardadoOk(false);
      setModo('vista');
      setTextoFed('');
      setPreview([]);
    }, 1200);
  }, [teamId, preview, perfil, guardar]);

  const handleCancelar = useCallback(() => {
    setModo('vista');
    setTextoFed('');
    setPreview([]);
  }, []);

  // ── formato fecha ─────────────────────────────────────────
  const fechaFormateada = updatedAt
    ? new Intl.DateTimeFormat('es-ES', {
        day: 'numeric', month: 'long', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      }).format(new Date(updatedAt))
    : null;

  // ── Vista ─────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-quarte-gris px-4 py-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-9 h-9 rounded-xl bg-quarte-azul flex items-center justify-center shadow-card">
                <Trophy size={20} className="text-white" />
              </div>
              <h1 className="font-titulo font-bold text-quarte-negro text-2xl">
                Clasificación
              </h1>
            </div>
            <div className="flex items-center gap-2 flex-wrap ml-11 mt-1">
              <TeamSwitcher dark={false} />
              <span className="font-cuerpo text-sm text-gray-500">Temporada 2026/27</span>
            </div>
          </div>

          {esAdmin && modo === 'vista' && (
            <button
              onClick={() => setModo('edicion')}
              className="flex items-center gap-2 bg-quarte-azul text-white font-titulo font-semibold
                         text-sm px-4 py-2.5 rounded-full hover:bg-blue-900 transition-colors shadow-card"
            >
              <Sparkles size={16} />
              Actualizar con IA
            </button>
          )}

          {modo === 'edicion' && (
            <button
              onClick={handleCancelar}
              className="flex items-center gap-2 text-quarte-negro font-titulo font-semibold
                         text-sm px-4 py-2.5 rounded-full border border-gray-200 hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft size={16} />
              Cancelar
            </button>
          )}
        </div>

        {/* Metadatos de última actualización */}
        {fechaFormateada && modo === 'vista' && (
          <div className="flex items-center gap-4 text-xs text-gray-500 font-cuerpo
                          bg-white px-4 py-2.5 rounded-xl border border-quarte-azulClaro shadow-card">
            <span className="flex items-center gap-1.5">
              <Clock size={13} className="text-quarte-azul" />
              {fechaFormateada}
            </span>
            {updatedBy && (
              <span className="flex items-center gap-1.5">
                <UserIcon size={13} className="text-quarte-azul" />
                {updatedBy}
              </span>
            )}
          </div>
        )}

        {/* ── MODO VISTA ──────────────────────────────────── */}
        {modo === 'vista' && (
          <>
            {cargando
              ? <Skeleton />
              : rows.length === 0
                ? <EmptyState esAdmin={esAdmin} onEditar={() => setModo('edicion')} />
                : (
                  <div className="bg-white rounded-2xl shadow-card overflow-hidden">
                    <StandingsTable rows={rows} />
                  </div>
                )
            }

            {!cargando && rows.length > 0 && esAdmin && (
              <div className="flex justify-end">
                <button
                  onClick={() => cargar(teamId)}
                  className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-quarte-azul
                             font-cuerpo transition-colors"
                >
                  <RefreshCw size={13} />
                  Recargar
                </button>
              </div>
            )}
          </>
        )}

        {/* ── MODO EDICIÓN ────────────────────────────────── */}
        {modo === 'edicion' && (
          <div className="space-y-6">

            {/* Paso 1: Pegar texto */}
            <div className="bg-white rounded-2xl shadow-card p-5 space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-quarte-azul text-white text-xs font-titulo
                                 font-bold flex items-center justify-center shrink-0">1</span>
                <h2 className="font-titulo font-bold text-quarte-negro text-base">
                  Pega el texto de la federación
                </h2>
              </div>
              <p className="text-xs font-cuerpo text-gray-500">
                Copia toda la tabla de clasificación de la web de la federación aragonesa y pégala aquí.
                La IA extraerá automáticamente las estadísticas de cada equipo.
              </p>
              <textarea
                value={textoFed}
                onChange={(e) => setTextoFed(e.target.value)}
                placeholder="Pega aquí el texto con la clasificación (puede incluir encabezados, texto extra, etc.)..."
                rows={8}
                className="w-full rounded-xl border border-gray-200 p-3 text-sm font-cuerpo text-quarte-negro
                           resize-none focus:outline-none focus:ring-2 focus:ring-quarte-azul
                           placeholder:text-gray-300"
              />

              {/* Error */}
              {errorParseo && (
                <div className="flex items-start gap-2 bg-red-50 border border-red-200
                                text-red-700 rounded-xl px-4 py-3 text-sm font-cuerpo">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  <span>{errorParseo}</span>
                </div>
              )}

              <button
                onClick={handleAnalizar}
                disabled={parseando || !textoFed.trim()}
                className="flex items-center gap-2 bg-quarte-azul text-white font-titulo font-semibold
                           text-sm px-5 py-2.5 rounded-full hover:bg-blue-900 transition-colors
                           disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {parseando ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    Analizando con IA…
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    Analizar con IA
                  </>
                )}
              </button>
            </div>

            {/* Paso 2: Preview editable */}
            {preview.length > 0 && (
              <div className="bg-white rounded-2xl shadow-card p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-quarte-azul text-white text-xs font-titulo
                                   font-bold flex items-center justify-center shrink-0">2</span>
                  <h2 className="font-titulo font-bold text-quarte-negro text-base">
                    Revisa y edita la clasificación
                  </h2>
                </div>
                <p className="text-xs font-cuerpo text-gray-500">
                  Verifica que los datos son correctos. Pulsa <Star size={11} className="inline" /> para marcar
                  el equipo Quarte. Usa las flechas para reordenar si es necesario.
                </p>

                <EditableTable rows={preview} onChange={setPreview} />

                {/* Actions */}
                <div className="flex items-center gap-3 justify-end pt-2">
                  <button
                    onClick={handleCancelar}
                    className="flex items-center gap-2 text-quarte-negro font-titulo font-semibold
                               text-sm px-4 py-2.5 rounded-full border border-gray-200
                               hover:bg-gray-100 transition-colors"
                  >
                    <X size={16} />
                    Cancelar
                  </button>
                  <button
                    onClick={handleGuardar}
                    disabled={guardando || guardadoOk}
                    className="flex items-center gap-2 bg-quarte-verde text-white font-titulo font-semibold
                               text-sm px-5 py-2.5 rounded-full hover:opacity-90 transition-all
                               disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {guardadoOk ? (
                      <>
                        <Pencil size={16} />
                        ¡Guardado!
                      </>
                    ) : guardando ? (
                      <>
                        <RefreshCw size={16} className="animate-spin" />
                        Guardando…
                      </>
                    ) : (
                      <>
                        <Save size={16} />
                        Guardar clasificación
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
