// ============================================================
// RemoteDataProvider — implementación con Supabase
// Mapea entre los tipos de la app y el esquema real de la DB.
// ============================================================
import { supabase } from './supabaseClient';
import type { DataProvider, FiltroEntrenamiento, FiltroTactica } from './DataProvider';
import type {
  Profile, Jugador, Alineacion, Entrenamiento, Tactica, Favorito,
  Posicion, Rol, CategoriaEntrenamiento, NivelEdad, TipoTactica,
  FormatoPartido, JugadorEnCampo, TipoFavorito,
  PizarraTactica, DatosPizarra,
} from '@/types';

let _perfilId: string | null = null;
export function setRemotePerfilId(id: string | null) { _perfilId = id; }

function check(error: { message: string } | null, op: string) {
  if (error) {
    console.error(`[Supabase] ${op}:`, error.message);
    throw new Error(error.message);
  }
}

// ── Conversores DB ↔ App ─────────────────────────────────────

// profiles: DB usa avatar_url / created_at / equipo (añadida)
// App usa: avatar_b64 / creado_en / equipo
function dbToProfile(r: Record<string, unknown>): Profile {
  return {
    id:         r.id as string,
    nombre:     (r.nombre as string) ?? '',
    equipo:     (r.equipo as string) ?? '',
    rol:        (r.rol as Rol) ?? 'entrenador',
    avatar_b64: (r.avatar_url as string | undefined) || undefined,
    creado_en:  r.created_at
      ? new Date(r.created_at as string).getTime()
      : Date.now(),
  };
}
function profileToDb(p: Profile) {
  return {
    id:         p.id,
    nombre:     p.nombre,
    equipo:     p.equipo,
    rol:        p.rol,
    avatar_url: p.avatar_b64 ?? null,
  };
}

// players: DB usa owner_id (añadida) / foto_url / observaciones / created_at
// App usa:  owner_id / foto_b64 / notas / creado_en
function dbToJugador(r: Record<string, unknown>): Jugador {
  return {
    id:        r.id as string,
    owner_id:  (r.owner_id as string) ?? '',
    nombre:    (r.nombre as string) ?? '',
    apellidos: (r.apellidos as string) ?? '',
    dorsal:    (r.dorsal as number) ?? 0,
    posicion:  (r.posicion as Posicion) ?? 'DEF',
    foto_b64:  (r.foto_url as string | undefined) || undefined,
    notas:     (r.observaciones as string | undefined) || undefined,
    creado_en: r.created_at
      ? new Date(r.created_at as string).getTime()
      : Date.now(),
  };
}
function jugadorToDb(j: Jugador) {
  return {
    id:            j.id,
    owner_id:      j.owner_id,
    nombre:        j.nombre,
    apellidos:     j.apellidos,
    dorsal:        j.dorsal,
    posicion:      j.posicion,
    foto_url:      j.foto_b64 ?? null,
    observaciones: j.notas ?? null,
  };
}

// lineups: DB usa coach_id (=owner) / tipo_futbol→formato (añadida) / posiciones (añadida)
// App usa: owner_id / formato / formacion / posiciones / creado_en / actualizado_en
function dbToAlineacion(r: Record<string, unknown>): Alineacion {
  return {
    id:             r.id as string,
    owner_id:       (r.coach_id as string) ?? '',
    nombre:         (r.nombre as string) ?? '',
    formato:        ((r.formato ?? r.tipo_futbol) as FormatoPartido) ?? 'F11',
    formacion:      (r.formacion as string) ?? '4-4-2',
    posiciones:     (r.posiciones as JugadorEnCampo[]) ?? [],
    creado_en:      (r.creado_en as number)
      ?? (r.created_at ? new Date(r.created_at as string).getTime() : Date.now()),
    actualizado_en: (r.actualizado_en as number) ?? Date.now(),
  };
}
function alineacionToDb(a: Alineacion) {
  return {
    id:             a.id,
    coach_id:       a.owner_id,
    nombre:         a.nombre,
    formato:        a.formato,
    formacion:      a.formacion,
    posiciones:     a.posiciones,   // columna jsonb
    creado_en:      a.creado_en,
    actualizado_en: a.actualizado_en,
  };
}

