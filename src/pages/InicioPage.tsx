// ============================================================
// InicioPage — pantalla de inicio rica
// Muestra: próximo partido + clasificación del equipo del usuario
// ============================================================
import { useNavigate } from 'react-router-dom';
import {
  Users, Dumbbell, LayoutGrid,
  Calendar, Trophy, MapPin, Clock,
  ChevronRight, Home, Bus,
} from 'lucide-react';
import { usePerfilStore } from '@/stores/perfilStore';
import { Avatar } from '@/components/ui/Avatar';
import { getProximoPartido, getClasificacion } from '@/data/competicionData';
import type { Partido, ClasificacionRow } from '@/types';
import escudoImg from '@/assets/escudo.png';

// ── Accesos rápidos ──────────────────────────────────────────
const SECCIONES = [
  { to: '/plantilla',      Icon: Users,      label: 'Plantilla',      color: 'bg-quarte-azul'  },
  { to: '/entrenamientos', Icon: Dumbbell,   label: 'Entrenos',       color: 'bg-quarte-rojo'  },
  { to: '/tacticas',       Icon: LayoutGrid, label: 'Tácticas',       color: 'bg-quarte-verde' },
] as const;

// ── Subcomponente: Próximo Partido ───────────────────────────
function ProximoPartidoCard({ partido }: { partido: Partido }) {
  const fechaObj = new Date(`${partido.fecha}T${partido.hora}`);
  const dia      = fechaObj.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <div className="flex flex-col gap-4">
      {/* Cabecera de la card */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-titulo font-bold text-gray-400 uppercase tracking-widest">
          {partido.competicion}
        </span>
        <span className="text-[10px] font-titulo font-semibold text-quarte-azul bg-quarte-azulClaro
                         px-2 py-0.5 rounded-full">
          J{partido.jornada}
        </span>
      </div>

      {/* Visual enfrentamiento */}
      <div className="flex items-center justify-between gap-2">
        {/* Local */}
        <div className="flex flex-col items-center gap-1.5 flex-1">
          <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-md
                           ${partido.esLocal ? 'bg-quarte-azul' : 'bg-gray-100'}`}>
            {partido.esLocal
              ? <img src={escudoImg} alt="Atlético Quarte" className="w-10 h-10 object-contain" />
              : <span className="text-gray-400 font-titulo font-bold text-xs text-center leading-tight px-1">
                  {partido.rival.split(' ').slice(0, 2).join('\n')}
                </span>
            }
          </div>
          <p className={`text-xs font-titulo font-bold text-center leading-tight
                         ${partido.esLocal ? 'text-quarte-azul' : 'text-quarte-negro'}`}>
            {partido.esLocal ? 'Atlético\nQuarte' : partido.rival}
          </p>
          {partido.esLocal && (
            <span className="flex items-center gap-0.5 text-[10px] text-quarte-verde font-semibold">
              <Home size={10} /> LOCAL
            </span>
          )}
        </div>

        {/* VS */}
        <div className="flex flex-col items-center">
          <span className="font-titulo font-extrabold text-2xl text-gray-300">vs</span>
        </div>

        {/* Visitante */}
        <div className="flex flex-col items-center gap-1.5 flex-1">
          <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-md
                           ${!partido.esLocal ? 'bg-quarte-azul' : 'bg-gray-100'}`}>
            {!partido.esLocal
              ? <img src={escudoImg} alt="Atlético Quarte" className="w-10 h-10 object-contain" />
              : <span className="text-gray-500 font-titulo font-bold text-xs text-center leading-tight px-1">
                  {partido.rival}
                </span>
            }
          </div>
          <p className={`text-xs font-titulo font-bold text-center leading-tight
                         ${!partido.esLocal ? 'text-quarte-azul' : 'text-quarte-negro'}`}>
            {!partido.esLocal ? 'Atlético\nQuarte' : partido.rival}
          </p>
          {!partido.esLocal && (
            <span className="flex items-center gap-0.5 text-[10px] text-orange-500 font-semibold">
              <Bus size={10} /> VISITA
            </span>
          )}
        </div>
      </div>

      {/* Fecha, hora y lugar */}
      <div className="bg-gray-50 rounded-xl px-4 py-3 flex flex-col gap-1.5">
        <div className="flex items-center gap-2 text-sm text-quarte-negro">
          <Calendar size={14} className="text-quarte-azul flex-shrink-0" />
          <span className="capitalize font-medium">{dia}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Clock size={14} className="text-quarte-azul flex-shrink-0" />
          <span>{partido.hora} h</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <MapPin size={14} className="text-quarte-azul flex-shrink-0" />
          <span className="leading-tight">{partido.lugar}</span>
        </div>
      </div>
    </div>
  );
}

