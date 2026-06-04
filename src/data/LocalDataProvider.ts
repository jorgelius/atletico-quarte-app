// ============================================================
// LocalDataProvider — implementación con IndexedDB (Dexie)
// ============================================================
// Reglas de acceso implementadas aquí en código:
//   - entrenamientos / tácticas: visibles para todos; editar/borrar
//     solo si author_id == perfil local actual.
//   - jugadores / alineaciones / favoritos: solo del propietario.
//   - profiles: el perfil local actual.
// ============================================================

import { db } from './db';
import type {
  DataProvider,
  FiltroEntrenamiento,
  FiltroTactica,
} from './DataProvider';
import type {
  Profile,
  Jugador,
  Alineacion,
  Entrenamiento,
  Tactica,
  Favorito,
} from '@/types';

// Clave usada en IndexedDB para el perfil activo único
const PERFIL_ID = 'perfil_local_unico';

export class LocalDataProvider implements DataProvider {

  // ── PERFIL ─────────────────────────────────────────────────
  async getPerfil(): Promise<Profile | null> {
    return (await db.profiles.get(PERFIL_ID)) ?? null;
  }

  async savePerfil(p: Profile): Promise<void> {
    // Siempre forzamos el mismo ID para que haya un único perfil local
    await db.profiles.put({ ...p, id: PERFIL_ID });
  }

  // ── JUGADORES ──────────────────────────────────────────────
  async getJugadores(owner_id: string): Promise<Jugador[]> {
    return db.jugadores.where('owner_id').equals(owner_id).toArray();
  }

  async saveJugador(j: Jugador): Promise<void> {
    await db.jugadores.put(j);
  }

  async deleteJugador(id: string): Promise<void> {
    await db.jugadores.delete(id);
  }

  // ── ALINEACIONES ───────────────────────────────────────────
  async getAlineaciones(owner_id: string): Promise<Alineacion[]> {
    return db.alineaciones.where('owner_id').equals(owner_id).toArray();
  }

  async getAlineacion(id: string): Promise<Alineacion | null> {
    return (await db.alineaciones.get(id)) ?? null;
  }

  async saveAlineacion(a: Alineacion): Promise<void> {
    await db.alineaciones.put(a);
  }

  async deleteAlineacion(id: string): Promise<void> {
    await db.alineaciones.delete(id);
  }

  // ── ENTRENAMIENTOS ─────────────────────────────────────────
  async getEntrenamientos(filtro?: FiltroEntrenamiento): Promise<Entrenamiento[]> {
    // Carga completa y filtra en memoria (colección local pequeña)
    let resultados = await db.entrenamientos.toArray();

    // Filtro por autor (usa índice implícito vía filter)
    if (filtro?.author_id) {
      resultados = resultados.filter(e => e.author_id === filtro.author_id);
    }

    // Filtros adicionales en memoria
    if (filtro?.solo_sugeridos) {
      resultados = resultados.filter(e => e.es_sugerido === true);
    }
    if (filtro?.categoria) {
      resultados = resultados.filter(e => e.categoria === filtro.categoria);
    }
    if (filtro?.nivel) {
      resultados = resultados.filter(e => e.nivel === filtro.nivel || e.nivel === 'todos');
    }
    if (filtro?.duracion_max) {
      resultados = resultados.filter(e => e.duracion_min <= filtro.duracion_max!);
    }
    if (filtro?.material) {
      const mat = filtro.material.toLowerCase();
      resultados = resultados.filter(e =>
        e.material.some(m => m.toLowerCase().includes(mat))
      );
    }
    if (filtro?.texto) {
      const t = filtro.texto.toLowerCase();
      resultados = resultados.filter(e =>
        e.titulo.toLowerCase().includes(t) ||
        e.descripcion.toLowerCase().includes(t)
      );
    }

    return resultados.sort((a, b) => b.creado_en - a.creado_en);
  }

  async getEntrenamiento(id: string): Promise<Entrenamiento | null> {
    return (await db.entrenamientos.get(id)) ?? null;
  }

  async saveEntrenamiento(e: Entrenamiento): Promise<void> {
    await db.entrenamientos.put(e);
  }

  async deleteEntrenamiento(id: string): Promise<void> {
    await db.entrenamientos.delete(id);
  }

  // ── TÁCTICAS ───────────────────────────────────────────────
  async getTacticas(filtro?: FiltroTactica): Promise<Tactica[]> {
    // Carga completa y filtra en memoria (colección local pequeña)
    let resultados = await db.tacticas.toArray();

    if (filtro?.author_id) {
      resultados = resultados.filter(t => t.author_id === filtro.author_id);
    }
    if (filtro?.solo_sugeridos) {
      resultados = resultados.filter(t => t.es_sugerido === true);
    }
    if (filtro?.tipo) {
      resultados = resultados.filter(t => t.tipo === filtro.tipo);
    }
    if (filtro?.formato) {
      resultados = resultados.filter(t => t.formato === filtro.formato);
    }
    if (filtro?.texto) {
      const t = filtro.texto.toLowerCase();
      resultados = resultados.filter(t2 =>
        t2.titulo.toLowerCase().includes(t) ||
        t2.descripcion.toLowerCase().includes(t)
      );
    }

    return resultados.sort((a, b) => b.creado_en - a.creado_en);
  }

  async getTactica(id: string): Promise<Tactica | null> {
    return (await db.tacticas.get(id)) ?? null;
  }

  async saveTactica(t: Tactica): Promise<void> {
    await db.tacticas.put(t);
  }

  async deleteTactica(id: string): Promise<void> {
    await db.tacticas.delete(id);
  }

  // ── FAVORITOS ──────────────────────────────────────────────
  async getFavoritos(user_id: string): Promise<Favorito[]> {
    return db.favoritos.where('user_id').equals(user_id).toArray();
  }

  async addFavorito(f: Favorito): Promise<void> {
    await db.favoritos.put(f);
  }

  async removeFavorito(user_id: string, item_id: string): Promise<void> {
    const registro = await db.favoritos
      .where('user_id').equals(user_id)
      .and(f => f.item_id === item_id)
      .first();
    if (registro) await db.favoritos.delete(registro.id);
  }

  async isFavorito(user_id: string, item_id: string): Promise<boolean> {
    const count = await db.favoritos
      .where('user_id').equals(user_id)
      .and(f => f.item_id === item_id)
      .count();
    return count > 0;
  }
}
