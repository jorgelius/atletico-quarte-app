// ============================================================
// PUNTO DE ENTRADA DE LA CAPA DE DATOS
// ============================================================
// TODO backend: aquí es donde se cambia el provider.
// Para conectar un servidor futuro:
//   1. Crea RemoteDataProvider implementando DataProvider
//   2. Sustituye la línea de abajo por:
//      export const dataProvider: DataProvider = new RemoteDataProvider(config)
// Las pantallas no necesitan ningún otro cambio.
// ============================================================

import { RemoteDataProvider } from './RemoteDataProvider';
import type { DataProvider } from './DataProvider';

export const dataProvider: DataProvider = new RemoteDataProvider();

// Re-exportamos tipos para facilitar los imports en las pantallas
export type { DataProvider, FiltroEntrenamiento, FiltroTactica } from './DataProvider';
