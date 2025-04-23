/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      keyframes: {
        'fade-in-right': {
          '0%': {
            opacity: '0',
            transform: 'translateX(100%)'
          },
          '100%': {
            opacity: '1',
            transform: 'translateX(0)'
          }
        },
        'fade-out-right': {
          '0%': {
            opacity: '1',
            transform: 'translateX(0)'
          },
          '100%': {
            opacity: '0',
            transform: 'translateX(100%)'
          }
        }
      },
      animation: {
        'fade-in-right': 'fade-in-right 0.4s ease-out',
        'fade-out-right': 'fade-out-right 0.4s ease-in forwards'
      }
    },
  },
  plugins: [],
};
