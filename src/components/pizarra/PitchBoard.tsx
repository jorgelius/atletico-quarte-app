// ============================================================
// PitchBoard — editor de pizarra animada con keyframes
// Reutilizable en Entrenamientos y Tácticas
// ============================================================
import { useRef, useEffect, useState, useCallback, useImperativeHandle, forwardRef } from 'react';
import { Stage, Layer, Circle, Text, Arrow, Group, RegularPolygon } from 'react-konva';
import Konva from 'konva';
import {
  Play, Pause, SkipBack, Plus, Trash2,
  MousePointer, Circle as CircleIcon, ArrowRight,
  Type,
} from 'lucide-react';
import type { FormatoPartido, ElementoPizarra, KeyframePizarra, EscenapPizarra } from '@/types';

// ── Tipos de elementos disponibles ──────────────────────────
type ToolType = ElementoPizarra['tipo'] | 'select';

interface PitchBoardProps {
  formato: FormatoPartido;
  readOnly?: boolean;
  initialData?: string;         // JSON de EscenapPizarra
  onChange?: (json: string) => void;
}

export interface PitchBoardHandle {
  exportPNG: () => string | undefined;
  getJSON: () => string;
}

// ── Colores ──────────────────────────────────────────────────
const COLORS = {
  field:     '#2E7D32',
  fieldAlt:  '#267028',
  line:      'white',
  azul:      '#1D4ED8',
  rojo:      '#DC2626',
  portero:   '#F59E0B',
  balon:     'white',
  cono:      '#F97316',
  zona:      'rgba(255,255,0,0.25)',
};

function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }

// ── Dibuja el campo en un Layer de Konva ────────────────────
function drawPitchLayer(layer: Konva.Layer, W: number, H: number, fmt: FormatoPartido) {
  layer.destroyChildren();
  const isF11 = fmt === 'F11';
  const pad = W * 0.04;
  const fw = W - pad * 2, fh = H - pad * 2;

  layer.add(new Konva.Rect({ x: 0, y: 0, width: W, height: H, fill: COLORS.field }));
  for (let i = 0; i < 8; i++) {
    layer.add(new Konva.Rect({ x: pad, y: pad + (fh/8)*i, width: fw, height: fh/8,
      fill: i % 2 === 0 ? COLORS.field : COLORS.fieldAlt }));
  }
  const s = { stroke: COLORS.line, strokeWidth: 1.5, listening: false };
  layer.add(new Konva.Rect({ x: pad, y: pad, width: fw, height: fh, fill: 'transparent', ...s }));
  layer.add(new Konva.Line({ points: [pad, H/2, pad+fw, H/2], ...s }));
  const cr = isF11 ? fw*0.13 : fw*0.15;
  layer.add(new Konva.Circle({ x: W/2, y: H/2, radius: cr, fill: 'transparent', ...s }));
  layer.add(new Konva.Circle({ x: W/2, y: H/2, radius: 3, fill: 'white', listening: false }));
  const gw = isF11 ? fw*0.30 : fw*0.35, gd = isF11 ? fh*0.155 : fh*0.17;
  const sw = isF11 ? fw*0.14 : fw*0.18, sd = isF11 ? fh*0.06  : fh*0.08;
  const ggw = isF11 ? fw*0.07 : fw*0.10;
  const gx1 = W/2-gw/2, sx1 = W/2-sw/2, glx = W/2-ggw/2;
  const bot = pad+fh;
  layer.add(new Konva.Rect({ x: gx1, y: bot-gd, width: gw, height: gd, fill: 'transparent', ...s }));
  layer.add(new Konva.Rect({ x: sx1, y: bot-sd, width: sw, height: sd, fill: 'transparent', ...s }));
  layer.add(new Konva.Rect({ x: glx, y: bot,    width: ggw,height: 8,  fill:'transparent',stroke:'white',strokeWidth:2,listening:false}));
  layer.add(new Konva.Rect({ x: gx1, y: pad,    width: gw, height: gd, fill: 'transparent', ...s }));
  layer.add(new Konva.Rect({ x: sx1, y: pad,    width: sw, height: sd, fill: 'transparent', ...s }));
  layer.add(new Konva.Rect({ x: glx, y: pad-8,  width: ggw,height: 8,  fill:'transparent',stroke:'white',strokeWidth:2,listening:false}));
  layer.batchDraw();
}

