// ============================================================
// PitchBoard — editor de pizarra animada con keyframes
// Reutilizable en Entrenamientos y Tácticas
// ============================================================
import { useRef, useEffect, useState, useCallback, useImperativeHandle, forwardRef } from 'react';
import { Stage, Layer, Circle, Text, Arrow, Group, RegularPolygon, Line, Rect } from 'react-konva';
import Konva from 'konva';
import {
  Play, Pause, SkipBack, Plus, Trash2,
  MousePointer, Circle as CircleIcon, ArrowRight,
  Type, Pencil, Square, Undo2, RotateCcw, Maximize2, Minimize2,
} from 'lucide-react';
import type { FormatoPartido, ElementoPizarra, KeyframePizarra, EscenapPizarra, TrazoCanvas } from '@/types';

type ToolType = ElementoPizarra['tipo'] | 'select' | 'rotulador';

interface PitchBoardProps {
  formato: FormatoPartido;
  readOnly?: boolean;
  initialData?: string;
  onChange?: (json: string) => void;
}

export interface PitchBoardHandle {
  exportPNG: () => string | undefined;
  getJSON: () => string;
}

// ── Paleta y grosores ────────────────────────────────────────
const PALETA = ['#FFFFFF', '#FFD700', '#00E5FF', '#FF4444', '#4ADE80', '#FB923C'];
const GROSORES = [3, 6, 12];

const COLORS = {
  field:    '#2E7D32',
  fieldAlt: '#267028',
  line:     'white',
  azul:     '#1D4ED8',
  rojo:     '#DC2626',
  portero:  '#F59E0B',
  balon:    'white',
  cono:     '#F97316',
};

function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }
function getPos(e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) {
  return e.target.getStage()?.getPointerPosition() ?? null;
}

