// ============================================================
// competicionData.ts — estructura de competición CD Atlético Quarte
// Datos vacíos hasta que la federación publique la temporada 2026-27.
// Cuando llegue el momento, añadir los datos en PARTIDOS y CLASIFICACIONES.
// ============================================================
import type { Partido, ClasificacionRow } from '@/types';

// Próximos partidos por equipo — null = sin dato todavía
const PARTIDOS: Record<string, Partido | null> = {
  'Prebenjamín A': null,
  'Prebenjamín B': null,
  'Benjamín A':    null,
  'Benjamín B':    null,
  'Alevín A':      null,
  'Alevín B':      null,
  'Infantil A':    null,
  'Infantil B':    null,
  'Cadete A':      null,
  'Cadete B':      null,
  'Juvenil A':     null,
  'Primer Equipo': null,
};

// Clasificación por equipo — [] = sin dato todavía
const CLASIFICACIONES: Record<string, ClasificacionRow[]> = {
  'Prebenjamín A': [],
  'Prebenjamín B': [],
  'Benjamín A':    [],
  'Benjamín B':    [],
  'Alevín A':      [],
  'Alevín B':      [],
  'Infantil A':    [],
  'Infantil B':    [],
  'Cadete A':      [],
  'Cadete B':      [],
  'Juvenil A':     [],
  'Primer Equipo': [],
};

export function getProximoPartido(equipo: string): Partido | null {
  return PARTIDOS[equipo] ?? null;
}

export function getClasificacion(equipo: string): ClasificacionRow[] {
  return CLASIFICACIONES[equipo] ?? [];
}

// Equipos del club agrupados para el selector de onboarding
export const GRUPOS_EQUIPOS = [
  {
    label: 'Fútbol Base',
    equipos: [
      { nombre: 'Prebenjamín A', sub: 'Sub-8'  },
      { nombre: 'Prebenjamín B', sub: 'Sub-8'  },
      { nombre: 'Benjamín A',    sub: 'Sub-10' },
      { nombre: 'Benjamín B',    sub: 'Sub-10' },
      { nombre: 'Alevín A',      sub: 'Sub-12' },
      { nombre: 'Alevín B',      sub: 'Sub-12' },
      { nombre: 'Infantil A',    sub: 'Sub-14' },
      { nombre: 'Infantil B',    sub: 'Sub-14' },
      { nombre: 'Cadete A',      sub: 'Sub-16' },
      { nombre: 'Cadete B',      sub: 'Sub-16' },
      { nombre: 'Juvenil A',     sub: 'Sub-18' },
    ],
  },
  {
    label: 'Primer Equipo',
    equipos: [
      { nombre: 'Primer Equipo', sub: 'Senior' },
    ],
  },
  {
    label: 'Gestión',
    equipos: [
      { nombre: 'Coordinación',   sub: '' },
      { nombre: 'Club (general)', sub: '' },
    ],
  },
] as const;
