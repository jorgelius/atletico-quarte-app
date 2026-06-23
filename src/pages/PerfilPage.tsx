// ============================================================
// PerfilPage — ver y editar el perfil del usuario autenticado
// ============================================================
import { useState } from 'react';
import {
  UserCircle, Edit2, LogOut,
  Shield, ChevronRight, Cloud, FileText, ChevronDown, ChevronUp,
} from 'lucide-react';
import { usePerfilStore } from '@/stores/perfilStore';
import { PerfilForm } from '@/components/ui/PerfilForm';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { getEquipoNombre } from '@/data/equipos';
import type { Profile } from '@/types';

const LABEL_ROL: Record<string, string> = {
  entrenador:  '⚽ Entrenador/a',
  coordinador: '📋 Coordinador/a',
  admin:       '🔧 Administrador/a',
};

export default function PerfilPage() {
  const { perfil, session, guardarPerfil, cerrarSesion } = usePerfilStore();
  const [editando,        setEditando]  = useState(false);
  const [confirmarSalir,  setConfirmar] = useState(false);
  const [cerrando,        setCerrando]  = useState(false);
  const [politicaOpen,    setPolitica]  = useState(false);

  if (!perfil) return null;

  async function handleGuardar(datos: Omit<Profile, 'id' | 'creado_en'>) {
    await guardarPerfil({ ...perfil!, ...datos });
    setEditando(false);
  }

  async function handleCerrarSesion() {
    setCerrando(true);
    await cerrarSesion();
    // El guard redirigirá automáticamente a /login
  }

  // ─── MODO EDICIÓN ──────────────────────────────────────────
  if (editando) {
    return (
      <div className="p-4 max-w-lg mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => setEditando(false)}
            className="w-10 h-10 flex items-center justify-center rounded-xl
                       bg-gray-100 hover:bg-gray-200 transition-colors"
            aria-label="Volver"
          >
            <ChevronRight size={20} className="rotate-180 text-quarte-azul" />
          </button>
          <div>
            <h1 className="font-titulo text-xl font-bold text-quarte-negro">Editar perfil</h1>
            <p className="text-sm text-gray-500">{session?.user?.email}</p>
          </div>
        </div>

        <div className="card">
          <PerfilForm
            perfilInicial={perfil}
            onGuardar={handleGuardar}
            textoBoton="Guardar cambios"
            mostrarCancelar
            onCancelar={() => setEditando(false)}
          />
        </div>
      </div>
    );
  }

  // ─── VISTA NORMAL ──────────────────────────────────────────
  return (
    <div className="p-4 max-w-lg mx-auto">
      {/* Cabecera */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-quarte-azul rounded-xl flex items-center justify-center">
          <UserCircle size={22} className="text-white" />
        </div>
        <div>
          <h1 className="font-titulo text-xl font-bold text-quarte-negro">Mi Perfil</h1>
          <p className="text-sm text-gray-500">{session?.user?.email}</p>
        </div>
      </div>

      {/* Tarjeta principal */}
      <div className="card mb-4">
        <div className="flex items-center gap-4">
          <Avatar nombre={perfil.nombre} foto={perfil.avatar_b64} size="lg" />
          <div className="flex-1 min-w-0">
            <p className="font-titulo font-bold text-quarte-negro text-lg truncate">
              {perfil.nombre}
            </p>
            <p className="text-gray-600 text-sm truncate">
              {(perfil.team_ids ?? []).map(id => getEquipoNombre(id)).join(' · ') || perfil.equipo}
            </p>
            <Badge variante="azul" className="mt-1.5">
              {LABEL_ROL[perfil.rol] ?? perfil.rol}
            </Badge>
          </div>
          <button
            onClick={() => setEditando(true)}
            className="w-10 h-10 flex items-center justify-center rounded-xl
                       bg-quarte-azulClaro hover:bg-blue-100 transition-colors flex-shrink-0"
            aria-label="Editar perfil"
          >
            <Edit2 size={18} className="text-quarte-azul" />
          </button>
        </div>
      </div>

      {/* Sección: Cuenta Supabase */}
      <div className="card mb-4">
        <p className="font-titulo text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
          Cuenta
        </p>
        <div className="flex items-center gap-3 py-2">
          <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
            <Cloud size={18} className="text-quarte-azul" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-titulo font-semibold text-sm text-quarte-negro">
              Sincronizado con Supabase
            </p>
            <p className="text-xs text-gray-400 truncate">
              {session?.user?.email}
            </p>
          </div>
          <Shield size={16} className="text-green-500 flex-shrink-0" />
        </div>
      </div>

      {/* Sección: Legal */}
      <div className="card mb-4">
        <p className="font-titulo text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
          Legal
        </p>

        {/* Fila desplegable — Política de privacidad */}
        <button
          onClick={() => setPolitica(v => !v)}
          className="w-full flex items-center gap-3 py-2 text-left"
        >
          <div className="w-9 h-9 bg-quarte-azulClaro rounded-xl flex items-center justify-center flex-shrink-0">
            <FileText size={17} className="text-quarte-azul" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-titulo font-semibold text-sm text-quarte-negro">Política de privacidad</p>
            <p className="text-xs text-gray-400">RGPD · Datos personales · Derechos</p>
          </div>
          {politicaOpen
            ? <ChevronUp   size={16} className="text-gray-400 flex-shrink-0" />
            : <ChevronDown size={16} className="text-gray-400 flex-shrink-0" />}
        </button>

        {/* Contenido expandido */}
        {politicaOpen && (
          <div className="mt-3 pt-3 border-t border-gray-100 flex flex-col gap-5 text-sm text-gray-700 font-cuerpo leading-relaxed"
            style={{ animation: 'aq-fadeUp .25s cubic-bezier(.5,0,.2,1) both' }}>

            <p className="text-[11px] font-titulo font-bold text-quarte-azul uppercase tracking-wider text-center">
              CD Atlético Quarte — Aplicación de Gestión Deportiva
            </p>

            {/* 1 */}
            <div>
              <h3 className="font-titulo font-bold text-quarte-negro text-sm mb-1">
                1. Responsable del tratamiento
              </h3>
              <p className="text-xs text-gray-600">
                El responsable del tratamiento de los datos personales recogidos a través de esta
                aplicación es el CD Atlético Quarte, con sede en Cuarte de Huerva (Zaragoza).
                Contacto: <span className="text-quarte-azul font-semibold">cdatleticoquarte@gmail.com</span>.
              </p>
            </div>

            {/* 2 */}
            <div>
              <h3 className="font-titulo font-bold text-quarte-negro text-sm mb-1">
                2. Datos que tratamos
              </h3>
              <p className="text-xs text-gray-600 mb-1.5">
                Esta aplicación recoge y trata únicamente los siguientes datos:
              </p>
              <ul className="flex flex-col gap-1">
                {[
                  'Nombre y apellidos de los jugadores de cada equipo.',
                  'Equipo y categoría a la que pertenece cada jugador.',
                  'Datos de asistencia a entrenamientos y partidos.',
                  'Convocatorias y alineaciones de partidos.',
                ].map(item => (
                  <li key={item} className="flex items-start gap-2 text-xs text-gray-600">
                    <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-quarte-azul flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <p className="text-xs text-gray-500 mt-2 italic">
                No se recogen datos económicos, documentos de identidad, imágenes ni datos de salud.
              </p>
            </div>

            {/* 3 */}
            <div>
              <h3 className="font-titulo font-bold text-quarte-negro text-sm mb-1">
                3. Finalidad del tratamiento
              </h3>
              <ul className="flex flex-col gap-1">
                {[
                  'Gestionar los equipos y la actividad deportiva del club.',
                  'Organizar entrenamientos, convocatorias y alineaciones.',
                  'Facilitar la comunicación interna entre entrenadores y coordinadores del club.',
                ].map(item => (
                  <li key={item} className="flex items-start gap-2 text-xs text-gray-600">
                    <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-quarte-azul flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* 4 */}
            <div>
              <h3 className="font-titulo font-bold text-quarte-negro text-sm mb-1">
                4. Base legal
              </h3>
              <p className="text-xs text-gray-600">
                El tratamiento se basa en la relación deportiva existente entre el jugador y el
                CD Atlético Quarte, y en el consentimiento informado del club y las familias,
                conforme al RGPD de la Unión Europea y la Ley Orgánica 3/2018 de Protección
                de Datos Personales (LOPDGDD).
              </p>
            </div>

            {/* 5 */}
            <div>
              <h3 className="font-titulo font-bold text-quarte-negro text-sm mb-1">
                5. Datos de menores de edad
              </h3>
              <p className="text-xs text-gray-600">
                Dado que la mayoría de los jugadores son menores de edad, el club se compromete
                a tratar sus datos con el máximo nivel de protección previsto en la normativa
                vigente. Los datos de menores se limitan estrictamente a los necesarios para la
                actividad deportiva (nombre, equipo y asistencia) y no se comparten con terceros
                ni se utilizan con ninguna otra finalidad.
              </p>
            </div>

            {/* 6 */}
            <div>
              <h3 className="font-titulo font-bold text-quarte-negro text-sm mb-1">
                6. Almacenamiento y seguridad
              </h3>
              <p className="text-xs text-gray-600">
                Los datos se almacenan en servidores seguros ubicados en la Unión Europea,
                a través del proveedor Supabase (región EU), cumpliendo con los estándares
                de seguridad exigidos por el RGPD. El acceso a la aplicación está protegido
                mediante autenticación y los datos solo son accesibles para el personal
                autorizado del club.
              </p>
            </div>

            {/* 7 */}
            <div>
              <h3 className="font-titulo font-bold text-quarte-negro text-sm mb-1">
                7. Cesión de datos a terceros
              </h3>
              <p className="text-xs text-gray-600">
                Los datos personales no se ceden ni se venden a terceros. No se utilizan
                con fines publicitarios ni comerciales.
              </p>
            </div>

            {/* 8 */}
            <div>
              <h3 className="font-titulo font-bold text-quarte-negro text-sm mb-1">
                8. Derechos de los interesados
              </h3>
              <p className="text-xs text-gray-600 mb-1.5">
                Las familias y los jugadores pueden ejercer los siguientes derechos en
                cualquier momento:
              </p>
              <ul className="flex flex-col gap-1 mb-2">
                {[
                  'Acceso: conocer qué datos suyos están almacenados.',
                  'Rectificación: corregir datos incorrectos o desactualizados.',
                  'Supresión: solicitar la eliminación de sus datos.',
                  'Oposición: oponerse al tratamiento de sus datos.',
                ].map(item => (
                  <li key={item} className="flex items-start gap-2 text-xs text-gray-600">
                    <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-quarte-azul flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <p className="text-xs text-gray-600">
                Para ejercer estos derechos:{' '}
                <span className="text-quarte-azul font-semibold">cdatleticoquarte@gmail.com</span>
              </p>
            </div>

            {/* 9 */}
            <div>
              <h3 className="font-titulo font-bold text-quarte-negro text-sm mb-1">
                9. Actualización de esta política
              </h3>
              <p className="text-xs text-gray-600">
                Esta política de privacidad puede actualizarse para adaptarse a cambios
                normativos o en las funcionalidades de la aplicación. Cualquier cambio
                relevante se comunicará a los usuarios del club.
              </p>
            </div>

            <p className="text-[10px] text-gray-400 italic text-right">
              Última actualización: junio de 2026
            </p>
          </div>
        )}
      </div>

      {/* Cerrar sesión */}
      {!confirmarSalir ? (
        <button
          onClick={() => setConfirmar(true)}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl
                     border-2 border-red-100 text-quarte-rojo hover:bg-red-50
                     transition-colors text-sm font-titulo font-semibold"
        >
          <LogOut size={16} />
          Cerrar sesión
        </button>
      ) : (
        <div className="card border-2 border-quarte-rojo">
          <p className="font-titulo font-bold text-quarte-rojo mb-1">
            ¿Cerrar sesión?
          </p>
          <p className="text-sm text-gray-500 mb-4">
            Tendrás que volver a iniciar sesión para acceder a la app.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setConfirmar(false)}
              disabled={cerrando}
              className="btn-outline flex-1 text-sm"
            >
              Cancelar
            </button>
            <button
              onClick={handleCerrarSesion}
              disabled={cerrando}
              className="btn-touch flex-1 bg-quarte-rojo text-white text-sm flex items-center justify-center gap-2"
            >
              {cerrando ? 'Saliendo…' : 'Sí, salir'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
