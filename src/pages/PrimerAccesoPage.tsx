// ============================================================
// PrimerAccesoPage — onboarding de perfil tras el registro
// El usuario ya está autenticado; aquí completa su perfil
// (nombre, equipo, rol, foto) que se guarda en Supabase.
// ============================================================
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, AlertCircle } from 'lucide-react';
import { usePerfilStore } from '@/stores/perfilStore';
import { PerfilForm } from '@/components/ui/PerfilForm';
import type { Profile } from '@/types';
import escudoImg from '@/assets/escudo.png';

export default function PrimerAccesoPage() {
  const { guardarPerfil, session, cargando } = usePerfilStore();
  const navigate = useNavigate();

  const [nombreInicial, setNombreInicial] = useState('');
  const [errorGuardar,  setErrorGuardar]  = useState('');

  useEffect(() => {
    if (!cargando && !session) {
      navigate('/login', { replace: true });
      return;
    }
    if (session?.user?.user_metadata?.nombre) {
      setNombreInicial(session.user.user_metadata.nombre as string);
    }
  }, [session, cargando]);

  async function handleGuardar(datos: Omit<Profile, 'id' | 'creado_en'>) {
    if (!session?.user) return;
    setErrorGuardar('');
    const perfil: Profile = {
      id:        session.user.id,
      creado_en: Date.now(),
      ...datos,
    };
    try {
      await guardarPerfil(perfil);
      navigate('/inicio', { replace: true });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al guardar el perfil';
      // Mensaje amigable para el error más común (RLS sin políticas)
      setErrorGuardar(
        msg.toLowerCase().includes('row-level security') || msg.toLowerCase().includes('rls') || msg.toLowerCase().includes('permission')
          ? 'Sin permisos en la base de datos. Activa las políticas RLS en Supabase (ver consola para detalles).'
          : msg
      );
    }
  }

  if (cargando) {
    return (
      <div className="min-h-screen bg-quarte-azul flex items-center justify-center">
        <Loader2 size={40} className="animate-spin text-white" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-quarte-azul to-blue-900
                    flex flex-col items-center justify-start px-4 pt-10 pb-8">
      {/* Cabecera */}
      <div className="flex flex-col items-center gap-3 mb-8 text-white text-center">
        <img src={escudoImg} alt="Escudo CD Atlético Quarte" className="w-24 h-24 object-contain drop-shadow-lg" />
        <div>
          <h1 className="font-titulo text-2xl font-extrabold tracking-tight text-white">
            Bienvenido a<br/>CD Atlético Quarte
          </h1>
          <p className="text-blue-200 text-sm mt-2 max-w-xs mx-auto">
            Completa tu perfil para personalizar tu experiencia.
          </p>
        </div>
      </div>

      {/* Tarjeta del formulario */}
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6">
        <h2 className="font-titulo text-lg font-bold text-quarte-negro mb-5">
          Mi perfil
        </h2>

        {errorGuardar && (
          <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl
                          px-4 py-3 mb-4 text-sm text-red-700">
            <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
            <span>{errorGuardar}</span>
          </div>
        )}

        <PerfilForm
          perfilInicial={{ nombre: nombreInicial }}
          onGuardar={handleGuardar}
          textoBoton="Empezar"
        />
      </div>
    </div>
  );
}
