/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/renderer/index.html",
    "./src/renderer/src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        khmer: ['"Noto Sans Khmer"', 'system-ui', '-apple-system', 'sans-serif'],
        sans: ['"Noto Sans Khmer"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        horror: {
          900: '#1e0826',
          800: '#2e1040',
          700: '#4c1d95',
          600: '#6d28d9',
          500: '#8b5cf6',
          400: '#a78bfa',
          100: '#ede9fe',
          50: '#f5f3ff',
        }
      }
    },
  },
  plugins: [],
}
