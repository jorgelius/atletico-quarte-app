// ============================================================
// STORE: Plantilla (Zustand)
// ============================================================
import { create } from 'zustand';
import { dataProvider } from '@/data';
import type { Jugador, Alineacion, FormatoPartido } from '@/types';
import {
  getFormaciones,
  getNumTitulares,
  getNumBanquillo,
  type PosFormacion,
} from '@/components/plantilla/formaciones';

export interface SlotJugador {
  slotIdx: number;    // 0=GK, 1..n = titulares, n+1.. = banquillo
  jugadorId: string | null;
  x: number;          // posición en campo (relativa 0-1)
  y: number;
  esTitular: boolean;
}

interface PlantillaState {
  // Datos persistidos
  jugadores: Jugador[];
  alineacionesGuardadas: Alineacion[];

  // Estado de sesión (en memoria)
  formato: FormatoPartido;
  formacion: string;
  slots: SlotJugador[];       // todos los slots (titulares + banquillo)
  seleccionado: string | null; // slotIdx seleccionado (como string para el store)
  cargando: boolean;

  // Acciones de carga
  cargar: (ownerId: string) => Promise<void>;

  // CRUD jugadores
  agregarJugador: (j: Jugador) => Promise<void>;
  editarJugador:  (j: Jugador) => Promise<void>;
  borrarJugador:  (id: string) => Promise<void>;

  // Alineación
  cambiarFormato:   (f: FormatoPartido) => void;
  cambiarFormacion: (f: string) => void;
  seleccionarSlot:  (idx: number | null) => void;
  moverASlot:       (destIdx: number) => void;  // mueve seleccionado → destino
  asignarJugadorASlot: (jugadorId: string, slotIdx: number) => void;
  limpiarSlot:      (slotIdx: number) => void;

  // Guardar / cargar alineación
  guardarAlineacion: (ownerId: string, nombre: string) => Promise<void>;
  cargarAlineacion:  (a: Alineacion) => void;
  borrarAlineacion:  (id: string) => Promise<void>;
}

function buildSlots(formato: FormatoPartido, formacion: string): SlotJugador[] {
  const posiciones: PosFormacion[] = getFormaciones(formato)[formacion] ?? [];
  const numTitulares = getNumTitulares(formato);
  const numBanquillo = getNumBanquillo(formato);

  const slots: SlotJugador[] = [];

  // Slots de titulares (incluye portero)
  for (let i = 0; i < numTitulares; i++) {
    const pos = posiciones[i] ?? { x: 0.5, y: 0.5 };
    slots.push({ slotIdx: i, jugadorId: null, x: pos.x, y: pos.y, esTitular: true });
  }

  // Slots de banquillo
  for (let i = 0; i < numBanquillo; i++) {
    slots.push({ slotIdx: numTitulares + i, jugadorId: null, x: 0, y: 0, esTitular: false });
  }

  return slots;
}

const DEFAULT_FORMATO: FormatoPartido = 'F11';
const DEFAULT_FORMACION = '4-4-2';