// trainings: DB usa nombre (=titulo), coach_id (=author), coach_id para RLS,
//            instrucciones text (JSON array), material text (JSON array),
//            fotos_b64 jsonb (añadida), pizarra_data (añadida), es_sugerido (añadida)
function dbToEntrenamiento(r: Record<string, unknown>): Entrenamiento {
  const parseTextArray = (v: unknown): string[] => {
    if (Array.isArray(v)) return v as string[];
    if (typeof v === 'string' && v) {
      try { return JSON.parse(v); } catch { return [v]; }
    }
    return [];
  };
  return {
    id:                r.id as string,
    author_id:         (r.coach_id as string) ?? '',
    titulo:            (r.nombre as string) ?? '',
    categoria:         (r.categoria as CategoriaEntrenamiento) ?? 'otros',
    nivel:             (r.nivel as NivelEdad) ?? 'todos',
    duracion_min:      (r.duracion_min as number) ?? 30,
    num_jugadores_min: (r.num_jugadores_min as number) ?? 8,
    num_jugadores_max: (r.num_jugadores_max as number) ?? 16,
    material:          parseTextArray(r.material),
    descripcion:       (r.descripcion as string) ?? '',
    instrucciones:     parseTextArray(r.instrucciones),
    fotos_b64:         (r.fotos_b64 as string[]) ?? [],
    pizarra_data:      (r.pizarra_data as string | undefined) || undefined,
    es_sugerido:       (r.es_sugerido as boolean) ?? (r.es_publico as boolean) ?? false,
    creado_en:         (r.creado_en as number)
      ?? (r.created_at ? new Date(r.created_at as string).getTime() : Date.now()),
    actualizado_en:    (r.actualizado_en as number) ?? Date.now(),
  };
}
function entrenamientoToDb(e: Entrenamiento) {
  return {
    id:                e.id,
    coach_id:          e.author_id,
    nombre:            e.titulo,
    categoria:         e.categoria,
    nivel:             e.nivel,
    duracion_min:      e.duracion_min,
    num_jugadores_min: e.num_jugadores_min,
    num_jugadores_max: e.num_jugadores_max,
    material:          JSON.stringify(e.material),
    descripcion:       e.descripcion,
    instrucciones:     JSON.stringify(e.instrucciones),
    fotos_b64:         e.fotos_b64,
    pizarra_data:      e.pizarra_data ?? null,
    es_sugerido:       e.es_sugerido,
    es_publico:        e.es_sugerido,
    creado_en:         e.creado_en,
    actualizado_en:    e.actualizado_en,
  };
}

// tactics: DB usa nombre (=titulo), coach_id (=author),
//          instrucciones jsonb (añadida), fotos_b64 jsonb (añadida), es_sugerido (añadida)
function dbToTactica(r: Record<string, unknown>): Tactica {
  return {
    id:             r.id as string,
    author_id:      (r.coach_id as string) ?? '',
    titulo:         (r.nombre as string) ?? '',
    tipo:           (r.tipo as TipoTactica) ?? 'otros',
    formato:        (r.formato as FormatoPartido) ?? 'F11',
    descripcion:    (r.descripcion as string) ?? '',
    instrucciones:  (r.instrucciones as string[]) ?? [],
    fotos_b64:      (r.fotos_b64 as string[]) ?? [],
    pizarra_data:   (r.pizarra_data as string | undefined) || undefined,
    es_sugerido:    (r.es_sugerido as boolean) ?? (r.es_publico as boolean) ?? false,
    creado_en:      (r.creado_en as number)
      ?? (r.created_at ? new Date(r.created_at as string).getTime() : Date.now()),
    actualizado_en: (r.actualizado_en as number) ?? Date.now(),
  };
}
function tacticaToDb(t: Tactica) {
  return {
    id:             t.id,
    coach_id:       t.author_id,
    nombre:         t.titulo,
    tipo:           t.tipo,
    formato:        t.formato,
    descripcion:    t.descripcion,
    instrucciones:  t.instrucciones,
    fotos_b64:      t.fotos_b64,
    pizarra_data:   t.pizarra_data ?? null,
    es_sugerido:    t.es_sugerido,
    es_publico:     t.es_sugerido,
    creado_en:      t.creado_en,
    actualizado_en: t.actualizado_en,
  };
}

// favorites: DB usa coach_id (=user_id), created_at
// App usa:   user_id / creado_en
function dbToFavorito(r: Record<string, unknown>): Favorito {
  return {
    id:        r.id as string,
    user_id:   (r.coach_id as string) ?? '',
    tipo:      (r.tipo as TipoFavorito) ?? 'entrenamiento',
    item_id:   (r.item_id as string) ?? '',
    creado_en: (r.creado_en as number)
      ?? (r.created_at ? new Date(r.created_at as string).getTime() : Date.now()),
  };
}
function favoritoToDb(f: Favorito) {
  return {
    id:        f.id,
    coach_id:  f.user_id,
    tipo:      f.tipo,
    item_id:   f.item_id,
    creado_en: f.creado_en,
  };
}

