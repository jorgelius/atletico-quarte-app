// ============================================================
// EntrenamientosPage — Fase 4 completa
// Tabs: Biblioteca | Favoritos | Mis ejercicios
// ============================================================
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dumbbell, Plus, Star, BookOpen, User, Clock, MapPin, ChevronRight, Play, CheckCircle2 } from 'lucide-react';
import { usePerfilStore }         from '@/stores/perfilStore';
import { useEntrenamientosStore } from '@/stores/entrenamientosStore';
import { useSesionEntrenoStore }  from '@/stores/sesionEntrenoStore';
import EntrenamientoCard          from '@/components/entrenamientos/EntrenamientoCard';
import EntrenamientoDetalle       from '@/components/entrenamientos/EntrenamientoDetalle';
import EntrenamientoForm          from '@/components/entrenamientos/EntrenamientoForm';
import FiltrosBar                 from '@/components/entrenamientos/FiltrosBar';
import type { Entrenamiento }     from '@/types';

function formatFechaEntreno(fecha: string): string {
  const d   = new Date(fecha + 'T12:00:00');
  const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
  const man = new Date(hoy); man.setDate(man.getDate() + 1);
  const fd  = new Date(d);  fd.setHours(0, 0, 0, 0);
  if (fd.getTime() === hoy.getTime()) return 'HOY';
  if (fd.getTime() === man.getTime()) return 'MAÑANA';
  const DAYS   = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const MONTHS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  return `${DAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

type Tab = 'biblioteca' | 'favoritos' | 'mios';
type View = { mode: 'list' } | { mode: 'detail'; id: string } | { mode: 'form'; item?: Entrenamiento };

export default function EntrenamientosPage() {
  const { perfil, activeTeamId } = usePerfilStore();
  const store                    = useEntrenamientosStore();
  const sesionStore              = useSesionEntrenoStore();
  const navigate                 = useNavigate();
  const [tab,  setTab]  = useState<Tab>('biblioteca');
  const [view, setView] = useState<View>({ mode: 'list' });

  useEffect(() => {
    if (perfil) store.cargar(perfil.id);
    if (activeTeamId) sesionStore.cargar(activeTeamId);
  }, [perfil?.id, activeTeamId]);

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
        {/* Tabs — con indicador deslizante */}
        <div className="relative flex">
          <div className="absolute bottom-0 h-0.5 bg-white pointer-events-none"
            style={{
              width: '33.333%',
              transform: `translateX(${['biblioteca','favoritos','mios'].indexOf(tab) * 100}%)`,
              transition: 'transform .3s cubic-bezier(.5,0,.2,1)',
            }} />
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-titulo font-semibold
                          transition-colors
                          ${tab === t.id ? 'text-white' : 'text-red-300 hover:text-white'}`}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-4 max-w-lg mx-auto flex flex-col gap-3">

          {/* ── Próximo entrenamiento ── */}
          {(() => {
            const { sesion, horario, fecha } = sesionStore.getProximoEntreno();
            const hasHorario = sesionStore.horarios.some(h => h.team_id === activeTeamId && h.activo);
            if (!hasHorario && !sesion) return (
              <button onClick={() => navigate('/sesion-entreno')}
                className="flex items-center gap-3 bg-green-50 border border-green-100 rounded-2xl px-4 py-3
                           text-left hover:bg-green-100 transition-colors active:scale-[0.98]">
                <div className="w-9 h-9 rounded-xl bg-quarte-verde/20 flex items-center justify-center flex-shrink-0">
                  <Dumbbell size={16} className="text-quarte-verde" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-titulo font-semibold text-sm text-quarte-verde">Configura el horario de entrenamiento</p>
                  <p className="text-xs text-gray-500">Define días y horas para preparar sesiones</p>
                </div>
                <ChevronRight size={15} className="text-quarte-verde flex-shrink-0" />
              </button>
            );
            if (!fecha) return null;
            const statusBadge =
              sesion?.status === 'active'    ? { label: 'En curso',   cls: 'bg-green-200 text-green-800' } :
              sesion?.status === 'completed' ? { label: 'Finalizado', cls: 'bg-blue-100 text-blue-700'   } :
                                              { label: 'Preparar',   cls: 'bg-amber-100 text-amber-700' };
            return (
              <button onClick={() => navigate('/sesion-entreno')}
                className="flex items-center gap-3 bg-green-50 border border-green-100 rounded-2xl px-4 py-3
                           text-left hover:bg-green-100 transition-colors active:scale-[0.98]">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0
                  ${sesion?.status === 'active' ? 'bg-quarte-verde' : 'bg-quarte-verde/20'}`}>
                  {sesion?.status === 'active'
                    ? <Play size={16} className="text-white" />
                    : sesion?.status === 'completed'
                    ? <CheckCircle2 size={16} className="text-quarte-verde" />
                    : <Dumbbell size={16} className="text-quarte-verde" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-titulo font-bold text-sm text-quarte-negro">
                      {formatFechaEntreno(fecha)}
                    </p>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-titulo font-bold ${statusBadge.cls}`}>
                      {statusBadge.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5 flex-wrap">
                    {horario && (
                      <span className="flex items-center gap-1">
                        <Clock size={10} /> {horario.hora_inicio}–{horario.hora_fin}
                      </span>
                    )}
                    {horario?.campo && (
                      <span className="flex items-center gap-1">
                        <MapPin size={10} /> {horario.campo}
                      </span>
                    )}
                    {sesion && sesion.exercise_ids.length > 0 && (
                      <span className="font-titulo font-semibold text-quarte-verde">
                        {sesion.exercise_ids.length} ejercicios
                      </span>
                    )}
                  </div>
                </div>
                <ChevronRight size={15} className="text-quarte-verde flex-shrink-0" />
              </button>
            );
          })()}

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