// ── Subcomponente: empty state partido ──────────────────────
function SinPartido() {
  return (
    <div className="flex flex-col items-center gap-3 py-5 text-center">
      <div className="w-14 h-14 rounded-full bg-quarte-azulClaro flex items-center justify-center">
        <Calendar size={26} className="text-quarte-azul" />
      </div>
      <div>
        <p className="font-titulo font-semibold text-quarte-negro text-sm">
          Temporada 2026-27 por comenzar
        </p>
        <p className="text-xs text-gray-400 mt-1 max-w-[220px] mx-auto leading-relaxed">
          El calendario aparecerá aquí en cuanto la federación lo publique.
        </p>
      </div>
    </div>
  );
}

// ── Subcomponente: Tabla de clasificación ───────────────────
function ClasificacionTable({ rows, equipo }: { rows: ClasificacionRow[]; equipo: string }) {
  const visibles = rows.slice(0, 6);
  return (
    <div className="overflow-x-auto -mx-1">
      <table className="w-full text-xs min-w-[280px]">
        <thead>
          <tr className="text-gray-400 font-titulo">
            <th className="text-left py-1.5 pl-1 w-6">#</th>
            <th className="text-left py-1.5">Equipo</th>
            <th className="text-center py-1.5 w-7">PJ</th>
            <th className="text-center py-1.5 w-7">GF</th>
            <th className="text-center py-1.5 w-7">GC</th>
            <th className="text-center py-1.5 w-8 font-bold text-quarte-azul">Pts</th>
          </tr>
        </thead>
        <tbody>
          {visibles.map(row => {
            const somos = row.equipo.toLowerCase().includes('quarte') || row.esNuestroEquipo;
            return (
              <tr
                key={row.posicion}
                className={`border-t border-gray-100 transition-colors
                             ${somos ? 'bg-quarte-azulClaro' : 'hover:bg-gray-50'}`}
              >
                <td className={`py-2 pl-1 font-titulo font-bold
                                ${somos ? 'text-quarte-azul' : 'text-gray-400'}`}>
                  {row.posicion}
                </td>
                <td className={`py-2 font-titulo font-semibold truncate max-w-[110px]
                                ${somos ? 'text-quarte-azul' : 'text-quarte-negro'}`}>
                  {row.equipo}
                </td>
                <td className="py-2 text-center text-gray-500">{row.pj}</td>
                <td className="py-2 text-center text-gray-500">{row.gf}</td>
                <td className="py-2 text-center text-gray-500">{row.gc}</td>
                <td className={`py-2 text-center font-titulo font-bold
                                ${somos ? 'text-quarte-azul' : 'text-quarte-negro'}`}>
                  {row.pts}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {rows.length > 6 && (
        <p className="text-[10px] text-gray-400 text-center mt-2">
          {rows.length - 6} equipos más · clasificación completa próximamente
        </p>
      )}
    </div>
  );
}

// ── Subcomponente: empty state clasificación ─────────────────
function SinClasificacion() {
  return (
    <div className="flex flex-col items-center gap-3 py-5 text-center">
      <div className="w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center">
        <Trophy size={26} className="text-amber-500" />
      </div>
      <div>
        <p className="font-titulo font-semibold text-quarte-negro text-sm">
          Clasificación pendiente
        </p>
        <p className="text-xs text-gray-400 mt-1 max-w-[220px] mx-auto leading-relaxed">
          Los datos se actualizarán cuando empiece la competición.
        </p>
      </div>
    </div>
  );
}

// ── Componente principal ─────────────────────────────────────
export default function InicioPage() {
  const { perfil } = usePerfilStore();
  const navigate   = useNavigate();

  const partido        = perfil ? getProximoPartido(perfil.equipo) : null;
  const clasificacion  = perfil ? getClasificacion(perfil.equipo) : [];

  return (
    <div className="min-h-screen bg-quarte-gris">

      {/* ── Hero header ──────────────────────────────────────── */}
      <div className="bg-gradient-to-b from-quarte-azul to-blue-900
                      px-4 pt-8 pb-16 relative overflow-hidden">
        {/* Patrón decorativo sutil */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'%3E%3Ccircle cx='20' cy='20' r='1'/%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        <div className="max-w-lg mx-auto relative">
          {/* Saludo + avatar */}
          {perfil && (
            <button
              onClick={() => navigate('/perfil')}
              className="flex items-center gap-2.5 mb-6 group"
            >
              <Avatar nombre={perfil.nombre} foto={perfil.avatar_b64} size="sm" />
              <div className="text-left">
                <p className="text-blue-200 text-xs">Bienvenido de nuevo</p>
                <p className="text-white font-titulo font-bold text-sm leading-tight group-hover:underline">
                  {perfil.nombre}
                </p>
              </div>
              <ChevronRight size={14} className="text-blue-300 ml-auto" />
            </button>
          )}

          {/* Escudo + nombre del club */}
          <div className="flex flex-col items-center text-center gap-3">
            <img
              src={escudoImg}
              alt="Escudo CD Atlético Quarte"
              className="w-20 h-20 object-contain drop-shadow-xl"
            />
            <div>
              <h1 className="font-titulo text-2xl font-extrabold tracking-tight text-white">
                CD Atlético Quarte
              </h1>
              <p className="text-blue-200 text-xs mt-0.5">Cuarte de Huerva · Los Halcones</p>
            </div>
            {/* Badge del equipo del usuario */}
            {perfil?.equipo && (
              <span className="bg-white/15 border border-white/20 text-white text-xs
                               font-titulo font-semibold px-3 py-1 rounded-full">
                {perfil.equipo}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Contenido flotante sobre el hero ─────────────────── */}
      <div className="max-w-lg mx-auto px-4 -mt-8 pb-8 flex flex-col gap-4">

        {/* Card: Próximo Partido */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-titulo font-bold text-quarte-negro text-sm uppercase tracking-wide">
              Próximo Partido
            </h2>
            <Calendar size={16} className="text-gray-300" />
          </div>
          {partido
            ? <ProximoPartidoCard partido={partido} />
            : <SinPartido />}
        </div>

        {/* Card: Clasificación */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-titulo font-bold text-quarte-negro text-sm uppercase tracking-wide">
              Clasificación
            </h2>
            <Trophy size={16} className="text-gray-300" />
          </div>
          {clasificacion.length > 0
            ? <ClasificacionTable rows={clasificacion} equipo={perfil?.equipo ?? ''} />
            : <SinClasificacion />}
        </div>

        {/* Accesos rápidos */}
        <div>
          <p className="text-[10px] font-titulo font-bold text-gray-400 uppercase tracking-widest mb-3 px-1">
            Acceso rápido
          </p>
          <div className="grid grid-cols-3 gap-3">
            {SECCIONES.map(({ to, Icon, label, color }) => (
              <button
                key={to}
                onClick={() => navigate(to)}
                className="card flex flex-col items-center gap-2.5 py-4 px-2 text-center
                           hover:shadow-md transition-shadow active:scale-[0.97]"
              >
                <div className={`${color} w-11 h-11 rounded-xl flex items-center justify-center shadow`}>
                  <Icon size={22} className="text-white" />
                </div>
                <p className="font-titulo font-bold text-quarte-negro text-xs leading-tight">
                  {label}
                </p>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
