/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        seal: {
          light: '#cfe0f1',
          DEFAULT: '#5d8fc4',
          dark: '#3d6ea1',
        },
        eco: {
          50:  '#eefaf2',
          100: '#d6f2e0',
          500: '#3fa365',
          600: '#2f8852',
        },
      },
      fontFamily: {
        sans: ['Pretendard', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
