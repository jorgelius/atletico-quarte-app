// ============================================================
// INTERFAZ DataProvider — capa de abstracción de datos
// ============================================================
// TODA lectura/escritura pasa por aquí.
// Las pantallas NUNCA acceden directamente a IndexedDB ni a APIs.
//
// TODO backend: para conectar un servidor, crea RemoteDataProvider
// que implemente esta misma interfaz y cámbialo en src/data/index.ts.
// Las pantallas no necesitan ningún cambio.
// ============================================================

import type {
  Profile,
  Jugador,
  Alineacion,
  Entrenamiento,
  Tactica,
  Favorito,
  PizarraTactica,
} from '@/types';

// Filtros de búsqueda para la biblioteca de entrenamientos
export interface FiltroEntrenamiento {
  texto?: string;
  categoria?: string;
  nivel?: string;
  duracion_max?: number;
  material?: string;
  author_id?: string;
  solo_sugeridos?: boolean;
}

// Filtros de búsqueda para la biblioteca de tácticas
export interface FiltroTactica {
  texto?: string;
  tipo?: string;
  formato?: string;
  author_id?: string;
  solo_sugeridos?: boolean;
}

export interface DataProvider {
  // -- PERFIL LOCAL --
  getPerfil(): Promise<Profile | null>;
  savePerfil(p: Profile): Promise<void>;

  // -- JUGADORES (propietario = perfil actual) --
  getJugadores(owner_id: string): Promise<Jugador[]>;
  saveJugador(j: Jugador): Promise<void>;
  deleteJugador(id: string): Promise<void>;

  // -- ALINEACIONES --
  getAlineaciones(owner_id: string): Promise<Alineacion[]>;
  getAlineacion(id: string): Promise<Alineacion | null>;
  saveAlineacion(a: Alineacion): Promise<void>;
  deleteAlineacion(id: string): Promise<void>;

  // -- ENTRENAMIENTOS (biblioteca compartida) --
  getEntrenamientos(filtro?: FiltroEntrenamiento): Promise<Entrenamiento[]>;
  getEntrenamiento(id: string): Promise<Entrenamiento | null>;
  saveEntrenamiento(e: Entrenamiento): Promise<void>;
  deleteEntrenamiento(id: string): Promise<void>;

  // -- TÁCTICAS (biblioteca compartida) --
  getTacticas(filtro?: FiltroTactica): Promise<Tactica[]>;
  getTactica(id: string): Promise<Tactica | null>;
  saveTactica(t: Tactica): Promise<void>;
  deleteTactica(id: string): Promise<void>;

  // -- FAVORITOS (privados por usuario) --
  getFavoritos(user_id: string): Promise<Favorito[]>;
  addFavorito(f: Favorito): Promise<void>;
  removeFavorito(user_id: string, item_id: string): Promise<void>;
  isFavorito(user_id: string, item_id: string): Promise<boolean>;

  // -- PIZARRAS TÁCTICAS --
  getPizarras(coach_id: string): Promise<PizarraTactica[]>;
  savePizarra(p: PizarraTactica): Promise<void>;
  deletePizarra(id: string): Promise<void>;
}