// pizarras_tacticas: columnas propias (canvas_data jsonb)
function dbToPizarra(r: Record<string, unknown>): PizarraTactica {
  return {
    id:             r.id as string,
    coach_id:       r.coach_id as string,
    titulo:         (r.titulo as string) ?? 'Sin título',
    formato:        (r.formato as FormatoPartido) ?? 'F11',
    canvas_data:    (r.canvas_data as DatosPizarra) ?? { jugadores: [], trazos: [], flechas: [], zonas: [], textos: [] },
    creado_en:      r.creado_en ? new Date(r.creado_en as string).getTime() : Date.now(),
    actualizado_en: r.actualizado_en ? new Date(r.actualizado_en as string).getTime() : Date.now(),
  };
}
function pizarraToDb(p: PizarraTactica) {
  return {
    id:             p.id,
    coach_id:       p.coach_id,
    titulo:         p.titulo,
    formato:        p.formato,
    canvas_data:    p.canvas_data,
    actualizado_en: new Date().toISOString(),
  };
}

// ── Provider ─────────────────────────────────────────────────

export class RemoteDataProvider implements DataProvider {

  // ── PERFIL ────────────────────────────────────────────────
  async getPerfil(): Promise<Profile | null> {
    if (!_perfilId) return null;
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', _perfilId)
      .maybeSingle();
    if (error) { console.error('[Supabase] getPerfil:', error.message); return null; }
    return data ? dbToProfile(data as Record<string, unknown>) : null;
  }

  async savePerfil(p: Profile): Promise<void> {
    const { error } = await supabase.from('profiles').upsert(profileToDb(p));
    check(error, 'savePerfil');
    _perfilId = p.id;
  }

  // ── JUGADORES ─────────────────────────────────────────────
  async getJugadores(owner_id: string): Promise<Jugador[]> {
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .eq('owner_id', owner_id)
      .order('dorsal');
    if (error) console.error('[Supabase] getJugadores:', error.message);
    return ((data ?? []) as Record<string, unknown>[]).map(dbToJugador);
  }

  async saveJugador(j: Jugador): Promise<void> {
    const { error } = await supabase.from('players').upsert(jugadorToDb(j));
    check(error, 'saveJugador');
  }

  async deleteJugador(id: string): Promise<void> {
    const { error } = await supabase.from('players').delete().eq('id', id);
    check(error, 'deleteJugador');
  }

  // ── ALINEACIONES ──────────────────────────────────────────
  async getAlineaciones(owner_id: string): Promise<Alineacion[]> {
    const { data, error } = await supabase
      .from('lineups')
      .select('*')
      .eq('coach_id', owner_id)
      .order('created_at', { ascending: false });
    if (error) console.error('[Supabase] getAlineaciones:', error.message);
    return ((data ?? []) as Record<string, unknown>[]).map(dbToAlineacion);
  }

  async getAlineacion(id: string): Promise<Alineacion | null> {
    const { data } = await supabase
      .from('lineups').select('*').eq('id', id).maybeSingle();
    return data ? dbToAlineacion(data as Record<string, unknown>) : null;
  }

  async saveAlineacion(a: Alineacion): Promise<void> {
    const { error } = await supabase.from('lineups').upsert(alineacionToDb(a));
    check(error, 'saveAlineacion');
  }

  async deleteAlineacion(id: string): Promise<void> {
    const { error } = await supabase.from('lineups').delete().eq('id', id);
    check(error, 'deleteAlineacion');
  }

  // ── ENTRENAMIENTOS ────────────────────────────────────────
  async getEntrenamientos(filtro?: FiltroEntrenamiento): Promise<Entrenamiento[]> {
    let query = supabase.from('trainings').select('*');

    if (filtro?.author_id)     query = query.eq('coach_id', filtro.author_id);
    if (filtro?.solo_sugeridos) query = query.eq('es_sugerido', true);
    if (filtro?.categoria)     query = query.eq('categoria', filtro.categoria);

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) console.error('[Supabase] getEntrenamientos:', error.message);

    let results = ((data ?? []) as Record<string, unknown>[]).map(dbToEntrenamiento);