// ── Componente de un elemento en la pizarra ─────────────────
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
  const isArrow = el.tipo === 'flecha_pase' || el.tipo === 'flecha_movimiento';
  if (isArrow) {
    return (
      <Arrow
        x={0} y={0}
        points={[el.x, el.y, el.x2 ?? el.x+60, el.y2 ?? el.y]}
        stroke={el.tipo === 'flecha_pase' ? '#FFD700' : '#00E5FF'}
        strokeWidth={2.5}
        fill={el.tipo === 'flecha_pase' ? '#FFD700' : '#00E5FF'}
        dash={el.tipo === 'flecha_movimiento' ? [6, 4] : undefined}
        pointerLength={8} pointerWidth={6}
        listening={!readOnly}
        onClick={() => onSelect(el.id)}
        onTap={() => onSelect(el.id)}
        opacity={selected ? 0.9 : 0.75}
      />
    );
  }
  if (el.tipo === 'texto') {
    return (
      <Text
        x={el.x} y={el.y}
        text={el.etiqueta ?? 'Texto'}
        fontSize={14} fontFamily="Montserrat,sans-serif"
        fill="white" draggable={!readOnly}
        onDragMove={e => onDrag(el.id, e.target.x(), e.target.y())}
        onDragEnd={e => onDragEnd(el.id, e.target.x(), e.target.y())}
        onClick={() => onSelect(el.id)} onTap={() => onSelect(el.id)}
        stroke={selected ? '#FFD700' : undefined} strokeWidth={selected ? 0.5 : 0}
      />
    );
  }

  const r = el.tipo === 'balon' ? 8 : el.tipo.includes('portero') ? 14 : 16;
  let fill = COLORS.azul;
  if (el.tipo.includes('rojo')) fill = COLORS.rojo;
  if (el.tipo.includes('portero')) fill = COLORS.portero;
  if (el.tipo === 'balon') fill = COLORS.balon;
  if (el.tipo === 'cono') fill = COLORS.cono;

  return (
    <Group
      x={el.x} y={el.y}
      draggable={!readOnly}
      onDragMove={e => onDrag(el.id, e.target.x(), e.target.y())}
      onDragEnd={e => onDragEnd(el.id, e.target.x(), e.target.y())}
      onClick={() => onSelect(el.id)}
      onTap={() => onSelect(el.id)}
    >
      {selected && <Circle radius={r+5} fill="rgba(255,215,0,0.3)" stroke="#FFD700" strokeWidth={2} />}
      {el.tipo === 'cono' ? (
        <RegularPolygon sides={3} radius={r} fill={fill} stroke="white" strokeWidth={1} />
      ) : (
        <Circle radius={r} fill={fill} stroke="white" strokeWidth={2}
          shadowBlur={4} shadowColor="rgba(0,0,0,0.5)" />
      )}
      {el.dorsal !== undefined && (
        <Text text={String(el.dorsal)} fontSize={10} fontFamily="Montserrat,sans-serif"
          fontStyle="bold" fill="white" align="center" verticalAlign="middle"
          offsetX={r*0.5} offsetY={r*0.4} width={r} />
      )}
    </Group>
  );
}

