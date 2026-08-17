// ============================================================
// PartidoForm — formulario de creación / edición de partido
// Extraído para usarse en PartidosPage y PartidoDetallePage
// ============================================================
import { useState } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import type { Match, MatchLocation } from '@/types';

export const TEMPORADA_ACTUAL = '2026/27';

export default function PartidoForm({
  inicial, teamId, onGuardar, onCancelar,
}: {
  inicial?: Match;
  teamId:   string;
  onGuardar: (p: Match) => Promise<void>;
  onCancelar: () => void;
}) {
  const [rival,       setRival]       = useState(inicial?.rival_name  ?? '');
  const [fecha,       setFecha]       = useState(inicial?.date        ?? new Date().toISOString().split('T')[0]);
  const [hora,        setHora]        = useState(inicial?.time        ?? '');
  const [ubicacion,   setUbicacion]   = useState<MatchLocation>(inicial?.location    ?? 'home');
  const [competicion, setCompeticion] = useState(inicial?.competition ?? '');
  const [notas,       setNotas]       = useState(inicial?.notes       ?? '');
  const [guardando,   setGuardando]   = useState(false);
  const [errorMsg,    setErrorMsg]    = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!rival.trim()) { setErrorMsg('El nombre del rival es obligatorio.'); return; }
    if (!fecha)        { setErrorMsg('La fecha es obligatoria.'); return; }
    setGuardando(true);
    setErrorMsg('');
    try {
      const now = new Date().toISOString();
      await onGuardar({
        id:            inicial?.id ?? crypto.randomUUID(),
        team_id:       teamId,
        season:        TEMPORADA_ACTUAL,
        date:          fecha,
        time:          hora || undefined,
        rival_name:    rival.trim(),
        location:      ubicacion,
        competition:   competicion.trim() || undefined,
        goals_for:     inicial?.goals_for    ?? 0,
        goals_against: inicial?.goals_against ?? 0,
        status:        inicial?.status        ?? 'scheduled',
        notes:         notas.trim()           || undefined,
        created_at:    inicial?.created_at    ?? now,
        updated_at:    now,
      });
    } catch {
      setErrorMsg('Error al guardar. Inténtalo de nuevo.');
      setGuardando(false);
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-quarte-gris">
      <div className="bg-quarte-azul text-white px-4 pt-4 pb-4 flex items-center gap-3">
        <button onClick={onCancelar}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/20 hover:bg-white/30">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <h1 className="font-titulo text-lg font-bold">{inicial ? 'Editar partido' : 'Nuevo partido'}</h1>
          <p className="text-blue-200 text-xs">Temporada {TEMPORADA_ACTUAL}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 max-w-lg mx-auto w-full">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="card flex flex-col gap-4">
            <p className="font-titulo font-bold text-sm text-quarte-negro">Datos del partido</p>

            <div>
              <label className="block text-xs font-titulo font-semibold text-gray-500 mb-1">Rival *</label>
              <input value={rival} onChange={e => setRival(e.target.value)}
                placeholder="Nombre del equipo rival" required
                className="w-full min-h-[44px] px-3 rounded-xl border-2 border-gray-200
                           focus:border-quarte-azul outline-none text-sm font-cuerpo" />
            </div>

            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-xs font-titulo font-semibold text-gray-500 mb-1">Fecha *</label>
                <input type="date" value={fecha} onChange={e => setFecha(e.target.value)} required
                  className="w-full min-h-[44px] px-3 rounded-xl border-2 border-gray-200
                             focus:border-quarte-azul outline-none text-sm font-cuerpo" />
              </div>
              <div className="w-32">
                <label className="block text-xs font-titulo font-semibold text-gray-500 mb-1">Hora</label>
                <input type="time" value={hora} onChange={e => setHora(e.target.value)}
                  className="w-full min-h-[44px] px-3 rounded-xl border-2 border-gray-200
                             focus:border-quarte-azul outline-none text-sm font-cuerpo" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-titulo font-semibold text-gray-500 mb-2">Campo</label>
              <div className="flex gap-2">
                {(['home', 'away', 'neutral'] as MatchLocation[]).map(loc => (
                  <button key={loc} type="button" onClick={() => setUbicacion(loc)}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-titulo font-bold transition-colors
                      ${ubicacion === loc ? 'bg-quarte-azul text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                    {loc === 'home' ? '🏠 Local' : loc === 'away' ? '✈️ Visitante' : '⚖️ Neutro'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-titulo font-semibold text-gray-500 mb-1">Competición</label>
              <input value={competicion} onChange={e => setCompeticion(e.target.value)}
                placeholder="Ej: 3ª Regional Aragón, Copa..."
                className="w-full min-h-[44px] px-3 rounded-xl border-2 border-gray-200
                           focus:border-quarte-azul outline-none text-sm font-cuerpo" />
            </div>
          </div>

          <div className="card flex flex-col gap-3">
            <p className="font-titulo font-bold text-sm text-quarte-negro">Notas previas</p>
            <textarea value={notas} onChange={e => setNotas(e.target.value)}
              placeholder="Observaciones, plan de juego..."
              rows={3}
              className="w-full px-3 py-2.5 rounded-xl border-2 border-gray-200
                         focus:border-quarte-azul outline-none text-sm font-cuerpo resize-none" />
          </div>

          {errorMsg && (
            <p className="text-sm text-quarte-rojo font-cuerpo text-center bg-red-50 rounded-xl py-2">
              {errorMsg}
            </p>
          )}

          <button type="submit" disabled={guardando}
            className="btn-primario flex items-center justify-center gap-2">
            {guardando
              ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : <Save size={18} />}
            {guardando ? 'Guardando...' : 'Guardar partido'}
          </button>
        </form>
      </div>
    </div>
  );
}
