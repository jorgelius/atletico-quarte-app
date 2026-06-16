import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { runSeedIfNeeded } from './data/seed.ts'

// Carga los datos de ejemplo la primera vez que se abre la app.
// El render se retrasa hasta que el seed termine de escribir en IndexedDB,
// evitando que el store lea ejercicios antes de que existan.
runSeedIfNeeded().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
});
