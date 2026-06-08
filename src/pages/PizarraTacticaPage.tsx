// ============================================================
// PizarraTacticaPage — listado y editor de pizarras tácticas
// ============================================================
import { useEffect, useState, useRef } from 'react';
import { PencilRuler, Plus, Trash2, Clock, Loader2 } from 'lucide-react';
import { usePerfilStore } from '@/stores/perfilStore';
import { usePlantillaStore } from '@/stores/plantillaStore';
import { usePizarrasStore } from '@/stores/pizarrasTacticasStore';
import TacticaEditor from '@/components/pizarra/TacticaEditor';
import type { PizarraTactica, DatosPizarra } from '@/types';

const DATOS_VACIOS: DatosPizarra = {
  jugadores: [], trazos: [], flechas: [], zonas: [], textos: [],
};

function formatFecha(ts: number) {
  return new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(ts));
}

export default function PizarraTacticaPage() {
  const { perfil }   = usePerfilStore();
  const plantilla    = usePlantillaStore();
  const store        = usePizarrasStore();
  const [editando, setEditando] = useState<PizarraTactica | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const editorRef = useRef(null);

  useEffect(() => {
    if (!perfil) return;
    store.cargar(perfil.id);
    plantilla.cargar(perfil.id);
  }, [perfil?.id]);

  if (!perfil) return null;

  // ── Crear nueva pizarra ──────────────────────────────────────
  function nuevaPizarra() {
    const p: PizarraTactica = {
      id:             crypto.randomUUID(),
      coach_id:       perfil!.id,
      titulo:         'Nueva pizarra',
      formato:        'F11',
      canvas_data:    DATOS_VACIOS,
      creado_en:      Date.now(),
      actualizado_en: Date.now(),
    };
    setEditando(p);
  }

  // ── Guardar pizarra ──────────────────────────────────────────
  async function handleSave(p: PizarraTactica) {
    setGuardando(true);
    try {
      await store.guardar(p);
      setEditando(null);
    } finally {
      setGuardando(false);
    }
  }

  // ── Borrar pizarra ───────────────────────────────────────────
  async function handleDelete(id: string) {
    await store.borrar(id);
    setConfirmDelete(null);
  }

  // ── Editor activo → ocupa toda la pantalla ───────────────────
  if (editando) {
    return (
      <TacticaEditor
        ref={editorRef}
        pizarra={editando}
        coachId={perfil.id}
        jugadores={plantilla.jugadores}
        alineaciones={plantilla.alineacionesGuardadas}
        onSave={handleSave}
        onBack={() => setEditando(null)}
      />
    );
  }

  // ── Vista de lista ───────────────────────────────────────────
  return (
    <div className="flex flex-col min-h-screen bg-quarte-gris">
      {/* Cabecera */}
      <div className="bg-quarte-azul text-white px-4 pt-4 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
            <PencilRuler size={20} />
          </div>
          <div className="flex-1">
            <h1 className="font-titulo text-lg font-bold">Pizarra Táctica</h1>
            <p className="text-blue-200 text-xs">
              {store.cargando ? 'Cargando…' : `${store.items.length} pizarras guardadas`}
            </p>
          </div>
          <button
            onClick={nuevaPizarra}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/20 hover:bg-white/30 transition-colors">
            <Plus size={20} />
          </button>
        </div>
      </div>

      {/* Contenido */}
      <div className="flex-1 overflow-y-auto p-4 max-w-lg mx-auto w-full">

        {store.cargando ? (
          <div className="flex flex-col items-center py-16 gap-3 text-gray-400">
            <Loader2 size={36} className="animate-spin opacity-40" />
            <p className="font-titulo font-semibold text-sm">Cargando pizarras…</p>
          </div>
        ) : store.items.length === 0 ? (
          // ── Empty state ──
          <div className="flex flex-col items-center py-16 gap-4 text-gray-400">
            <div className="w-20 h-20 rounded-2xl bg-white flex items-center justify-center shadow-sm">
              <svg viewBox="0 0 80 80" className="w-14 h-14">
                {/* Campo SVG simplificado */}
                <rect x="5" y="5" width="70" height="70" rx="3" fill="#2E7D32" />
                <rect x="5" y="5" width="70" height="70" rx="3" fill="none" stroke="white" strokeWidth="1.5" />
                <line x1="5" y1="40" x2="75" y2="40" stroke="white" strokeWidth="1.5" />
                <circle cx="40" cy="40" r="10" fill="none" stroke="white" strokeWidth="1.5" />
                {/* Jugadores */}
                <circle cx="40" cy="22" r="4" fill="#1D4ED8" stroke="white" strokeWidth="1" />
                <circle cx="25" cy="35" r="4" fill="#1D4ED8" stroke="white" strokeWidth="1" />
                <circle cx="55" cy="35" r="4" fill="#1D4ED8" stroke="white" strokeWidth="1" />
                {/* Flecha */}
                <line x1="40" y1="22" x2="25" y2="35" stroke="#FFD700" strokeWidth="1.5" markerEnd="url(#arrow)" />
              </svg>
            </div>
            <div className="text-center">
              <p className="font-titulo font-bold text-quarte-negro text-base">Sin pizarras aún</p>
              <p className="text-sm text-gray-400 mt-1">Crea tu primera pizarra táctica<br/>y empieza a diseñar jugadas</p>
            </div>
            <button onClick={nuevaPizarra}
              className="btn-primario flex items-center gap-2 px-6">
              <Plus size={16} />
              Nueva pizarra
            </button>
          </div>
        ) : (
          // ── Lista de pizarras ──
          <div className="grid gap-3">
            {/* CTA nueva pizarra */}
            <button onClick={nuevaPizarra}
              className="flex items-center gap-3 p-4 rounded-2xl border-2 border-dashed border-gray-300
                         bg-white hover:border-quarte-azul hover:bg-blue-50 transition-colors text-left w-full">
              <div className="w-10 h-10 rounded-xl bg-quarte-azul/10 flex items-center justify-center flex-shrink-0">
                <Plus size={20} className="text-quarte-azul" />
              </div>
              <div>
                <p className="font-titulo font-bold text-sm text-quarte-negro">Nueva pizarra</p>
                <p className="text-xs text-gray-400">Lienzo en blanco listo para usar</p>
              </div>
            </button>

            {store.items.map(item => (
              <div key={item.id}
                className="bg-white rounded-2xl shadow-sm overflow-hidden">
                {/* Miniatura del campo */}
                <button
                  onClick={() => setEditando(item)}
                  className="w-full text-left">
                  <div className="h-24 bg-gradient-to-b from-green-800 to-green-700 flex items-center justify-center relative overflow-hidden">
                    <svg viewBox="0 0 120 80" className="w-full h-full opacity-80">
                      <rect width="120" height="80" fill="#2E7D32" />
                      <rect x="4" y="4" width="112" height="72" fill="none" stroke="white" strokeWidth="1" />
                      <line x1="4" y1="40" x2="116" y2="40" stroke="white" strokeWidth="1" />
                      <circle cx="60" cy="40" r="12" fill="none" stroke="white" strokeWidth="1" />
                      {/* Preview jugadores del canvas */}
                      {(item.canvas_data?.jugadores ?? []).slice(0, 14).map((j, i) => {
                        const cx = (j.x / 320) * 120;
                        const cy = (j.y / 492) * 80;
                        const fill = j.tipo === 'rival' ? '#DC2626' : j.tipo === 'balon' ? '#FFFFFF' : '#1D4ED8';
                        return <circle key={i} cx={cx} cy={cy} r="3" fill={fill} stroke="white" strokeWidth="0.5" />;
                      })}
                      {/* Preview flechas */}
                      {(item.canvas_data?.flechas ?? []).slice(0, 6).map((f, i) => {
                        const x1 = (f.x1 / 320) * 120, y1 = (f.y1 / 492) * 80;
                        const x2 = (f.x2 / 320) * 120, y2 = (f.y2 / 492) * 80;
                        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={f.color} strokeWidth="1" />;
                      })}
                    </svg>
                    <span className="absolute top-2 right-2 text-[10px] bg-black/40 text-white font-titulo font-bold px-1.5 py-0.5 rounded-full">
                      {item.formato}
                    </span>
                  </div>
                </button>

                {/* Info + acciones */}
                <div className="px-4 py-3 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-titulo font-bold text-sm text-quarte-negro truncate">{item.titulo}</p>
                    <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                      <Clock size={10} />
                      {formatFecha(item.actualizado_en)}
                      <span className="mx-1">·</span>
                      {(item.canvas_data?.jugadores?.length ?? 0)} jugadores
                      {' · '}
                      {(item.canvas_data?.flechas?.length ?? 0) + (item.canvas_data?.trazos?.length ?? 0)} trazos
                    </p>
                  </div>
                  <button onClick={() => setEditando(item)}
                    className="px-3 py-1.5 bg-quarte-azul text-white rounded-xl text-xs font-titulo font-bold hover:bg-blue-700 transition-colors flex-shrink-0">
                    Abrir
                  </button>
                  <button onClick={() => setConfirmDelete(item.id)}
                    className="w-8 h-8 flex items-center justify-center rounded-xl bg-red-50 text-quarte-rojo hover:bg-red-100 flex-shrink-0">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Modal confirmación borrado ──────────────────────────── */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl p-6 max-w-xs w-full shadow-2xl">
            <h3 className="font-titulo font-bold text-quarte-negro mb-2">¿Eliminar pizarra?</h3>
            <p className="text-sm text-gray-500 mb-5">Esta acción no se puede deshacer.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)}
                className="flex-1 py-2.5 rounded-xl border-2 border-gray-200 text-gray-600 font-titulo font-semibold text-sm">
                Cancelar
              </button>
              <button onClick={() => handleDelete(confirmDelete)}
                disabled={guardando}
                className="flex-1 py-2.5 rounded-xl bg-quarte-rojo text-white font-titulo font-bold text-sm disabled:opacity-60">
                {guardando ? 'Eliminando…' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
