// ============================================================
// Horarios de entrenamiento predeterminados del CD Atlético Quarte
// Extraídos del cuadrante oficial de instalaciones (imagen).
// Se cargan en localStorage la primera vez que un entrenador
// accede a la sección de entrenamiento de su equipo.
// dia_semana: 1=Lun, 2=Mar, 3=Mié, 4=Jue, 5=Vie
// ============================================================
import type { HorarioEntrenamiento } from '@/types';

type HorarioSeed = Omit<HorarioEntrenamiento, 'id' | 'team_id' | 'activo'>;

export const DEFAULT_HORARIOS: Record<string, HorarioSeed[]> = {

  // ─── JUVENIL A ─── (Campo F11 Mar + Campo F7-1 Jue)
  '10000000-0000-0000-0000-00000000000c': [
    { dia_semana: 2, hora_inicio: '16:00', hora_fin: '17:20', campo: 'Campo F11' },
    { dia_semana: 4, hora_inicio: '16:00', hora_fin: '17:20', campo: 'Campo F7-1' },
  ],

  // ─── REGIONAL ─── (Campo F11 Mar + Campo F7-1 Jue)
  '10000000-0000-0000-0000-00000000000d': [
    { dia_semana: 2, hora_inicio: '21:00', hora_fin: '22:00', campo: 'Campo F11' },
    { dia_semana: 4, hora_inicio: '21:00', hora_fin: '22:00', campo: 'Campo F7-1' },
  ],

  // ─── CADETE ─── (Campo F11 Mar + Campo Anexo Jue)
  '10000000-0000-0000-0000-000000000006': [
    { dia_semana: 2, hora_inicio: '19:50', hora_fin: '21:00', campo: 'Campo F11' },
    { dia_semana: 4, hora_inicio: '19:00', hora_fin: '20:20', campo: 'Campo Anexo' },
  ],

  // ─── INFANTIL A (1a Infantil) ─── (Campo F11 Mar + Campo F7-1 Jue)
  '10000000-0000-0000-0000-000000000007': [
    { dia_semana: 2, hora_inicio: '17:25', hora_fin: '18:40', campo: 'Campo F11' },
    { dia_semana: 4, hora_inicio: '19:45', hora_fin: '21:00', campo: 'Campo F7-1' },
  ],

  // ─── INFANTIL B (2a Infantil A) ─── (Campo F11 Mar + Campo Anexo Jue)
  '10000000-0000-0000-0000-000000000008': [
    { dia_semana: 2, hora_inicio: '18:40', hora_fin: '19:50', campo: 'Campo F11' },
    { dia_semana: 4, hora_inicio: '20:30', hora_fin: '21:50', campo: 'Campo Anexo' },
  ],

  // ─── INFANTIL C (2a Infantil B) ─── (Campo F11 Mar + Campo F7-1 Vie)
  '10000000-0000-0000-0000-000000000009': [
    { dia_semana: 2, hora_inicio: '17:25', hora_fin: '18:40', campo: 'Campo F11' },
    { dia_semana: 5, hora_inicio: '20:30', hora_fin: '21:50', campo: 'Campo F7-1' },
  ],

  // ─── ALEVÍN A ─── (Campo F7-1 Mar + Campo F11 Jue)
  '10000000-0000-0000-0000-000000000004': [
    { dia_semana: 2, hora_inicio: '19:30', hora_fin: '20:30', campo: 'Campo F7-1' },
    { dia_semana: 4, hora_inicio: '19:00', hora_fin: '20:20', campo: 'Campo F11' },
  ],

  // ─── ALEVÍN B ─── (Campo Anexo Mar + Campo F11 Jue)
  '10000000-0000-0000-0000-000000000005': [
    { dia_semana: 2, hora_inicio: '19:30', hora_fin: '20:45', campo: 'Campo Anexo' },
    { dia_semana: 4, hora_inicio: '19:00', hora_fin: '20:20', campo: 'Campo F11' },
  ],

  // ─── 1ª BENJAMÍN A ─── (Campo F7-1 Mar + Campo F7-1 Jue)
  '10000000-0000-0000-0000-000000000001': [
    { dia_semana: 2, hora_inicio: '19:30', hora_fin: '20:30', campo: 'Campo F7-1' },
    { dia_semana: 4, hora_inicio: '18:35', hora_fin: '19:45', campo: 'Campo F7-1' },
  ],

  // ─── 2ª BENJAMÍN A ─── (Campo F7-1 Mar + Campo Anexo Jue)
  '10000000-0000-0000-0000-000000000002': [
    { dia_semana: 2, hora_inicio: '18:30', hora_fin: '19:30', campo: 'Campo F7-1' },
    { dia_semana: 4, hora_inicio: '17:30', hora_fin: '18:50', campo: 'Campo Anexo' },
  ],

  // ─── 2ª BENJAMÍN B ─── (Campo Anexo Mar + Campo F7-1 Jue)
  '10000000-0000-0000-0000-000000000003': [
    { dia_semana: 2, hora_inicio: '18:10', hora_fin: '19:25', campo: 'Campo Anexo' },
    { dia_semana: 4, hora_inicio: '18:35', hora_fin: '19:45', campo: 'Campo F7-1' },
  ],

  // ─── PREBENJAMÍN A ─── (Campo F7-1 Mar + Campo Anexo Vie)
  '10000000-0000-0000-0000-00000000000a': [
    { dia_semana: 2, hora_inicio: '18:30', hora_fin: '19:30', campo: 'Campo F7-1' },
    { dia_semana: 5, hora_inicio: '17:30', hora_fin: '19:00', campo: 'Campo Anexo' },
  ],

  // ─── PREBENJAMÍN B ─── (Campo F7-1 Mar + Campo F7-1 Jue)
  '10000000-0000-0000-0000-00000000000b': [
    { dia_semana: 2, hora_inicio: '17:30', hora_fin: '18:30', campo: 'Campo F7-1' },
    { dia_semana: 4, hora_inicio: '17:30', hora_fin: '18:30', campo: 'Campo F7-1' },
  ],
};
