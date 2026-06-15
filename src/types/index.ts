// ============================================================
// TIPOS GLOBALES — CD Atlético Quarte
// ============================================================

// --- PERFIL LOCAL ---
export type Rol = 'entrenador' | 'coordinador' | 'admin';

export interface Profile {
  id: string;
  nombre: string;
  // team_ids: UUIDs fijos de los equipos que gestiona este entrenador.
  // Se codifica en la columna 'equipo' de Supabase como JSON array string.
  team_ids: string[];
  rol: Rol;
  avatar_b64?: string;     // Foto en base64 (opcional)
  creado_en: number;       // timestamp
  // Campo legacy — ya no se usa directamente; se mantiene por compatibilidad
  // con partes de la UI que aún leen perfil.equipo como string de display.
  equipo: string;
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

// --- PIZARRA TÁCTICA LIBRE ---
export interface JugadorCanvas {
  id: string;
  tipo: 'local' | 'rival' | 'balon' | 'cono';
  dorsal?: number;
  nombre?: string;
  x: number;
  y: number;
  esPortero?: boolean;
}

export interface TrazoCanvas {
  id: string;
  puntos: number[];
  color: string;
  grosor: number;
}

export interface FlechaCanvas {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
  estilo: 'solida' | 'discontinua';
  grosor: number;
}

export interface ZonaCanvas {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
}

export interface TextoCanvas {
  id: string;
  x: number;
  y: number;
  texto: string;
  color: string;
}

export interface DatosPizarra {
  jugadores: JugadorCanvas[];
  trazos:    TrazoCanvas[];
  flechas:   FlechaCanvas[];
  zonas:     ZonaCanvas[];
  textos:    TextoCanvas[];
}

export interface PizarraTactica {
  id:             string;
  coach_id:       string;
  titulo:         string;
  formato:        FormatoPartido;
  canvas_data:    DatosPizarra;
  creado_en:      number;
  actualizado_en: number;
}

// --- PARTIDO (MATCH) ---
export type MatchStatus    = 'scheduled' | 'played' | 'cancelled' | 'postponed';
export type MatchLocation  = 'home' | 'away' | 'neutral';
export type MatchEventType = 'goal' | 'assist' | 'yellow_card' | 'red_card' | 'mvp';

export interface Match {
  id:            string;
  team_id:       string;
  season:        string;
  date:          string;        // "YYYY-MM-DD"
  time?:         string;        // "HH:MM" opcional
  rival_name:    string;
  location:      MatchLocation;
  competition?:  string;
  goals_for:     number;
  goals_against: number;
  status:        MatchStatus;
  notes?:        string;
  created_at:    string;
  updated_at:    string;
}

export interface MatchEvent {
  id:          string;
  match_id:    string;
  player_id?:  string;
  player_name?: string;
  event_type:  MatchEventType;
  minute?:     number;
  created_at:  string;
}

// --- CONVOCATORIA DE PARTIDO ---
export type MatchSquadStatus = 'called' | 'confirmed' | 'declined' | 'doubt' | 'injured';

export interface MatchSquad {
  id:                string;
  match_id:          string;
  player_id:         string;
  status:            MatchSquadStatus;
  position_in_squad: number;
  is_starter:        boolean;
  jersey_number?:    number;
  notes?:            string;
  created_at:        string;
}

// --- ASISTENCIA A ENTRENAMIENTOS ---
export type AttendanceStatus = 'present' | 'absent' | 'justified' | 'late';

export interface TrainingAttendance {
  id:          string;
  training_id: string;
  player_id:   string;
  status:      AttendanceStatus;
  notes?:      string;
  recorded_at: string;
}

// --- COMPETICIÓN (datos estáticos legacy) ---
export interface Partido {
  id:          string;
  equipo:      string;   // "Alevín A"
  rival:       string;   // "SD Zaragoza B"
  fecha:       string;   // ISO date "2025-10-12"
  hora:        string;   // "17:00"
  lugar:       string;   // "Campo Municipal Cuarte de Huerva"
  esLocal:     boolean;
  competicion: string;   // "Liga Aragón Alevín"
  jornada:     number;
}

export interface ClasificacionRow {
  posicion:        number;
  equipo:          string;
  pj:              number;  // Partidos jugados
  pg:              number;  // Ganados
  pe:              number;  // Empatados
  pp:              number;  // Perdidos
  gf:              number;  // Goles a favor
  gc:              number;  // Goles en contra
  pts:             number;  // Puntos
  esNuestroEquipo: boolean;
}
