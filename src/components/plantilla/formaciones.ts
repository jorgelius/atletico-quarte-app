// ============================================================
// Datos de formaciones — posiciones relativas en el campo
// x: 0=izquierda, 1=derecha, 0.5=centro
// y: 0=arriba(ataque), 1=abajo(portería propia)
// Portero siempre en [0.5, 0.88]
// ============================================================

export interface PosFormacion {
  x: number;
  y: number;
}

// Distribuye N jugadores uniformemente en un ancho entre `margen` y 1-`margen`
function distribuir(n: number, y: number, margen = 0.1): PosFormacion[] {
  if (n === 1) return [{ x: 0.5, y }];
  const paso = (1 - margen * 2) / (n - 1);
  return Array.from({ length: n }, (_, i) => ({ x: margen + i * paso, y }));
}

// Genera posiciones a partir de una cadena "L1-L2-L3..."
// Portero incluido siempre en posición 0
function generarPosiciones(lineas: number[], ys: number[]): PosFormacion[] {
  const result: PosFormacion[] = [{ x: 0.5, y: 0.88 }]; // portero
  lineas.forEach((n, i) => result.push(...distribuir(n, ys[i])));
  return result;
}

// ── FORMACIONES F11 ──────────────────────────────────────────
export const FORMACIONES_F11: Record<string, PosFormacion[]> = {
  '4-4-2': generarPosiciones([4, 4, 2], [0.71, 0.49, 0.22]),
  '4-3-3': generarPosiciones([4, 3, 3], [0.71, 0.48, 0.20]),
  '4-2-3-1': generarPosiciones([4, 2, 3, 1], [0.72, 0.55, 0.37, 0.15]),
  '3-5-2': generarPosiciones([3, 5, 2], [0.71, 0.48, 0.20]),
  '3-4-3': generarPosiciones([3, 4, 3], [0.71, 0.48, 0.20]),
  '5-3-2': generarPosiciones([5, 3, 2], [0.72, 0.49, 0.22]),
  '4-5-1': generarPosiciones([4, 5, 1], [0.72, 0.48, 0.18]),
};

// ── FORMACIONES F7 ───────────────────────────────────────────
export const FORMACIONES_F7: Record<string, PosFormacion[]> = {
  '1-2-3': generarPosiciones([1, 2, 3], [0.70, 0.48, 0.22]),
  '2-3-1': generarPosiciones([2, 3, 1], [0.72, 0.46, 0.20]),
  '2-2-2': generarPosiciones([2, 2, 2], [0.72, 0.50, 0.22]),
  '1-3-2': generarPosiciones([1, 3, 2], [0.70, 0.46, 0.20]),
  '3-3':   generarPosiciones([3, 3],   [0.70, 0.25]),
  '3-2-1': generarPosiciones([3, 2, 1], [0.72, 0.48, 0.20]),
};

export function getFormaciones(formato: 'F7' | 'F11') {
  return formato === 'F7' ? FORMACIONES_F7 : FORMACIONES_F11;
}

export function getNumTitulares(formato: 'F7' | 'F11') {
  return formato === 'F7' ? 7 : 11;
}

export function getNumBanquillo(formato: 'F7' | 'F11') {
  return formato === 'F7' ? 15 : 18;
}
