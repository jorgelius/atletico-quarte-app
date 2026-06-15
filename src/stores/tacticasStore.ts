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

  cargar: async (teamId) => {
    set({ cargando: true });
    // Load tactics: team-specific + global suggested
    const [teamItems, sugeridos, favs] = await Promise.all([
      dataProvider.getTacticas({ author_id: teamId }),
      dataProvider.getTacticas({ solo_sugeridos: true }),
      dataProvider.getFavoritos(teamId),
    ]);
    // Merge deduplicating by id (team items take precedence)
    const map = new Map<string, (typeof teamItems)[0]>();
    sugeridos.forEach(t => map.set(t.id, t));
    teamItems.forEach(t => map.set(t.id, t));
    set({ items: [...map.values()], favoritos: favs.filter(f => f.tipo === 'tactica'), cargando: false });
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
