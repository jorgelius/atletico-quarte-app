// ============================================================
// BASE DE DATOS LOCAL — IndexedDB con Dexie
// ============================================================
import Dexie, { type Table } from 'dexie';
import type {
  Profile,
  Jugador,
  Alineacion,
  Entrenamiento,
  Tactica,
  Favorito,
} from '@/types';

class AtleticoQuarteDB extends Dexie {
  profiles!: Table<Profile, string>;
  jugadores!: Table<Jugador, string>;
  alineaciones!: Table<Alineacion, string>;
  entrenamientos!: Table<Entrenamiento, string>;
  tacticas!: Table<Tactica, string>;
  favoritos!: Table<Favorito, string>;

  constructor() {
    super('atletico_quarte_db');

    this.version(1).stores({
      // Índices relevantes para consultas frecuentes
      profiles:       'id',
      jugadores:      'id, owner_id',
      alineaciones:   'id, owner_id',
      entrenamientos: 'id, author_id, categoria, nivel, es_sugerido',
      tacticas:       'id, author_id, tipo, formato, es_sugerido',
      favoritos:      'id, user_id, item_id',
    });
  }
}

// Instancia única (singleton) exportada
export const db = new AtleticoQuarteDB();
