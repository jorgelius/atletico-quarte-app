// ============================================================
// FieldCanvas — campo de fútbol con fichas de jugadores (Konva)
// ============================================================
import { useRef, useEffect, useState, useCallback } from 'react';
import { Stage, Layer, Circle, Text, Group } from 'react-konva';
import Konva from 'konva';
import type { Jugador, FormatoPartido } from '@/types';
import type { SlotJugador } from '@/stores/plantillaStore';

// Colores por posición
const COLOR_POS: Record<string, string> = {
  POR: '#F59E0B', // amber
  DEF: '#3B82F6', // blue
  MED: '#22C55E', // green
  DEL: '#EF4444', // red
};

interface FieldCanvasProps {
  formato:      FormatoPartido;
  slots:        SlotJugador[];
  jugadores:    Jugador[];
  seleccionado: string | null;   // slotIdx as string
  onSelectSlot: (idx: number | null) => void;
  onMoveSlot:   (destIdx: number) => void;
  onOpenModal:  (slotIdx: number) => void;  // double tap → annotations
  stageRef:     React.RefObject<Konva.Stage | null>;
}

// ── Dibuja las líneas del campo ──────────────────────────────
function drawField(layer: Konva.Layer, W: number, H: number, formato: FormatoPartido) {
  layer.destroyChildren();

  const isF11 = formato === 'F11';
  const pad   = W * 0.04;            // margen exterior
  const fw    = W - pad * 2;         // ancho campo
  const fh    = H - pad * 2;         // alto campo

  // Fondo verde
  layer.add(new Konva.Rect({ x: 0, y: 0, width: W, height: H, fill: '#2E7D32' }));

  // Líneas de fondo del césped (rayas)
  for (let i = 0; i < 8; i++) {
    const y = pad + (fh / 8) * i;
    layer.add(new Konva.Rect({
      x: pad, y,
      width: fw, height: fh / 8,
      fill: i % 2 === 0 ? '#2E7D32' : '#267028',
    }));
  }

  const stroke = { stroke: 'white', strokeWidth: 1.5, listening: false };

  // Borde del campo
  layer.add(new Konva.Rect({ x: pad, y: pad, width: fw, height: fh, fill: 'transparent', ...stroke }));

  // Línea de centro
  layer.add(new Konva.Line({ points: [pad, H / 2, pad + fw, H / 2], ...stroke }));

  // Círculo central
  const cr = isF11 ? fw * 0.13 : fw * 0.15;
  layer.add(new Konva.Circle({ x: W / 2, y: H / 2, radius: cr, fill: 'transparent', ...stroke }));
  layer.add(new Konva.Circle({ x: W / 2, y: H / 2, radius: 3, fill: 'white', listening: false }));

  // ── PORTERÍA INFERIOR (propia) ──
  const gw  = isF11 ? fw * 0.30 : fw * 0.35;   // área grande ancho
  const gd  = isF11 ? fh * 0.155 : fh * 0.17;   // área grande profundidad
  const sw  = isF11 ? fw * 0.14 : fw * 0.18;   // área pequeña ancho
  const sd  = isF11 ? fh * 0.06 : fh * 0.08;   // área pequeña profundidad
  const ggw = isF11 ? fw * 0.07 : fw * 0.10;   // portería ancho
  const ggd = 8;                                 // portería profundidad (px)

  const gx1 = W / 2 - gw / 2;
  const sx1 = W / 2 - sw / 2;
  const glx = W / 2 - ggw / 2;
  const bot = pad + fh;

  // Área grande inferior
  layer.add(new Konva.Rect({ x: gx1, y: bot - gd, width: gw, height: gd, fill: 'transparent', ...stroke }));
  // Área pequeña inferior
  layer.add(new Konva.Rect({ x: sx1, y: bot - sd, width: sw, height: sd, fill: 'transparent', ...stroke }));
  // Portería inferior
  layer.add(new Konva.Rect({ x: glx, y: bot, width: ggw, height: ggd, fill: 'transparent', stroke: 'white', strokeWidth: 2, listening: false }));
  // Punto de penalti inferior
  if (isF11) {
    const py = bot - fh * 0.115;
    layer.add(new Konva.Circle({ x: W / 2, y: py, radius: 3, fill: 'white', listening: false }));
  }

  // ── PORTERÍA SUPERIOR (rival) ──
  const top = pad;
  layer.add(new Konva.Rect({ x: gx1, y: top, width: gw, height: gd, fill: 'transparent', ...stroke }));
  layer.add(new Konva.Rect({ x: sx1, y: top, width: sw, height: sd, fill: 'transparent', ...stroke }));
  layer.add(new Konva.Rect({ x: glx, y: top - ggd, width: ggw, height: ggd, fill: 'transparent', stroke: 'white', strokeWidth: 2, listening: false }));
  if (isF11) {
    const py = top + fh * 0.115;
    layer.add(new Konva.Circle({ x: W / 2, y: py, radius: 3, fill: 'white', listening: false }));
  }

  // Arcos de esquinas
  const cornerR = isF11 ? fw * 0.025 : fw * 0.03;
  [
    { x: pad,      y: pad },
    { x: pad + fw, y: pad },
    { x: pad,      y: bot },
    { x: pad + fw, y: bot },
  ].forEach(({ x, y }) => {
    const angle = x < W / 2 ? (y < H / 2 ? 0 : 270) : (y < H / 2 ? 90 : 180);
    layer.add(new Konva.Arc({ x, y, innerRadius: 0, outerRadius: cornerR, angle: 90, rotation: angle, fill: 'transparent', ...stroke }));
  });

  layer.batchDraw();
}

