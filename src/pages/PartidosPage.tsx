// ============================================================
// PartidosPage — lista de partidos
// El detalle se gestiona en PartidoDetallePage (/partidos/:id)
// ============================================================
import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Shield, Plus } from 'lucide-react';
import { usePerfilStore }       from '@/stores/perfilStore';
import { usePartidosStore }     from '@/stores/partidosStore';
import { usePlantillaStore }    from '@/stores/plantillaStore';
import { useConvocatoriaStore } from '@/stores/convocatoriaStore';
import PartidoCard              from '@/components/partidos/PartidoCard';
import PartidoForm              from '@/components/partidos/PartidoForm';
import { TEMPORADA_ACTUAL }     from '@/components/partidos/PartidoForm';
import type { Match }           from '@/types';
import { TeamSwitcher }         from '@/components/ui/TeamSwitcher';

// ── Tipos de vistas ──────────────────────────────────────────
type View =
  | { mode: 'list' }
  | { mode: 'form'; partido?: Match };

type TabFiltro = 'todos' | 'proximos' | 'jugados' | 'temporada';

// ============================================================
// PartidosPage — Componente principal (lista + form nuevo)
// ============================================================
export default function PartidosPage() {
  const { perfil, activeTeamId } = usePerfilStore();
  const store             = usePartidosStore();
  const plantillaStore    = usePlantillaStore();
  const navigate          = useNavigate();
  const location          = useLocation();

  const [view, setView] = useState<View>({ mode: 'list' });
  const [tab,  setTab]  = useState<TabFiltro>('todos');

  const convocatoriaStore = useConvocatoriaStore();

  useEffect(() => {
    if (!perfil || !activeTeamId) return;
    store.cargar(activeTeamId);
    plantillaStore.cargar(activeTeamId);
  }, [activeTeamId]);

  // Cargar counts de convocatoria cuando hay partidos
  useEffect(() => {
    if (store.partidos.length === 0) return;
    convocatoriaStore.cargarCuentas(store.partidos.map(p => p.id));
  }, [store.partidos.length]);

  // Redirigir al detalle si se viene de ConvocatoriaPage con openId
  useEffect(() => {
    const openId = (location.state as { openId?: string } | null)?.openId;
    if (openId) {
      navigate(`/partidos/${openId}`, { replace: true });
      window.history.replaceState({}, '');
    }
  }, [location.state]);

  if (!perfil) return null;

  // Filtros
  const hoy      = new Date().toISOString().split('T')[0];
  const filtrados = store.partidos.filter(p => {
    if (tab === 'proximos')  return p.status === 'scheduled' && p.date >= hoy;
    if (tab === 'jugados')   return p.status === 'played';
    if (tab === 'temporada') return p.season === TEMPORADA_ACTUAL;
    return true;
  });

  // ── Vista FORM ────────────────────────────────────────────
  if (view.mode === 'form') {
    return (
      <PartidoForm
        inicial={view.partido}
        teamId={activeTeamId ?? ''}
        onGuardar={async p => { await store.guardarPartido(p); setView({ mode: 'list' }); }}
        onCancelar={() => setView({ mode: 'list' })}
      />
    );
  }

  // ── Vista LISTA ───────────────────────────────────────────
  const tabs: { id: TabFiltro; label: string }[] = [
    { id: 'todos',     label: 'Todos'         },
    { id: 'proximos',  label: 'Próximos'      },
    { id: 'jugados',   label: 'Jugados'       },
    { id: 'temporada', label: TEMPORADA_ACTUAL },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-quarte-gris">
      {/* Cabecera */}
      <div className="bg-quarte-azul text-white px-4 pt-4 pb-0">
        <div className="flex items-center gap-3 pb-3">
          <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
            <Shield size={20} />
          </div>
          <div className="flex-1">
            <h1 className="font-titulo text-lg font-bold">Partidos</h1>
            <div className="flex items-center gap-2 flex-wrap mt-0.5">
              <TeamSwitcher />
              <span className="text-blue-200 text-xs">{store.partidos.length} partidos</span>
            </div>
          </div>
          <button onClick={() => setView({ mode: 'form' })}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/20 hover:bg-white/30">
            <Plus size={20} />
          </button>
        </div>
        {/* Tabs */}
        <div className="flex overflow-x-auto scrollbar-hide gap-1 pb-0">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex-shrink-0 px-4 py-2.5 text-xs font-titulo font-semibold transition-colors border-b-2
                ${tab === t.id ? 'text-white border-white' : 'text-blue-300 border-transparent hover:text-white'}`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Lista */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 max-w-lg mx-auto flex flex-col gap-3">
          {store.cargando ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-3 border-quarte-azul border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filtrados.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-gray-400 gap-3">
              <Shield size={48} className="opacity-20" />
              <p className="font-titulo font-semibold">
                {tab === 'proximos' ? 'Sin partidos próximos' :
                 tab === 'jugados'  ? 'Sin partidos jugados'  :
                 'Sin partidos'}
              </p>
              <p className="text-sm text-center">
                {tab === 'todos' || tab === 'temporada'
                  ? 'Añade el primer partido con el botón +'
                  : 'Prueba con otro filtro'}
              </p>
            </div>
          ) : (
            filtrados.map(p => (
              <PartidoCard
                key={p.id}
                partido={p}
                onClick={() => navigate(`/partidos/${p.id}`)}
                squadCount={convocatoriaStore.getCount(p.id)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
