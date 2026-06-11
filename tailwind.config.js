/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        rail: {
          50: '#E8EEF4',
          100: '#D1DDE9',
          200: '#A3BBD3',
          300: '#7599BD',
          400: '#4777A7',
          500: '#1B3A5C',
          600: '#162E4A',
          700: '#112338',
          800: '#0C1726',
          900: '#070C14',
        },
        copper: {
          50: '#FDF3EC',
          100: '#FAE7D9',
          200: '#F5CFB3',
          300: '#F0B78D',
          400: '#E89F67',
          500: '#C87533',
          600: '#A05E29',
          700: '#78471F',
          800: '#503015',
          900: '#28180B',
        },
        slate: {
          650: '#4A5568',
        },
        warning: {
          500: '#E67E22',
        },
      },
      fontFamily: {
        serif: ['"Noto Serif SC"', 'serif'],
        sans: ['"Noto Sans SC"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