export default function FieldCanvas({
  formato, slots, jugadores, seleccionado, onSelectSlot, onMoveSlot, onOpenModal, stageRef,
}: FieldCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 320, h: 480 });
  const fieldLayerRef  = useRef<Konva.Layer>(null);
  const tapTimerRef    = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Ratio del campo según formato
  const RATIO = formato === 'F11' ? 1.54 : 1.5;

  // Responsive sizing
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

  // Redibuja el campo cuando cambia el tamaño
  useEffect(() => {
    if (fieldLayerRef.current) {
      drawField(fieldLayerRef.current, size.w, size.h, formato);
    }
  }, [size, formato]);

  const { w, h } = size;
  const pad  = w * 0.04;

  // Coordenadas relativas → píxeles
  const toAbsX = (rx: number) => pad + rx * (w - pad * 2);
  const toAbsY = (ry: number) => pad + ry * (h - pad * 2);

  // Fichas titulares
  const titulares = slots.filter(s => s.esTitular);
  const jugadorMap = new Map(jugadores.map(j => [j.id, j]));
  const tokenR = Math.max(16, w * 0.055);

  // Gestión de doble tap (click rápido × 2)
  const handleTokenClick = useCallback((slotIdx: number) => {
    if (tapTimerRef.current) {
      clearTimeout(tapTimerRef.current);
      tapTimerRef.current = null;
      onOpenModal(slotIdx);
      return;
    }
    tapTimerRef.current = setTimeout(() => {
      tapTimerRef.current = null;
      const selIdx = seleccionado !== null ? parseInt(seleccionado) : null;
      if (selIdx === slotIdx) {
        onSelectSlot(null);
      } else if (selIdx !== null) {
        onMoveSlot(slotIdx);
      } else {
        onSelectSlot(slotIdx);
      }
    }, 280);
  }, [seleccionado, onSelectSlot, onMoveSlot, onOpenModal]);

  // Click en campo vacío → mover seleccionado a esa posición si hay slot cerca
  const handleFieldClick = useCallback((e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
    if (seleccionado === null) return;
    const stage = e.target.getStage();
    if (!stage) return;
    const pos = stage.getPointerPosition();
    if (!pos) return;
    // Buscar slot más cercano que esté vacío
    const nearest = titulares
      .filter(s => !s.jugadorId)
      .map(s => ({ idx: s.slotIdx, dist: Math.hypot(toAbsX(s.x) - pos.x, toAbsY(s.y) - pos.y) }))
      .sort((a, b) => a.dist - b.dist)[0];
    if (nearest && nearest.dist < tokenR * 2) {
      onMoveSlot(nearest.idx);
    }
  }, [seleccionado, titulares, toAbsX, toAbsY, tokenR, onMoveSlot]);

  return (
    <div ref={containerRef} className="w-full select-none">
      <Stage
        ref={stageRef}
        width={w}
        height={h}
        className="rounded-xl overflow-hidden shadow-lg"
      >
        {/* Layer del campo — se dibuja vía useEffect */}
        <Layer ref={fieldLayerRef} listening={false} />

        {/* Layer de fichas de jugadores */}
        <Layer onClick={handleFieldClick} onTap={handleFieldClick}>
          {titulares.map(slot => {
            const cx = toAbsX(slot.x);
            const cy = toAbsY(slot.y);
            const jugador = slot.jugadorId ? jugadorMap.get(slot.jugadorId) : undefined;
            const isSel = seleccionado === String(slot.slotIdx);
            const posColor = jugador ? (COLOR_POS[jugador.posicion] ?? '#9CA3AF') : '#6B7280';

            return (
              <Group
                key={slot.slotIdx}
                x={cx}
                y={cy}
                onClick={e => { e.cancelBubble = true; handleTokenClick(slot.slotIdx); }}
                onTap={e => { e.cancelBubble = true; handleTokenClick(slot.slotIdx); }}
              >
                {/* Anillo de selección */}
                {isSel && (
                  <Circle radius={tokenR + 5} fill="rgba(255,255,0,0.35)" stroke="#FFD700" strokeWidth={2} />
                )}
                {/* Círculo del jugador */}
                <Circle
                  radius={tokenR}
                  fill={jugador ? posColor : 'rgba(255,255,255,0.2)'}
                  stroke={jugador ? 'white' : 'rgba(255,255,255,0.5)'}
                  strokeWidth={jugador ? 2 : 1.5}
                  shadowBlur={jugador ? 4 : 0}
                  shadowColor="rgba(0,0,0,0.4)"
                />
                {/* Dorsal o número de slot */}
                {jugador ? (
                  <>
                    <Text
                      text={String(jugador.dorsal)}
                      fontSize={tokenR * 0.75}
                      fontFamily="Montserrat,sans-serif"
                      fontStyle="bold"
                      fill="white"
                      align="center"
                      verticalAlign="middle"
                      offsetX={tokenR * 0.5}
                      offsetY={tokenR * 0.4}
                      width={tokenR}
                    />
                    <Text
                      text={(jugador.apellidos || jugador.nombre).split(' ')[0].substring(0, 7)}
                      fontSize={tokenR * 0.42}
                      fontFamily="Inter,sans-serif"
                      fill="white"
                      align="center"
                      offsetX={tokenR * 1.3}
                      offsetY={-tokenR * 0.1}
                      width={tokenR * 2.6}
                      y={tokenR + 3}
                    />
                  </>
                ) : (
                  <Text
                    text={slot.slotIdx === 0 ? 'POR' : `${slot.slotIdx}`}
                    fontSize={tokenR * 0.5}
                    fontFamily="Montserrat,sans-serif"
                    fill="rgba(255,255,255,0.6)"
                    align="center"
                    verticalAlign="middle"
                    offsetX={tokenR * 0.5}
                    offsetY={tokenR * 0.35}
                    width={tokenR}
                  />
                )}
              </Group>
            );
          })}
        </Layer>
      </Stage>
    </div>
  );
}
