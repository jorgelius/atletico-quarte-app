// ============================================================
// STORE: Pizarras Tácticas (Zustand)
// ============================================================
import { create } from 'zustand';
import { dataProvider } from '@/data';
import type { PizarraTactica } from '@/types';

interface PizarrasState {
  items:    PizarraTactica[];
  cargando: boolean;

  cargar:  (coachId: string) => Promise<void>;
  guardar: (p: PizarraTactica) => Promise<void>;
  borrar:  (id: string) => Promise<void>;
}

export const usePizarrasStore = create<PizarrasState>((set) => ({
  items:    [],
  cargando: false,

  cargar: async (coachId) => {
    set({ cargando: true });
    const items = await dataProvider.getPizarras(coachId);
    set({ items, cargando: false });
  },

  guardar: async (p) => {
    await dataProvider.savePizarra(p);
    set(s => {
      const idx = s.items.findIndex(i => i.id === p.id);
      if (idx >= 0) {
        const next = [...s.items];
        next[idx] = p;
        return { items: next };
      }
      return { items: [p, ...s.items] };
    });
  },

  borrar: async (id) => {
    await dataProvider.deletePizarra(id);
    set(s => ({ items: s.items.filter(i => i.id !== id) }));
  },
}));
