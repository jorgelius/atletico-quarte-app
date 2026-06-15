// ============================================================
// EQUIPOS — catálogo fijo de equipos del CD Atlético Quarte
// Los IDs son UUIDs deterministas (no son IDs de usuario).
// Cualquier entrenador que seleccione el mismo equipo comparte
// los mismos datos de plantilla, partidos y asistencia.
//
// ⚠️  SUPABASE: las RLS policies de las tablas players, matches,
//     lista_sesiones, lineups, tactics y pizarras_tacticas deben
//     permitir acceso cuando el owner_id/team_id/coach_id sea uno
//     de estos UUIDs Y el usuario autenticado tenga ese equipo en
//     su perfil (campo equipo). La forma más rápida de probar es
//     desactivar RLS en esas tablas y habilitar de nuevo con las
//     políticas correctas cuando se vaya a producción.
// ============================================================

import type { FormatoPartido } from '@/types';

export interface Equipo {
  id:     string;   // UUID determinista único por equipo
  nombre: string;   // Nombre a mostrar
  sub?:   string;   // Categoría de edad
}

export const EQUIPOS: Equipo[] = [
  { id: '10000000-0000-0000-0000-000000000001', nombre: '1ª Benjamín A',  sub: 'Sub-10' },
  { id: '10000000-0000-0000-0000-000000000002', nombre: '2ª Benjamín A',  sub: 'Sub-10' },
  { id: '10000000-0000-0000-0000-000000000003', nombre: '2ª Benjamín B',  sub: 'Sub-10' },
  { id: '10000000-0000-0000-0000-000000000004', nombre: 'Alevín A',       sub: 'Sub-12' },
  { id: '10000000-0000-0000-0000-000000000005', nombre: 'Alevín B',       sub: 'Sub-12' },
  { id: '10000000-0000-0000-0000-000000000006', nombre: 'Cadete',         sub: 'Sub-16' },
  { id: '10000000-0000-0000-0000-000000000007', nombre: 'Infantil A',     sub: 'Sub-14' },
  { id: '10000000-0000-0000-0000-000000000008', nombre: 'Infantil B',     sub: 'Sub-14' },
  { id: '10000000-0000-0000-0000-000000000009', nombre: 'Infantil C',     sub: 'Sub-14' },
  { id: '10000000-0000-0000-0000-00000000000a', nombre: 'Prebenjamín A',  sub: 'Sub-8'  },
  { id: '10000000-0000-0000-0000-00000000000b', nombre: 'Prebenjamín B',  sub: 'Sub-8'  },
  { id: '10000000-0000-0000-0000-00000000000c', nombre: 'Juvenil',        sub: 'Sub-18' },
  { id: '10000000-0000-0000-0000-00000000000d', nombre: 'Regional',       sub: 'Senior' },
];

export const EQUIPOS_MAP = new Map<string, Equipo>(EQUIPOS.map(e => [e.id, e]));

export function getEquipoNombre(id: string): string {
  return EQUIPOS_MAP.get(id)?.nombre ?? id;
}

const F7_SUBS = new Set(['Sub-8', 'Sub-10']);

/** Devuelve el formato de campo obligatorio según la categoría del equipo. */
export function getFormatoEquipo(teamId: string): FormatoPartido {
  const equipo = EQUIPOS_MAP.get(teamId);
  return equipo && F7_SUBS.has(equipo.sub ?? '') ? 'F7' : 'F11';
}

// ── Grupos para el selector de onboarding ───────────────────
export const GRUPOS_EQUIPOS_SELECTOR = [
  {
    label: 'Prebenjamín',
    equipos: EQUIPOS.filter(e => ['10000000-0000-0000-0000-00000000000a', '10000000-0000-0000-0000-00000000000b'].includes(e.id)),
  },
  {
    label: 'Benjamín',
    equipos: EQUIPOS.filter(e => ['10000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000003'].includes(e.id)),
  },
  {
    label: 'Alevín',
    equipos: EQUIPOS.filter(e => ['10000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000005'].includes(e.id)),
  },
  {
    label: 'Infantil',
    equipos: EQUIPOS.filter(e => ['10000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000008', '10000000-0000-0000-0000-000000000009'].includes(e.id)),
  },
  {
    label: 'Cadete · Juvenil · Regional',
    equipos: EQUIPOS.filter(e => ['10000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-00000000000c', '10000000-0000-0000-0000-00000000000d'].includes(e.id)),
  },
];
