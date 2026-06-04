// ============================================================
// PerfilGuard — protege las rutas autenticadas
//   Sin sesión    → /login
//   Con sesión pero sin perfil → /primer-acceso (onboarding)
//   Con sesión y perfil → renderiza la ruta solicitada
// ============================================================
import { Navigate, Outlet } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { usePerfilStore } from '@/stores/perfilStore';

export default function PerfilGuard() {
  const { perfil, session, cargando } = usePerfilStore();

  if (cargando) {
    return (
      <div className="min-h-screen bg-quarte-azul flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-white">
          <Loader2 size={40} className="animate-spin" />
          <p className="font-titulo text-sm">Cargando…</p>
        </div>
      </div>
    );
  }

  if (!session) return <Navigate to="/login" replace />;
  if (!perfil)  return <Navigate to="/primer-acceso" replace />;

  return <Outlet />;
}
