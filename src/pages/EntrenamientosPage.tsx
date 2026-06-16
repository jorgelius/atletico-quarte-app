// ============================================================
// EntrenamientosPage — Fase 4 completa
// Tabs: Biblioteca | Favoritos | Mis ejercicios
// ============================================================
import { useEffect, useState } from 'react';
import { Dumbbell, Plus, Star, BookOpen, User } from 'lucide-react';
import { usePerfilStore } from '@/stores/perfilStore';
import { useEntrenamientosStore } from '@/stores/entrenamientosStore';
import EntrenamientoCard from '@/components/entrenamientos/EntrenamientoCard';
import EntrenamientoDetalle from '@/components/entrenamientos/EntrenamientoDetalle';
import EntrenamientoForm from '@/components/entrenamientos/EntrenamientoForm';
import FiltrosBar from '@/components/entrenamientos/FiltrosBar';
import type { Entrenamiento } from '@/types';

type Tab = 'biblioteca' | 'favoritos' | 'mios';
type View = { mode: 'list' } | { mode: 'detail'; id: string } | { mode: 'form'; item?: Entrenamiento };

export default function EntrenamientosPage() {
  const { perfil }  = usePerfilStore();
  const store       = useEntrenamientosStore();
  const [tab,  setTab]  = useState<Tab>('biblioteca');
  const [view, setView] = useState<View>({ mode: 'list' });

  useEffect(() => {
    if (perfil) store.cargar(perfil.id);
  }, [perfil?.id]);

  if (!perfil) return null;
  const canSugerir = perfil.rol === 'admin' || perfil.rol === 'coordinador';

  // Filtra según tab activo
  const filteredItems = (() => {
    let base = store.items;
    if (tab === 'favoritos') base = base.filter(e => store.isFav(e.id));
    if (tab === 'mios')      base = base.filter(e => e.author_id === perfil.id);

    // Aplica filtros de texto/categoría/nivel
    if (store.filtro.texto)    base = base.filter(e => e.titulo.toLowerCase().includes(store.filtro.texto!.toLowerCase()) || e.descripcion.toLowerCase().includes(store.filtro.texto!.toLowerCase()));
    if (store.filtro.categoria) base = base.filter(e => e.categoria === store.filtro.categoria);
    if (store.filtro.nivel)    base = base.filter(e => e.nivel === store.filtro.nivel || e.nivel === 'todos');
    return base.sort((a, b) => b.creado_en - a.creado_en);
  })();

  // ── Vistas de detalle / formulario ──
  if (view.mode === 'detail') {
    const item = store.items.find(e => e.id === (view as { mode: 'detail'; id: string }).id);
    if (!item) { setView({ mode: 'list' }); return null; }
    return (
      <EntrenamientoDetalle
        item={item}
        isFav={store.isFav(item.id)}
        canEdit={item.author_id === perfil.id || canSugerir}
        onBack={() => setView({ mode: 'list' })}
        onToggleFav={() => store.toggleFav(perfil.id, item.id)}
        onEdit={() => setView({ mode: 'form', item })}
        onBorrar={async () => { await store.borrar(item.id, perfil.id); setView({ mode: 'list' }); }}
      />
    );
  }

  if (view.mode === 'form') {
    const formItem = (view as { mode: 'form'; item?: Entrenamiento }).item;
    return (
      <EntrenamientoForm
        inicial={formItem}
        authorId={perfil.id}
        canSugerir={canSugerir}
        onGuardar={async e => { await store.guardar(e); setView({ mode: 'list' }); }}
        onCancelar={() => setView({ mode: 'list' })}
      />
    );
  }

  // ── Vista de lista ──
  const tabs = [
    { id: 'biblioteca', icon: <BookOpen size={14}/>, label: 'Todo' },
    { id: 'favoritos',  icon: <Star size={14}/>,     label: 'Favs' },
    { id: 'mios',       icon: <User size={14}/>,     label: 'Míos' },
  ] as const;

  return (
    <div className="flex flex-col min-h-screen bg-quarte-gris">
      {/* Cabecera */}
      <div className="bg-quarte-rojo text-white px-4 pt-4 pb-0">
        <div className="flex items-center gap-3 pb-3">
          <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
            <Dumbbell size={20} />
          </div>
          <div className="flex-1">
            <h1 className="font-titulo text-lg font-bold">Entrenamientos</h1>
            <p className="text-red-200 text-xs">{store.items.length} ejercicios en la biblioteca</p>
          </div>
          <button onClick={() => setView({ mode: 'form' })}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/20 hover:bg-white/30">
            <Plus size={20} />
          </button>
        </div>
        {/* Tabs */}
        <div className="flex">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-titulo font-semibold
                          transition-colors border-b-2
                          ${tab === t.id ? 'text-white border-white' : 'text-red-300 border-transparent hover:text-white'}`}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-4 max-w-lg mx-auto flex flex-col gap-3">
          {/* Filtros (solo en biblioteca) */}
          {tab === 'biblioteca' && (
            <FiltrosBar filtro={store.filtro} onChange={store.setFiltro} />
          )}

          {/* Lista */}
          {store.cargando ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-3 border-quarte-rojo border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-gray-400 gap-3">
              <Dumbbell size={48} className="opacity-20" />
              <p className="font-titulo font-semibold">
                {tab === 'favoritos' ? 'Sin favoritos aún' :
                 tab === 'mios'      ? 'No has publicado ejercicios' :
                 'Sin resultados'}
              </p>
              <p className="text-sm text-center">
                {tab === 'favoritos' ? 'Pulsa ⭐ en cualquier ejercicio para guardarlo aquí' :
                 tab === 'mios'      ? 'Crea tu primer ejercicio con el botón +' :
                 'Prueba con otros filtros'}
              </p>
            </div>
          ) : (
            filteredItems.map(item => (
              <EntrenamientoCard
                key={item.id}
                item={item}
                isFav={store.isFav(item.id)}
                onOpen={() => setView({ mode: 'detail', id: item.id })}
                onToggleFav={() => store.toggleFav(perfil.id, item.id)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
