/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          50:  '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
      },
      boxShadow: {
        card:     '0 1px 3px 0 rgb(0 0 0/.06),0 1px 2px -1px rgb(0 0 0/.06)',
        'card-md':'0 4px 16px -4px rgb(0 0 0/.10)',
        modal:    '0 24px 64px -12px rgb(0 0 0/.25)',
      },
      animation: {
        'fade-in':   'fadeIn .18s ease-out',
        'scale-in':  'scaleIn .2s ease-out',
        'slide-down':'slideDown .22s ease-out',
      },
      keyframes: {
        fadeIn:    { from:{opacity:'0'},                             to:{opacity:'1'} },
        scaleIn:   { from:{opacity:'0',transform:'scale(.96)'},      to:{opacity:'1',transform:'scale(1)'} },
        slideDown: { from:{opacity:'0',transform:'translateY(-8px)'},to:{opacity:'1',transform:'translateY(0)'} },
      },
    },
  },
  plugins: [],
}