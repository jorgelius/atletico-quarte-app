# CD Atlético Quarte — App

Aplicación web para la gestión de plantilla, entrenamientos y tácticas del **CD Atlético Quarte** de Cuarte de Huerva (Zaragoza). 100% local — sin servidores ni cuentas requeridas.

## Requisitos

- Node.js ≥ 20 · npm ≥ 10

## Instalación y arranque

```bash
npm install
npm run dev
# → http://localhost:5173
```

## Build de producción

```bash
npm run build && npm run preview
```

## Funcionalidades

- **Perfil local** — nombre, equipo, rol; foto guardada como base64
- **Plantilla** — campo F7/F11 interactivo (Konva), formaciones, fichas arrastrables, exportar PNG
- **PitchBoard** — editor de pizarra táctica con keyframes + animación Play
- **Entrenamientos** — biblioteca con filtros, favoritos, sugeridos; formulario con pizarra integrada
- **Tácticas** — igual estructura, tipos (sistema, presión, salida, etc.) y pizarra animada
- **Sin backend** — todo en IndexedDB; pantallas de login/registro maquetadas para el futuro

## Seed de datos de ejemplo

Al primer arranque se cargan 4 entrenamientos y 1 táctica sugeridos. Para resetear: borra `atletico_quarte_db` en IndexedDB y `atq_seed_v1` en localStorage.

## Conectar backend en el futuro

Toda la capa de datos pasa por `src/data/DataProvider.ts`. Para añadir un servidor:

1. Crea `src/data/RemoteDataProvider.ts` implementando la misma interfaz
2. En **`src/data/index.ts`** (comentario `// TODO backend`) cambia una línea:

```typescript
// Antes:
export const dataProvider: DataProvider = new LocalDataProvider();
// Después:
export const dataProvider: DataProvider = new RemoteDataProvider({ baseUrl: '…' });
```

Las páginas no necesitan ningún cambio.

## Stack

React 19 · Vite 8 · TypeScript 6 · Tailwind 3.4.17 · React Router 7 · Zustand 5 · Dexie 4 · react-konva · lucide-react

---
*CD Atlético Quarte · Los Halcones · Cuarte de Huerva, Zaragoza*

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
