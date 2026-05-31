/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Fredoka One"', 'cursive'],
        body: ['Quicksand', 'sans-serif'],
      },
      colors: {
        'wood': {
          light: '#C4A882',
          DEFAULT: '#8B6F47',
          dark: '#5C4A2E',
        },
        'parchment': {
          light: '#FFF8E7',
          DEFAULT: '#F5E6C8',
          dark: '#D4C5A0',
        },
        'selga': '#2E8B57',
        'gc': '#FFD700',
        'kesejahteraan': '#FF6B6B',
        'crisis': '#DC2626',
      },
      minWidth: {
        'touch': '44px',
        'fab': '64px',
      },
    },
  },
  plugins: [],
};