// ── Campo ────────────────────────────────────────────────────
function drawPitchLayer(layer: Konva.Layer, W: number, H: number, fmt: FormatoPartido) {
  layer.destroyChildren();
  const isF11 = fmt === 'F11';
  const pad = W * 0.04;
  const fw = W - pad * 2, fh = H - pad * 2;

  layer.add(new Konva.Rect({ x: 0, y: 0, width: W, height: H, fill: COLORS.field }));
  for (let i = 0; i < 8; i++) {
    layer.add(new Konva.Rect({ x: pad, y: pad + (fh / 8) * i, width: fw, height: fh / 8,
      fill: i % 2 === 0 ? COLORS.field : COLORS.fieldAlt }));
  }
  const s = { stroke: COLORS.line, strokeWidth: 1.5, listening: false };
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

// ── Elemento individual en el canvas ────────────────────────
function PizarraElement({
  el, selected, onSelect, onDrag, onDragEnd, readOnly,
}: {
  el: ElementoPizarra;
  selected: boolean;
  onSelect: (id: string) => void;
  onDrag: (id: string, x: number, y: number) => void;
  onDragEnd: (id: string, x: number, y: number) => void;
  readOnly: boolean;
}) {
<<<<<<< HEAD
  // Zona rectangular
=======
>>>>>>> dev
  if (el.tipo === 'zona') {
    const w = (el.x2 ?? el.x + 80) - el.x;
    const h = (el.y2 ?? el.y + 50) - el.y;
    return (
      <Rect
        x={el.x} y={el.y} width={w} height={h}
        fill={(el.color ?? '#FFD700') + '30'}
        stroke={el.color ?? '#FFD700'} strokeWidth={selected ? 2.5 : 1.5}
        dash={selected ? undefined : [6, 3]}
        listening={!readOnly}
        onClick={() => onSelect(el.id)} onTap={() => onSelect(el.id)}
        opacity={selected ? 1 : 0.8}
      />
    );
  }

<<<<<<< HEAD
  // Flechas
=======
>>>>>>> dev
  if (el.tipo === 'flecha_pase' || el.tipo === 'flecha_movimiento') {
    const color = el.color ?? (el.tipo === 'flecha_pase' ? '#FFD700' : '#00E5FF');
    return (
      <Arrow
        x={0} y={0}
        points={[el.x, el.y, el.x2 ?? el.x + 60, el.y2 ?? el.y]}
        stroke={color} fill={color} strokeWidth={2.5}
        dash={el.tipo === 'flecha_movimiento' ? [6, 4] : undefined}
        pointerLength={10} pointerWidth={8}
        listening={!readOnly}
        onClick={() => onSelect(el.id)} onTap={() => onSelect(el.id)}
        opacity={selected ? 1 : 0.8}
      />
    );
  }

<<<<<<< HEAD
  // Texto
=======
>>>>>>> dev
  if (el.tipo === 'texto') {
    return (
      <Text
        x={el.x} y={el.y}
        text={el.etiqueta ?? 'Texto'}
        fontSize={15} fontFamily="'Plus Jakarta Sans',sans-serif" fontStyle="bold"
        fill={el.color ?? 'white'}
        draggable={!readOnly}
        onDragMove={e => onDrag(el.id, e.target.x(), e.target.y())}
        onDragEnd={e => onDragEnd(el.id, e.target.x(), e.target.y())}
        onClick={() => onSelect(el.id)} onTap={() => onSelect(el.id)}
        shadowColor="black" shadowBlur={3}
        stroke={selected ? '#FFD700' : undefined} strokeWidth={selected ? 0.5 : 0}
      />
    );
  }

  // Jugadores / balón / cono
  const r = el.tipo === 'balon' ? 8 : el.tipo.includes('portero') ? 14 : 16;
  let fill = COLORS.azul;
  if (el.tipo.includes('rojo'))    fill = COLORS.rojo;
  if (el.tipo.includes('portero')) fill = COLORS.portero;
  if (el.tipo === 'balon')         fill = COLORS.balon;
  if (el.tipo === 'cono')          fill = COLORS.cono;

  return (
    <Group
      x={el.x} y={el.y}
      draggable={!readOnly}
      onDragMove={e => onDrag(el.id, e.target.x(), e.target.y())}
      onDragEnd={e => onDragEnd(el.id, e.target.x(), e.target.y())}
      onClick={() => onSelect(el.id)} onTap={() => onSelect(el.id)}
    >
      {selected && <Circle radius={r + 5} fill="rgba(255,215,0,0.3)" stroke="#FFD700" strokeWidth={2} />}
      {el.tipo === 'cono' ? (
        <RegularPolygon sides={3} radius={r} fill={fill} stroke="white" strokeWidth={1.5}
          shadowBlur={4} shadowColor="rgba(0,0,0,0.5)" />
      ) : (
        <Circle radius={r} fill={fill} stroke="white" strokeWidth={2}
          shadowBlur={4} shadowColor="rgba(0,0,0,0.5)" />
      )}
      {el.dorsal !== undefined && el.tipo !== 'balon' && (
        <Text text={String(el.dorsal)} fontSize={10} fontFamily="'JetBrains Mono',monospace"
          fontStyle="bold" fill="white" align="center" verticalAlign="middle"
          offsetX={r * 0.5} offsetY={r * 0.4} width={r} listening={false} />
      )}
    </Group>
  );
}

// ── COMPONENTE PRINCIPAL ─────────────────────────────────────
const PitchBoard = forwardRef<PitchBoardHandle, PitchBoardProps>(
  ({ formato, readOnly = false, initialData, onChange }, ref) => {
<<<<<<< HEAD
  const containerRef   = useRef<HTMLDivElement>(null);
  const stageRef       = useRef<Konva.Stage | null>(null);
  const fieldLayerRef  = useRef<Konva.Layer>(null);
  const previewLayerRef = useRef<Konva.Layer>(null);
  const previewLineRef = useRef<Konva.Line | null>(null);
  const animRef        = useRef<number | null>(null);
  const drawPtsRef     = useRef<number[]>([]);
  const isDrawingRef   = useRef(false);
  const drawStartRef   = useRef<{ x: number; y: number } | null>(null);
  const hasDraggedRef  = useRef(false);
  const textInputRef   = useRef<HTMLInputElement>(null);
  const undoStack      = useRef<{ idx: number; elementos: ElementoPizarra[]; trazos: TrazoCanvas[] }[]>([]);

  const RATIO = formato === 'F11' ? 1.54 : 1.5;
  const [size, setSize]             = useState({ w: 320, h: 490 });
  const [isFullscreen, setFullscreen] = useState(false);

  const [keyframes,  setKeyframes]  = useState<KeyframePizarra[]>(() => {
=======
  const containerRef    = useRef<HTMLDivElement>(null);
  const stageRef        = useRef<Konva.Stage | null>(null);
  const fieldLayerRef   = useRef<Konva.Layer>(null);
  const previewLayerRef = useRef<Konva.Layer>(null);
  const previewLineRef  = useRef<Konva.Line | null>(null);
  const animRef         = useRef<number | null>(null);
  const drawPtsRef      = useRef<number[]>([]);
  const isDrawingRef    = useRef(false);
  const drawStartRef    = useRef<{ x: number; y: number } | null>(null);
  const hasDraggedRef   = useRef(false);
  const textInputRef    = useRef<HTMLInputElement>(null);
  const undoStack       = useRef<{ idx: number; elementos: ElementoPizarra[]; trazos: TrazoCanvas[] }[]>([]);

  const RATIO = formato === 'F11' ? 1.54 : 1.5;
  const [size, setSize]               = useState({ w: 320, h: 490 });
  const [isFullscreen, setFullscreen] = useState(false);

  const [keyframes, setKeyframes] = useState<KeyframePizarra[]>(() => {
>>>>>>> dev
    if (initialData) {
      try {
        const parsed: EscenapPizarra = JSON.parse(initialData);
        return parsed.keyframes ?? [{ id: crypto.randomUUID(), elementos: [], trazos: [], duracion_ms: 1200 }];
      } catch { /* ignored */ }
    }
    return [{ id: crypto.randomUUID(), elementos: [], trazos: [], duracion_ms: 1200 }];
  });
<<<<<<< HEAD
  const [currentKF,   setCurrentKF]  = useState(0);
  const [selectedEl,  setSelectedEl] = useState<string | null>(null);
  const [tool,        setTool]       = useState<ToolType>('select');
  const [color,       setColor]      = useState(PALETA[0]);
  const [grosor,      setGrosor]     = useState(GROSORES[0]);
  const [playing,     setPlaying]    = useState(false);
  const [playSpeed,   setPlaySpeed]  = useState(1);
  const [displayEls,  setDisplayEls] = useState<ElementoPizarra[] | null>(null);
  const [pendingFlecha, setPendingFlecha] = useState<{ x1: number; y1: number; x2: number; y2: number } | null>(null);
  const [pendingZona,   setPendingZona]   = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const [textPos,     setTextPos]    = useState<{ x: number; y: number } | null>(null);
  const [textVal,     setTextVal]    = useState('');
=======
  const [currentKF,     setCurrentKF]     = useState(0);
  const [selectedEl,    setSelectedEl]    = useState<string | null>(null);
  const [tool,          setTool]          = useState<ToolType>('select');
  const [color,         setColor]         = useState(PALETA[0]);
  const [grosor,        setGrosor]        = useState(GROSORES[0]);
  const [playing,       setPlaying]       = useState(false);
  const [playSpeed,     setPlaySpeed]     = useState(1);
  const [displayEls,    setDisplayEls]    = useState<ElementoPizarra[] | null>(null);
  const [pendingFlecha, setPendingFlecha] = useState<{ x1: number; y1: number; x2: number; y2: number } | null>(null);
  const [pendingZona,   setPendingZona]   = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const [textPos,       setTextPos]       = useState<{ x: number; y: number } | null>(null);
  const [textVal,       setTextVal]       = useState('');
>>>>>>> dev

  const currentEls = displayEls ?? keyframes[currentKF]?.elementos ?? [];

  // ── Responsive ───────────────────────────────────────────
  useEffect(() => {
    const update = () => {
      if (!containerRef.current) return;
      const availW = containerRef.current.offsetWidth;
      const availH = containerRef.current.offsetHeight;
      if (isFullscreen && availH > 60) {
        const byW = { w: availW, h: Math.round(availW * RATIO) };
        const byH = { w: Math.round(availH / RATIO), h: availH };
        setSize(byH.w <= availW ? byH : byW);
      } else {
        setSize({ w: availW, h: Math.round(availW * RATIO) });
      }
    };
    update();
    const ro = new ResizeObserver(update);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [RATIO, isFullscreen]);

  useEffect(() => {
    if (fieldLayerRef.current) drawPitchLayer(fieldLayerRef.current, size.w, size.h, formato);
  }, [size, formato]);

  useEffect(() => {
    if (onChange && !playing) {
      const scene: EscenapPizarra = { formato, keyframes };
      onChange(JSON.stringify(scene));
    }
  }, [keyframes, playing]);

  // ── Handle externo ───────────────────────────────────────
  useImperativeHandle(ref, () => ({
    exportPNG: () => stageRef.current?.toDataURL({ pixelRatio: 2 }),
    getJSON:   () => JSON.stringify({ formato, keyframes } satisfies EscenapPizarra),
  }));

<<<<<<< HEAD
  // ── Undo ────────────────────────────────────────────────
=======
  // ── Undo ─────────────────────────────────────────────────
>>>>>>> dev
  function pushUndo() {
    const kf = keyframes[currentKF];
    undoStack.current = [
      ...undoStack.current.slice(-19),
      { idx: currentKF, elementos: [...kf.elementos], trazos: [...(kf.trazos ?? [])] },
    ];
  }
  function undo() {
    const prev = undoStack.current.pop();
    if (!prev) return;
    setKeyframes(ks => ks.map((kf, i) =>
      i !== prev.idx ? kf : { ...kf, elementos: prev.elementos, trazos: prev.trazos }
    ));
    setSelectedEl(null);
  }

  // ── Helpers ──────────────────────────────────────────────
  const updateKFElements = useCallback((kfIdx: number, els: ElementoPizarra[]) => {
    setKeyframes(prev => prev.map((kf, i) => i === kfIdx ? { ...kf, elementos: els } : kf));
  }, []);

  function clearAll() {
    pushUndo();
    setKeyframes(prev => prev.map((kf, i) =>
      i !== currentKF ? kf : { ...kf, elementos: [], trazos: [] }
    ));
    setSelectedEl(null);
    previewLineRef.current?.destroy();
    previewLayerRef.current?.batchDraw();
    previewLineRef.current = null;
    drawPtsRef.current = [];
    isDrawingRef.current = false;
  }

  function borrarSeleccionado() {
    if (!selectedEl) return;
    pushUndo();
    updateKFElements(currentKF, keyframes[currentKF].elementos.filter(e => e.id !== selectedEl));
    setSelectedEl(null);
  }

  // ── Eventos de dibujo ────────────────────────────────────
  const handleMouseDown = useCallback((e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
    if (readOnly || playing) return;
    const pos = getPos(e);
    if (!pos) return;
    hasDraggedRef.current = false;

    if (tool === 'rotulador') {
      isDrawingRef.current = true;
      drawPtsRef.current = [pos.x, pos.y];
      const line = new Konva.Line({
        points: [pos.x, pos.y],
        stroke: color, strokeWidth: grosor,
        tension: 0.5, lineCap: 'round', lineJoin: 'round', listening: false,
      });
      previewLayerRef.current?.add(line);
      previewLineRef.current = line;
    }
    if (tool === 'flecha_pase' || tool === 'flecha_movimiento') {
      drawStartRef.current = pos;
      setPendingFlecha({ x1: pos.x, y1: pos.y, x2: pos.x, y2: pos.y });
    }
    if (tool === 'zona') {
      drawStartRef.current = pos;
      setPendingZona({ x: pos.x, y: pos.y, w: 0, h: 0 });
    }
  }, [readOnly, playing, tool, color, grosor]);

  const handleMouseMove = useCallback((e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
    if (readOnly || playing) return;
    const pos = getPos(e);
    if (!pos) return;

    if (tool === 'rotulador' && isDrawingRef.current && previewLineRef.current) {
      drawPtsRef.current = [...drawPtsRef.current, pos.x, pos.y];
      previewLineRef.current.points(drawPtsRef.current);
      previewLayerRef.current?.batchDraw();
      hasDraggedRef.current = true;
    }
    if ((tool === 'flecha_pase' || tool === 'flecha_movimiento') && drawStartRef.current) {
      setPendingFlecha(prev => prev ? { ...prev, x2: pos.x, y2: pos.y } : null);
      hasDraggedRef.current = true;
    }
    if (tool === 'zona' && drawStartRef.current) {
      const ox = drawStartRef.current.x, oy = drawStartRef.current.y;
      setPendingZona({ x: Math.min(ox, pos.x), y: Math.min(oy, pos.y), w: Math.abs(pos.x - ox), h: Math.abs(pos.y - oy) });
      hasDraggedRef.current = true;
    }
  }, [readOnly, playing, tool]);

  const handleMouseUp = useCallback((_e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
    if (readOnly || playing) return;

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
        setKeyframes(prev => prev.map((kf, i) =>
          i !== currentKF ? kf : { ...kf, trazos: [...(kf.trazos ?? []), trazo] }
        ));
      }
      drawPtsRef.current = [];
    }

    if ((tool === 'flecha_pase' || tool === 'flecha_movimiento') && pendingFlecha) {
      const dx = pendingFlecha.x2 - pendingFlecha.x1, dy = pendingFlecha.y2 - pendingFlecha.y1;
      if (Math.hypot(dx, dy) > 15) {
        const newEl: ElementoPizarra = {
          id: crypto.randomUUID(), tipo: tool,
          x: pendingFlecha.x1, y: pendingFlecha.y1,
          x2: pendingFlecha.x2, y2: pendingFlecha.y2,
          color: tool === 'flecha_pase' ? '#FFD700' : '#00E5FF',
        };
        pushUndo();
        updateKFElements(currentKF, [...keyframes[currentKF].elementos, newEl]);
        hasDraggedRef.current = true;
      }
      setPendingFlecha(null);
      drawStartRef.current = null;
    }

    if (tool === 'zona' && pendingZona) {
      if (pendingZona.w > 20 && pendingZona.h > 20) {
        const newEl: ElementoPizarra = {
          id: crypto.randomUUID(), tipo: 'zona',
          x: pendingZona.x, y: pendingZona.y,
          x2: pendingZona.x + pendingZona.w, y2: pendingZona.y + pendingZona.h,
          color,
        };
        pushUndo();
        updateKFElements(currentKF, [...keyframes[currentKF].elementos, newEl]);
        hasDraggedRef.current = true;
      }
      setPendingZona(null);
      drawStartRef.current = null;
    }
  }, [readOnly, playing, tool, color, grosor, pendingFlecha, pendingZona, currentKF, keyframes, updateKFElements]);

  // ── Click para colocar elementos ─────────────────────────
  const handleStageClick = useCallback((e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
    if (readOnly || playing) return;
    if (hasDraggedRef.current) { hasDraggedRef.current = false; return; }
    if (e.target !== e.target.getStage() && e.target.getLayer() !== fieldLayerRef.current) return;
    const pos = e.target.getStage()?.getPointerPosition();
    if (!pos) return;

    if (tool === 'select') { setSelectedEl(null); return; }
    if (tool === 'rotulador' || tool === 'flecha_pase' || tool === 'flecha_movimiento' || tool === 'zona') return;

    if (tool === 'texto') {
      setTextPos(pos);
      setTextVal('');
      setTimeout(() => textInputRef.current?.focus(), 50);
      return;
    }

    const kf = keyframes[currentKF];
    let newEl: ElementoPizarra = { id: crypto.randomUUID(), tipo: tool as ElementoPizarra['tipo'], x: pos.x, y: pos.y };
    if (tool === 'jugador_azul') newEl = { ...newEl, tipo: 'jugador_azul', dorsal: kf.elementos.filter(e => e.tipo === 'jugador_azul').length + 1 };
    if (tool === 'jugador_rojo') newEl = { ...newEl, tipo: 'jugador_rojo', dorsal: kf.elementos.filter(e => e.tipo === 'jugador_rojo').length + 1 };
    if (tool === 'portero_azul') newEl = { ...newEl, tipo: 'portero_azul', dorsal: 1 };
    if (tool === 'portero_rojo') newEl = { ...newEl, tipo: 'portero_rojo', dorsal: 1 };

    pushUndo();
    updateKFElements(currentKF, [...kf.elementos, newEl]);
    setTool('select');
  }, [readOnly, playing, tool, currentKF, keyframes, updateKFElements]);

<<<<<<< HEAD
  // ── Texto confirm ────────────────────────────────────────
  function confirmText() {
    if (textVal.trim() && textPos) {
      const newEl: ElementoPizarra = { id: crypto.randomUUID(), tipo: 'texto', x: textPos.x, y: textPos.y, etiqueta: textVal.trim(), color };
=======
  // ── Confirmar texto ──────────────────────────────────────
  function confirmText() {
    if (textVal.trim() && textPos) {
      const newEl: ElementoPizarra = {
        id: crypto.randomUUID(), tipo: 'texto',
        x: textPos.x, y: textPos.y,
        etiqueta: textVal.trim(), color,
      };
>>>>>>> dev
      pushUndo();
      updateKFElements(currentKF, [...keyframes[currentKF].elementos, newEl]);
    }
    setTextPos(null);
    setTextVal('');
  }

  // ── Drag de elementos ────────────────────────────────────
  function handleDrag(id: string, x: number, y: number) {
    setKeyframes(prev => prev.map((kf, i) =>
      i !== currentKF ? kf : { ...kf, elementos: kf.elementos.map(el => el.id === id ? { ...el, x, y } : el) }
    ));
  }
  function handleDragEnd(id: string, x: number, y: number) { handleDrag(id, x, y); }

  // ── Keyframes ────────────────────────────────────────────
  function addKeyframe() {
    const lastKF = keyframes[keyframes.length - 1];
    const newKF: KeyframePizarra = {
      id: crypto.randomUUID(),
      elementos: (lastKF?.elementos ?? []).map(e => ({ ...e, id: crypto.randomUUID() })),
<<<<<<< HEAD
      trazos: (lastKF?.trazos ?? []).map(t => ({ ...t, id: crypto.randomUUID() })),
=======
      trazos:    (lastKF?.trazos ?? []).map(t => ({ ...t, id: crypto.randomUUID() })),
>>>>>>> dev
      duracion_ms: 1200,
    };
    setKeyframes(prev => [...prev, newKF]);
    setCurrentKF(keyframes.length);
  }

  function removeKeyframe(idx: number) {
    if (keyframes.length <= 1) return;
    const next = [...keyframes];
    next.splice(idx, 1);
    setKeyframes(next);
    setCurrentKF(Math.min(currentKF, next.length - 1));
  }

  // ── Animación ────────────────────────────────────────────
  function startPlay() {
    if (keyframes.length < 2) return;
    setPlaying(true);
    let kfIdx = 0;
    let startTime = performance.now();

    function frame(now: number) {
      const elapsed = (now - startTime) * playSpeed;
      const kf = keyframes[kfIdx];
      const nextKf = keyframes[kfIdx + 1];
      if (!nextKf) { setPlaying(false); setDisplayEls(null); return; }

      const t = Math.min(elapsed / kf.duracion_ms, 1);
      const lerped = kf.elementos.map(el => {
        const nel = nextKf.elementos.find(e => e.tipo === el.tipo && Math.abs(e.dorsal ?? -1) === Math.abs(el.dorsal ?? -1));
        if (!nel) return el;
        return { ...el, x: lerp(el.x, nel.x, t), y: lerp(el.y, nel.y, t) };
      });
      setDisplayEls(lerped);

      if (t >= 1) {
        kfIdx++;
        startTime = now;
        if (kfIdx >= keyframes.length - 1) {
          setPlaying(false); setDisplayEls(null); return;
        }
      }
      animRef.current = requestAnimationFrame(frame);
    }
    animRef.current = requestAnimationFrame(frame);
  }

  function stopPlay() {
    if (animRef.current) cancelAnimationFrame(animRef.current);
    setPlaying(false);
    setDisplayEls(null);
  }

  // ── Paleta de herramientas ───────────────────────────────
  const TOOLS: { type: ToolType; icon: React.ReactNode; label: string }[] = [
    { type: 'select',            icon: <MousePointer size={15} />,  label: 'Selec.' },
    { type: 'rotulador',         icon: <Pencil size={15} />,        label: 'Rotul.' },
    { type: 'flecha_pase',       icon: <ArrowRight size={15} className="text-yellow-400" />, label: 'Pase' },
    { type: 'flecha_movimiento', icon: <ArrowRight size={15} className="text-cyan-400" />,   label: 'Mov.' },
    { type: 'zona',              icon: <Square size={15} />,         label: 'Zona' },
    { type: 'texto',             icon: <Type size={15} />,           label: 'Texto' },
    { type: 'jugador_azul',      icon: <span className="w-3.5 h-3.5 rounded-full bg-blue-600 inline-block" />, label: 'Azul' },
    { type: 'jugador_rojo',      icon: <span className="w-3.5 h-3.5 rounded-full bg-red-600 inline-block" />,  label: 'Rojo' },
    { type: 'portero_azul',      icon: <span className="w-3.5 h-3.5 rounded-full bg-amber-400 border-2 border-blue-600 inline-block" />, label: 'P.Az' },
    { type: 'portero_rojo',      icon: <span className="w-3.5 h-3.5 rounded-full bg-amber-400 border-2 border-red-600 inline-block" />,  label: 'P.Ro' },
    { type: 'balon',             icon: <CircleIcon size={15} />,    label: 'Balón' },
    { type: 'cono',              icon: <ConeIcon />,                 label: 'Cono' },
  ];

  const showColor  = tool === 'rotulador' || tool === 'zona' || tool === 'texto';
  const showGrosor = tool === 'rotulador';

  const wrapperCls = isFullscreen
    ? 'fixed inset-0 z-50 flex flex-col bg-gray-950'
    : 'flex flex-col gap-2 bg-gray-900 rounded-2xl p-2 overflow-hidden';

  return (
    <div className={wrapperCls}>
      {/* ── Toolbar ─────────────────────────────────────────── */}
      {!readOnly && (
        <div className="flex items-center gap-1 px-1 py-1.5 bg-gray-900 overflow-x-auto scrollbar-hide flex-shrink-0">
<<<<<<< HEAD
          {/* Herramientas */}
          {TOOLS.map(t => (
            <button key={t.type}
              onClick={() => { setTool(t.type); }}
=======
          {TOOLS.map(t => (
            <button key={t.type} type="button"
              onClick={() => setTool(t.type)}
>>>>>>> dev
              className={`flex-shrink-0 flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg
                          text-[10px] font-titulo font-semibold transition-colors min-w-[40px]
                          ${tool === t.type ? 'bg-quarte-azul text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}>
              {t.icon}
              {t.label}
            </button>
          ))}

          <div className="w-px h-7 bg-gray-700 flex-shrink-0 mx-0.5" />

<<<<<<< HEAD
          {/* Colores */}
          {showColor && PALETA.map(c => (
            <button key={c}
=======
          {showColor && PALETA.map(c => (
            <button key={c} type="button"
>>>>>>> dev
              onClick={() => setColor(c)}
              style={{ background: c }}
              className={`flex-shrink-0 w-6 h-6 rounded-full transition-transform
                          ${color === c ? 'scale-125 ring-2 ring-quarte-azul ring-offset-1 ring-offset-gray-900' : 'opacity-60 hover:opacity-100'}`} />
          ))}

<<<<<<< HEAD
          {/* Grosor */}
=======
>>>>>>> dev
          {showGrosor && (
            <>
              <div className="w-px h-7 bg-gray-700 flex-shrink-0 mx-0.5" />
              {GROSORES.map(g => (
<<<<<<< HEAD
                <button key={g}
=======
                <button key={g} type="button"
>>>>>>> dev
                  onClick={() => setGrosor(g)}
                  className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg transition-colors
                              ${grosor === g ? 'bg-quarte-azul' : 'bg-gray-800 hover:bg-gray-700'}`}>
                  <span className="bg-white rounded-full" style={{ width: g + 2, height: g + 2 }} />
                </button>
              ))}
            </>
          )}

          <div className="w-px h-7 bg-gray-700 flex-shrink-0 mx-0.5" />

<<<<<<< HEAD
          {/* Deshacer */}
          <button onClick={undo}
=======
          <button type="button" onClick={undo}
>>>>>>> dev
            className="flex-shrink-0 flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg min-w-[40px]
                       bg-gray-800 text-gray-300 hover:bg-gray-700 text-[10px] font-titulo font-semibold">
            <Undo2 size={14} />Desah.
          </button>

<<<<<<< HEAD
          {/* Borrar todo */}
          <button onClick={clearAll}
=======
          <button type="button" onClick={clearAll}
>>>>>>> dev
            className="flex-shrink-0 flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg min-w-[40px]
                       bg-gray-800 text-gray-300 hover:bg-gray-700 text-[10px] font-titulo font-semibold">
            <RotateCcw size={14} />Limpiar
          </button>

<<<<<<< HEAD
          {/* Eliminar seleccionado */}
          {selectedEl && (
            <button onClick={borrarSeleccionado}
=======
          {selectedEl && (
            <button type="button" onClick={borrarSeleccionado}
>>>>>>> dev
              className="flex-shrink-0 flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg min-w-[40px]
                         bg-red-900 text-red-300 hover:bg-red-800 text-[10px] font-titulo font-semibold">
              <Trash2 size={14} />Borrar
            </button>
          )}

          <div className="ml-auto flex-shrink-0" />

<<<<<<< HEAD
          {/* Pantalla completa */}
          <button onClick={() => setFullscreen(v => !v)}
=======
          <button type="button" onClick={() => setFullscreen(v => !v)}
>>>>>>> dev
            className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700">
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
        </div>
      )}

      {/* ── Canvas ──────────────────────────────────────────── */}
      <div ref={containerRef}
        className={isFullscreen
          ? 'flex-1 overflow-hidden flex items-center justify-center bg-gray-950 relative'
          : 'w-full relative'}>
        <div className="relative" style={{ width: size.w, height: size.h }}>
          <Stage
            ref={stageRef} width={size.w} height={size.h}
            className="rounded-xl overflow-hidden"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onTouchStart={handleMouseDown}
            onTouchMove={handleMouseMove}
            onTouchEnd={handleMouseUp}
            onClick={handleStageClick}
            onTap={handleStageClick}
<<<<<<< HEAD
            style={{ cursor: tool === 'rotulador' ? 'crosshair' : tool === 'select' ? 'default' : 'crosshair' }}
          >
            {/* Campo */}
            <Layer ref={fieldLayerRef} listening={false} />

            {/* Trazos freehand del keyframe actual */}
=======
            style={{ cursor: tool === 'rotulador' || tool === 'flecha_pase' || tool === 'flecha_movimiento' || tool === 'zona' ? 'crosshair' : 'default' }}
          >
            <Layer ref={fieldLayerRef} listening={false} />

>>>>>>> dev
            <Layer listening={false}>
              {(keyframes[currentKF]?.trazos ?? []).map(t => (
                <Line key={t.id}
                  points={t.puntos} stroke={t.color} strokeWidth={t.grosor}
                  tension={0.5} lineCap="round" lineJoin="round" />
              ))}
            </Layer>

<<<<<<< HEAD
            {/* Preview layer imperativo (rotulador en vivo) */}
            <Layer ref={previewLayerRef} listening={false} />

            {/* Elementos interactivos */}
            <Layer>
              {/* Preview flecha mientras se arrastra */}
=======
            <Layer ref={previewLayerRef} listening={false} />

            <Layer>
>>>>>>> dev
              {pendingFlecha && Math.hypot(pendingFlecha.x2 - pendingFlecha.x1, pendingFlecha.y2 - pendingFlecha.y1) > 5 && (
                <Arrow
                  points={[pendingFlecha.x1, pendingFlecha.y1, pendingFlecha.x2, pendingFlecha.y2]}
                  stroke={tool === 'flecha_pase' ? '#FFD700' : '#00E5FF'}
                  fill={tool === 'flecha_pase' ? '#FFD700' : '#00E5FF'}
                  strokeWidth={2.5}
                  dash={tool === 'flecha_movimiento' ? [6, 4] : undefined}
                  pointerLength={10} pointerWidth={8}
                  opacity={0.65} listening={false}
                />
              )}

<<<<<<< HEAD
              {/* Preview zona mientras se arrastra */}
=======
>>>>>>> dev
              {pendingZona && pendingZona.w > 0 && (
                <Rect
                  x={pendingZona.x} y={pendingZona.y} width={pendingZona.w} height={pendingZona.h}
                  fill={color + '20'} stroke={color} strokeWidth={1.5}
                  dash={[6, 4]} listening={false}
                />
              )}

<<<<<<< HEAD
              {/* Elementos del keyframe */}
=======
>>>>>>> dev
              {currentEls.map(el => (
                <PizarraElement key={el.id} el={el}
                  selected={selectedEl === el.id}
                  onSelect={id => !playing && setSelectedEl(id)}
                  onDrag={handleDrag} onDragEnd={handleDragEnd}
                  readOnly={readOnly || playing} />
              ))}
            </Layer>
          </Stage>

<<<<<<< HEAD
          {/* Input de texto flotante */}
=======
>>>>>>> dev
          {textPos && (
            <input
              ref={textInputRef}
              style={{ position: 'absolute', left: textPos.x, top: textPos.y - 22, zIndex: 60, minWidth: 80 }}
              className="bg-transparent border-0 border-b-2 border-white text-white font-bold text-base outline-none px-1"
              placeholder="Texto…"
              value={textVal}
              onChange={e => setTextVal(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === 'Escape') confirmText(); }}
              onBlur={confirmText}
            />
          )}
<<<<<<< HEAD

          {/* Leyenda colores */}
          {readOnly && (
            <div className="absolute bottom-3 right-3 flex flex-col gap-1.5 pointer-events-none">
              <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-sm rounded-lg px-2 py-1">
                <span className="w-3 h-3 rounded-full bg-blue-600 ring-1 ring-white" />
                <span className="text-white text-[9px] font-titulo">Mi equipo</span>
              </div>
              <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-sm rounded-lg px-2 py-1">
                <span className="w-3 h-3 rounded-full bg-red-600 ring-1 ring-white" />
                <span className="text-white text-[9px] font-titulo">Rival</span>
              </div>
            </div>
          )}
=======
>>>>>>> dev
        </div>
      </div>

      {/* ── Controles keyframes + reproducción ──────────────── */}
      {!readOnly && (
        <div className="flex flex-col gap-2 px-1 pb-1 flex-shrink-0">
<<<<<<< HEAD
          {/* Timeline */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {keyframes.map((kf, i) => (
              <button key={kf.id}
=======
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {keyframes.map((kf, i) => (
              <button key={kf.id} type="button"
>>>>>>> dev
                onClick={() => { stopPlay(); setCurrentKF(i); setSelectedEl(null); }}
                className={`flex-shrink-0 relative px-3 py-1.5 rounded-lg text-xs font-titulo font-bold transition-colors
                             ${i === currentKF ? 'bg-quarte-azul text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>
                Paso {i + 1}
                {keyframes.length > 1 && (
                  <span onClick={e => { e.stopPropagation(); removeKeyframe(i); }}
                    className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 rounded-full
                               text-white text-[8px] flex items-center justify-center cursor-pointer">
                    ×
                  </span>
                )}
              </button>
            ))}
            <button type="button" onClick={addKeyframe}
              className="flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-lg
                         bg-gray-700 text-gray-300 hover:bg-gray-600 text-xs font-titulo">
              <Plus size={12} /> Paso
            </button>
          </div>

<<<<<<< HEAD
          {/* Reproducción */}
=======
>>>>>>> dev
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => { stopPlay(); setCurrentKF(0); }}
              className="w-9 h-9 flex items-center justify-center rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600">
              <SkipBack size={16} />
            </button>
            <button type="button"
              onClick={playing ? stopPlay : startPlay}
              disabled={keyframes.length < 2}
              className={`flex-1 h-9 flex items-center justify-center rounded-lg font-titulo font-bold text-sm
                          transition-colors disabled:opacity-40
                          ${playing ? 'bg-quarte-rojo text-white' : 'bg-quarte-verde text-white'}`}>
              {playing ? <><Pause size={16} className="mr-1" /> Pausar</> : <><Play size={16} className="mr-1" /> Reproducir</>}
            </button>
            <select value={playSpeed} onChange={e => setPlaySpeed(Number(e.target.value))}
              className="h-9 px-2 rounded-lg bg-gray-700 text-gray-300 text-xs font-titulo border-0 outline-none">
              <option value={0.5}>0.5×</option>
              <option value={1}>1×</option>
              <option value={2}>2×</option>
            </select>
          </div>
        </div>
      )}

<<<<<<< HEAD
      {/* Modo readOnly: solo botón play */}
=======
>>>>>>> dev
      {readOnly && keyframes.length >= 2 && (
        <div className="flex justify-center py-1">
          <button type="button" onClick={playing ? stopPlay : startPlay}
            className={`flex items-center gap-2 px-6 py-2 rounded-full font-titulo font-bold text-sm
                        ${playing ? 'bg-quarte-rojo text-white' : 'bg-quarte-verde text-white'}`}>
            {playing ? <><Pause size={14} /> Pausar</> : <><Play size={14} /> Ver animación</>}
          </button>
        </div>
      )}
    </div>
  );
});

function ConeIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
      <polygon points="8,2 15,14 1,14" fill="#F97316" />
    </svg>
  );
}

PitchBoard.displayName = 'PitchBoard';
export default PitchBoard;
