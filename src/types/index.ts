// ============================================================
// TIPOS GLOBALES — CD Atlético Quarte
// ============================================================

// --- PERFIL LOCAL ---
export type Rol = 'entrenador' | 'coordinador' | 'admin';

export interface Profile {
  id: string;
  nombre: string;
  equipo: string;          // Ej. "Alevín A", "Infantil B"
  rol: Rol;
  avatar_b64?: string;     // Foto en base64 (opcional)
  creado_en: number;       // timestamp
}

// --- JUGADOR ---
export type Posicion = 'POR' | 'DEF' | 'MED' | 'DEL';

export interface Jugador {
  id: string;
  owner_id: string;        // Perfil local propietario
  nombre: string;
  apellidos: string;
  dorsal: number;
  posicion: Posicion;
  foto_b64?: string;
  notas?: string;
  creado_en: number;
}

// --- ALINEACIÓN ---
export type FormatoPartido = 'F7' | 'F11';

export interface JugadorEnCampo {
  jugador_id: string;
  x: number;               // Posición relativa en el canvas (0-1)
  y: number;
  en_campo: boolean;       // true = titular, false = banquillo
}

export interface Alineacion {
  id: string;
  owner_id: string;
  nombre: string;
  formato: FormatoPartido;
  formacion: string;       // Ej. "1-4-3-3"
  posiciones: JugadorEnCampo[];
  creado_en: number;
  actualizado_en: number;
}

// --- PIZARRA (keyframes animados) ---
export interface ElementoPizarra {
  id: string;
  tipo: 'jugador_azul' | 'jugador_rojo' | 'portero_azul' | 'portero_rojo'
      | 'balon' | 'cono' | 'pica' | 'escalera' | 'miniporteria'
      | 'flecha_pase' | 'flecha_movimiento' | 'zona' | 'texto';
  x: number;
  y: number;
  rotacion?: number;
  dorsal?: number;
  etiqueta?: string;
  color?: string;
  // Para flechas / líneas:
  x2?: number;
  y2?: number;
}

export interface KeyframePizarra {
  id: string;
  elementos: ElementoPizarra[];
  duracion_ms: number;     // duración de la transición al siguiente frame
}

export interface EscenapPizarra {
  formato: FormatoPartido;
  keyframes: KeyframePizarra[];
}

// --- ENTRENAMIENTO ---
export type CategoriaEntrenamiento =
  | 'ataque' | 'defensa' | 'porteros' | 'posesion'
  | 'finalizacion' | 'fisico' | 'otros';

export type NivelEdad = 'prebenjamin' | 'benjamin' | 'alevin'
  | 'infantil' | 'cadete' | 'juvenil' | 'senior' | 'todos';

export interface Entrenamiento {
  id: string;
  author_id: string;
  titulo: string;
  categoria: CategoriaEntrenamiento;
  nivel: NivelEdad;
  duracion_min: number;
  num_jugadores_min: number;
  num_jugadores_max: number;
  material: string[];
  descripcion: string;
  instrucciones: string[];  // pasos numerados
  fotos_b64: string[];
  pizarra_data?: string;    // JSON serializado de EscenapPizarra
  es_sugerido: boolean;     // Curado por admin/coordinador del club
  creado_en: number;
  actualizado_en: number;
}

// --- TÁCTICA ---
export type TipoTactica =
  | 'sistema' | 'balon_parado' | 'presion'
  | 'salida_balon' | 'transicion' | 'otros';

export interface Tactica {
  id: string;
  author_id: string;
  titulo: string;
  tipo: TipoTactica;
  formato: FormatoPartido;
  descripcion: string;
  instrucciones: string[];
  fotos_b64: string[];
  pizarra_data?: string;    // JSON serializado de EscenapPizarra
  es_sugerido: boolean;
  creado_en: number;
  actualizado_en: number;
}

// --- FAVORITO ---
export type TipoFavorito = 'entrenamiento' | 'tactica';

export interface Favorito {
  id: string;
  user_id: string;
  tipo: TipoFavorito;
  item_id: string;
  creado_en: number;
}
