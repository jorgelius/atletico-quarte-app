// ============================================================
// Animaciones de pizarra táctica para cada ejercicio de entrenamiento
// ViewBox: 400 × 260  |  Teams: A=azul, B=rojo, N=ámbar, GK=naranja
// ============================================================

export type TeamColor = 'A' | 'B' | 'N' | 'GK';

export type PlayerDef = {
  id: string;
  start: [number, number];
  team: TeamColor;
  label: string;
};

export type ArrowDef = {
  x1: number; y1: number; x2: number; y2: number;
  dashed?: boolean;
  color?: string;
};

export type Scene = {
  dur: number;
  pos: Partial<Record<string, [number, number]>>;
};

export type DrillDef = {
  field: 'full' | 'half_a' | 'half_d' | 'box' | 'channel' | 'open';
  label?: string;
  players: PlayerDef[];
  cones: [number, number][];
  arrows: ArrowDef[];
  zones?: Array<{ x: number; y: number; w: number; h: number; color?: string }>;
  ballStart: [number, number];
  scenes: Scene[];
};

export const DRILLS: Record<string, DrillDef> = {

  // ── 01 · Rondo 3v1 ────────────────────────────────────────────
  '00000000-0000-0000-0000-000000000001': {
    field: 'open', label: 'Rondo 3v1',
    players: [
      { id: 'A1', start: [140, 190], team: 'A', label: 'A' },
      { id: 'A2', start: [260, 190], team: 'A', label: 'A' },
      { id: 'A3', start: [200, 70],  team: 'A', label: 'A' },
      { id: 'D1', start: [200, 145], team: 'B', label: 'D' },
    ],
    cones: [[130,60],[270,60],[270,200],[130,200]],
    arrows: [
      { x1:150,y1:182, x2:195,y2:83,  dashed:true, color:'rgba(147,197,253,0.7)' },
      { x1:206,y1:83,  x2:253,y2:182, dashed:true, color:'rgba(147,197,253,0.7)' },
      { x1:250,y1:192, x2:150,y2:192, dashed:true, color:'rgba(147,197,253,0.7)' },
    ],
    ballStart: [140, 190],
    scenes: [
      { dur:1400, pos:{ ball:[140,190], D1:[190,152] } },
      { dur:1400, pos:{ ball:[200,70],  D1:[192,118] } },
      { dur:1400, pos:{ ball:[260,190], D1:[228,158] } },
      { dur:1000, pos:{ ball:[140,190], D1:[190,152] } },
    ],
  },

  // ── 02 · Conducción + cambio de ritmo ────────────────────────
  '00000000-0000-0000-0000-000000000002': {
    field: 'open', label: 'Zigzag',
    players: [
      { id: 'P1', start: [185, 238], team: 'A', label: 'J' },
    ],
    cones: [[185,215],[150,170],[185,125],[150,80],[185,38]],
    arrows: [],
    ballStart: [185, 238],
    scenes: [
      { dur:700, pos:{ P1:[185,215], ball:[185,215] } },
      { dur:700, pos:{ P1:[150,170], ball:[150,170] } },
      { dur:700, pos:{ P1:[185,125], ball:[185,125] } },
      { dur:700, pos:{ P1:[150,80],  ball:[150,80]  } },
      { dur:700, pos:{ P1:[185,38],  ball:[185,38]  } },
      { dur:900, pos:{ P1:[310,28],  ball:[310,28]  } },
      { dur:600, pos:{ P1:[185,238], ball:[185,238] } },
    ],
  },

  // ── 03 · Presión alta tras pérdida ────────────────────────────
  '00000000-0000-0000-0000-000000000003': {
    field: 'half_a', label: 'Pressing',
    players: [
      { id: 'B1', start: [200,80],  team: 'B', label: 'B' },
      { id: 'B2', start: [80,140],  team: 'B', label: 'B' },
      { id: 'B3', start: [320,140], team: 'B', label: 'B' },
      { id: 'P1', start: [100,225], team: 'A', label: 'P' },
      { id: 'P2', start: [200,232], team: 'A', label: 'P' },
      { id: 'P3', start: [300,225], team: 'A', label: 'P' },
    ],
    cones: [],
    arrows: [],
    ballStart: [200, 80],
    scenes: [
      { dur:1000, pos:{} },
      { dur:1100, pos:{ P1:[130,190], P2:[200,200], P3:[270,190] } },
      { dur:1200, pos:{ P1:[158,118], P2:[200,100], P3:[242,118] } },
      { dur:1000, pos:{ P1:[172,94],  P2:[200,84],  P3:[228,94]  } },
      { dur:800,  pos:{ P1:[100,225], P2:[200,232], P3:[300,225] } },
    ],
  },

  // ── 04 · Combinación + remate a portería ─────────────────────
  '00000000-0000-0000-0000-000000000004': {
    field: 'half_a', label: 'Combinación+remate',
    players: [
      { id: 'A1', start: [100,85],  team: 'A', label: 'A' },
      { id: 'B1', start: [300,85],  team: 'B', label: 'B' },
      { id: 'GK', start: [200,248], team: 'GK', label: 'P' },
    ],
    cones: [[250,160]],
    arrows: [
      { x1:115,y1:85, x2:282,y2:85, dashed:true, color:'rgba(147,197,253,0.7)' },
    ],
    ballStart: [100, 85],
    scenes: [
      { dur:1000, pos:{ ball:[100,85] } },
      { dur:900,  pos:{ ball:[300,85] } },
      { dur:1200, pos:{ B1:[215,175], ball:[215,175] } },
      { dur:900,  pos:{ ball:[200,252], GK:[200,240] } },
      { dur:800,  pos:{ B1:[300,85], ball:[100,85], GK:[200,248] } },
    ],
  },

  // ── 05 · Rondo 4v2 ────────────────────────────────────────────
  '00000000-0000-0000-0000-000000000005': {
    field: 'open', label: 'Rondo 4v2',
    players: [
      { id: 'A1', start: [130, 75],  team: 'A', label: 'A' },
      { id: 'A2', start: [270, 75],  team: 'A', label: 'A' },
      { id: 'A3', start: [270, 195], team: 'A', label: 'A' },
      { id: 'A4', start: [130, 195], team: 'A', label: 'A' },
      { id: 'D1', start: [185, 125], team: 'B', label: 'D' },
      { id: 'D2', start: [215, 148], team: 'B', label: 'D' },
    ],
    cones: [[130,75],[270,75],[270,195],[130,195]],
    arrows: [],
    ballStart: [130, 75],
    scenes: [
      { dur:1200, pos:{ ball:[130,75],  D1:[165,100], D2:[195,132] } },
      { dur:1200, pos:{ ball:[270,75],  D1:[205,100], D2:[220,118] } },
      { dur:1200, pos:{ ball:[270,195], D1:[232,162], D2:[218,148] } },
      { dur:1200, pos:{ ball:[130,195], D1:[168,162], D2:[185,148] } },
    ],
  },

  // ── 06 · Rondo 5v2 ────────────────────────────────────────────
  '00000000-0000-0000-0000-000000000006': {
    field: 'open', label: 'Rondo 5v2',
    players: [
      { id: 'A1', start: [200, 40],  team: 'A', label: 'A' },
      { id: 'A2', start: [288, 100], team: 'A', label: 'A' },
      { id: 'A3', start: [257, 200], team: 'A', label: 'A' },
      { id: 'A4', start: [143, 200], team: 'A', label: 'A' },
      { id: 'A5', start: [112, 100], team: 'A', label: 'A' },
      { id: 'D1', start: [178, 122], team: 'B', label: 'D' },
      { id: 'D2', start: [222, 142], team: 'B', label: 'D' },
    ],
    cones: [],
    arrows: [],
    ballStart: [200, 40],
    scenes: [
      { dur:1100, pos:{ ball:[200,40],  D1:[190,78],  D2:[220,110] } },
      { dur:1100, pos:{ ball:[288,100], D1:[228,102], D2:[222,128] } },
      { dur:1100, pos:{ ball:[257,200], D1:[232,168], D2:[220,152] } },
      { dur:1100, pos:{ ball:[143,200], D1:[172,168], D2:[192,148] } },
      { dur:1100, pos:{ ball:[112,100], D1:[148,118], D2:[178,128] } },
    ],
  },

  // ── 07 · Rondo 3 colores ──────────────────────────────────────
  '00000000-0000-0000-0000-000000000007': {
    field: 'open', label: '3 Colores',
    players: [
      { id: 'R1', start: [80, 95],  team: 'A', label: 'R' },
      { id: 'R2', start: [80, 165], team: 'A', label: 'R' },
      { id: 'B1', start: [200,50],  team: 'B', label: 'A' },
      { id: 'B2', start: [200,130], team: 'B', label: 'A' },
      { id: 'B3', start: [200,210], team: 'B', label: 'A' },
      { id: 'Y1', start: [320,95],  team: 'N', label: 'P' },
      { id: 'Y2', start: [320,165], team: 'N', label: 'P' },
    ],
    cones: [],
    arrows: [],
    ballStart: [200, 50],
    scenes: [
      { dur:1200, pos:{ ball:[200,50]  } },
      { dur:1200, pos:{ ball:[80,95],  Y1:[260,100], Y2:[220,140] } },
      { dur:1200, pos:{ ball:[200,130], Y1:[290,120], Y2:[280,160] } },
      { dur:1200, pos:{ ball:[80,165], Y1:[165,155], Y2:[200,170], } },
      { dur:1000, pos:{ ball:[200,210], Y1:[320,95],  Y2:[320,165] } },
    ],
  },

  // ── 08 · Juego de posición por zonas ──────────────────────────
  '00000000-0000-0000-0000-000000000008': {
    field: 'half_a', label: 'Juego posicional',
    zones: [
      { x:10, y:5,   w:380, h:82, color:'rgba(59,130,246,0.07)' },
      { x:10, y:87,  w:380, h:82, color:'rgba(255,255,255,0.05)' },
      { x:10, y:169, w:380, h:86, color:'rgba(239,68,68,0.07)'  },
    ],
    players: [
      { id: 'A1', start: [120,45],  team: 'A', label: 'A' },
      { id: 'A2', start: [280,45],  team: 'A', label: 'A' },
      { id: 'A3', start: [120,128], team: 'A', label: 'A' },
      { id: 'A4', start: [280,128], team: 'A', label: 'A' },
      { id: 'A5', start: [200,200], team: 'A', label: 'A' },
      { id: 'B1', start: [165,128], team: 'B', label: 'D' },
      { id: 'B2', start: [235,128], team: 'B', label: 'D' },
      { id: 'B3', start: [165,200], team: 'B', label: 'D' },
      { id: 'B4', start: [235,200], team: 'B', label: 'D' },
    ],
    cones: [],
    arrows: [],
    ballStart: [120, 45],
    scenes: [
      { dur:1200, pos:{ ball:[120,45]  } },
      { dur:1100, pos:{ ball:[200,128], A3:[140,128], A4:[260,128] } },
      { dur:1200, pos:{ ball:[200,200], A5:[200,195] } },
      { dur:1200, pos:{ ball:[280,45]  } },
    ],
  },

  // ── 09 · Posesión 6v6+3 comodines ────────────────────────────
  '00000000-0000-0000-0000-000000000009': {
    field: 'half_a', label: '6v6+3 comodines',
    players: [
      { id: 'A1', start: [55,55],   team: 'A', label: 'A' },
      { id: 'A2', start: [180,50],  team: 'A', label: 'A' },
      { id: 'A3', start: [340,55],  team: 'A', label: 'A' },
      { id: 'A4', start: [75,190],  team: 'A', label: 'A' },
      { id: 'A5', start: [200,195], team: 'A', label: 'A' },
      { id: 'A6', start: [330,190], team: 'A', label: 'A' },
      { id: 'B1', start: [125,115], team: 'B', label: 'D' },
      { id: 'B2', start: [200,100], team: 'B', label: 'D' },
      { id: 'B3', start: [275,115], team: 'B', label: 'D' },
      { id: 'B4', start: [125,160], team: 'B', label: 'D' },
      { id: 'B5', start: [275,160], team: 'B', label: 'D' },
      { id: 'N1', start: [15,128],  team: 'N', label: 'C' },
      { id: 'N2', start: [200,130], team: 'N', label: 'C' },
      { id: 'N3', start: [385,128], team: 'N', label: 'C' },
    ],
    cones: [],
    arrows: [],
    ballStart: [55, 55],
    scenes: [
      { dur:1200, pos:{ ball:[55,55]   } },
      { dur:1200, pos:{ ball:[200,130], N2:[200,115] } },
      { dur:1200, pos:{ ball:[330,190] } },
      { dur:1200, pos:{ ball:[385,128], N3:[370,128] } },
    ],
  },

  // ── 10 · Rueda de pases ───────────────────────────────────────
  '00000000-0000-0000-0000-00000000000a': {
    field: 'open', label: 'Rueda de pases',
    players: [
      { id: 'P1', start: [295, 130], team: 'A', label: 'A' },
      { id: 'P2', start: [267, 197], team: 'A', label: 'A' },
      { id: 'P3', start: [200, 222], team: 'A', label: 'A' },
      { id: 'P4', start: [133, 197], team: 'A', label: 'A' },
      { id: 'P5', start: [105, 130], team: 'A', label: 'A' },
      { id: 'P6', start: [133, 63],  team: 'A', label: 'A' },
      { id: 'P7', start: [200, 38],  team: 'A', label: 'A' },
      { id: 'P8', start: [267, 63],  team: 'A', label: 'A' },
    ],
    cones: [],
    arrows: [],
    ballStart: [295, 130],
    scenes: [
      { dur:900, pos:{ ball:[295,130], P8:[295,130] } },
      { dur:900, pos:{ ball:[267,197], P1:[267,197] } },
      { dur:900, pos:{ ball:[200,222], P2:[200,222] } },
      { dur:900, pos:{ ball:[133,197], P3:[133,197] } },
      { dur:900, pos:{ ball:[105,130], P4:[105,130] } },
      { dur:900, pos:{ ball:[133,63],  P5:[133,63]  } },
      { dur:900, pos:{ ball:[200,38],  P6:[200,38]  } },
      { dur:900, pos:{ ball:[267,63],  P7:[267,63]  } },
    ],
  },

  // ── 11 · Pressing alto por zonas ──────────────────────────────
  '00000000-0000-0000-0000-00000000000b': {
    field: 'full', label: 'Pressing alto',
    zones: [
      { x:10, y:5,   w:380, h:80,  color:'rgba(239,68,68,0.12)' },
    ],
    players: [
      { id: 'GK', start: [200,240], team: 'GK', label: 'P' },
      { id: 'CB1',start: [155,215], team: 'B', label: 'D' },
      { id: 'CB2',start: [245,215], team: 'B', label: 'D' },
      { id: 'F1', start: [155,88],  team: 'A', label: 'P' },
      { id: 'F2', start: [245,88],  team: 'A', label: 'P' },
      { id: 'CM1',start: [95,132],  team: 'A', label: 'M' },
      { id: 'CM2',start: [305,132], team: 'A', label: 'M' },
    ],
    cones: [],
    arrows: [],
    ballStart: [200, 240],
    scenes: [
      { dur:1200, pos:{ ball:[200,240] } },
      { dur:1200, pos:{ ball:[155,215], F1:[155,168], F2:[230,140] } },
      { dur:1000, pos:{ ball:[155,215], F1:[180,192] } },
      { dur:1000, pos:{ ball:[200,78] } },
      { dur:1000, pos:{ ball:[245,88], F2:[245,95] } },
    ],
  },

  // ── 12 · Gegenpressing ────────────────────────────────────────
  '00000000-0000-0000-0000-00000000000c': {
    field: 'half_a', label: 'Gegenpressing',
    players: [
      { id: 'B1', start: [200,95],  team: 'A', label: 'B' },
      { id: 'B2', start: [115,140], team: 'A', label: 'B' },
      { id: 'B3', start: [285,140], team: 'A', label: 'B' },
      { id: 'B4', start: [180,200], team: 'A', label: 'B' },
      { id: 'R1', start: [200,110], team: 'B', label: 'R' },
      { id: 'R2', start: [145,165], team: 'B', label: 'R' },
      { id: 'R3', start: [255,165], team: 'B', label: 'R' },
    ],
    cones: [],
    arrows: [],
    ballStart: [200, 95],
    scenes: [
      { dur:1000, pos:{ ball:[200,95] } },
      { dur:700,  pos:{ ball:[200,112] } },
      { dur:1200, pos:{ B1:[200,118], B2:[165,130], B3:[235,130] } },
      { dur:1000, pos:{ B1:[200,113], B2:[175,112], B3:[225,112] } },
      { dur:900,  pos:{ ball:[178,200], B1:[200,95], B2:[115,140], B3:[285,140] } },
    ],
  },

  // ── 13 · Bloque medio 4-4-2 ──────────────────────────────────
  '00000000-0000-0000-0000-00000000000d': {
    field: 'full', label: 'Bloque 4-4-2',
    players: [
      { id: 'S1', start: [150,148], team: 'B', label: 'D' },
      { id: 'S2', start: [250,148], team: 'B', label: 'D' },
      { id: 'M1', start: [90,178],  team: 'B', label: 'D' },
      { id: 'M2', start: [162,178], team: 'B', label: 'D' },
      { id: 'M3', start: [238,178], team: 'B', label: 'D' },
      { id: 'M4', start: [310,178], team: 'B', label: 'D' },
      { id: 'D1', start: [90,210],  team: 'B', label: 'D' },
      { id: 'D2', start: [162,210], team: 'B', label: 'D' },
      { id: 'D3', start: [238,210], team: 'B', label: 'D' },
      { id: 'D4', start: [310,210], team: 'B', label: 'D' },
      { id: 'A1', start: [55,95],   team: 'A', label: 'A' },
      { id: 'A2', start: [200,78],  team: 'A', label: 'A' },
      { id: 'A3', start: [345,95],  team: 'A', label: 'A' },
    ],
    cones: [],
    arrows: [],
    ballStart: [55, 95],
    scenes: [
      { dur:1200, pos:{ ball:[55,95] } },
      { dur:1200, pos:{ ball:[200,78] } },
      { dur:1300, pos:{
          ball:[345,95],
          M3:[265,178], M4:[338,178], D3:[262,210], D4:[340,210],
          S2:[278,148]
        }
      },
      { dur:1200, pos:{
          ball:[200,78],
          M3:[238,178], M4:[310,178], D3:[238,210], D4:[310,210], S2:[250,148]
        }
      },
    ],
  },

  // ── 14 · Coberturas y permutas ────────────────────────────────
  '00000000-0000-0000-0000-00000000000e': {
    field: 'half_d', label: 'Coberturas',
    players: [
      { id: 'D1', start: [100,162], team: 'B', label: 'D' },
      { id: 'D2', start: [167,162], team: 'B', label: 'D' },
      { id: 'D3', start: [233,162], team: 'B', label: 'D' },
      { id: 'D4', start: [300,162], team: 'B', label: 'D' },
      { id: 'A1', start: [100, 82], team: 'A', label: 'A' },
      { id: 'A2', start: [200, 82], team: 'A', label: 'A' },
      { id: 'A3', start: [300, 82], team: 'A', label: 'A' },
    ],
    cones: [],
    arrows: [],
    ballStart: [100, 82],
    scenes: [
      { dur:1200, pos:{ ball:[100,82] } },
      { dur:1000, pos:{ A1:[100,122], D1:[100,142] } },
      { dur:1200, pos:{ A1:[100,142], D2:[112,145], D1:[167,162] } },
      { dur:1000, pos:{ ball:[200,82] } },
    ],
  },

  // ── 15 · 1v1 defensivo ────────────────────────────────────────
  '00000000-0000-0000-0000-00000000000f': {
    field: 'channel', label: '1v1 defensivo',
    players: [
      { id: 'A1', start: [200, 52],  team: 'A', label: 'A' },
      { id: 'D1', start: [200, 142], team: 'B', label: 'D' },
      { id: 'GK', start: [200, 246], team: 'GK', label: 'P' },
    ],
    cones: [],
    arrows: [],
    ballStart: [200, 52],
    scenes: [
      { dur:1200, pos:{ ball:[200,52], A1:[200,52], D1:[200,142] } },
      { dur:1000, pos:{ ball:[200,98], A1:[200,98] } },
      { dur:1100, pos:{ ball:[235,122], A1:[235,122], D1:[215,132] } },
      { dur:1000, pos:{ ball:[235,155], A1:[235,155], D1:[215,142] } },
      { dur:800,  pos:{ ball:[200,52], A1:[200,52], D1:[200,142] } },
    ],
  },

  // ── 16 · Achique y basculación ────────────────────────────────
  '00000000-0000-0000-0000-000000000010': {
    field: 'full', label: 'Basculación',
    players: [
      { id: 'RD1', start: [65,212],  team: 'B', label: 'D' },
      { id: 'RD2', start: [135,212], team: 'B', label: 'D' },
      { id: 'RD3', start: [205,212], team: 'B', label: 'D' },
      { id: 'RD4', start: [275,212], team: 'B', label: 'D' },
      { id: 'RM1', start: [85,172],  team: 'B', label: 'M' },
      { id: 'RM2', start: [168,172], team: 'B', label: 'M' },
      { id: 'RM3', start: [248,172], team: 'B', label: 'M' },
      { id: 'AW',  start: [55,100],  team: 'A', label: 'A' },
    ],
    cones: [],
    arrows: [],
    ballStart: [55, 100],
    scenes: [
      { dur:1300, pos:{ ball:[55,100] } },
      { dur:1400, pos:{
          ball:[345,100], AW:[345,100],
          RD1:[135,212], RD2:[205,212], RD3:[275,212], RD4:[345,212],
          RM1:[165,172], RM2:[248,172], RM3:[325,172],
        }
      },
      { dur:1400, pos:{
          ball:[55,100], AW:[55,100],
          RD1:[65,212], RD2:[135,212], RD3:[205,212], RD4:[275,212],
          RM1:[85,172],  RM2:[168,172], RM3:[248,172],
        }
      },
    ],
  },

  // ── 17 · Transición D→A ──────────────────────────────────────
  '00000000-0000-0000-0000-000000000011': {
    field: 'full', label: 'Transición D→A',
    players: [
      { id: 'P1', start: [145,198], team: 'A', label: 'R' },
      { id: 'P2', start: [80,175],  team: 'A', label: 'A' },
      { id: 'P3', start: [320,175], team: 'A', label: 'A' },
      { id: 'P4', start: [130,80],  team: 'A', label: 'A' },
      { id: 'P5', start: [270,80],  team: 'A', label: 'A' },
    ],
    cones: [],
    arrows: [],
    ballStart: [145, 198],
    scenes: [
      { dur:900,  pos:{ ball:[145,198] } },
      { dur:1100, pos:{ ball:[200,132], P2:[95,132], P3:[305,132] } },
      { dur:1200, pos:{ ball:[130,80], P2:[65,78], P4:[130,55], P3:[305,95] } },
      { dur:1000, pos:{ ball:[200,8],  P4:[200,32], P5:[270,55] } },
      { dur:800,  pos:{ ball:[145,198], P2:[80,175], P3:[320,175], P4:[130,80], P5:[270,80] } },
    ],
  },

  // ── 18 · Transición A→D ──────────────────────────────────────
  '00000000-0000-0000-0000-000000000012': {
    field: 'full', label: 'Transición A→D',
    players: [
      { id: 'B1', start: [200,78],  team: 'A', label: 'A' },
      { id: 'B2', start: [148,98],  team: 'A', label: 'A' },
      { id: 'B3', start: [252,98],  team: 'A', label: 'A' },
      { id: 'B4', start: [128,140], team: 'A', label: 'A' },
      { id: 'B5', start: [272,140], team: 'A', label: 'A' },
      { id: 'R1', start: [200,90],  team: 'B', label: 'R' },
    ],
    cones: [],
    arrows: [],
    ballStart: [200, 78],
    scenes: [
      { dur:1000, pos:{ ball:[200,78] } },
      { dur:700,  pos:{ ball:[200,92] } },
      { dur:1200, pos:{ B1:[200,96],  B2:[148,130], B3:[252,130] } },
      { dur:1200, pos:{ B2:[148,168], B3:[252,168], B4:[128,178], B5:[272,178] } },
      { dur:1000, pos:{ ball:[200,78], B1:[200,78], B2:[148,98], B3:[252,98], B4:[128,140], B5:[272,140] } },
    ],
  },

  // ── 19 · Transiciones 4v4+porteros ───────────────────────────
  '00000000-0000-0000-0000-000000000013': {
    field: 'half_a', label: 'Transiciones 4v4',
    players: [
      { id: 'B1', start: [118,80],  team: 'A', label: 'A' },
      { id: 'B2', start: [200,95],  team: 'A', label: 'A' },
      { id: 'B3', start: [282,80],  team: 'A', label: 'A' },
      { id: 'B4', start: [200,165], team: 'A', label: 'A' },
      { id: 'R1', start: [130,148], team: 'B', label: 'D' },
      { id: 'R2', start: [200,128], team: 'B', label: 'D' },
      { id: 'R3', start: [270,148], team: 'B', label: 'D' },
      { id: 'R4', start: [200,58],  team: 'B', label: 'D' },
      { id: 'GK', start: [200,248], team: 'GK', label: 'P' },
    ],
    cones: [],
    arrows: [],
    ballStart: [118, 80],
    scenes: [
      { dur:1100, pos:{ ball:[118,80] } },
      { dur:1000, pos:{ ball:[200,95] } },
      { dur:800,  pos:{ ball:[200,125] } },
      { dur:1200, pos:{ B1:[145,142], B2:[200,138], B3:[255,142] } },
      { dur:1100, pos:{ ball:[200,55], R4:[200,55] } },
    ],
  },

  // ── 20 · Ataque rápido tras recuperación ─────────────────────
  '00000000-0000-0000-0000-000000000014': {
    field: 'full', label: 'Ataque rápido 6s',
    players: [
      { id: 'P1', start: [200,132], team: 'A', label: 'R' },
      { id: 'P2', start: [118,132], team: 'A', label: 'A' },
      { id: 'P3', start: [282,132], team: 'A', label: 'A' },
      { id: 'P4', start: [128,80],  team: 'A', label: 'A' },
      { id: 'P5', start: [272,80],  team: 'A', label: 'A' },
      { id: 'GK', start: [200,8],   team: 'GK', label: 'P' },
    ],
    cones: [],
    arrows: [],
    ballStart: [200, 132],
    scenes: [
      { dur:900,  pos:{ ball:[200,132] } },
      { dur:1100, pos:{ ball:[128,80], P4:[128,80], P2:[90,115] } },
      { dur:1000, pos:{ ball:[272,80], P5:[272,80] } },
      { dur:1000, pos:{ ball:[272,38], P5:[272,38] } },
      { dur:900,  pos:{ ball:[200,8]  } },
    ],
  },

  // ── 21 · Contraataque 3v2 ─────────────────────────────────────
  '00000000-0000-0000-0000-000000000015': {
    field: 'full', label: 'Contraataque 3v2',
    players: [
      { id: 'A1', start: [200,80],  team: 'A', label: 'A' },
      { id: 'A2', start: [118,98],  team: 'A', label: 'A' },
      { id: 'A3', start: [282,98],  team: 'A', label: 'A' },
      { id: 'D1', start: [158,155], team: 'B', label: 'D' },
      { id: 'D2', start: [242,155], team: 'B', label: 'D' },
      { id: 'GK', start: [200,248], team: 'GK', label: 'P' },
    ],
    cones: [],
    arrows: [],
    ballStart: [200, 80],
    scenes: [
      { dur:1200, pos:{ ball:[200,80] } },
      { dur:1200, pos:{ ball:[200,125], A1:[200,125], A2:[118,138], A3:[282,138] } },
      { dur:1000, pos:{ ball:[118,155], A2:[118,155], D1:[158,168] } },
      { dur:1200, pos:{ ball:[282,195], A3:[282,195] } },
      { dur:900,  pos:{ ball:[242,252] } },
    ],
  },

  // ── 22 · Finalización tras centro lateral ────────────────────
  '00000000-0000-0000-0000-000000000016': {
    field: 'half_a', label: 'Centro lateral',
    players: [
      { id: 'W1', start: [355,82],  team: 'A', label: 'E' },
      { id: 'S1', start: [162,232], team: 'A', label: 'D' },
      { id: 'S2', start: [232,218], team: 'A', label: 'D' },
      { id: 'D1', start: [168,205], team: 'B', label: 'D' },
      { id: 'D2', start: [242,198], team: 'B', label: 'D' },
      { id: 'GK', start: [200,248], team: 'GK', label: 'P' },
    ],
    cones: [],
    arrows: [],
    ballStart: [355, 82],
    scenes: [
      { dur:1200, pos:{ ball:[355,82], W1:[355,82] } },
      { dur:1200, pos:{ ball:[355,222], W1:[355,222], S1:[162,218], S2:[232,205] } },
      { dur:1100, pos:{ ball:[182,225] } },
      { dur:900,  pos:{ ball:[200,252] } },
      { dur:800,  pos:{ ball:[355,82], W1:[355,82], S1:[162,232], S2:[232,218] } },
    ],
  },

  // ── 23 · Definición 1v1 con portero ──────────────────────────
  '00000000-0000-0000-0000-000000000017': {
    field: 'half_a', label: 'Mano a mano',
    players: [
      { id: 'A1', start: [200,60],  team: 'A', label: 'A' },
      { id: 'GK', start: [200,248], team: 'GK', label: 'P' },
    ],
    cones: [],
    arrows: [],
    ballStart: [200, 60],
    scenes: [
      { dur:1000, pos:{ ball:[200,60], A1:[200,60], GK:[200,248] } },
      { dur:1200, pos:{ ball:[200,118], A1:[200,118], GK:[200,215] } },
      { dur:1000, pos:{ ball:[200,165], A1:[200,165], GK:[200,190] } },
      { dur:900,  pos:{ ball:[200,252] } },
      { dur:800,  pos:{ ball:[200,60], A1:[200,60], GK:[200,248] } },
    ],
  },

  // ── 24 · Circuito de finalización ────────────────────────────
  '00000000-0000-0000-0000-000000000018': {
    field: 'box', label: 'Circuito 4 estaciones',
    players: [
      { id: 'E1', start: [200,72],  team: 'A', label: '1' },
      { id: 'E2', start: [200,118], team: 'A', label: '2' },
      { id: 'E3', start: [128,185], team: 'A', label: '3' },
      { id: 'E4', start: [200,165], team: 'A', label: '4' },
      { id: 'GK', start: [200,62],  team: 'GK', label: 'P' },
    ],
    cones: [],
    arrows: [],
    ballStart: [200, 72],
    scenes: [
      { dur:1200, pos:{ ball:[200,72],  E1:[200,72]  } },
      { dur:1000, pos:{ ball:[200,55]  } },
      { dur:1200, pos:{ ball:[200,118], E2:[200,118], E1:[200,72] } },
      { dur:1200, pos:{ ball:[200,62]  } },
      { dur:1200, pos:{ ball:[128,185], E3:[128,185] } },
      { dur:1000, pos:{ ball:[200,148] } },
      { dur:1200, pos:{ ball:[200,62]  } },
    ],
  },

  // ── 25 · Ataque posicional 8v6 ────────────────────────────────
  '00000000-0000-0000-0000-000000000019': {
    field: 'half_a', label: '8v6 posicional',
    players: [
      { id: 'A1', start: [55,55],   team: 'A', label: 'A' },
      { id: 'A2', start: [158,48],  team: 'A', label: 'A' },
      { id: 'A3', start: [242,48],  team: 'A', label: 'A' },
      { id: 'A4', start: [345,55],  team: 'A', label: 'A' },
      { id: 'A5', start: [78,155],  team: 'A', label: 'A' },
      { id: 'A6', start: [200,148], team: 'A', label: 'A' },
      { id: 'A7', start: [322,155], team: 'A', label: 'A' },
      { id: 'A8', start: [200,78],  team: 'A', label: 'A' },
      { id: 'B1', start: [128,122], team: 'B', label: 'D' },
      { id: 'B2', start: [200,108], team: 'B', label: 'D' },
      { id: 'B3', start: [272,122], team: 'B', label: 'D' },
      { id: 'B4', start: [128,182], team: 'B', label: 'D' },
      { id: 'B5', start: [200,185], team: 'B', label: 'D' },
      { id: 'B6', start: [272,182], team: 'B', label: 'D' },
      { id: 'GK', start: [200,248], team: 'GK', label: 'P' },
    ],
    cones: [],
    arrows: [],
    ballStart: [55, 55],
    scenes: [
      { dur:1200, pos:{ ball:[55,55]   } },
      { dur:1100, pos:{ ball:[200,78]  } },
      { dur:1100, pos:{ ball:[345,55]  } },
      { dur:1100, pos:{ ball:[322,155], A7:[322,155] } },
      { dur:1000, pos:{ ball:[200,252] } },
    ],
  },

  // ── 26 · Juego entre líneas ───────────────────────────────────
  '00000000-0000-0000-0000-00000000001a': {
    field: 'half_a', label: 'Entre líneas',
    zones: [
      { x:10, y:5,   w:380, h:68, color:'rgba(59,130,246,0.08)' },
      { x:10, y:73,  w:380, h:68, color:'rgba(255,255,255,0.04)' },
      { x:10, y:141, w:380, h:58, color:'rgba(245,158,11,0.1)' },
      { x:10, y:199, w:380, h:56, color:'rgba(239,68,68,0.07)'  },
    ],
    players: [
      { id: 'A1', start: [128,38],  team: 'A', label: 'A' },
      { id: 'A2', start: [272,38],  team: 'A', label: 'A' },
      { id: 'A3', start: [200,105], team: 'A', label: 'A' },
      { id: 'A4', start: [200,170], team: 'N', label: 'R' },
      { id: 'B1', start: [128,112], team: 'B', label: 'D' },
      { id: 'B2', start: [272,112], team: 'B', label: 'D' },
      { id: 'B3', start: [165,205], team: 'B', label: 'D' },
      { id: 'B4', start: [235,205], team: 'B', label: 'D' },
    ],
    cones: [],
    arrows: [
      { x1:200,y1:118, x2:200,y2:158, dashed:true, color:'rgba(245,158,11,0.8)' },
    ],
    ballStart: [128, 38],
    scenes: [
      { dur:1200, pos:{ ball:[128,38] } },
      { dur:1100, pos:{ ball:[200,105] } },
      { dur:1300, pos:{ ball:[200,170], A4:[200,162] } },
      { dur:1200, pos:{ ball:[200,220], A4:[200,220] } },
      { dur:900,  pos:{ ball:[200,252] } },
    ],
  },

  // ── 27 · Paredes y desmarques ─────────────────────────────────
  '00000000-0000-0000-0000-00000000001b': {
    field: 'half_a', label: 'Pared + 3º hombre',
    players: [
      { id: 'A1', start: [128,92],  team: 'A', label: 'A' },
      { id: 'B1', start: [200,142], team: 'B', label: 'B' },
      { id: 'C1', start: [285,92],  team: 'N', label: 'C' },
      { id: 'GK', start: [200,248], team: 'GK', label: 'P' },
    ],
    cones: [],
    arrows: [
      { x1:142,y1:92,  x2:188,y2:138, dashed:true, color:'rgba(147,197,253,0.7)' },
      { x1:200,y1:130, x2:148,y2:100, dashed:true, color:'rgba(147,197,253,0.7)' },
    ],
    ballStart: [128, 92],
    scenes: [
      { dur:1200, pos:{ ball:[128,92] } },
      { dur:900,  pos:{ ball:[200,142] } },
      { dur:800,  pos:{ ball:[148,105], A1:[148,105] } },
      { dur:1200, pos:{ ball:[148,222], A1:[148,222], C1:[228,222] } },
      { dur:1000, pos:{ ball:[228,222] } },
      { dur:900,  pos:{ ball:[200,252] } },
    ],
  },

  // ── 28 · Blocajes y reflejos portero ─────────────────────────
  '00000000-0000-0000-0000-00000000001c': {
    field: 'box', label: 'Reflejos portero',
    players: [
      { id: 'GK', start: [200,80],  team: 'GK', label: 'P' },
      { id: 'SH', start: [200,162], team: 'A', label: 'D' },
    ],
    cones: [],
    arrows: [],
    ballStart: [200, 162],
    scenes: [
      { dur:1000, pos:{ ball:[200,162], GK:[200,80] } },
      { dur:1100, pos:{ ball:[162,82],  GK:[168,90]  } },
      { dur:800,  pos:{ GK:[200,80], ball:[200,162] } },
      { dur:1100, pos:{ ball:[238,82],  GK:[232,90]  } },
      { dur:800,  pos:{ GK:[200,80], ball:[200,162] } },
      { dur:1100, pos:{ ball:[200,78],  GK:[200,74]  } },
      { dur:800,  pos:{ GK:[200,80], ball:[200,162] } },
    ],
  },

  // ── 29 · Juego de pies portero ────────────────────────────────
  '00000000-0000-0000-0000-00000000001d': {
    field: 'half_d', label: 'Juego de pies P.',
    players: [
      { id: 'GK', start: [200,22],  team: 'GK', label: 'P' },
      { id: 'CB1',start: [140,82],  team: 'B', label: 'D' },
      { id: 'CB2',start: [260,82],  team: 'B', label: 'D' },
      { id: 'LAT',start: [50,132],  team: 'B', label: 'L' },
    ],
    cones: [],
    arrows: [],
    ballStart: [200, 22],
    scenes: [
      { dur:1000, pos:{ ball:[200,22] } },
      { dur:1200, pos:{ ball:[140,82], CB1:[140,82] } },
      { dur:1000, pos:{ ball:[200,22] } },
      { dur:1400, pos:{ ball:[50,132], LAT:[50,132] } },
      { dur:1000, pos:{ ball:[200,22] } },
    ],
  },

  // ── 30 · Salidas y dominio del área portero ──────────────────
  '00000000-0000-0000-0000-00000000001e': {
    field: 'box', label: 'Salidas portero',
    players: [
      { id: 'GK', start: [200,80],  team: 'GK', label: 'P' },
      { id: 'A1', start: [200,178], team: 'A', label: 'A' },
      { id: 'A2', start: [252,162], team: 'A', label: 'A' },
    ],
    cones: [],
    arrows: [],
    ballStart: [55, 170],
    scenes: [
      { dur:1000, pos:{ ball:[55,170], GK:[200,80] } },
      { dur:1300, pos:{ ball:[142,142], GK:[178,102] } },
      { dur:1200, pos:{ ball:[175,148], GK:[178,145] } },
      { dur:1000, pos:{ ball:[50,100] } },
      { dur:800,  pos:{ ball:[55,170], GK:[200,80] } },
    ],
  },

  // ── 31 · 1v1 portero-delantero ───────────────────────────────
  '00000000-0000-0000-0000-00000000001f': {
    field: 'half_a', label: '1v1 P. vs A.',
    players: [
      { id: 'A1', start: [200,62],  team: 'A', label: 'A' },
      { id: 'GK', start: [200,248], team: 'GK', label: 'P' },
    ],
    cones: [],
    arrows: [],
    ballStart: [200, 62],
    scenes: [
      { dur:1000, pos:{ ball:[200,62], A1:[200,62], GK:[200,248] } },
      { dur:1200, pos:{ ball:[200,115], A1:[200,115], GK:[200,212] } },
      { dur:1000, pos:{ ball:[200,162], A1:[200,162], GK:[200,188] } },
      { dur:900,  pos:{ ball:[185,252] } },
      { dur:800,  pos:{ ball:[200,62], A1:[200,62], GK:[200,248] } },
    ],
  },

  // ══════════════════════════════════════════════════════════════
  // TÁCTICAS UEFA PRO — IDs coinciden con los registros en Supabase
  // ══════════════════════════════════════════════════════════════

  // ── T01 · Presión alta 4-3-3 ─────────────────────────────────
  'b0000000-0000-0000-0000-000000000001': {
    field: 'full', label: 'Pressing 4-3-3',
    players: [
      { id: 'GK',    start: [200, 248], team: 'GK', label: 'P'  },
      { id: 'LD',    start: [332, 210], team: 'A',  label: 'LD' },
      { id: 'DFCR',  start: [252, 218], team: 'A',  label: 'D'  },
      { id: 'DFCL',  start: [148, 218], team: 'A',  label: 'D'  },
      { id: 'LI',    start: [68,  210], team: 'A',  label: 'LI' },
      { id: 'MCD',   start: [200, 168], team: 'A',  label: 'MC' },
      { id: 'MCOR',  start: [272, 148], team: 'A',  label: 'M'  },
      { id: 'MCOL',  start: [128, 148], team: 'A',  label: 'M'  },
      { id: 'ED',    start: [328, 100], team: 'A',  label: 'ED' },
      { id: 'DC',    start: [200,  82], team: 'A',  label: 'DC' },
      { id: 'EI',    start: [72,  100], team: 'A',  label: 'EI' },
      { id: 'GKR',   start: [200,  12], team: 'B',  label: 'P'  },
      { id: 'LDR',   start: [332,  45], team: 'B',  label: 'D'  },
      { id: 'DFC1R', start: [248,  52], team: 'B',  label: 'D'  },
      { id: 'DFC2R', start: [152,  52], team: 'B',  label: 'D'  },
      { id: 'LIR',   start: [68,   45], team: 'B',  label: 'D'  },
      { id: 'MCR1',  start: [252, 102], team: 'B',  label: 'M'  },
      { id: 'MCR2',  start: [148, 102], team: 'B',  label: 'M'  },
    ],
    cones: [],
    arrows: [],
    zones: [{ x: 10, y: 5, w: 380, h: 82, color: 'rgba(239,68,68,0.08)' }],
    ballStart: [200, 12],
    scenes: [
      { dur: 1400, pos: { ball: [200, 12] } },
      { dur: 1200, pos: { ball: [200, 12], DC: [180, 48], EI: [108, 58], ED: [290, 58], MCOL: [130, 112], MCOR: [270, 112] } },
      { dur: 1100, pos: { ball: [152, 52], DC: [162, 72], EI: [105, 60], MCOL: [112, 98] } },
      { dur: 1000, pos: { ball: [200, 12], DC: [180, 28] } },
      { dur: 900,  pos: { ball: [200, 12], DC: [200, 82], EI: [72, 100], ED: [328, 100], MCOL: [128, 148], MCOR: [272, 148] } },
    ],
  },

  // ── T02 · Salida balón desde portero 4-2-3-1 ─────────────────
  'b0000000-0000-0000-0000-000000000002': {
    field: 'half_d', label: 'Build-up 4-2-3-1',
    players: [
      { id: 'GK',   start: [200,  22], team: 'GK', label: 'P'  },
      { id: 'LI',   start: [52,   82], team: 'A',  label: 'LI' },
      { id: 'DFCL', start: [150,  68], team: 'A',  label: 'D'  },
      { id: 'DFCR', start: [250,  68], team: 'A',  label: 'D'  },
      { id: 'LD',   start: [348,  82], team: 'A',  label: 'LD' },
      { id: 'MCD1', start: [152, 140], team: 'A',  label: 'MC' },
      { id: 'MCD2', start: [248, 140], team: 'A',  label: 'MC' },
      { id: 'EI',   start: [68,  182], team: 'A',  label: 'EI' },
      { id: 'MO',   start: [200, 165], team: 'A',  label: 'MO' },
      { id: 'ED',   start: [332, 182], team: 'A',  label: 'ED' },
      { id: 'DC',   start: [200, 205], team: 'A',  label: 'DC' },
      { id: 'F1R',  start: [200,  80], team: 'B',  label: 'A'  },
      { id: 'M1R',  start: [148, 138], team: 'B',  label: 'M'  },
      { id: 'M2R',  start: [252, 138], team: 'B',  label: 'M'  },
    ],
    cones: [],
    arrows: [],
    zones: [],
    ballStart: [200, 22],
    scenes: [
      { dur: 1200, pos: { ball: [200, 22] } },
      { dur: 1100, pos: { ball: [250, 68], MCD2: [272, 118], F1R: [240, 72] } },
      { dur: 1200, pos: { ball: [348, 82], MCD2: [312, 125] } },
      { dur: 1100, pos: { ball: [312, 125], MO: [270, 152], ED: [340, 165] } },
      { dur: 1000, pos: { ball: [270, 152], DC: [215, 195] } },
    ],
  },

  // ── T03 · Trampa de presión orientando al lateral ─────────────
  'b0000000-0000-0000-0000-000000000003': {
    field: 'full', label: 'Pressing trap lateral',
    players: [
      { id: 'GK',    start: [200, 248], team: 'GK', label: 'P'  },
      { id: 'LI',    start: [68,  215], team: 'A',  label: 'LI' },
      { id: 'DFCL',  start: [148, 222], team: 'A',  label: 'D'  },
      { id: 'DFCR',  start: [252, 222], team: 'A',  label: 'D'  },
      { id: 'LD',    start: [332, 215], team: 'A',  label: 'LD' },
      { id: 'MI',    start: [72,  175], team: 'A',  label: 'M'  },
      { id: 'MC1',   start: [155, 168], team: 'A',  label: 'MC' },
      { id: 'MC2',   start: [245, 168], team: 'A',  label: 'MC' },
      { id: 'MD',    start: [328, 175], team: 'A',  label: 'M'  },
      { id: 'DC1',   start: [152, 118], team: 'A',  label: 'DC' },
      { id: 'DC2',   start: [248, 118], team: 'A',  label: 'DC' },
      { id: 'GKR',   start: [200,  12], team: 'B',  label: 'P'  },
      { id: 'LIR',   start: [68,   45], team: 'B',  label: 'D'  },
      { id: 'DFC1R', start: [152,  52], team: 'B',  label: 'D'  },
      { id: 'DFC2R', start: [248,  52], team: 'B',  label: 'D'  },
      { id: 'LDR',   start: [332,  45], team: 'B',  label: 'D'  },
    ],
    cones: [],
    arrows: [],
    zones: [{ x: 290, y: 5, w: 100, h: 90, color: 'rgba(239,68,68,0.10)' }],
    ballStart: [248, 52],
    scenes: [
      { dur: 1300, pos: { ball: [248, 52], DC2: [248, 88], DC1: [200, 90] } },
      { dur: 1200, pos: { ball: [332, 45], MD: [328, 132] } },
      { dur: 1100, pos: { ball: [332, 45], MD: [338, 58], MC2: [285, 138], LD: [340, 198] } },
      { dur: 1000, pos: { ball: [332, 45], MD: [338, 52], LD: [338, 192] } },
      { dur: 900,  pos: { ball: [248, 52], DC2: [248, 118], MD: [328, 175], LD: [332, 215], MC2: [245, 168] } },
    ],
  },

  // ── T04 · Bloque bajo replegado y compacto ────────────────────
  'b0000000-0000-0000-0000-000000000004': {
    field: 'full', label: 'Bloque bajo 4-4-2',
    players: [
      { id: 'GK',    start: [200, 248], team: 'GK', label: 'P'  },
      { id: 'LI',    start: [68,  228], team: 'A',  label: 'LI' },
      { id: 'DFCL',  start: [148, 232], team: 'A',  label: 'D'  },
      { id: 'DFCR',  start: [252, 232], team: 'A',  label: 'D'  },
      { id: 'LD',    start: [332, 228], team: 'A',  label: 'LD' },
      { id: 'MI',    start: [72,  198], team: 'A',  label: 'M'  },
      { id: 'MC1',   start: [148, 195], team: 'A',  label: 'MC' },
      { id: 'MC2',   start: [252, 195], team: 'A',  label: 'MC' },
      { id: 'MD',    start: [328, 198], team: 'A',  label: 'M'  },
      { id: 'DC1',   start: [155, 172], team: 'A',  label: 'DC' },
      { id: 'DC2',   start: [245, 172], team: 'A',  label: 'DC' },
      { id: 'EDR',   start: [55,  100], team: 'B',  label: 'E'  },
      { id: 'MC1R',  start: [155, 108], team: 'B',  label: 'M'  },
      { id: 'MC2R',  start: [245, 108], team: 'B',  label: 'M'  },
      { id: 'EIR',   start: [345, 100], team: 'B',  label: 'E'  },
      { id: 'DFC1R', start: [155,  55], team: 'B',  label: 'D'  },
      { id: 'DFC2R', start: [245,  55], team: 'B',  label: 'D'  },
    ],
    cones: [],
    arrows: [],
    zones: [{ x: 50, y: 162, w: 300, h: 95, color: 'rgba(59,130,246,0.06)' }],
    ballStart: [155, 108],
    scenes: [
      { dur: 1300, pos: { ball: [155, 108] } },
      { dur: 1200, pos: { ball: [55, 100], MI: [52, 185], DC1: [108, 168], DFCL: [118, 228] } },
      { dur: 1200, pos: { ball: [345, 100], LD: [348, 218], MD: [348, 185], DC2: [292, 168], DFCR: [282, 228], MI: [72, 198], DC1: [155, 172], DFCL: [148, 232] } },
      { dur: 1100, pos: { ball: [200, 158], DFCL: [162, 215], DFCR: [242, 215] } },
      { dur: 900,  pos: { ball: [155, 108], LD: [332, 228], MD: [328, 198], DC2: [245, 172], DFCR: [252, 232], DFCL: [148, 232] } },
    ],
  },

  // ── T05 · Contraataque / transición defensa-ataque ────────────
  'b0000000-0000-0000-0000-000000000005': {
    field: 'full', label: 'Contraataque 3 pases',
    players: [
      { id: 'GK',    start: [200, 248], team: 'GK', label: 'P'  },
      { id: 'LI',    start: [68,  218], team: 'A',  label: 'LI' },
      { id: 'DFCL',  start: [148, 225], team: 'A',  label: 'D'  },
      { id: 'DFCR',  start: [252, 225], team: 'A',  label: 'D'  },
      { id: 'LD',    start: [332, 218], team: 'A',  label: 'LD' },
      { id: 'MCD',   start: [200, 172], team: 'A',  label: 'MC' },
      { id: 'EI',    start: [68,  118], team: 'A',  label: 'EI' },
      { id: 'DC',    start: [200, 105], team: 'A',  label: 'DC' },
      { id: 'ED',    start: [332, 118], team: 'A',  label: 'ED' },
      { id: 'GKR',   start: [200,  12], team: 'B',  label: 'P'  },
      { id: 'DFC1R', start: [148,  92], team: 'B',  label: 'D'  },
      { id: 'DFC2R', start: [252,  92], team: 'B',  label: 'D'  },
      { id: 'MCR1',  start: [155, 150], team: 'B',  label: 'M'  },
      { id: 'MCR2',  start: [245, 150], team: 'B',  label: 'M'  },
    ],
    cones: [],
    arrows: [
      { x1: 200, y1: 168, x2: 330, y2: 102, dashed: true, color: 'rgba(147,197,253,0.6)' },
    ],
    zones: [],
    ballStart: [200, 168],
    scenes: [
      { dur: 1000, pos: { ball: [200, 168] } },
      { dur: 1100, pos: { ball: [332, 102], MCR2: [270, 125] } },
      { dur: 1000, pos: { ball: [332, 60], ED: [332, 60], DC: [255, 70], EI: [68, 72] } },
      { dur: 1100, pos: { ball: [255, 60], DFC2R: [255, 72] } },
      { dur: 900,  pos: { ball: [200, 22] } },
    ],
  },

  // ── T06 · Ataque posicional con superioridades ────────────────
  'b0000000-0000-0000-0000-000000000006': {
    field: 'full', label: 'Juego de posición 4-3-3',
    players: [
      { id: 'GK',    start: [200, 248], team: 'GK', label: 'P'  },
      { id: 'LI',    start: [68,  210], team: 'A',  label: 'LI' },
      { id: 'DFCL',  start: [148, 218], team: 'A',  label: 'D'  },
      { id: 'DFCR',  start: [252, 218], team: 'A',  label: 'D'  },
      { id: 'LD',    start: [332, 210], team: 'A',  label: 'LD' },
      { id: 'MCD',   start: [200, 168], team: 'A',  label: 'MC' },
      { id: 'MCOL',  start: [128, 148], team: 'A',  label: 'M'  },
      { id: 'MCOR',  start: [272, 148], team: 'A',  label: 'M'  },
      { id: 'EI',    start: [68,   98], team: 'A',  label: 'EI' },
      { id: 'DC',    start: [200,  82], team: 'A',  label: 'DC' },
      { id: 'ED',    start: [332,  98], team: 'A',  label: 'ED' },
      { id: 'GKR',   start: [200,  12], team: 'B',  label: 'P'  },
      { id: 'LIR',   start: [68,   48], team: 'B',  label: 'D'  },
      { id: 'DFC1R', start: [155,  55], team: 'B',  label: 'D'  },
      { id: 'DFC2R', start: [245,  55], team: 'B',  label: 'D'  },
      { id: 'LDR',   start: [332,  48], team: 'B',  label: 'D'  },
      { id: 'MI_R',  start: [75,  102], team: 'B',  label: 'M'  },
      { id: 'MC1R',  start: [155, 108], team: 'B',  label: 'M'  },
      { id: 'MC2R',  start: [245, 108], team: 'B',  label: 'M'  },
      { id: 'MD_R',  start: [325, 102], team: 'B',  label: 'M'  },
    ],
    cones: [],
    arrows: [],
    zones: [{ x: 264, y: 55, w: 126, h: 100, color: 'rgba(59,130,246,0.08)' }],
    ballStart: [252, 218],
    scenes: [
      { dur: 1300, pos: { ball: [252, 218], MCOR: [272, 178] } },
      { dur: 1100, pos: { ball: [272, 175], ED: [340, 128], LD: [348, 145] } },
      { dur: 1200, pos: { ball: [340, 98], ED: [340, 98], DC: [235, 72], LDR: [340, 60] } },
      { dur: 1100, pos: { ball: [235, 65], DFC2R: [255, 68] } },
      { dur: 1000, pos: { ball: [200, 28] } },
    ],
  },

  // ── T07 · Gegenpressing en 5 segundos ────────────────────────
  'b0000000-0000-0000-0000-000000000007': {
    field: 'half_a', label: 'Gegenpressing 5s',
    players: [
      { id: 'MC1', start: [200,  95], team: 'A', label: 'B' },
      { id: 'MC2', start: [118, 145], team: 'A', label: 'B' },
      { id: 'MC3', start: [282, 145], team: 'A', label: 'B' },
      { id: 'EI',  start: [65,  188], team: 'A', label: 'E' },
      { id: 'ED',  start: [335, 188], team: 'A', label: 'E' },
      { id: 'DC',  start: [200, 188], team: 'A', label: 'D' },
      { id: 'R1',  start: [200, 110], team: 'B', label: 'R' },
      { id: 'R2',  start: [148, 162], team: 'B', label: 'R' },
      { id: 'R3',  start: [252, 162], team: 'B', label: 'R' },
    ],
    cones: [],
    arrows: [],
    zones: [],
    ballStart: [200, 112],
    scenes: [
      { dur: 900,  pos: { ball: [200, 112] } },
      { dur: 1100, pos: { ball: [200, 112], MC1: [200, 118], MC2: [165, 128], MC3: [235, 128] } },
      { dur: 1000, pos: { MC2: [148, 148], MC3: [252, 148], MC1: [200, 115] } },
      { dur: 1200, pos: { ball: [200, 115], MC1: [200, 112] } },
      { dur: 900,  pos: { ball: [200, 95], MC1: [200, 95], MC2: [118, 145], MC3: [282, 145] } },
    ],
  },

  // ── T08 · Basculación defensiva del bloque ────────────────────
  'b0000000-0000-0000-0000-000000000008': {
    field: 'full', label: 'Basculación 4-4-2',
    players: [
      { id: 'GK',   start: [200, 248], team: 'GK', label: 'P'  },
      { id: 'LI',   start: [68,  220], team: 'A',  label: 'LI' },
      { id: 'DFCL', start: [148, 228], team: 'A',  label: 'D'  },
      { id: 'DFCR', start: [252, 228], team: 'A',  label: 'D'  },
      { id: 'LD',   start: [332, 220], team: 'A',  label: 'LD' },
      { id: 'MI',   start: [72,  182], team: 'A',  label: 'M'  },
      { id: 'MC1',  start: [148, 178], team: 'A',  label: 'MC' },
      { id: 'MC2',  start: [252, 178], team: 'A',  label: 'MC' },
      { id: 'MD',   start: [328, 182], team: 'A',  label: 'M'  },
      { id: 'DC1',  start: [155, 148], team: 'A',  label: 'DC' },
      { id: 'DC2',  start: [245, 148], team: 'A',  label: 'DC' },
      { id: 'EIR',  start: [55,  100], team: 'B',  label: 'E'  },
      { id: 'MCR',  start: [200,  88], team: 'B',  label: 'M'  },
      { id: 'EDR',  start: [345, 100], team: 'B',  label: 'E'  },
    ],
    cones: [],
    arrows: [],
    zones: [],
    ballStart: [55, 100],
    scenes: [
      { dur: 1400, pos: { ball: [55, 100], LI: [50, 205], MI: [52, 168], DC1: [108, 140], DFCL: [122, 222] } },
      { dur: 1500, pos: { ball: [345, 100], LD: [348, 205], MD: [348, 168], DC2: [295, 140], DFCR: [278, 222], LI: [68, 220], MI: [72, 182], DC1: [155, 148], DFCL: [148, 228] } },
      { dur: 1300, pos: { ball: [200, 88], LD: [332, 220], MD: [328, 182], DC2: [245, 148], DFCR: [252, 228] } },
    ],
  },

  // ── T09 · Córner ofensivo con bloqueos ───────────────────────
  'b0000000-0000-0000-0000-000000000009': {
    field: 'box', label: 'Córner con pantallas',
    players: [
      { id: 'COR',  start: [55,  62],  team: 'A',  label: 'C'  },
      { id: 'BLK1', start: [165, 138], team: 'A',  label: 'B'  },
      { id: 'BLK2', start: [200, 138], team: 'A',  label: 'B'  },
      { id: 'R1',   start: [165, 158], team: 'A',  label: 'DC' },
      { id: 'R2',   start: [242, 148], team: 'A',  label: 'DC' },
      { id: 'R3',   start: [200, 178], team: 'A',  label: 'M'  },
      { id: 'GKR',  start: [200,  80], team: 'B',  label: 'P'  },
      { id: 'D1',   start: [152, 102], team: 'B',  label: 'D'  },
      { id: 'D2',   start: [248, 102], team: 'B',  label: 'D'  },
      { id: 'D3',   start: [200, 122], team: 'B',  label: 'D'  },
    ],
    cones: [],
    arrows: [],
    zones: [{ x: 130, y: 60, w: 80, h: 55, color: 'rgba(59,130,246,0.08)' }],
    ballStart: [55, 62],
    scenes: [
      { dur: 1200, pos: { ball: [55, 62] } },
      { dur: 1000, pos: { BLK1: [148, 108], BLK2: [200, 128] } },
      { dur: 1100, pos: { R1: [148, 88], R2: [255, 92] } },
      { dur: 1300, pos: { ball: [165, 95], GKR: [200, 78] } },
      { dur: 900,  pos: { ball: [200, 82], R3: [200, 110] } },
      { dur: 800,  pos: { ball: [55, 62], R1: [165, 158], R2: [242, 148], R3: [200, 178], BLK1: [165, 138], BLK2: [200, 138], GKR: [200, 80] } },
    ],
  },

  // ── T10 · Falta lateral ofensiva al área ─────────────────────
  'b0000000-0000-0000-0000-00000000000a': {
    field: 'half_a', label: 'Falta lateral al área',
    players: [
      { id: 'FK1', start: [42,  162], team: 'A',  label: 'F'  },
      { id: 'BLK', start: [172, 202], team: 'A',  label: 'B'  },
      { id: 'R1',  start: [158, 218], team: 'A',  label: 'DC' },
      { id: 'R2',  start: [242, 222], team: 'A',  label: 'DC' },
      { id: 'R3',  start: [200, 208], team: 'A',  label: 'M'  },
      { id: 'EDF', start: [318, 175], team: 'A',  label: 'E'  },
      { id: 'GKR', start: [200, 248], team: 'B',  label: 'P'  },
      { id: 'D1',  start: [162, 228], team: 'B',  label: 'D'  },
      { id: 'D2',  start: [248, 228], team: 'B',  label: 'D'  },
      { id: 'D3',  start: [200, 222], team: 'B',  label: 'D'  },
    ],
    cones: [],
    arrows: [
      { x1: 52, y1: 162, x2: 168, y2: 222, dashed: true, color: 'rgba(245,158,11,0.75)' },
    ],
    zones: [{ x: 115, y: 195, w: 90, h: 60, color: 'rgba(59,130,246,0.07)' }],
    ballStart: [42, 162],
    scenes: [
      { dur: 1200, pos: { ball: [42, 162] } },
      { dur: 1000, pos: { R1: [158, 235], R2: [242, 235], BLK: [168, 228] } },
      { dur: 1100, pos: { R1: [148, 228], R2: [255, 228], R3: [200, 215], BLK: [162, 228] } },
      { dur: 1300, pos: { ball: [162, 225], R1: [148, 225] } },
      { dur: 900,  pos: { ball: [200, 248], GKR: [200, 245] } },
      { dur: 800,  pos: { ball: [42, 162], R1: [158, 218], R2: [242, 222], R3: [200, 208], BLK: [172, 202], GKR: [200, 248] } },
    ],
  },

  // ── 32 · Defensa de córner y barrera ─────────────────────────
  '00000000-0000-0000-0000-000000000020': {
    field: 'box', label: 'Córner + falta',
    players: [
      { id: 'GK', start: [200,80],  team: 'GK', label: 'P' },
      { id: 'D1', start: [140,84],  team: 'B', label: 'D' },
      { id: 'D2', start: [260,84],  team: 'B', label: 'D' },
      { id: 'D3', start: [188,115], team: 'B', label: 'D' },
      { id: 'D4', start: [212,115], team: 'B', label: 'D' },
      { id: 'AX', start: [55,62],   team: 'A', label: 'L' },
      { id: 'A1', start: [200,178], team: 'A', label: 'A' },
      { id: 'A2', start: [258,162], team: 'A', label: 'A' },
    ],
    cones: [],
    arrows: [],
    ballStart: [55, 62],
    scenes: [
      // Córner scene
      { dur:1200, pos:{ ball:[55,62], GK:[200,80] } },
      { dur:1400, pos:{ ball:[182,108] } },
      { dur:1000, pos:{ ball:[52,105] } },
      // Free kick / barrera scene
      { dur:1400, pos:{
          ball:[148,185],
          D1:[148,175], D2:[164,175], D3:[180,175], D4:[196,175],
          GK:[200,80], AX:[148,185]
        }
      },
      { dur:1000, pos:{ ball:[168,165] } },
      { dur:800,  pos:{ ball:[55,62], D1:[140,84], D2:[260,84], D3:[188,115], D4:[212,115] } },
    ],
  },

};
