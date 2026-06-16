import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { runSeedIfNeeded } from './data/seed.ts'

// Espera a que el seed termine antes de renderizar para que IndexedDB
// ya tenga los ejercicios cuando el store haga la primera lectura.
// .finally() garantiza que la app siempre se monta aunque el seed falle.
runSeedIfNeeded()
  .catch(err => console.error('[Seed] Error al cargar datos iniciales:', err))
  .finally(() => {
    createRoot(document.getElementById('root')!).render(
      <StrictMode>
        <App />
      </StrictMode>,
    );
  });
