/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Club+ Brand Colors
        primary: '#ff0000', // Rojo principal - CTA, acciones
        secondary: '#ffffff', // Blanco - backgrounds, contraste

        // Neutros
        'gray-dark': '#1e293b', // Texto fuerte sobre blanco
        'gray-light': '#f8fafc', // Fondos secundarios

        // Estados del sistema
        success: '#22c55e', // Verde - confirmaciones
        error: '#dc2626', // Rojo oscuro - errores (distinto al primario)
        warning: '#facc15', // Amarillo - advertencias
      },
      fontFamily: {
        title: ['Code Pro', 'Inter', 'sans-serif'], // Títulos - geométrico, fuerte
        body: ['Poppins', 'Inter', 'sans-serif'], // Cuerpo - alta legibilidad
        sans: ['Poppins', 'Inter', 'system-ui', 'sans-serif'], // Default
      },
      fontSize: {
        hero: ['48px', { lineHeight: '1.2', fontWeight: '700' }], // H1 Hero
        h2: ['32px', { lineHeight: '1.3', fontWeight: '600' }], // H2
        body: ['16px', { lineHeight: '1.6', fontWeight: '400' }], // Body
        label: ['14px', { lineHeight: '1.5', fontWeight: '500' }], // Labels/notas
      },
      borderRadius: {
        xl: '12px', // Botones, inputs
        '2xl': '16px', // Cards, containers
      },
      boxShadow: {
        soft: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        hover: '0 10px 15px -3px rgba(255, 0, 0, 0.1), 0 4px 6px -2px rgba(255, 0, 0, 0.05)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'scale-hover': 'scale 0.2s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scale: {
          '0%': { transform: 'scale(1)' },
          '100%': { transform: 'scale(1.05)' },
        },
      },
    },
  },
  plugins: [],
};
