// ============================================================
// App.tsx — Enrutador principal CD Atlético Quarte
// ============================================================
import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { usePerfilStore } from '@/stores/perfilStore';

// Layout
import AppLayout   from '@/components/layout/AppLayout';
import PerfilGuard from '@/components/layout/PerfilGuard';

// Páginas públicas (sin necesitar perfil)
import PrimerAccesoPage from '@/pages/PrimerAccesoPage';
import LoginPage        from '@/pages/auth/LoginPage';
import RegistroPage     from '@/pages/auth/RegistroPage';

// Páginas protegidas (requieren perfil local)
import InicioPage         from '@/pages/InicioPage';
import PlantillaPage      from '@/pages/PlantillaPage';
import EntrenamientosPage from '@/pages/EntrenamientosPage';
import TacticasPage       from '@/pages/TacticasPage';
import PerfilPage         from '@/pages/PerfilPage';

export default function App() {
  const { inicializarAuth } = usePerfilStore();

  useEffect(() => {
    const unsubscribe = inicializarAuth();
    return unsubscribe;
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* ── Rutas PÚBLICAS (sin NavBar, sin guard) ────────── */}
        <Route path="/primer-acceso" element={<PrimerAccesoPage />} />
        <Route path="/login"         element={<LoginPage />} />
        <Route path="/registro"      element={<RegistroPage />} />

        {/* ── Rutas PROTEGIDAS (con NavBar + guard de perfil) ── */}
        <Route element={<PerfilGuard />}>
          <Route element={<AppLayout />}>
            <Route index                   element={<Navigate to="/inicio" replace />} />
            <Route path="/inicio"          element={<InicioPage />} />
            <Route path="/plantilla"       element={<PlantillaPage />} />
            <Route path="/entrenamientos"  element={<EntrenamientosPage />} />
            <Route path="/tacticas"        element={<TacticasPage />} />
            <Route path="/perfil"          element={<PerfilPage />} />
          </Route>
        </Route>

        {/* Ruta no encontrada → inicio */}
        <Route path="*" element={<Navigate to="/inicio" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
