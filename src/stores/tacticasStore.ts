import { create } from 'zustand';
import { dataProvider } from '@/data';
import type { Tactica, Favorito } from '@/types';

interface TacticasState {
  items:     Tactica[];
  favoritos: Favorito[];
  cargando:  boolean;

  cargar:      (userId: string) => Promise<void>;
  guardar:     (t: Tactica) => Promise<void>;
  borrar:      (id: string, authorId: string) => Promise<void>;
  toggleFav:   (userId: string, itemId: string) => Promise<void>;
  isFav:       (itemId: string) => boolean;
}

export const useTacticasStore = create<TacticasState>((set, get) => ({
  items:     [],
  favoritos: [],
  cargando:  false,

  cargar: async (userId) => {
    set({ cargando: true });
    const [items, favs] = await Promise.all([
      dataProvider.getTacticas(),
      dataProvider.getFavoritos(userId),
    ]);
    set({ items, favoritos: favs.filter(f => f.tipo === 'tactica'), cargando: false });
  },

  guardar: async (t) => {
    await dataProvider.saveTactica(t);
    set(s => ({
      items: s.items.find(i => i.id === t.id)
        ? s.items.map(i => i.id === t.id ? t : i)
        : [t, ...s.items],
    }));
  },

  borrar: async (id, authorId) => {
    const item = get().items.find(i => i.id === id);
    if (!item || item.author_id !== authorId) return;
    await dataProvider.deleteTactica(id);
    set(s => ({ items: s.items.filter(i => i.id !== id) }));
  },

  toggleFav: async (userId, itemId) => {
    const isFav = get().favoritos.some(f => f.item_id === itemId);
    if (isFav) {
      await dataProvider.removeFavorito(userId, itemId);
      set(s => ({ favoritos: s.favoritos.filter(f => f.item_id !== itemId) }));
    } else {
      const fav: Favorito = { id: crypto.randomUUID(), user_id: userId, tipo: 'tactica', item_id: itemId, creado_en: Date.now() };
      await dataProvider.addFavorito(fav);
      set(s => ({ favoritos: [...s.favoritos, fav] }));
    }
  },

  isFav: (itemId) => get().favoritos.some(f => f.item_id === itemId),
}));