    if (filtro?.nivel) {
      results = results.filter(e => e.nivel === filtro.nivel || e.nivel === 'todos');
    }
    if (filtro?.texto) {
      const t = filtro.texto.toLowerCase();
      results = results.filter(e =>
        e.titulo.toLowerCase().includes(t) || e.descripcion.toLowerCase().includes(t)
      );
    }
    if (filtro?.duracion_max) {
      results = results.filter(e => e.duracion_min <= filtro.duracion_max!);
    }
    return results;
  }

  async getEntrenamiento(id: string): Promise<Entrenamiento | null> {
    const { data } = await supabase
      .from('trainings').select('*').eq('id', id).maybeSingle();
    return data ? dbToEntrenamiento(data as Record<string, unknown>) : null;
  }

  async saveEntrenamiento(e: Entrenamiento): Promise<void> {
    const { error } = await supabase.from('trainings').upsert(entrenamientoToDb(e));
    check(error, 'saveEntrenamiento');
  }

  async deleteEntrenamiento(id: string): Promise<void> {
    const { error } = await supabase.from('trainings').delete().eq('id', id);
    check(error, 'deleteEntrenamiento');
  }

  // ── TÁCTICAS ──────────────────────────────────────────────
  async getTacticas(filtro?: FiltroTactica): Promise<Tactica[]> {
    let query = supabase.from('tactics').select('*');

    if (filtro?.author_id)     query = query.eq('coach_id', filtro.author_id);
    if (filtro?.solo_sugeridos) query = query.eq('es_sugerido', true);
    if (filtro?.tipo)          query = query.eq('tipo', filtro.tipo);

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) console.error('[Supabase] getTacticas:', error.message);

    let results = ((data ?? []) as Record<string, unknown>[]).map(dbToTactica);

    if (filtro?.formato) {
      results = results.filter(t => t.formato === filtro.formato);
    }
    if (filtro?.texto) {
      const t = filtro.texto.toLowerCase();
      results = results.filter(t2 =>
        t2.titulo.toLowerCase().includes(t) || t2.descripcion.toLowerCase().includes(t)
      );
    }
    return results;
  }

  async getTactica(id: string): Promise<Tactica | null> {
    const { data } = await supabase
      .from('tactics').select('*').eq('id', id).maybeSingle();
    return data ? dbToTactica(data as Record<string, unknown>) : null;
  }

  async saveTactica(t: Tactica): Promise<void> {
    const { error } = await supabase.from('tactics').upsert(tacticaToDb(t));
    check(error, 'saveTactica');
  }

  async deleteTactica(id: string): Promise<void> {
    const { error } = await supabase.from('tactics').delete().eq('id', id);
    check(error, 'deleteTactica');
  }

  // ── FAVORITOS ─────────────────────────────────────────────
  async getFavoritos(user_id: string): Promise<Favorito[]> {
    const { data, error } = await supabase
      .from('favorites').select('*').eq('coach_id', user_id);
    if (error) console.error('[Supabase] getFavoritos:', error.message);
    return ((data ?? []) as Record<string, unknown>[]).map(dbToFavorito);
  }

  async addFavorito(f: Favorito): Promise<void> {
    const { error } = await supabase.from('favorites').upsert(favoritoToDb(f));
    check(error, 'addFavorito');
  }

  async removeFavorito(user_id: string, item_id: string): Promise<void> {
    const { error } = await supabase.from('favorites')
      .delete()
      .eq('coach_id', user_id)
      .eq('item_id', item_id);
    check(error, 'removeFavorito');
  }

  async isFavorito(user_id: string, item_id: string): Promise<boolean> {
    const { count } = await supabase
      .from('favorites')
      .select('id', { count: 'exact', head: true })
      .eq('coach_id', user_id)
      .eq('item_id', item_id);
    return (count ?? 0) > 0;
  }

  // ── PIZARRAS TÁCTICAS ─────────────────────────────────────
  async getPizarras(coach_id: string): Promise<PizarraTactica[]> {
    const { data, error } = await supabase
      .from('pizarras_tacticas')
      .select('*')
      .eq('coach_id', coach_id)
      .order('actualizado_en', { ascending: false });
    if (error) { console.error('[Supabase] getPizarras:', error.message); return []; }
    return ((data ?? []) as Record<string, unknown>[]).map(dbToPizarra);
  }

  async savePizarra(p: PizarraTactica): Promise<void> {
    const { error } = await supabase.from('pizarras_tacticas').upsert(pizarraToDb(p));
    check(error, 'savePizarra');
  }

  async deletePizarra(id: string): Promise<void> {
    const { error } = await supabase.from('pizarras_tacticas').delete().eq('id', id);
    check(error, 'deletePizarra');
  }
}
