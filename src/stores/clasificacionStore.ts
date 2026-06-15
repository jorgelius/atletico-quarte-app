// ============================================================
// STORE: Clasificación de liga (Zustand)
// Lee y escribe en la tabla `clasificaciones` de Supabase.
// La actualización via IA se hace a través de la Edge Function
// `parse-clasificacion` para no exponer la API key en el cliente.
// ============================================================
import { create } from 'zustand';
import { supabase } from '@/data/supabaseClient';
import type { ClasificacionRow } from '@/types';

const TEMPORADA_DEFAULT = '2025/26';

interface DbRow {
  posicion: number;
  equipo_nombre: string;
  pj: number;
  pg: number;
  pe: number;
  pp: number;
  gf: number;
  gc: number;
  pts: number;
  es_nuestro: boolean;
  updated_at: string;
  updated_by: string | null;
}

interface ClasificacionState {
  rows:        ClasificacionRow[];
  updatedAt:   string | null;
  updatedBy:   string | null;
  cargando:    boolean;
  guardando:   boolean;
  parseando:   boolean;
  errorParseo: string | null;

  cargar(teamId: string, temporada?: string): Promise<void>;
  guardar(teamId: string, rows: ClasificacionRow[], updatedBy: string, temporada?: string): Promise<void>;
  parsearConIA(text: string): Promise<ClasificacionRow[] | null>;
}

export const useClasificacionStore = create<ClasificacionState>((set) => ({
  rows:        [],
  updatedAt:   null,
  updatedBy:   null,
  cargando:    false,
  guardando:   false,
  parseando:   false,
  errorParseo: null,

  cargar: async (teamId, temporada = TEMPORADA_DEFAULT) => {
    set({ cargando: true });
    try {
      const { data, error } = await supabase
        .from('clasificaciones')
        .select('posicion, equipo_nombre, pj, pg, pe, pp, gf, gc, pts, es_nuestro, updated_at, updated_by')
        .eq('team_id', teamId)
        .eq('temporada', temporada)
        .order('posicion', { ascending: true });

      if (error) throw new Error(error.message);

      const rows: ClasificacionRow[] = (data as DbRow[]).map((r) => ({
        posicion:        r.posicion,
        equipo:          r.equipo_nombre,
        pj:              r.pj,
        pg:              r.pg,
        pe:              r.pe,
        pp:              r.pp,
        gf:              r.gf,
        gc:              r.gc,
        pts:             r.pts,
        esNuestroEquipo: r.es_nuestro,
      }));

      set({
        rows,
        updatedAt: (data as DbRow[])[0]?.updated_at ?? null,
        updatedBy: (data as DbRow[])[0]?.updated_by ?? null,
        cargando:  false,
      });
    } catch (err) {
      console.error('[clasificacionStore] cargar:', err);
      set({ cargando: false });
    }
  },

  guardar: async (teamId, rows, updatedBy, temporada = TEMPORADA_DEFAULT) => {
    set({ guardando: true });
    try {
      // Borrar filas existentes para este equipo + temporada
      const { error: delError } = await supabase
        .from('clasificaciones')
        .delete()
        .eq('team_id', teamId)
        .eq('temporada', temporada);

      if (delError) throw new Error(delError.message);

      const now = new Date().toISOString();
      const inserts = rows.map((r) => ({
        team_id:       teamId,
        temporada,
        posicion:      r.posicion,
        equipo_nombre: r.equipo,
        es_nuestro:    r.esNuestroEquipo,
        pj:            r.pj,
        pg:            r.pg,
        pe:            r.pe,
        pp:            r.pp,
        gf:            r.gf,
        gc:            r.gc,
        pts:           r.pts,
        updated_at:    now,
        updated_by:    updatedBy,
      }));

      const { error: insError } = await supabase.from('clasificaciones').insert(inserts);
      if (insError) throw new Error(insError.message);

      set({ rows, updatedAt: now, updatedBy, guardando: false });
    } catch (err) {
      console.error('[clasificacionStore] guardar:', err);
      set({ guardando: false });
    }
  },

  parsearConIA: async (text) => {
    set({ parseando: true, errorParseo: null });
    try {
      const res = await fetch('/api/parse-clasificacion', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: `Error ${res.status}` })) as { error?: string };
        throw new Error(err.error ?? `Error ${res.status}`);
      }

      const data = await res.json() as { rows: Record<string, unknown>[] };
      const rawRows = data.rows ?? [];

      const rows: ClasificacionRow[] = rawRows.map((r, i) => ({
        posicion:        Number(r.posicion ?? i + 1),
        equipo:          String(r.equipo ?? r.equipo_nombre ?? ''),
        pj:              Number(r.pj ?? 0),
        pg:              Number(r.pg ?? 0),
        pe:              Number(r.pe ?? 0),
        pp:              Number(r.pp ?? 0),
        gf:              Number(r.gf ?? 0),
        gc:              Number(r.gc ?? 0),
        pts:             Number(r.pts ?? 0),
        esNuestroEquipo: Boolean(r.esNuestroEquipo ?? false),
      }));

      set({ parseando: false });
      return rows;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al parsear con IA';
      set({ parseando: false, errorParseo: msg });
      return null;
    }
  },
}));
