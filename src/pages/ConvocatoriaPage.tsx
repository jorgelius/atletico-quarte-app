// ============================================================
// ConvocatoriaPage — /partidos/:id/convocatoria
// Wrapper page que carga los datos y delega en ConvocatoriaEditor
// ============================================================
import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePerfilStore }       from '@/stores/perfilStore';
import { usePartidosStore }     from '@/stores/partidosStore';
import { usePlantillaStore }    from '@/stores/plantillaStore';
import { useAsistenciaStore }   from '@/stores/asistenciaStore';
import { useConvocatoriaStore } from '@/stores/convocatoriaStore';
import ConvocatoriaEditor       from '@/components/partidos/ConvocatoriaEditor';
import type { MatchSquad } from '@/types';

export default function ConvocatoriaPage() {
  const { id: matchId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { perfil }        = usePerfilStore();
  const partidosStore     = usePartidosStore();
  const plantillaStore    = usePlantillaStore();
  const asistenciaStore   = useAsistenciaStore();
  const convocatoriaStore = useConvocatoriaStore();

  useEffect(() => {
    if (!perfil || !matchId) return;
    // Cargar datos si no están en memoria
    if (partidosStore.partidos.length === 0) partidosStore.cargar(perfil.id);
    if (plantillaStore.jugadores.length === 0) plantillaStore.cargar(perfil.id);
    if (asistenciaStore.estadisticasEquipo.length === 0) {
      asistenciaStore.cargarResumenEquipo(perfil.id);
    }
    convocatoriaStore.cargar(matchId);
  }, [perfil?.id, matchId]);

  if (!perfil || !matchId) return null;

  const partido = partidosStore.partidos.find(p => p.id === matchId);
  if (!partido && !partidosStore.cargando) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-400 font-titulo">Partido no encontrado</p>
      </div>
    );
  }
  if (!partido) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-3 border-quarte-azul border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const initialSquad = convocatoriaStore.getSquad(matchId);

  async function handleGuardar(squad: MatchSquad[]) {
    await convocatoriaStore.guardarConvocatoria(matchId!, squad);
    navigate(`/partidos`, { state: { openId: matchId } });
  }

  return (
    <ConvocatoriaEditor
      partido={partido}
      jugadores={plantillaStore.jugadores}
      statsAsistencia={asistenciaStore.estadisticasEquipo}
      initialSquad={initialSquad}
      equipo={perfil.equipo}
      guardando={convocatoriaStore.guardando}
      onGuardar={handleGuardar}
      onBack={() => navigate('/partidos', { state: { openId: matchId } })}
    />
  );
}