// ── COMPONENTE PRINCIPAL ────────────────────────────────────
const PitchBoard = forwardRef<PitchBoardHandle, PitchBoardProps>(
  ({ formato, readOnly = false, initialData, onChange }, ref) => {
  const containerRef  = useRef<HTMLDivElement>(null);
  const stageRef      = useRef<Konva.Stage | null>(null);
  const fieldLayerRef = useRef<Konva.Layer>(null);
  const animRef       = useRef<number | null>(null);

  const RATIO = formato === 'F11' ? 1.54 : 1.5;
  const [size, setSize] = useState({ w: 320, h: 490 });

  // Keyframes state
  const [keyframes, setKeyframes]   = useState<KeyframePizarra[]>(() => {
    if (initialData) {
      try {
        const parsed: EscenapPizarra = JSON.parse(initialData);
        return parsed.keyframes ?? [{ id: crypto.randomUUID(), elementos: [], duracion_ms: 1200 }];
      } catch { /* ignored */ }
    }
    return [{ id: crypto.randomUUID(), elementos: [], duracion_ms: 1200 }];
  });
  const [currentKF,    setCurrentKF]   = useState(0);
  const [selectedEl,   setSelectedEl]  = useState<string | null>(null);
  const [tool,         setTool]        = useState<ToolType>('select');
  const [playing,      setPlaying]     = useState(false);
  const [playSpeed,    setPlaySpeed]   = useState(1);
  // display elements during animation
  const [displayEls,   setDisplayEls] = useState<ElementoPizarra[] | null>(null);

  // Elementos actuales del keyframe en vista
  const currentEls = displayEls ?? keyframes[currentKF]?.elementos ?? [];

  // ── Responsive ──
  useEffect(() => {
    const update = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.offsetWidth;
      setSize({ w, h: Math.round(w * RATIO) });
    };
    update();
    const ro = new ResizeObserver(update);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [RATIO]);

  useEffect(() => {
    if (fieldLayerRef.current) drawPitchLayer(fieldLayerRef.current, size.w, size.h, formato);
  }, [size, formato]);

  // Notifica cambios
  useEffect(() => {
    if (onChange && !playing) {
      const scene: EscenapPizarra = { formato, keyframes };
      onChange(JSON.stringify(scene));
    }
  }, [keyframes, playing]);

  // ── Handle externo ──
  useImperativeHandle(ref, () => ({
    exportPNG: () => stageRef.current?.toDataURL({ pixelRatio: 2 }),
    getJSON:   () => JSON.stringify({ formato, keyframes } satisfies EscenapPizarra),
  }));

  // ── Helpers para mutar keyframes ──
  const updateKFElements = useCallback((kfIdx: number, els: ElementoPizarra[]) => {
    setKeyframes(prev => prev.map((kf, i) => i === kfIdx ? { ...kf, elementos: els } : kf));
  }, []);

  // ── Añadir elemento al canvas ──
  const handleStageClick = useCallback((e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
    if (readOnly || tool === 'select') return;
    if (playing) return;
    if (e.target !== e.target.getStage() && e.target.getLayer() !== fieldLayerRef.current) return;
    const stage = e.target.getStage();
    if (!stage) return;
    const pos = stage.getPointerPosition();
    if (!pos) return;

    const kf = keyframes[currentKF];
    let newEl: ElementoPizarra = { id: crypto.randomUUID(), tipo: tool as ElementoPizarra['tipo'], x: pos.x, y: pos.y };

    if (tool === 'jugador_azul')   newEl = { ...newEl, tipo: 'jugador_azul',   dorsal: kf.elementos.filter(e => e.tipo === 'jugador_azul').length + 1 };
    if (tool === 'jugador_rojo')   newEl = { ...newEl, tipo: 'jugador_rojo',   dorsal: kf.elementos.filter(e => e.tipo === 'jugador_rojo').length + 1 };
    if (tool === 'portero_azul')   newEl = { ...newEl, tipo: 'portero_azul',   dorsal: 1 };
    if (tool === 'portero_rojo')   newEl = { ...newEl, tipo: 'portero_rojo',   dorsal: 1 };
    if (tool === 'flecha_pase')    newEl = { ...newEl, tipo: 'flecha_pase',    x2: pos.x + 70, y2: pos.y };
    if (tool === 'flecha_movimiento') newEl = { ...newEl, tipo: 'flecha_movimiento', x2: pos.x + 70, y2: pos.y };
    if (tool === 'texto')          newEl = { ...newEl, tipo: 'texto', etiqueta: 'Texto' };

    updateKFElements(currentKF, [...kf.elementos, newEl]);
    setTool('select');
  }, [readOnly, tool, playing, currentKF, keyframes, updateKFElements]);

  function handleDrag(id: string, x: number, y: number) {
    setKeyframes(prev => prev.map((kf, i) =>
      i !== currentKF ? kf : { ...kf, elementos: kf.elementos.map(el => el.id === id ? { ...el, x, y } : el) }
    ));
  }
  function handleDragEnd(id: string, x: number, y: number) { handleDrag(id, x, y); }

  function borrarSeleccionado() {
    if (!selectedEl) return;
    updateKFElements(currentKF, keyframes[currentKF].elementos.filter(e => e.id !== selectedEl));
    setSelectedEl(null);
  }

  // ── Keyframes ──
  function addKeyframe() {
    const lastEls = keyframes[keyframes.length - 1]?.elementos ?? [];
    const newKF: KeyframePizarra = {
      id: crypto.randomUUID(),
      elementos: lastEls.map(e => ({ ...e, id: crypto.randomUUID() })),  // copia profunda
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

  // ── Animación ──
  function startPlay() {
    if (keyframes.length < 2) return;
    setPlaying(true);
    let kfIdx = 0;
    let startTime = performance.now();

    function frame(now: number) {
      const elapsed  = (now - startTime) * playSpeed;
      const kf       = keyframes[kfIdx];
      const nextKf   = keyframes[kfIdx + 1];
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

  // ── Paleta de herramientas ──
  const tools: { type: ToolType; icon: React.ReactNode; label: string }[] = [
    { type: 'select',            icon: <MousePointer size={16}/>, label: 'Selec.' },
    { type: 'jugador_azul',      icon: <span className="w-4 h-4 rounded-full bg-blue-600 inline-block"/>, label: 'Azul' },
    { type: 'jugador_rojo',      icon: <span className="w-4 h-4 rounded-full bg-red-600 inline-block"/>,  label: 'Rojo' },
    { type: 'portero_azul',      icon: <span className="w-4 h-4 rounded-full bg-amber-400 border-2 border-blue-600 inline-block"/>, label: 'P.Az' },
    { type: 'portero_rojo',      icon: <span className="w-4 h-4 rounded-full bg-amber-400 border-2 border-red-600 inline-block"/>,  label: 'P.Ro' },
    { type: 'balon',             icon: <CircleIcon size={16}/>,  label: 'Balón' },
    { type: 'cono',              icon: <RegularPolygonIcon/>,    label: 'Cono' },
    { type: 'flecha_pase',       icon: <ArrowRight size={16} className="text-yellow-400"/>, label: 'Pase' },
    { type: 'flecha_movimiento', icon: <ArrowRight size={16} className="text-cyan-400"/>,   label: 'Mov.' },
    { type: 'texto',             icon: <Type size={16}/>,        label: 'Texto' },
  ];

  return (
    <div className="flex flex-col gap-2 bg-gray-900 rounded-2xl p-2 overflow-hidden">
      {/* Barra de herramientas (solo editor) */}
      {!readOnly && (
        <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-hide">
          {tools.map(t => (
            <button key={t.type}
              onClick={() => setTool(t.type)}
              className={`flex-shrink-0 flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg
                          text-[10px] font-titulo font-semibold transition-colors min-w-[44px]
                          ${tool === t.type ? 'bg-quarte-azul text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}>
              {t.icon}
              {t.label}
            </button>
          ))}
          {selectedEl && (
            <button onClick={borrarSeleccionado}
              className="flex-shrink-0 flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg
                         bg-red-900 text-red-300 text-[10px] font-titulo font-semibold min-w-[44px]">
              <Trash2 size={16} /> Borrar
            </button>
          )}
        </div>
      )}

      {/* Canvas */}
      <div ref={containerRef} className="w-full">
        <Stage ref={stageRef} width={size.w} height={size.h}
          className="rounded-xl overflow-hidden"
          onClick={handleStageClick} onTap={handleStageClick}>
          <Layer ref={fieldLayerRef} listening={false} />
          <Layer>
            {currentEls.map(el => (
              <PizarraElement key={el.id} el={el}
                selected={selectedEl === el.id}
                onSelect={id => !playing && setSelectedEl(id)}
                onDrag={handleDrag} onDragEnd={handleDragEnd}
                readOnly={readOnly || playing} />
            ))}
          </Layer>
        </Stage>
      </div>

      {/* Controles de keyframes (solo editor) */}
      {!readOnly && (
        <div className="flex flex-col gap-2">
          {/* Timeline de keyframes */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {keyframes.map((kf, i) => (
              <button key={kf.id}
                onClick={() => { stopPlay(); setCurrentKF(i); }}
                className={`flex-shrink-0 relative px-3 py-1.5 rounded-lg text-xs font-titulo font-bold
                             transition-colors
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
            <button onClick={addKeyframe}
              className="flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-lg
                         bg-gray-700 text-gray-300 hover:bg-gray-600 text-xs font-titulo">
              <Plus size={12} /> Paso
            </button>
          </div>

          {/* Controles de reproducción */}
          <div className="flex items-center gap-2">
            <button onClick={() => { stopPlay(); setCurrentKF(0); }}
              className="w-9 h-9 flex items-center justify-center rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600">
              <SkipBack size={16} />
            </button>
            <button
              onClick={playing ? stopPlay : startPlay}
              disabled={keyframes.length < 2}
              className={`flex-1 h-9 flex items-center justify-center rounded-lg font-titulo font-bold text-sm
                          transition-colors
                          ${playing ? 'bg-quarte-rojo text-white' : 'bg-quarte-verde text-white'}
                          disabled:opacity-40`}>
              {playing ? <><Pause size={16} className="mr-1"/> Pausar</> : <><Play size={16} className="mr-1"/> Reproducir</>}
            </button>
            {/* Velocidad */}
            <select value={playSpeed} onChange={e => setPlaySpeed(Number(e.target.value))}
              className="h-9 px-2 rounded-lg bg-gray-700 text-gray-300 text-xs font-titulo border-0 outline-none">
              <option value={0.5}>0.5×</option>
              <option value={1}>1×</option>
              <option value={2}>2×</option>
            </select>
          </div>
        </div>
      )}

      {/* Modo readOnly: solo Play */}
      {readOnly && keyframes.length >= 2 && (
        <div className="flex justify-center py-1">
          <button onClick={playing ? stopPlay : startPlay}
            className={`flex items-center gap-2 px-6 py-2 rounded-full font-titulo font-bold text-sm
                        ${playing ? 'bg-quarte-rojo text-white' : 'bg-quarte-verde text-white'}`}>
            {playing ? <><Pause size={14}/> Pausar</> : <><Play size={14}/> Ver animación</>}
          </button>
        </div>
      )}
    </div>
  );
});

// Ícono simple para cono (triángulo)
function RegularPolygonIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <polygon points="8,2 15,14 1,14" fill="#F97316" />
    </svg>
  );
}

PitchBoard.displayName = 'PitchBoard';
export default PitchBoard;
