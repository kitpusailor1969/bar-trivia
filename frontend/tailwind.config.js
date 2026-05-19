/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: { yellow: '#facc15', dark: '#030712' },
      },
    },
  },
  plugins: [],
}
