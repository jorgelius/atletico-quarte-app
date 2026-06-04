// ============================================================
// AppLayout — layout principal de la app (con NavBar)
// ============================================================
import { Outlet } from 'react-router-dom';
import NavBar from './NavBar';

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-quarte-gris flex">
      <NavBar />

      {/* Contenido principal */}
      {/* En desktop desplazamos a la derecha del sidebar */}
      {/* En móvil dejamos espacio en la parte inferior para la barra */}
      <main className="flex-1 lg:ml-20 xl:ml-56 pb-20 lg:pb-0 min-h-screen">
        <Outlet />
      </main>
    </div>
  );
}
