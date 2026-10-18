/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#251b21',
        ivory: '#f8f5f0',
        lavender: '#73566a',
        lilac: '#eee5ea',
        clay: '#9b5f55',
      },
      fontFamily: {
        display: ['Georgia', 'Cambria', 'Times New Roman', 'serif'],
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 18px 60px rgba(58, 45, 35, 0.09)',
        luxe: '0 28px 90px rgba(55, 34, 45, 0.14)',
      },
    },
  },
  plugins: [],
};
