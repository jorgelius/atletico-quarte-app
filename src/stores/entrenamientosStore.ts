import { create } from 'zustand';
import { dataProvider } from '@/data';
import type { Entrenamiento, Favorito } from '@/types';
import type { FiltroEntrenamiento } from '@/data';

interface EntrenamientosState {
  items:       Entrenamiento[];
  favoritos:   Favorito[];
  cargando:    boolean;
  filtro:      FiltroEntrenamiento;

  cargar:       (userId: string) => Promise<void>;
  setFiltro:    (f: Partial<FiltroEntrenamiento>) => void;
  guardar:      (e: Entrenamiento) => Promise<void>;
  borrar:       (id: string, authorId: string) => Promise<void>;
  toggleFav:    (userId: string, itemId: string) => Promise<void>;
  isFav:        (itemId: string) => boolean;
  marcarSugerido: (id: string, valor: boolean) => Promise<void>;
}

export const useEntrenamientosStore = create<EntrenamientosState>((set, get) => ({
  items:     [],
  favoritos: [],
  cargando:  false,
  filtro:    {},

  cargar: async (userId) => {
    set({ cargando: true });
    const [items, favoritos] = await Promise.all([
      dataProvider.getEntrenamientos(),
      dataProvider.getFavoritos(userId),
    ]);
    set({ items, favoritos: favoritos.filter(f => f.tipo === 'entrenamiento'), cargando: false });
  },

  setFiltro: (f) => set(s => ({ filtro: { ...s.filtro, ...f } })),

  guardar: async (e) => {
    await dataProvider.saveEntrenamiento(e);
    set(s => ({
      items: s.items.find(i => i.id === e.id)
        ? s.items.map(i => i.id === e.id ? e : i)
        : [e, ...s.items],
    }));
  },

  borrar: async (id, authorId) => {
    const item = get().items.find(i => i.id === id);
    if (!item || item.author_id !== authorId) return;
    await dataProvider.deleteEntrenamiento(id);
    set(s => ({ items: s.items.filter(i => i.id !== id) }));
  },

  toggleFav: async (userId, itemId) => {
    const isFav = get().favoritos.some(f => f.item_id === itemId);
    if (isFav) {
      await dataProvider.removeFavorito(userId, itemId);
      set(s => ({ favoritos: s.favoritos.filter(f => f.item_id !== itemId) }));
    } else {
      const fav: Favorito = { id: crypto.randomUUID(), user_id: userId, tipo: 'entrenamiento', item_id: itemId, creado_en: Date.now() };
      await dataProvider.addFavorito(fav);
      set(s => ({ favoritos: [...s.favoritos, fav] }));
    }
  },

  isFav: (itemId) => get().favoritos.some(f => f.item_id === itemId),

  marcarSugerido: async (id, valor) => {
    const item = get().items.find(i => i.id === id);
    if (!item) return;
    const updated = { ...item, es_sugerido: valor };
    await dataProvider.saveEntrenamiento(updated);
    set(s => ({ items: s.items.map(i => i.id === id ? updated : i) }));
  },
}));