export const usePlantillaStore = create<PlantillaState>((set, get) => ({
  jugadores: [],
  alineacionesGuardadas: [],
  formato:    DEFAULT_FORMATO,
  formacion:  DEFAULT_FORMACION,
  slots:      buildSlots(DEFAULT_FORMATO, DEFAULT_FORMACION),
  seleccionado: null,
  cargando:   false,

  cargar: async (ownerId) => {
    set({ cargando: true });
    const [jugadores, alineaciones] = await Promise.all([
      dataProvider.getJugadores(ownerId),
      dataProvider.getAlineaciones(ownerId),
    ]);
    const { formato, formacion } = get();

    // Auto-aplicar la alineación más reciente si existe
    const lastAlin = alineaciones.length > 0
      ? [...alineaciones].sort((a, b) => b.actualizado_en - a.actualizado_en)[0]
      : null;

    if (lastAlin) {
      const activeFormato   = lastAlin.formato;
      const activeFormacion = lastAlin.formacion;
      const slots = buildSlots(activeFormato, activeFormacion);

      // Colocar titulares guardados en sus posiciones
      lastAlin.posiciones.forEach(p => {
        const slot = slots.find(s =>
          s.esTitular &&
          Math.abs(s.x - p.x) < 0.05 &&
          Math.abs(s.y - p.y) < 0.05
        );
        if (slot) slot.jugadorId = p.jugador_id;
      });

      // Rellenar banquillo con jugadores no titulares
      const enCampoIds = new Set(lastAlin.posiciones.map(p => p.jugador_id));
      const enBanquillo = jugadores.filter(j => !enCampoIds.has(j.id));
      const numTit = getNumTitulares(activeFormato);
      enBanquillo.forEach((j, i) => {
        const idx = numTit + i;
        if (idx < slots.length) slots[idx].jugadorId = j.id;
      });

      set({ jugadores, alineacionesGuardadas: alineaciones, slots,
            formato: activeFormato, formacion: activeFormacion, cargando: false });
    } else {
      // Sin alineaciones guardadas: todos al banquillo
      const slots = buildSlots(formato, formacion);
      const numTitulares = getNumTitulares(formato);
      jugadores.forEach((j, i) => {
        const banqIdx = numTitulares + i;
        if (banqIdx < slots.length) slots[banqIdx].jugadorId = j.id;
      });
      set({ jugadores, alineacionesGuardadas: alineaciones, slots, cargando: false });
    }
  },

  agregarJugador: async (j) => {
    await dataProvider.saveJugador(j);
    const slots = [...get().slots];
    const emptyBanq = slots.find(s => !s.esTitular && !s.jugadorId);
    if (emptyBanq) emptyBanq.jugadorId = j.id;
    set(s => ({ jugadores: [...s.jugadores, j], slots }));
  },

  editarJugador: async (j) => {
    await dataProvider.saveJugador(j);
    set(s => ({ jugadores: s.jugadores.map(jj => jj.id === j.id ? j : jj) }));
  },

  borrarJugador: async (id) => {
    await dataProvider.deleteJugador(id);
    const slots = get().slots.map(s =>
      s.jugadorId === id ? { ...s, jugadorId: null } : s
    );
    set(s => ({ jugadores: s.jugadores.filter(j => j.id !== id), slots }));
  },

  cambiarFormato: (f) => {
    const formacion = Object.keys(getFormaciones(f))[0];
    set({ formato: f, formacion, slots: buildSlots(f, formacion), seleccionado: null });
  },

  cambiarFormacion: (f) => {
    const { formato, slots } = get();
    const newSlots = buildSlots(formato, f);
    // Mantener jugadores titulares en las posiciones que quepan
    slots.filter(s => s.esTitular).forEach((s, i) => {
      if (newSlots[i]) newSlots[i].jugadorId = s.jugadorId;
    });
    // Mantener banquillo
    const numTit = getNumTitulares(formato);
    slots.filter(s => !s.esTitular).forEach((s, i) => {
      if (newSlots[numTit + i]) newSlots[numTit + i].jugadorId = s.jugadorId;
    });
    set({ formacion: f, slots: newSlots, seleccionado: null });
  },

  seleccionarSlot: (idx) => {
    set({ seleccionado: idx !== null ? String(idx) : null });
  },

  moverASlot: (destIdx) => {
    const { seleccionado, slots } = get();
    if (seleccionado === null) return;
    const srcIdx = parseInt(seleccionado);
    if (srcIdx === destIdx) { set({ seleccionado: null }); return; }
    const newSlots = [...slots];
    const srcSlot = { ...newSlots[srcIdx] };
    const dstSlot = { ...newSlots[destIdx] };
    // Intercambia jugadores
    newSlots[srcIdx] = { ...srcSlot, jugadorId: dstSlot.jugadorId };
    newSlots[destIdx] = { ...dstSlot, jugadorId: srcSlot.jugadorId };
    set({ slots: newSlots, seleccionado: null });
  },

  asignarJugadorASlot: (jugadorId, slotIdx) => {
    const slots = get().slots.map(s =>
      s.slotIdx === slotIdx ? { ...s, jugadorId } : s
    );
    set({ slots });
  },

  limpiarSlot: (slotIdx) => {
    const slots = get().slots.map(s =>
      s.slotIdx === slotIdx ? { ...s, jugadorId: null } : s
    );
    set({ slots });
  },

  guardarAlineacion: async (ownerId, nombre) => {
    const { formato, formacion, slots, alineacionesGuardadas } = get();
    const numTit = getNumTitulares(formato);
    const posiciones = slots.slice(0, numTit)
      .filter(s => s.jugadorId)
      .map(s => ({ jugador_id: s.jugadorId!, x: s.x, y: s.y, en_campo: true }));

    const existing = alineacionesGuardadas.find(a => a.nombre === nombre);
    const a: Alineacion = {
      id: existing?.id ?? crypto.randomUUID(),
      owner_id: ownerId,
      nombre,
      formato,
      formacion,
      posiciones,
      creado_en: existing?.creado_en ?? Date.now(),
      actualizado_en: Date.now(),
    };
    // Lanza excepción si Supabase falla (check() en RemoteDataProvider ya hace throw)
    await dataProvider.saveAlineacion(a);
    set(s => ({
      alineacionesGuardadas: existing
        ? s.alineacionesGuardadas.map(x => x.id === a.id ? a : x)
        : [...s.alineacionesGuardadas, a],
    }));
  },

  cargarAlineacion: (a) => {
    const slots = buildSlots(a.formato, a.formacion);
    a.posiciones.forEach(p => {
      const slot = slots.find(s => s.esTitular && s.slotIdx === slots.findIndex(ss => ss.esTitular && Math.abs(ss.x - p.x) < 0.05 && Math.abs(ss.y - p.y) < 0.05));
      if (slot) slot.jugadorId = p.jugador_id;
    });
    set({ formato: a.formato, formacion: a.formacion, slots, seleccionado: null });
  },

  borrarAlineacion: async (id) => {
    await dataProvider.deleteAlineacion(id);
    set(s => ({ alineacionesGuardadas: s.alineacionesGuardadas.filter(a => a.id !== id) }));
  },
}));
