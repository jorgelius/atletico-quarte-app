// ============================================================
// PerfilPage — ver y editar el perfil del usuario autenticado
// ============================================================
import { useState } from 'react';
import {
  UserCircle, Edit2, LogOut,
  Shield, ChevronRight, Cloud,
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
