import React, { useEffect, useMemo, useRef, useState } from 'react';
import { DRILLS } from '@/data/drillAnimations';
import type { DrillDef } from '@/data/drillAnimations';

// ── Team colors ────────────────────────────────────────────────
const FILL: Record<string, string> = {
  A:  '#3B82F6',
  B:  '#EF4444',
  N:  '#F59E0B',
  GK: '#F97316',
};

// ── Field sections ─────────────────────────────────────────────
function FieldOpen() {
  return (
    <g>
      <rect width="400" height="260" fill="#1e5c1e"/>
      <rect width="400" height="65"  fill="white" opacity="0.05"/>
      <rect y="130" width="400" height="65" fill="white" opacity="0.05"/>
    </g>
  );
}

function FieldHalfA() {
  return (
    <g>
      <rect width="400" height="260" fill="#1e5c1e"/>
      <rect width="400" height="130" fill="white" opacity="0.05"/>
      <line x1="10" y1="5"  x2="390" y2="5"  stroke="white" strokeWidth="1.5" opacity="0.45"/>
      <rect x="110" y="180" width="180" height="75" fill="none" stroke="white" strokeWidth="1.5" opacity="0.5"/>
      <rect x="152" y="225" width="96"  height="30" fill="none" stroke="white" strokeWidth="1"   opacity="0.4"/>
      <circle cx="200" cy="215" r="3" fill="white" opacity="0.5"/>
      <rect x="160" y="252" width="80" height="8"  fill="none" stroke="white" strokeWidth="2"   opacity="0.8"/>
    </g>
  );
}

function FieldHalfD() {
  return (
    <g>
      <rect width="400" height="260" fill="#1e5c1e"/>
      <rect y="130" width="400" height="130" fill="white" opacity="0.05"/>
      <line x1="10" y1="255" x2="390" y2="255" stroke="white" strokeWidth="1.5" opacity="0.45"/>
      <rect x="110" y="5"   width="180" height="75" fill="none" stroke="white" strokeWidth="1.5" opacity="0.5"/>
      <rect x="152" y="5"   width="96"  height="30" fill="none" stroke="white" strokeWidth="1"   opacity="0.4"/>
      <circle cx="200" cy="45" r="3" fill="white" opacity="0.5"/>
      <rect x="160" y="0"   width="80" height="8"  fill="none" stroke="white" strokeWidth="2"   opacity="0.8"/>
    </g>
  );
}

function FieldFull() {
  return (
    <g>
      <rect x="10" y="5" width="380" height="250" fill="#1e5c1e"/>
      <rect x="10" y="5" width="380" height="62"  fill="white" opacity="0.05"/>
      <rect x="10" y="130" width="380" height="62" fill="white" opacity="0.05"/>
      <line x1="10" y1="130" x2="390" y2="130" stroke="white" strokeWidth="1.5" opacity="0.45"/>
      <circle cx="200" cy="130" r="36" fill="none" stroke="white" strokeWidth="1.5" opacity="0.4"/>
      <circle cx="200" cy="130" r="3"  fill="white" opacity="0.4"/>
      <rect x="110" y="5"   width="180" height="68" fill="none" stroke="white" strokeWidth="1" opacity="0.4"/>
      <rect x="152" y="5"   width="96"  height="28" fill="none" stroke="white" strokeWidth="1" opacity="0.35"/>
      <rect x="110" y="187" width="180" height="68" fill="none" stroke="white" strokeWidth="1" opacity="0.4"/>
      <rect x="152" y="227" width="96"  height="28" fill="none" stroke="white" strokeWidth="1" opacity="0.35"/>
      <rect x="160" y="1"   width="80"  height="8"  fill="none" stroke="white" strokeWidth="1.5" opacity="0.7"/>
      <rect x="160" y="251" width="80"  height="8"  fill="none" stroke="white" strokeWidth="1.5" opacity="0.7"/>
      <circle cx="200" cy="55"  r="3" fill="white" opacity="0.4"/>
      <circle cx="200" cy="205" r="3" fill="white" opacity="0.4"/>
    </g>
  );
}

function FieldBox() {
  return (
    <g>
      <rect width="400" height="260" fill="#1e5c1e"/>
      <rect x="55"  y="60"  width="290" height="165" fill="none" stroke="white" strokeWidth="1.5" opacity="0.55"/>
      <rect x="118" y="60"  width="164" height="60"  fill="none" stroke="white" strokeWidth="1"   opacity="0.4"/>
      <circle cx="200" cy="165" r="4" fill="white" opacity="0.5"/>
      <circle cx="200" cy="105" r="38" fill="none" stroke="white" strokeWidth="1" opacity="0.2"/>
      <rect x="140" y="48"  width="120" height="14" fill="none" stroke="white" strokeWidth="2" opacity="0.8"/>
    </g>
  );
}

function FieldChannel() {
  return (
    <g>
      <rect width="400" height="260" fill="#1e5c1e"/>
      <line x1="130" y1="0" x2="130" y2="260" stroke="white" strokeWidth="1" opacity="0.35" strokeDasharray="6,5"/>
      <line x1="270" y1="0" x2="270" y2="260" stroke="white" strokeWidth="1" opacity="0.35" strokeDasharray="6,5"/>
      <rect x="160" y="250" width="80" height="10" fill="none" stroke="white" strokeWidth="2" opacity="0.8"/>
    </g>
  );
}

