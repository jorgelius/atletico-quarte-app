// ============================================================
// TacticaEditor — Pizarra táctica interactiva completa
// ============================================================
import {
  useRef, useEffect, useState, useCallback,
  forwardRef, useImperativeHandle,
} from 'react';
import { Stage, Layer, Arrow, Rect, Line, Text, Group, Circle, RegularPolygon } from 'react-konva';
import Konva from 'konva';
import {
  MousePointer2, Pencil, ArrowRight, Square, Type,
  Undo2, Trash2, RotateCcw, Save, Image, X, ChevronDown,
  Users, Swords,
} from 'lucide-react';
import type {
  FormatoPartido, Jugador, Alineacion,
  JugadorCanvas, TrazoCanvas, FlechaCanvas, ZonaCanvas, TextoCanvas,
  DatosPizarra, PizarraTactica,
} from '@/types';

// ── Paleta de colores ─────────────────────────────────────────
const PALETA = [
  '#FFFFFF', '#FFD700', '#00E5FF', '#FF4444', '#4ADE80', '#FB923C',
];
const GROSORES = [3, 6, 12];

// ── Tipos de herramienta ──────────────────────────────────────
type ToolType =
  | 'select'
  | 'rotulador'
  | 'flecha_pase'
  | 'flecha_mov'
  | 'zona'
  | 'texto'
  | 'jugador_local'
  | 'jugador_rival'
  | 'balon'
  | 'cono';

type SelectedType = 'jugador' | 'trazo' | 'flecha' | 'zona' | 'texto' | null;

// ── Dibuja el campo en un Layer Konva ─────────────────────────
function drawPitch(layer: Konva.Layer, W: number, H: number, fmt: FormatoPartido) {
  layer.destroyChildren();
  const isF11 = fmt === 'F11';
  const pad = W * 0.04;
  const fw = W - pad * 2, fh = H - pad * 2;
  const field = '#2E7D32', fieldAlt = '#267028', line = 'white';

  layer.add(new Konva.Rect({ x: 0, y: 0, width: W, height: H, fill: field }));
  for (let i = 0; i < 8; i++) {
    layer.add(new Konva.Rect({ x: pad, y: pad + (fh / 8) * i, width: fw, height: fh / 8,
      fill: i % 2 === 0 ? field : fieldAlt }));
  }
  const s = { stroke: line, strokeWidth: 1.5, listening: false };
  layer.add(new Konva.Rect({ x: pad, y: pad, width: fw, height: fh, fill: 'transparent', ...s }));
  layer.add(new Konva.Line({ points: [pad, H / 2, pad + fw, H / 2], ...s }));
  const cr = isF11 ? fw * 0.13 : fw * 0.15;
  layer.add(new Konva.Circle({ x: W / 2, y: H / 2, radius: cr, fill: 'transparent', ...s }));
  layer.add(new Konva.Circle({ x: W / 2, y: H / 2, radius: 3, fill: 'white', listening: false }));
  const gw = isF11 ? fw * 0.30 : fw * 0.35, gd = isF11 ? fh * 0.155 : fh * 0.17;
  const sw = isF11 ? fw * 0.14 : fw * 0.18, sd = isF11 ? fh * 0.06 : fh * 0.08;
  const ggw = isF11 ? fw * 0.07 : fw * 0.10;
  const gx1 = W / 2 - gw / 2, sx1 = W / 2 - sw / 2, glx = W / 2 - ggw / 2;
  const bot = pad + fh;
  layer.add(new Konva.Rect({ x: gx1, y: bot - gd, width: gw, height: gd, fill: 'transparent', ...s }));
  layer.add(new Konva.Rect({ x: sx1, y: bot - sd, width: sw, height: sd, fill: 'transparent', ...s }));
  layer.add(new Konva.Rect({ x: glx, y: bot, width: ggw, height: 8, fill: 'transparent', stroke: 'white', strokeWidth: 2, listening: false }));
  layer.add(new Konva.Rect({ x: gx1, y: pad, width: gw, height: gd, fill: 'transparent', ...s }));
  layer.add(new Konva.Rect({ x: sx1, y: pad, width: sw, height: sd, fill: 'transparent', ...s }));
  layer.add(new Konva.Rect({ x: glx, y: pad - 8, width: ggw, height: 8, fill: 'transparent', stroke: 'white', strokeWidth: 2, listening: false }));
  layer.batchDraw();
}

