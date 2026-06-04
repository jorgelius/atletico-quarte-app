import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { runSeedIfNeeded } from './data/seed.ts'

// Carga los datos de ejemplo la primera vez que se abre la app
runSeedIfNeeded();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
