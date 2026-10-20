/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        khmer: ['"Noto Sans Khmer"', 'system-ui', '-apple-system', 'sans-serif'],
        sans: ['"Noto Sans Khmer"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        horror: {
          50: '#fbf7fe',
          100: '#f5edfd',
          200: '#ebdcfb',
          300: '#dbbdf7',
          400: '#c393f0',
          500: '#aa66e7',
          600: '#9242d8',
          700: '#792ebc',
          800: '#65279a',
          900: '#53237d',
          950: '#1b062c',
        },
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(109, 40, 217, 0.08)',
        'glass-hover': '0 12px 40px 0 rgba(109, 40, 217, 0.14)',
        'glass-glow': '0 0 25px rgba(139, 92, 246, 0.25)',
      },
      backdropBlur: {
        'xs': '2px',
      }
    },
  },
  plugins: [],
}