// ── Sub-componente: nodo de jugador ───────────────────────────
function JugadorNode({
  j, selected, draggable, onSelect, onDragEnd,
}: {
  j: JugadorCanvas;
  selected: boolean;
  draggable: boolean;
  onSelect: () => void;
  onDragEnd: (x: number, y: number) => void;
}) {
  const isBall  = j.tipo === 'balon';
  const isCone  = j.tipo === 'cono';
  const isRival = j.tipo === 'rival';
  const r = isBall ? 8 : isCone ? 10 : 16;
  const fill = isBall ? '#FFFFFF'
    : isCone ? '#F97316'
    : isRival ? '#DC2626'
    : j.esPortero ? '#F59E0B'
    : '#1D4ED8';

  return (
    <Group
      x={j.x} y={j.y}
      draggable={draggable}
      onDragEnd={e => onDragEnd(e.target.x(), e.target.y())}
      onClick={onSelect}
      onTap={onSelect}
    >
      {selected && (
        <Circle radius={r + 6} fill="rgba(255,215,0,0.25)" stroke="#FFD700" strokeWidth={2} />
      )}
      {isCone ? (
        <RegularPolygon sides={3} radius={r} fill={fill} stroke="white" strokeWidth={1.5}
          shadowBlur={4} shadowColor="rgba(0,0,0,0.5)" />
      ) : (
        <Circle radius={r} fill={fill} stroke="white" strokeWidth={2}
          shadowBlur={4} shadowColor="rgba(0,0,0,0.5)" />
      )}
      {j.dorsal !== undefined && !isBall && !isCone && (
        <Text text={String(j.dorsal)} fontSize={10} fontFamily="'JetBrains Mono',monospace"
          fontStyle="bold" fill="white" align="center" verticalAlign="middle"
          offsetX={r * 0.5} offsetY={r * 0.38} width={r} listening={false} />
      )}
    </Group>
  );
}

// ── Props e handle del editor ─────────────────────────────────
export interface TacticaEditorHandle {
  exportPNG: () => string | undefined;
}

interface TacticaEditorProps {
  pizarra:     PizarraTactica;
  coachId:     string;
  jugadores:   Jugador[];
  alineaciones: Alineacion[];
  onSave:      (p: PizarraTactica) => Promise<void>;
  onBack:      () => void;
}

