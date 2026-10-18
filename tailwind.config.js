/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#211f1d',
        ivory: '#f7f3ec',
        lavender: '#81719d',
        lilac: '#ebe5f1',
        clay: '#a46f5f',
      },
      fontFamily: {
        display: ['Georgia', 'Cambria', 'Times New Roman', 'serif'],
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: { soft: '0 18px 60px rgba(58, 45, 35, 0.09)' },
    },
  },
  plugins: [],
};