const FIELD_COMPONENTS: Record<string, () => React.ReactElement> = {
  open:    FieldOpen,
  half_a:  FieldHalfA,
  half_d:  FieldHalfD,
  full:    FieldFull,
  box:     FieldBox,
  channel: FieldChannel,
};

// ── Main component ─────────────────────────────────────────────
export default function DrillAnimator({ drillId }: { drillId: string }) {
  const def: DrillDef | undefined = DRILLS[drillId];
  if (!def) return null;

  const [sceneIdx, setSceneIdx] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Reset when drill changes
  useEffect(() => { setSceneIdx(0); }, [drillId]);

  // Advance scene loop
  useEffect(() => {
    const advance = (idx: number) => {
      const dur = def.scenes[idx]?.dur ?? 1400;
      timerRef.current = setTimeout(() => {
        const next = (idx + 1) % def.scenes.length;
        setSceneIdx(next);
        advance(next);
      }, dur);
    };
    advance(sceneIdx);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [drillId]); // eslint-disable-line

  // Flatten: carry forward previous positions for elements not in current scene
  const flatPos = useMemo(() => {
    const last: Record<string, [number, number]> = { ball: def.ballStart };
    def.players.forEach(p => { last[p.id] = p.start; });
    return def.scenes.map(s => {
      Object.entries(s.pos).forEach(([k, v]) => { if (v) last[k] = v; });
      return { dur: s.dur, pos: { ...last } };
    });
  }, [def]);

  const cur = flatPos[sceneIdx] ?? flatPos[0];
  const transDur = `${Math.min((cur.dur / 1000) * 0.85, 1.1)}s`;

  const FieldBg = FIELD_COMPONENTS[def.field] ?? FieldOpen;

  return (
    <div>
      <div className="rounded-xl overflow-hidden bg-[#1e5c1e] relative">
        <svg viewBox="0 0 400 260" className="w-full block" style={{ fontFamily: 'system-ui, sans-serif' }}>
          <defs>
            <marker id="ah" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
              <path d="M0,0 L0,7 L7,3.5 z" fill="rgba(255,255,255,0.75)"/>
            </marker>
            <marker id="ah-b" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
              <path d="M0,0 L0,7 L7,3.5 z" fill="rgba(147,197,253,0.9)"/>
            </marker>
          </defs>

          <FieldBg />

          {/* Zone overlays */}
          {def.zones?.map((z, i) => (
            <rect key={i} x={z.x} y={z.y} width={z.w} height={z.h}
                  fill={z.color ?? 'rgba(255,255,255,0.06)'}
                  stroke="rgba(255,255,255,0.2)" strokeWidth="1" strokeDasharray="4,3"/>
          ))}

          {/* Static arrows */}
          {def.arrows.map((a, i) => (
            <line key={i} x1={a.x1} y1={a.y1} x2={a.x2} y2={a.y2}
                  stroke={a.color ?? 'rgba(255,255,255,0.55)'}
                  strokeWidth="1.5"
                  strokeDasharray={a.dashed ? '6,3' : undefined}
                  markerEnd={`url(#${a.color?.includes('93') ? 'ah-b' : 'ah'})`}/>
          ))}

          {/* Cones */}
          {def.cones.map(([cx, cy], i) => (
            <polygon key={i}
              points={`${cx},${cy - 7} ${cx - 5},${cy + 5} ${cx + 5},${cy + 5}`}
              fill="#F97316" opacity="0.95"/>
          ))}

          {/* Players */}
          {def.players.map(p => {
            const [px, py] = cur.pos[p.id] ?? p.start;
            return (
              <g key={p.id}
                 style={{ transform: `translate(${px}px,${py}px)`, transition: `transform ${transDur} ease-in-out` }}>
                <circle r="13" fill={FILL[p.team]} opacity="0.92"/>
                <circle r="13" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5"/>
                <text textAnchor="middle" dy="4" fill="white" fontSize="9" fontWeight="700"
                      style={{ userSelect: 'none', pointerEvents: 'none' }}>{p.label}</text>
              </g>
            );
          })}

          {/* Ball */}
          {(() => {
            const [bx, by] = cur.pos['ball'] ?? def.ballStart;
            return (
              <g style={{ transform: `translate(${bx}px,${by}px)`, transition: `transform ${transDur} ease-in-out` }}>
                <circle r="8"   fill="white" opacity="0.95"/>
                <circle r="8"   fill="none"  stroke="rgba(0,0,0,0.12)" strokeWidth="1"/>
                <circle r="3.5" fill="rgba(0,0,0,0.08)"/>
              </g>
            );
          })()}
        </svg>

        {/* Label overlay */}
        <div className="absolute bottom-2 left-3 flex gap-2">
          <span className="text-[9px] text-white/50 font-mono uppercase tracking-wide">
            {def.label}
          </span>
        </div>
      </div>

      {/* Scene progress dots */}
      {def.scenes.length > 2 && (
        <div className="flex justify-center gap-1.5 mt-2">
          {def.scenes.map((_, i) => (
            <div key={i}
                 className={`rounded-full transition-all duration-300 ${i === sceneIdx
                   ? 'w-4 h-1.5 bg-quarte-azul'
                   : 'w-1.5 h-1.5 bg-gray-300'}`}/>
          ))}
        </div>
      )}
    </div>
  );
}
