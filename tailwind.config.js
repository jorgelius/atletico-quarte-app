/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Tokens de color CD Atlético Quarte
      colors: {
        quarte: {
          azul:       '#014181',  // Azul Quarte – cabeceras y navegación
          rojo:       '#D9161E',  // Rojo Quarte – acciones primarias
          blanco:     '#FFFFFF',  // Blanco
          verde:      '#328F3B',  // Verde Laurel – éxito / confirmación
          negro:      '#1A1A1A',  // Negro Carbón – texto principal
          gris:       '#F3F4F6',  // Fondo suave
          azulClaro:  '#E8EFF7',  // Fondo cabecera secundaria
          cesped:     '#2E7D32',  // Verde césped del campo
          cespedLuz:  '#4CAF50',  // Verde César más claro (mitad del campo)
        },
      },
      // Tipografías del club
      fontFamily: {
        titulo: ['Montserrat', 'sans-serif'],
        cuerpo: ['Inter', 'sans-serif'],
      },
      // Sombras personalizadas
      boxShadow: {
        card: '0 2px 8px rgba(1,65,129,0.12)',
        nav:  '0 -2px 8px rgba(1,65,129,0.10)',
      },
    },
  },
  plugins: [],
}

