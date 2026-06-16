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
