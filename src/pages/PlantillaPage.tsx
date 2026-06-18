// ============================================================
// PlantillaPage — Fase 2 completa
// Tabs: Alineación | Jugadores
// ============================================================
import { useEffect, useRef, useState } from 'react';
import { Users, Save, Download, Trash2, ChevronDown, ClipboardList, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import Konva from 'konva';
import { usePerfilStore } from '@/stores/perfilStore';
import { usePlantillaStore } from '@/stores/plantillaStore';
import { useAsistenciaStore } from '@/stores/asistenciaStore';
import { getFormaciones, getNumBanquillo, getNumTitulares } from '@/components/plantilla/formaciones';
import { getFormatoEquipo } from '@/data/equipos';
import { TeamSwitcher } from '@/components/ui/TeamSwitcher';
import FieldCanvas from '@/components/plantilla/FieldCanvas';
import GestorJugadores from '@/components/plantilla/GestorJugadores';
import JugadorModal from '@/components/plantilla/JugadorModal';

type Tab = 'alineacion' | 'jugadores' | 'asistencia';

const COLORES_BANQ: Record<string, string> = {
  POR: 'border-amber-400 bg-amber-50',
  DEF: 'border-blue-400 bg-blue-50',
  MED: 'border-green-400 bg-green-50',
  DEL: 'border-red-400 bg-red-50',
};

export default function PlantillaPage() {
  const { perfil }       = usePerfilStore();
  const store            = usePlantillaStore();
  const asistenciaStore  = useAsistenciaStore();
  const stageRef         = useRef<Konva.Stage | null>(null);
  const [tab, setTab] = useState<Tab>('alineacion');
  const [modalSlot, setModal]   = useState<number | null>(null);
  const [showCargar, setShowC]  = useState(false);
  const [showFmt, setShowFmt]   = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [toast, setToast] = useState<{ tipo: 'ok' | 'error'; msg: string } | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { activeTeamId } = usePerfilStore();

  useEffect(() => {
    if (!perfil || !activeTeamId) return;
    store.cargar(activeTeamId);
    store.cambiarFormato(getFormatoEquipo(activeTeamId));
    asistenciaStore.cargarResumenEquipo(perfil.id);  // entrenos = biblioteca personal
    asistenciaStore.cargarEstadisticasLista(activeTeamId);
  }, [activeTeamId]);

  if (!perfil) return null;

  const numTit  = getNumTitulares(store.formato);
  const numBanq = getNumBanquillo(store.formato);
  const formaciones = Object.keys(getFormaciones(store.formato));
  const banqSlots  = store.slots.filter(s => !s.esTitular);
  const jugadorMap = new Map(store.jugadores.map(j => [j.id, j]));

  // ── Jugador en el modal ──
  const modalJugadorId = modalSlot !== null ? store.slots[modalSlot]?.jugadorId : null;
  const modalJugador   = modalJugadorId ? jugadorMap.get(modalJugadorId) : undefined;

  // ── Export PNG ──
  function exportarPNG() {
    const uri = stageRef.current?.toDataURL({ pixelRatio: 2 });
    if (!uri) return;
    const a = document.createElement('a');
    a.href = uri;
    a.download = `alineacion_${store.formacion}_${Date.now()}.png`;
    a.click();
  }

  function showToast(tipo: 'ok' | 'error', msg: string) {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ tipo, msg });
    toastTimer.current = setTimeout(() => setToast(null), 5000);
  }

  // ── Guardar alineación (un solo clic, sin nombre) ──
  async function handleGuardar() {
    console.log('[handleGuardar] click — activeTeamId:', activeTeamId, 'guardando:', guardando);
    if (!activeTeamId) {
      showToast('error', 'Sin equipo activo — selecciona un equipo');
      return;
    }
    if (guardando) return;
    setGuardando(true);
    try {
      await store.guardarAlineacion(activeTeamId, 'Plantilla activa');
      showToast('ok', '✓ Plantilla guardada');
    } catch (e) {
      console.error('[handleGuardar] Error:', e);
      const msg = e instanceof Error ? e.message : String(e);
      showToast('error', `Error: ${msg.slice(0, 60)}`);
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-quarte-gris">
      {/* Cabecera */}
      <div className="bg-quarte-azul text-white px-4 pt-4 pb-3 flex items-center gap-3">
        <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
          <Users size={20} className="text-white" />
        </div>
        <div className="flex-1">
          <h1 className="font-titulo text-lg font-bold leading-tight">Plantilla</h1>
          <div className="flex items-center gap-2 flex-wrap mt-0.5">
            <TeamSwitcher />
            <span className="text-blue-200 text-xs">· {store.formato} · {store.formacion}</span>
          </div>
        </div>
        {/* Exportar PNG */}
        <button onClick={exportarPNG}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/10
                     hover:bg-white/20 transition-colors" title="Exportar PNG">
          <Download size={18} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex bg-quarte-azul border-t border-blue-800">
        {([
          { id: 'alineacion', label: '⚽ Alineación' },
          { id: 'jugadores',  label: '👥 Jugadores'  },
          { id: 'asistencia', label: '📋 Asistencia' },
        ] as { id: Tab; label: string }[]).map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-1 py-2.5 text-xs font-titulo font-semibold transition-colors
              ${tab === t.id ? 'text-white border-b-2 border-quarte-rojo' : 'text-blue-300 hover:text-white'}`}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* ── TAB ALINEACIÓN ── */}
        {tab === 'alineacion' && (
          <div className="flex flex-col gap-3 p-3 max-w-lg mx-auto">

            {/* Controles: formato + formación */}
            <div className="flex gap-2">
              {/* Formato (fijo según categoría) */}
              <div className="flex items-center px-4 py-2.5 bg-quarte-azul text-white rounded-xl shadow-sm flex-shrink-0">
                <span className="text-sm font-titulo font-bold">{store.formato}</span>
              </div>

              {/* Selector de formación */}
              <div className="relative flex-1">
                <button onClick={() => setShowFmt(v => !v)}
                  className="w-full flex items-center justify-between gap-2 bg-white rounded-xl
                             shadow-sm px-4 py-2.5 text-sm font-titulo font-bold text-quarte-azul">
                  {store.formacion}
                  <ChevronDown size={16} />
                </button>
                {showFmt && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-lg z-30
                                  border border-gray-100 max-h-48 overflow-y-auto">
                    {formaciones.map(f => (
                      <button key={f} onClick={() => { store.cambiarFormacion(f); setShowFmt(false); }}
                        className={`w-full text-left px-4 py-2.5 text-sm font-titulo font-semibold
                          hover:bg-quarte-azulClaro transition-colors
                          ${f === store.formacion ? 'text-quarte-azul bg-quarte-azulClaro' : 'text-quarte-negro'}`}>
                        {f}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Campo */}
            <FieldCanvas
              formato={store.formato}
              slots={store.slots}
              jugadores={store.jugadores}
              seleccionado={store.seleccionado}
              onSelectSlot={store.seleccionarSlot}
              onMoveSlot={store.moverASlot}
              onOpenModal={setModal}
              stageRef={stageRef}
            />

            {/* Instrucción */}
            <p className="text-xs text-gray-400 text-center">
              Toca un jugador para seleccionarlo · Toca otro para intercambiar · Doble toque para editar
            </p>

            {/* Banquillo */}
            <div>
              <p className="font-titulo text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                Banquillo ({banqSlots.filter(s => s.jugadorId).length}/{numBanq})
              </p>
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {banqSlots.map(slot => {
                  const jug = slot.jugadorId ? jugadorMap.get(slot.jugadorId) : undefined;
                  const isSel = store.seleccionado === String(slot.slotIdx);
                  return (
                    <button
                      key={slot.slotIdx}
                      onClick={() => {
                        if (store.seleccionado !== null) {
                          store.moverASlot(slot.slotIdx);
                        } else if (jug) {
                          store.seleccionarSlot(slot.slotIdx);
                        }
                      }}
                      className={`flex-shrink-0 w-16 h-16 rounded-xl border-2 flex flex-col
                                  items-center justify-center transition-all
                                  ${jug ? COLORES_BANQ[jug.posicion] : 'border-dashed border-gray-300 bg-gray-50'}
                                  ${isSel ? 'ring-2 ring-yellow-400 ring-offset-1' : ''}`}>
                      {jug ? (
                        <>
                          <span className="font-titulo font-bold text-lg leading-none">{jug.dorsal}</span>
                          <span className="text-[9px] font-cuerpo truncate px-1">{(jug.apellidos || jug.nombre).split(' ')[0]}</span>
                        </>
                      ) : (
                        <span className="text-gray-300 text-xs">{slot.slotIdx - numTit + 1}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Guardar plantilla — un solo clic */}
            <button onClick={handleGuardar} disabled={guardando}
              className="btn-secundario w-full flex items-center justify-center gap-2 text-sm">
              {guardando
                ? <Loader2 size={16} className="animate-spin" />
                : <Save size={16} />}
              {guardando ? 'Guardando…' : 'Guardar plantilla'}
            </button>

            {/* Lista alineaciones guardadas (por si hay más de una) */}
            {showCargar && (
              <div className="card flex flex-col gap-2">
                <p className="font-titulo font-bold text-sm text-quarte-negro">Versiones guardadas</p>
                {store.alineacionesGuardadas.length === 0 && (
                  <p className="text-sm text-gray-400">Sin versiones guardadas.</p>
                )}
                {store.alineacionesGuardadas.map(a => (
                  <div key={a.id} className="flex items-center gap-3 bg-gray-50 rounded-xl px-3 py-2">
                    <div className="flex-1">
                      <p className="font-titulo font-semibold text-sm text-quarte-negro">{a.nombre}</p>
                      <p className="text-xs text-gray-400">{a.formato} · {a.formacion}</p>
                    </div>
                    <button onClick={() => { store.cargarAlineacion(a); setShowC(false); }}
                      className="text-xs text-quarte-azul font-semibold hover:underline">Cargar</button>
                    <button onClick={() => store.borrarAlineacion(a.id)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg
                                 bg-red-50 text-quarte-rojo hover:bg-red-100">
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── TAB JUGADORES ── */}
        {tab === 'jugadores' && (
          <div className="p-4 max-w-lg mx-auto">
            <GestorJugadores
              jugadores={store.jugadores}
              ownerId={activeTeamId ?? ''}
              onAgregar={store.agregarJugador}
              onEditar={store.editarJugador}
              onBorrar={store.borrarJugador}
              estadisticasAsistencia={asistenciaStore.estadisticasEquipo}
            />
          </div>
        )}

        {/* ── TAB ASISTENCIA ── */}
        {tab === 'asistencia' && (
          <div className="p-4 max-w-lg mx-auto flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ClipboardList size={16} className="text-quarte-azul" />
                <p className="font-titulo font-bold text-sm text-quarte-negro">Asistencia temporada</p>
              </div>
              {asistenciaStore.cargandoLista && (
                <div className="w-4 h-4 border-2 border-quarte-azul border-t-transparent rounded-full animate-spin" />
              )}
            </div>

            {asistenciaStore.estadisticasLista.length === 0 && !asistenciaStore.cargandoLista ? (
              <div className="flex flex-col items-center py-12 text-gray-400 gap-3">
                <ClipboardList size={40} className="opacity-20" />
                <p className="font-titulo font-semibold text-sm">Sin datos de asistencia</p>
                <p className="text-xs text-center">Pasa lista desde Inicio para ver las estadísticas aquí.</p>
              </div>
            ) : (
              <div className="card p-0 overflow-hidden">
                {/* Cabecera tabla */}
                <div className="flex items-center gap-2 px-4 py-2.5 bg-quarte-azulClaro border-b border-gray-100">
                  <span className="flex-1 text-xs font-titulo font-bold text-quarte-azul">Jugador</span>
                  <span className="w-10 text-right text-xs font-titulo font-bold text-quarte-azul">Asist.</span>
                  <span className="w-8  text-right text-xs font-titulo font-bold text-quarte-azul">Total</span>
                  <span className="w-10 text-right text-xs font-titulo font-bold text-quarte-azul">%</span>
                </div>
                {asistenciaStore.estadisticasLista.map((stat, idx) => {
                  const pct = stat.total > 0 ? Math.round((stat.asistidos / stat.total) * 100) : 0;
                  const barColor = pct >= 80 ? 'bg-quarte-verde' : pct >= 60 ? 'bg-amber-400' : 'bg-quarte-rojo';
                  const textColor = pct >= 80 ? 'text-green-700' : pct >= 60 ? 'text-amber-600' : 'text-quarte-rojo';
                  return (
                    <div key={stat.player_id}
                      className={`flex items-center gap-2 px-4 py-3 ${idx % 2 === 0 ? '' : 'bg-gray-50'}`}>
                      <div className="flex-1 min-w-0">
                        <p className="font-titulo font-semibold text-sm text-quarte-negro truncate">
                          {stat.player_name}
                        </p>
                        <div className="h-1.5 bg-gray-200 rounded-full mt-1 overflow-hidden w-full">
                          <div
                            className={`h-full rounded-full transition-all ${barColor}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                      <span className="w-10 text-right font-titulo font-bold text-sm text-quarte-negro">
                        {stat.asistidos}
                      </span>
                      <span className="w-8 text-right text-xs text-gray-400">/{stat.total}</span>
                      <span className={`w-10 text-right font-titulo font-bold text-sm ${textColor}`}>
                        {pct}%
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}


      </div>

      {/* Modal de anotaciones */}
      {modalSlot !== null && modalJugador && (
        <JugadorModal
          jugador={modalJugador}
          onGuardar={j => { store.editarJugador(j); setModal(null); }}
          onCerrar={() => setModal(null)}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[999]
                         flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl
                         text-base font-titulo font-bold whitespace-nowrap
                         ${toast.tipo === 'ok'
                           ? 'bg-quarte-verde text-white'
                           : 'bg-quarte-rojo text-white'}`}>
          {toast.tipo === 'ok'
            ? <CheckCircle2 size={24} />
            : <XCircle size={24} />}
          {toast.msg}
        </div>
      )}
    </div>
  );
}