// ── COMPONENTE PRINCIPAL ──────────────────────────────────────
const TacticaEditor = forwardRef<TacticaEditorHandle, TacticaEditorProps>(
  ({ pizarra, coachId, jugadores, alineaciones, onSave, onBack }, ref) => {

  const [titulo,   setTitulo]   = useState(pizarra.titulo);
  const [formato,  setFormato]  = useState<FormatoPartido>(pizarra.formato);
  const [datos,    setDatos]    = useState<DatosPizarra>(
    pizarra.canvas_data ?? { jugadores: [], trazos: [], flechas: [], zonas: [], textos: [] }
  );
  const [tool,     setTool]     = useState<ToolType>('select');
  const [color,    setColor]    = useState(PALETA[0]);
  const [grosor,   setGrosor]   = useState(GROSORES[0]);
  const [selectedId,   setSelectedId]   = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<SelectedType>(null);
  const [pendingFlecha, setPendingFlecha] = useState<{ x1: number; y1: number; x2: number; y2: number } | null>(null);
  const [pendingZona,   setPendingZona]   = useState<{ x: number; y: number; w: number; h: number; ox: number; oy: number } | null>(null);
  const [textPos,  setTextPos]  = useState<{ x: number; y: number } | null>(null);
  const [textVal,  setTextVal]  = useState('');
  const [saving,   setSaving]   = useState(false);
  const [showAlineModal, setShowAlineModal] = useState(false);

  const [size, setSize] = useState({ w: 300, h: 462 });
  const RATIO = formato === 'F11' ? 1.54 : 1.5;

  // Refs
  const containerRef    = useRef<HTMLDivElement>(null);
  const stageRef        = useRef<Konva.Stage | null>(null);
  const fieldLayerRef   = useRef<Konva.Layer>(null);
  const previewLayerRef = useRef<Konva.Layer>(null);
  const previewLineRef  = useRef<Konva.Line | null>(null);
  const drawPtsRef      = useRef<number[]>([]);
  const isDrawingRef    = useRef(false);
  const drawStartRef    = useRef<{ x: number; y: number } | null>(null);
  const undoStack       = useRef<DatosPizarra[]>([]);
  const textInputRef    = useRef<HTMLInputElement>(null);

  // ── Handle externo ──
  useImperativeHandle(ref, () => ({
    exportPNG: () => stageRef.current?.toDataURL({ pixelRatio: 2 }),
  }));

  // ── Responsive ──
  useEffect(() => {
    const update = () => {
      if (!containerRef.current) return;
      const availW = containerRef.current.offsetWidth;
      const availH = containerRef.current.offsetHeight;
      const byW = { w: availW, h: Math.round(availW * RATIO) };
      const byH = { w: Math.round(availH / RATIO), h: availH };
      setSize(byH.w <= availW ? byH : byW);
    };
    update();
    const ro = new ResizeObserver(update);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [RATIO]);

  // ── Campo ──
  useEffect(() => {
    if (fieldLayerRef.current) drawPitch(fieldLayerRef.current, size.w, size.h, formato);
  }, [size, formato]);

  // ── Undo ──
  function pushUndo() {
    undoStack.current = [...undoStack.current.slice(-19), JSON.parse(JSON.stringify(datos))];
  }
  function undo() {
    const prev = undoStack.current.pop();
    if (prev) setDatos(prev);
  }

  // ── Helpers de elemento seleccionado ──
  function select(id: string, type: SelectedType) {
    setSelectedId(id);
    setSelectedType(type);
  }
  function deselect() { setSelectedId(null); setSelectedType(null); }

  function deleteSelected() {
    if (!selectedId || !selectedType) return;
    pushUndo();
    setDatos(prev => ({
      ...prev,
      jugadores: selectedType === 'jugador' ? prev.jugadores.filter(j => j.id !== selectedId) : prev.jugadores,
      trazos:    selectedType === 'trazo'   ? prev.trazos.filter(t => t.id !== selectedId) : prev.trazos,
      flechas:   selectedType === 'flecha'  ? prev.flechas.filter(f => f.id !== selectedId) : prev.flechas,
      zonas:     selectedType === 'zona'    ? prev.zonas.filter(z => z.id !== selectedId) : prev.zonas,
      textos:    selectedType === 'texto'   ? prev.textos.filter(t => t.id !== selectedId) : prev.textos,
    }));
    deselect();
  }

  // ── Obtener posición del puntero ──
  function getPos(e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) {
    return e.target.getStage()?.getPointerPosition() ?? null;
  }

  // ── Eventos de dibujo (mousedown/move/up) ──
  const handleMouseDown = useCallback((e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
    const pos = getPos(e);
    if (!pos) return;

    if (tool === 'rotulador') {
      isDrawingRef.current = true;
      drawPtsRef.current = [pos.x, pos.y];
      const line = new Konva.Line({
        points: [pos.x, pos.y],
        stroke: color,
        strokeWidth: grosor,
        tension: 0.5,
        lineCap: 'round',
        lineJoin: 'round',
        listening: false,
      });
      previewLayerRef.current?.add(line);
      previewLineRef.current = line;
    }
    if (tool === 'flecha_pase' || tool === 'flecha_mov') {
      drawStartRef.current = pos;
      setPendingFlecha({ x1: pos.x, y1: pos.y, x2: pos.x, y2: pos.y });
    }
    if (tool === 'zona') {
      drawStartRef.current = pos;
      setPendingZona({ x: pos.x, y: pos.y, w: 0, h: 0, ox: pos.x, oy: pos.y });
    }
  }, [tool, color, grosor]);

  const handleMouseMove = useCallback((e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
    const pos = getPos(e);
    if (!pos) return;

    if (tool === 'rotulador' && isDrawingRef.current && previewLineRef.current) {
      drawPtsRef.current = [...drawPtsRef.current, pos.x, pos.y];
      previewLineRef.current.points(drawPtsRef.current);
      previewLayerRef.current?.batchDraw();
    }
    if ((tool === 'flecha_pase' || tool === 'flecha_mov') && drawStartRef.current) {
      setPendingFlecha(prev => prev ? { ...prev, x2: pos.x, y2: pos.y } : null);
    }
    if (tool === 'zona' && drawStartRef.current) {
      const ox = drawStartRef.current.x, oy = drawStartRef.current.y;
      setPendingZona({ ox, oy, x: Math.min(ox, pos.x), y: Math.min(oy, pos.y), w: Math.abs(pos.x - ox), h: Math.abs(pos.y - oy) });
    }
  }, [tool]);

  const handleMouseUp = useCallback((_e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
    if (tool === 'rotulador' && isDrawingRef.current) {
      isDrawingRef.current = false;
      if (previewLineRef.current) {
        previewLineRef.current.destroy();
        previewLayerRef.current?.batchDraw();
        previewLineRef.current = null;
      }
      const pts = drawPtsRef.current;
      if (pts.length >= 4) {
        const trazo: TrazoCanvas = { id: crypto.randomUUID(), puntos: pts, color, grosor };
        pushUndo();
        setDatos(prev => ({ ...prev, trazos: [...prev.trazos, trazo] }));
      }
      drawPtsRef.current = [];
    }

    if ((tool === 'flecha_pase' || tool === 'flecha_mov') && pendingFlecha) {
      const dx = pendingFlecha.x2 - pendingFlecha.x1, dy = pendingFlecha.y2 - pendingFlecha.y1;
      if (Math.hypot(dx, dy) > 15) {
        const flecha: FlechaCanvas = {
          id: crypto.randomUUID(),
          x1: pendingFlecha.x1, y1: pendingFlecha.y1,
          x2: pendingFlecha.x2, y2: pendingFlecha.y2,
          color: tool === 'flecha_pase' ? '#FFD700' : '#00E5FF',
          estilo: tool === 'flecha_pase' ? 'solida' : 'discontinua',
          grosor: 2.5,
        };
        pushUndo();
        setDatos(prev => ({ ...prev, flechas: [...prev.flechas, flecha] }));
      }
      setPendingFlecha(null);
      drawStartRef.current = null;
    }

    if (tool === 'zona' && pendingZona) {
      if (pendingZona.w > 20 && pendingZona.h > 20) {
        const zona: ZonaCanvas = { id: crypto.randomUUID(), x: pendingZona.x, y: pendingZona.y, width: pendingZona.w, height: pendingZona.h, color };
        pushUndo();
        setDatos(prev => ({ ...prev, zonas: [...prev.zonas, zona] }));
      }
      setPendingZona(null);
      drawStartRef.current = null;
    }
  }, [tool, color, grosor, pendingFlecha, pendingZona, datos]);

  // ── Click sobre el fondo del stage ──
  const handleStageClick = useCallback((e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
    if (e.target !== e.target.getStage() && e.target.getLayer() !== fieldLayerRef.current) return;
    const pos = getPos(e);
    if (!pos) return;

    if (tool === 'select') { deselect(); return; }

    if (tool === 'jugador_local') {
      const dorsal = (datos.jugadores.filter(j => j.tipo === 'local').length) + 1;
      const j: JugadorCanvas = { id: crypto.randomUUID(), tipo: 'local', dorsal, x: pos.x, y: pos.y };
      pushUndo();
      setDatos(prev => ({ ...prev, jugadores: [...prev.jugadores, j] }));
    }
    if (tool === 'jugador_rival') {
      const dorsal = (datos.jugadores.filter(j => j.tipo === 'rival').length) + 1;
      const j: JugadorCanvas = { id: crypto.randomUUID(), tipo: 'rival', dorsal, x: pos.x, y: pos.y };
      pushUndo();
      setDatos(prev => ({ ...prev, jugadores: [...prev.jugadores, j] }));
    }
    if (tool === 'balon') {
      const j: JugadorCanvas = { id: crypto.randomUUID(), tipo: 'balon', x: pos.x, y: pos.y };
      pushUndo();
      setDatos(prev => ({ ...prev, jugadores: [...prev.jugadores, j] }));
    }
    if (tool === 'cono') {
      const j: JugadorCanvas = { id: crypto.randomUUID(), tipo: 'cono', x: pos.x, y: pos.y };
      pushUndo();
      setDatos(prev => ({ ...prev, jugadores: [...prev.jugadores, j] }));
    }
    if (tool === 'texto') {
      setTextPos(pos);
      setTextVal('');
      setTimeout(() => textInputRef.current?.focus(), 50);
    }
  }, [tool, datos]);

  // ── Confirmar texto ──
  function confirmText() {
    if (textVal.trim() && textPos) {
      const t: TextoCanvas = { id: crypto.randomUUID(), x: textPos.x, y: textPos.y, texto: textVal.trim(), color };
      pushUndo();
      setDatos(prev => ({ ...prev, textos: [...prev.textos, t] }));
    }
    setTextPos(null);
    setTextVal('');
  }

  // ── Drag de jugadores ──
  function jugadorDragEnd(id: string, x: number, y: number) {
    setDatos(prev => ({ ...prev, jugadores: prev.jugadores.map(j => j.id === id ? { ...j, x, y } : j) }));
  }

  // ── Drag de textos ──
  function textoDragEnd(id: string, x: number, y: number) {
    setDatos(prev => ({ ...prev, textos: prev.textos.map(t => t.id === id ? { ...t, x, y } : t) }));
  }

  // ── Cargar alineación ──
  function cargarAlineacion(a: Alineacion) {
    const nuevos: JugadorCanvas[] = a.posiciones.map(p => {
      const jug = jugadores.find(j => j.id === p.jugador_id);
      return {
        id: crypto.randomUUID(),
        tipo: 'local' as const,
        dorsal: jug?.dorsal,
        nombre: jug?.nombre,
        x: p.x * size.w,
        y: p.y * size.h,
        esPortero: jug?.posicion === 'POR',
      };
    });
    pushUndo();
    setDatos(prev => ({
      ...prev,
      jugadores: [
        ...prev.jugadores.filter(j => j.tipo !== 'local'),
        ...nuevos,
      ],
    }));
    setShowAlineModal(false);
  }

  // ── Borrar todo ──
  function clearAll() {
    pushUndo();
    setDatos({ jugadores: [], trazos: [], flechas: [], zonas: [], textos: [] });
    deselect();
    previewLineRef.current?.destroy();
    previewLayerRef.current?.batchDraw();
    previewLineRef.current = null;
  }

  // ── Guardar ──
  async function handleSave() {
    setSaving(true);
    try {
      await onSave({
        ...pizarra,
        titulo,
        formato,
        canvas_data: datos,
        coach_id: coachId,
        actualizado_en: Date.now(),
      });
    } finally {
      setSaving(false);
    }
  }

  // ── Definición de herramientas ──
  const TOOLS: { type: ToolType; label: string; icon: React.ReactNode }[] = [
    { type: 'select',        label: 'Selec.',  icon: <MousePointer2 size={16} /> },
    { type: 'rotulador',     label: 'Rotul.',  icon: <Pencil size={16} /> },
    { type: 'flecha_pase',   label: 'Pase',    icon: <ArrowRight size={16} className="text-yellow-400" /> },
    { type: 'flecha_mov',    label: 'Mov.',    icon: <ArrowRight size={16} className="text-cyan-400" /> },
    { type: 'zona',          label: 'Zona',    icon: <Square size={16} /> },
    { type: 'texto',         label: 'Texto',   icon: <Type size={16} /> },
    { type: 'jugador_local', label: '+Local',  icon: <span className="w-3.5 h-3.5 rounded-full bg-blue-600 inline-block ring-2 ring-white" /> },
    { type: 'jugador_rival', label: '+Rival',  icon: <span className="w-3.5 h-3.5 rounded-full bg-red-600 inline-block ring-2 ring-white" /> },
    { type: 'balon',         label: 'Balón',   icon: <span className="w-3.5 h-3.5 rounded-full bg-white inline-block ring-1 ring-gray-400" /> },
    { type: 'cono',          label: 'Cono',    icon: <span className="text-orange-400 text-[10px] font-bold">▲</span> },
  ];

  const showColor  = tool === 'rotulador' || tool === 'zona';
  const showGrosor = tool === 'rotulador';

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-gray-950">
      {/* ── Header ────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 px-3 py-2 bg-gray-900 border-b border-gray-800 flex-shrink-0">
        <button onClick={onBack} className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-800 text-gray-300 hover:bg-gray-700">
          <X size={18} />
        </button>
        <input
          value={titulo}
          onChange={e => setTitulo(e.target.value)}
          className="flex-1 bg-transparent text-white font-titulo font-bold text-sm outline-none placeholder:text-gray-500 min-w-0"
          placeholder="Nombre de la pizarra…"
        />
        {/* F7/F11 */}
        <div className="flex bg-gray-800 rounded-lg overflow-hidden flex-shrink-0">
          {(['F7', 'F11'] as FormatoPartido[]).map(f => (
            <button key={f} onClick={() => setFormato(f)}
              className={`px-2.5 py-1.5 text-xs font-titulo font-bold transition-colors
                ${formato === f ? 'bg-quarte-azul text-white' : 'text-gray-400 hover:text-white'}`}>
              {f}
            </button>
          ))}
        </div>
        <button onClick={handleSave} disabled={saving}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-quarte-azul text-white hover:bg-blue-700 flex-shrink-0 disabled:opacity-60">
          {saving
            ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            : <Save size={16} />}
        </button>
        <button
          onClick={() => { const url = stageRef.current?.toDataURL({ pixelRatio: 2 }); if (url) { const a = document.createElement('a'); a.href = url; a.download = `${titulo}.png`; a.click(); } }}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-800 text-gray-300 hover:bg-gray-700 flex-shrink-0">
          <Image size={16} />
        </button>
      </div>

      {/* ── Toolbar ───────────────────────────────────────────── */}
      <div className="flex items-center gap-1 px-2 py-1.5 bg-gray-900 border-b border-gray-800 overflow-x-auto scrollbar-hide flex-shrink-0">
        {/* Herramientas */}
        {TOOLS.map(t => (
          <button key={t.type}
            onClick={() => { setTool(t.type); deselect(); }}
            className={`flex-shrink-0 flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg min-w-[44px]
                        text-[10px] font-titulo font-semibold transition-colors
                        ${tool === t.type ? 'bg-quarte-azul text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}>
            {t.icon}
            {t.label}
          </button>
        ))}

        <div className="w-px h-7 bg-gray-700 flex-shrink-0 mx-0.5" />

        {/* Colores */}
        {showColor && PALETA.map(c => (
          <button key={c}
            onClick={() => setColor(c)}
            style={{ background: c }}
            className={`flex-shrink-0 w-6 h-6 rounded-full transition-transform ${color === c ? 'scale-125 ring-2 ring-quarte-azul' : 'opacity-70 hover:opacity-100'}`} />
        ))}

        {/* Grosor */}
        {showGrosor && (
          <>
            <div className="w-px h-7 bg-gray-700 flex-shrink-0 mx-0.5" />
            {GROSORES.map(g => (
              <button key={g}
                onClick={() => setGrosor(g)}
                className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg transition-colors
                            ${grosor === g ? 'bg-quarte-azul' : 'bg-gray-800 hover:bg-gray-700'}`}>
                <span className="bg-white rounded-full" style={{ width: g + 2, height: g + 2 }} />
              </button>
            ))}
          </>
        )}

        <div className="w-px h-7 bg-gray-700 flex-shrink-0 mx-0.5" />

        {/* Cargar alineación */}
        <button onClick={() => setShowAlineModal(v => !v)}
          className="flex-shrink-0 flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg min-w-[48px]
                     bg-gray-800 text-gray-300 hover:bg-gray-700 text-[10px] font-titulo font-semibold">
          <Users size={14} />Alinea.
        </button>

        <div className="w-px h-7 bg-gray-700 flex-shrink-0 mx-0.5" />

        {/* Deshacer */}
        <button onClick={undo}
          className="flex-shrink-0 flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg min-w-[40px]
                     bg-gray-800 text-gray-300 hover:bg-gray-700 text-[10px] font-titulo font-semibold">
          <Undo2 size={14} />Desah.
        </button>

        {/* Borrar todo */}
        <button onClick={clearAll}
          className="flex-shrink-0 flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg min-w-[40px]
                     bg-gray-800 text-gray-300 hover:bg-gray-700 text-[10px] font-titulo font-semibold">
          <RotateCcw size={14} />Limpiar
        </button>

        {/* Eliminar seleccionado */}
        {selectedId && (
          <button onClick={deleteSelected}
            className="flex-shrink-0 flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg min-w-[44px]
                       bg-red-900 text-red-300 hover:bg-red-800 text-[10px] font-titulo font-semibold">
            <Trash2 size={14} />Eliminar
          </button>
        )}
      </div>

      {/* ── Canvas ────────────────────────────────────────────── */}
      <div ref={containerRef} className="flex-1 overflow-hidden flex items-center justify-center bg-gray-950 relative">
        <div className="relative" style={{ width: size.w, height: size.h }}>
          <Stage
            ref={stageRef}
            width={size.w}
            height={size.h}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onTouchStart={handleMouseDown}
            onTouchMove={handleMouseMove}
            onTouchEnd={handleMouseUp}
            onClick={handleStageClick}
            onTap={handleStageClick}
            style={{ cursor: tool === 'rotulador' ? 'crosshair' : tool === 'select' ? 'default' : 'crosshair' }}
          >
            {/* Campo */}
            <Layer ref={fieldLayerRef} listening={false} />

            {/* Preview de rotulador (imperativo) */}
            <Layer ref={previewLayerRef} listening={false} />

            {/* Elementos interactivos */}
            <Layer>
              {/* Zonas */}
              {datos.zonas.map(z => (
                <Rect key={z.id}
                  x={z.x} y={z.y} width={z.width} height={z.height}
                  fill={z.color + '30'} stroke={z.color} strokeWidth={2}
                  opacity={selectedId === z.id ? 1 : 0.8}
                  listening={tool === 'select'}
                  onClick={() => select(z.id, 'zona')}
                  onTap={() => select(z.id, 'zona')}
                />
              ))}
              {/* Preview zona */}
              {pendingZona && pendingZona.w > 0 && (
                <Rect x={pendingZona.x} y={pendingZona.y} width={pendingZona.w} height={pendingZona.h}
                  fill={color + '20'} stroke={color} strokeWidth={1.5} dash={[6, 4]} listening={false} />
              )}

              {/* Trazos completados */}
              {datos.trazos.map(t => (
                <Line key={t.id}
                  points={t.puntos} stroke={t.color} strokeWidth={t.grosor}
                  tension={0.5} lineCap="round" lineJoin="round"
                  opacity={selectedId === t.id ? 1 : 0.85}
                  listening={tool === 'select'}
                  onClick={() => select(t.id, 'trazo')}
                  onTap={() => select(t.id, 'trazo')}
                />
              ))}

              {/* Flechas */}
              {datos.flechas.map(f => (
                <Arrow key={f.id}
                  points={[f.x1, f.y1, f.x2, f.y2]}
                  stroke={f.color} fill={f.color} strokeWidth={f.grosor}
                  dash={f.estilo === 'discontinua' ? [8, 5] : undefined}
                  pointerLength={10} pointerWidth={8}
                  opacity={selectedId === f.id ? 1 : 0.85}
                  listening={tool === 'select'}
                  onClick={() => select(f.id, 'flecha')}
                  onTap={() => select(f.id, 'flecha')}
                />
              ))}
              {/* Preview flecha */}
              {pendingFlecha && Math.hypot(pendingFlecha.x2 - pendingFlecha.x1, pendingFlecha.y2 - pendingFlecha.y1) > 5 && (
                <Arrow
                  points={[pendingFlecha.x1, pendingFlecha.y1, pendingFlecha.x2, pendingFlecha.y2]}
                  stroke={tool === 'flecha_pase' ? '#FFD700' : '#00E5FF'}
                  fill={tool === 'flecha_pase' ? '#FFD700' : '#00E5FF'}
                  strokeWidth={2.5}
                  dash={tool === 'flecha_mov' ? [8, 5] : undefined}
                  pointerLength={10} pointerWidth={8}
                  opacity={0.65}
                  listening={false}
                />
              )}

              {/* Textos */}
              {datos.textos.map(t => (
                <Text key={t.id}
                  x={t.x} y={t.y}
                  text={t.texto}
                  fontSize={16}
                  fontFamily="'Plus Jakarta Sans',sans-serif"
                  fontStyle="bold"
                  fill={t.color}
                  draggable={tool === 'select'}
                  onDragEnd={e => textoDragEnd(t.id, e.target.x(), e.target.y())}
                  listening={tool === 'select'}
                  onClick={() => select(t.id, 'texto')}
                  onTap={() => select(t.id, 'texto')}
                  shadowColor="black" shadowBlur={3}
                  opacity={selectedId === t.id ? 1 : 0.9}
                />
              ))}

              {/* Jugadores */}
              {datos.jugadores.map(j => (
                <JugadorNode key={j.id}
                  j={j}
                  selected={selectedId === j.id}
                  draggable={tool === 'select'}
                  onSelect={() => select(j.id, 'jugador')}
                  onDragEnd={(x, y) => jugadorDragEnd(j.id, x, y)}
                />
              ))}
            </Layer>
          </Stage>

          {/* Input de texto sobre el canvas */}
          {textPos && (
            <input
              ref={textInputRef}
              style={{ position: 'absolute', left: textPos.x, top: textPos.y - 20, zIndex: 60, minWidth: 80 }}
              className="bg-transparent border-0 border-b-2 border-white text-white font-bold text-base outline-none px-1"
              placeholder="Texto…"
              value={textVal}
              onChange={e => setTextVal(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === 'Escape') confirmText(); }}
              onBlur={confirmText}
            />
          )}
        </div>

        {/* Modal de leyenda de colores */}
        <div className="absolute bottom-3 right-3 flex flex-col gap-1.5 pointer-events-none">
          <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-sm rounded-lg px-2 py-1">
            <span className="w-3 h-3 rounded-full bg-blue-600 ring-1 ring-white" />
            <span className="text-white text-[9px] font-titulo">Mi equipo</span>
          </div>
          <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-sm rounded-lg px-2 py-1">
            <span className="w-3 h-3 rounded-full bg-red-600 ring-1 ring-white" />
            <span className="text-white text-[9px] font-titulo">Rival</span>
          </div>
          <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-sm rounded-lg px-2 py-1">
            <ArrowRight size={10} className="text-yellow-400" />
            <span className="text-white text-[9px] font-titulo">Pase</span>
          </div>
          <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-sm rounded-lg px-2 py-1">
            <ArrowRight size={10} className="text-cyan-400" />
            <span className="text-white text-[9px] font-titulo">Movimiento</span>
          </div>
        </div>
      </div>

      {/* ── Modal: cargar alineación ──────────────────────────── */}
      {showAlineModal && (
        <div className="absolute inset-0 z-60 bg-black/70 flex items-end" onClick={() => setShowAlineModal(false)}>
          <div className="w-full bg-gray-900 rounded-t-2xl p-4 max-h-[50vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-white font-titulo font-bold">Cargar alineación guardada</p>
              <button onClick={() => setShowAlineModal(false)} className="text-gray-400">
                <X size={18} />
              </button>
            </div>
            {alineaciones.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-4">No hay alineaciones guardadas</p>
            ) : (
              <div className="flex flex-col gap-2">
                {alineaciones.map(a => (
                  <button key={a.id} onClick={() => cargarAlineacion(a)}
                    className="flex items-center gap-3 p-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-left">
                    <Users size={16} className="text-quarte-azul flex-shrink-0" />
                    <div>
                      <p className="text-white font-titulo font-semibold text-sm">{a.nombre}</p>
                      <p className="text-gray-400 text-xs">{a.formato} · {a.formacion} · {a.posiciones.length} jugadores</p>
                    </div>
                    <ChevronDown size={14} className="text-gray-500 ml-auto -rotate-90" />
                  </button>
                ))}
              </div>
            )}
            <p className="text-gray-600 text-[10px] text-center mt-3 font-cuerpo">
              Cargar reemplazará los jugadores locales en el campo
            </p>
          </div>
        </div>
      )}
    </div>
  );
});

TacticaEditor.displayName = 'TacticaEditor';
export default TacticaEditor;

// Unused import cleanup helper
const _Swords = Swords;
void _Swords;
