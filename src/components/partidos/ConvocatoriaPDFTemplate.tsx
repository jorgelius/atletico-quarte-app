import { forwardRef } from 'react';
import type { Match, MatchSquad, Jugador } from '@/types';
import escudoImg from '@/assets/escudo.png';

const AZUL       = '#014181';
const ROJO       = '#D9161E';
const AZUL_DARK  = '#0a2558';
const GRIS_HDR   = '#e0e0e0';

const DIAS_ES = ['DOMINGO', 'LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES', 'SÁBADO'];

function getDia(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  return DIAS_ES[new Date(y, m - 1, d).getDay()];
}

function formatFecha(dateStr: string): string {
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
}

function calcHoraConv(time?: string): string {
  if (!time) return '--:--';
  const [h, m] = time.split(':').map(Number);
  const total = h * 60 + m - 50;
  const ch = Math.floor(total / 60);
  const cm = total % 60;
  return `${String(ch).padStart(2, '0')}:${String(cm < 0 ? cm + 60 : cm).padStart(2, '0')}`;
}

interface Props {
  partido:   Match;
  jugadores: Jugador[];
  squad:     MatchSquad[];
  equipo:    string;
}

const ConvocatoriaPDFTemplate = forwardRef<HTMLDivElement, Props>(
  ({ partido, jugadores, squad, equipo }, ref) => {
    const jugMap = new Map(jugadores.map(j => [j.id, j]));

    const por = squad.filter(s => jugMap.get(s.player_id)?.posicion === 'POR');
    const def = squad.filter(s => jugMap.get(s.player_id)?.posicion === 'DEF');
    const med = squad.filter(s => jugMap.get(s.player_id)?.posicion === 'MED');
    const del = squad.filter(s => jugMap.get(s.player_id)?.posicion === 'DEL');

    const esLocal   = partido.location === 'home';
    const rivalName = partido.rival_name.toUpperCase();
    const matchLine = esLocal
      ? `AT. QUARTE - ${rivalName}`
      : `${rivalName} - AT. QUARTE`;

    const fecha       = formatFecha(partido.date);
    const dia         = getDia(partido.date);
    const horaPartido = partido.time ?? '--:--';
    const horaConv    = calcHoraConv(partido.time);
    const categoria   = partido.competition?.toUpperCase() ?? equipo.toUpperCase();

    const playerRow = (id: string, suffix = '') => {
      const j = jugMap.get(id);
      const nombre = j ? `${j.nombre} ${j.apellidos}`.toUpperCase() : 'JUGADOR';
      return `- ${nombre}${suffix}`;
    };

    return (
      <div
        ref={ref}
        style={{
          width: '794px',
          fontFamily: 'Arial, Helvetica, sans-serif',
          backgroundColor: '#ffffff',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Franja roja izquierda */}
        <div style={{
          position: 'absolute', left: 0, top: 0,
          width: '20px', height: '100%',
          backgroundColor: ROJO, zIndex: 3,
        }} />

        {/* ── CABECERA ── */}
        <div style={{
          backgroundColor: GRIS_HDR,
          padding: '28px 32px 28px 48px',
          display: 'flex', alignItems: 'center', gap: '24px',
        }}>
          <img src={escudoImg} alt="Escudo" style={{ width: '130px', height: '130px', objectFit: 'contain', flexShrink: 0 }} />

          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '21px', fontWeight: '900', color: '#111', textTransform: 'uppercase', letterSpacing: '0.4px', lineHeight: '1.2', marginBottom: '4px' }}>
              CONVOCATORIA PARTIDO DE LIGA
            </div>
            <div style={{ fontSize: '14px', fontWeight: '700', color: '#222', marginBottom: '14px' }}>
              {matchLine}
            </div>
            {[
              { label: 'JORNADA:',          value: `${fecha} ${dia}` },
              { label: 'CATEGORÍA:',         value: categoria },
              { label: 'HORA DEL PARTIDO:',  value: horaPartido },
              { label: 'HORA DE CONV.:',     value: horaConv },
            ].map(({ label, value }) => (
              <div key={label} style={{ display: 'flex', gap: '8px', marginBottom: '5px', fontSize: '14px', fontWeight: '700', alignItems: 'baseline' }}>
                <span style={{ color: '#111', whiteSpace: 'nowrap' }}>{label}</span>
                <span style={{ color: ROJO }}>{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── JUGADORES ── */}
        <div style={{ backgroundColor: '#fff', position: 'relative' }}>

          {/* Escudo marca de agua */}
          <img src={escudoImg} alt="" style={{
            position: 'absolute', right: '60px', top: '60px',
            width: '300px', height: '300px', objectFit: 'contain',
            opacity: 0.07, zIndex: 0, pointerEvents: 'none',
          }} />

          {/* Barra "JUGADORES CONVOCADOS" */}
          <div style={{
            backgroundColor: AZUL_DARK, color: '#fff',
            textAlign: 'center', padding: '11px 0 10px',
            fontSize: '16px', fontWeight: '900', letterSpacing: '1.5px',
            position: 'relative', zIndex: 1,
          }}>
            JUGADORES CONVOCADOS
          </div>

          {/* Lista */}
          <div style={{ padding: '18px 32px 36px 48px', position: 'relative', zIndex: 1 }}>

            {/* Porteros */}
            {por.map(s => (
              <div key={s.id} style={{ fontSize: '14px', fontWeight: '700', color: '#111', marginBottom: '7px' }}>
                {playerRow(s.player_id, ' (PORTERO)')}
              </div>
            ))}

            {/* Defensas */}
            {def.length > 0 && (
              <>
                <SectionBar label="DEFENSAS:" color={AZUL} />
                {def.map(s => (
                  <div key={s.id} style={{ fontSize: '14px', fontWeight: '700', color: '#111', marginBottom: '7px', marginLeft: '8px' }}>
                    {playerRow(s.player_id)}
                  </div>
                ))}
              </>
            )}

            {/* Medios */}
            {med.length > 0 && (
              <>
                <SectionBar label="MEDIOS" color={AZUL} />
                {med.map(s => (
                  <div key={s.id} style={{ fontSize: '14px', fontWeight: '700', color: '#111', marginBottom: '7px', marginLeft: '8px' }}>
                    {playerRow(s.player_id)}
                  </div>
                ))}
              </>
            )}

            {/* Delanteros */}
            {del.length > 0 && (
              <>
                <SectionBar label="DELANTEROS" color={AZUL} />
                {del.map(s => (
                  <div key={s.id} style={{ fontSize: '14px', fontWeight: '700', color: '#111', marginBottom: '7px', marginLeft: '8px' }}>
                    {playerRow(s.player_id)}
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </div>
    );
  }
);

ConvocatoriaPDFTemplate.displayName = 'ConvocatoriaPDFTemplate';
export default ConvocatoriaPDFTemplate;

function SectionBar({ label, color }: { label: string; color: string }) {
  return (
    <div style={{
      display: 'inline-block',
      backgroundColor: color, color: '#fff',
      padding: '3px 16px', borderRadius: '2px',
      fontWeight: '900', fontSize: '13px', letterSpacing: '0.5px',
      marginTop: '14px', marginBottom: '9px',
    }}>
      {label}
    </div>
  );
}
