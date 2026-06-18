// ============================================================
// ConvocatoriaPage — /partidos/:id/convocatoria
// Wrapper page que carga los datos y delega en ConvocatoriaEditor
// ============================================================
import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePerfilStore }       from '@/stores/perfilStore';
import { getEquipoNombre }      from '@/data/equipos';
import { usePartidosStore }     from '@/stores/partidosStore';
import { usePlantillaStore }    from '@/stores/plantillaStore';
import { useAsistenciaStore }   from '@/stores/asistenciaStore';
import { useConvocatoriaStore } from '@/stores/convocatoriaStore';
import ConvocatoriaEditor       from '@/components/partidos/ConvocatoriaEditor';
import type { MatchSquad } from '@/types';

export default function ConvocatoriaPage() {
  const { id: matchId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { perfil, activeTeamId } = usePerfilStore();
  const partidosStore     = usePartidosStore();
  const plantillaStore    = usePlantillaStore();
  const asistenciaStore   = useAsistenciaStore();
  const convocatoriaStore = useConvocatoriaStore();

  useEffect(() => {
    if (!perfil || !matchId || !activeTeamId) return;
    // Siempre recargar plantilla y partidos con el equipo activo
    plantillaStore.cargar(activeTeamId);
    if (partidosStore.partidos.length === 0) partidosStore.cargar(activeTeamId);
    asistenciaStore.cargarEstadisticasLista(activeTeamId);
    convocatoriaStore.cargar(matchId);
  }, [activeTeamId, matchId]);

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
      statsAsistencia={asistenciaStore.estadisticasLista}
      initialSquad={initialSquad}
      equipo={getEquipoNombre(activeTeamId ?? '') || perfil.equipo}
      onGuardar={handleGuardar}
      onBack={() => navigate('/partidos', { state: { openId: matchId } })}
    />
  );
}
