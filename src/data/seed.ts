// ============================================================
// SEED — datos de ejemplo para CD Atlético Quarte
// Se ejecuta una sola vez al primer arranque
// ============================================================
import { dataProvider } from './index';
import type { Entrenamiento, Tactica } from '@/types';

const SEED_KEY = 'atq_seed_v1';

const ENTRENAMIENTOS_SEED: Entrenamiento[] = [
  {
    id: 'seed-ent-001',
    author_id: 'sistema',
    titulo: 'Rondo 3 contra 1 — Posesión básica',
    categoria: 'posesion',
    nivel: 'benjamin',
    duracion_min: 15,
    num_jugadores_min: 5,
    num_jugadores_max: 8,
    material: ['Balones (2)', 'Conos (8)'],
    descripcion: 'Ejercicio clásico de posesión en espacio reducido. Tres jugadores forman un triángulo y deben mantener la pelota ante un defensor central. Trabaja el juego de uno-dos, el primer toque y la orientación del cuerpo.',
    instrucciones: [
      'Delimita un cuadrado de 8×8 m con conos.',
      'Coloca 3 jugadores en los vértices y 1 defensor en el centro.',
      'El grupo de 3 debe dar 8 pases consecutivos sin perder el balón.',
      'Cuando el defensor roba, él y el jugador que perdió el balón intercambian roles.',
      'Progresión: reduce el espacio a 6×6 m o añade un segundo defensor.',
    ],
    fotos_b64: [],
    pizarra_data: undefined,
    es_sugerido: true,
    creado_en: Date.now() - 7 * 86400000,
    actualizado_en: Date.now() - 7 * 86400000,
  },
  {
    id: 'seed-ent-002',
    author_id: 'sistema',
    titulo: 'Conducción + cambio de ritmo',
    categoria: 'fisico',
    nivel: 'prebenjamin',
    duracion_min: 12,
    num_jugadores_min: 4,
    num_jugadores_max: 10,
    material: ['Balones (1 por jugador)', 'Conos (10)', 'Picas (4)'],
    descripcion: 'Circuito de conducción con cambios de ritmo para trabajar la habilidad técnica individual y la velocidad. Ideal para calentamiento o bloque técnico al inicio del entrenamiento.',
    instrucciones: [
      'Monta un circuito en zigzag con 5 conos separados 1,5 m entre sí.',
      'Al llegar al final del zigzag, conducción rápida 10 m hasta el siguiente cono.',
      'Regreso al punto de partida trotando con el balón.',
      'Cada jugador realiza 4 repeticiones.',
      'Competición: la mitad de la fila contra la otra mitad para motivar.',
    ],
    fotos_b64: [],
    pizarra_data: undefined,
    es_sugerido: true,
    creado_en: Date.now() - 5 * 86400000,
    actualizado_en: Date.now() - 5 * 86400000,
  },
  {
    id: 'seed-ent-003',
    author_id: 'sistema',
    titulo: 'Presión alta tras pérdida de balón',
    categoria: 'defensa',
    nivel: 'infantil',
    duracion_min: 25,
    num_jugadores_min: 10,
    num_jugadores_max: 16,
    material: ['Balones (2)', 'Petos (2 colores)', 'Conos (12)'],
    descripcion: 'Trabajo de presión colectiva inmediata tras perder el balón. Se entrena el concepto de "pressing" coordinado: los 3-4 jugadores más cercanos al balón cierran los espacios de forma sincronizada.',
    instrucciones: [
      'Divide el grupo en dos equipos de 6-8 jugadores. Un equipo ataca, el otro defiende en bloque bajo.',
      'Cuando el equipo atacante pierde el balón, los 3 jugadores más cercanos ejecutan pressing inmediato en menos de 3 segundos.',
      'El equipo que recupera el balón tiene 5 segundos para sacarlo de la zona de presión.',
      'Rotación cada 4 minutos para que todos pasen por el rol de presionador.',
      'Criterio de éxito: recuperar el balón en los primeros 6 segundos tras la pérdida.',
    ],
    fotos_b64: [],
    pizarra_data: undefined,
    es_sugerido: true,
    creado_en: Date.now() - 3 * 86400000,
    actualizado_en: Date.now() - 3 * 86400000,
  },
  {
    id: 'seed-ent-004',
    author_id: 'sistema',
    titulo: 'Combinación + remate a portería',
    categoria: 'finalizacion',
    nivel: 'alevin',
    duracion_min: 20,
    num_jugadores_min: 8,
    num_jugadores_max: 14,
    material: ['Balones (4)', 'Conos (6)', 'Portería'],
    descripcion: 'Ejercicio de finalización que combina circulación de balón y llegada al área. Trabaja el remate a la carrera, el control orientado y la definición bajo presión del portero.',
    instrucciones: [
      'Coloca dos filas de jugadores a 20 m de la portería a distintos ángulos.',
      'El jugador de la fila A pasa al jugador de la fila B que entra en profundidad.',
      'El receptor controla orientado, regatea el cono y remata a portería.',
      'Variante: añade un defensor pasivo que complica el control.',
      'Mínimo 3 remates por jugador. El portero trabaja 5 min y luego rota.',
    ],
    fotos_b64: [],
    pizarra_data: undefined,
    es_sugerido: true,
    creado_en: Date.now() - 1 * 86400000,
    actualizado_en: Date.now() - 1 * 86400000,
  },
];

const TACTICAS_SEED: Tactica[] = [
  {
    id: 'seed-tac-001',
    author_id: 'sistema',
    titulo: 'Salida de balón en corto — 1-4-3-3',
    tipo: 'salida_balon',
    formato: 'F11',
    descripcion: 'Sistema de juego base del primer equipo. El portero inicia el juego con los centrales abiertos y los pivotes ofreciendo opción de pase corto. El objetivo es superar la primera línea de presión rival con circulación y no con pelotazos.',
    instrucciones: [
      'El portero siempre tiene dos opciones: central izquierdo o central derecho.',
      'Los pivotes bajan a recibir entre líneas para crear superioridad numérica.',
      'Los laterales suben a dar amplitud y los extremos se cierran al interior.',
      'Si hay presión en el inicio, el portero juega largo al delantero centro como última opción.',
      'Tras recuperar la posesión, volver siempre al inicio del patrón.',
    ],
    fotos_b64: [],
    pizarra_data: undefined,
    es_sugerido: true,
    creado_en: Date.now() - 2 * 86400000,
    actualizado_en: Date.now() - 2 * 86400000,
  },
];

export async function runSeedIfNeeded() {
  if (localStorage.getItem(SEED_KEY)) return;
  for (const e of ENTRENAMIENTOS_SEED) {
    await dataProvider.saveEntrenamiento(e);
  }
  for (const t of TACTICAS_SEED) {
    await dataProvider.saveTactica(t);
  }
  localStorage.setItem(SEED_KEY, '1');
  console.info('[Atlético Quarte] Seed inicial cargado ✓');
}
