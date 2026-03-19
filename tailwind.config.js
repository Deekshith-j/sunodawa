/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Medical White + Blue palette
        bg: {
          primary: '#F0F6FF',
          surface: '#FFFFFF',
          elevated: '#E8F1FC',
          deep: '#D6E8FA',
        },
        blue: {
          primary: '#1A6FDB',
          deep: '#0B4EA8',
          light: '#4CA3F5',
          pale: '#EBF3FF',
          mid: '#2D8EF0',
        },
        // Legacy aliases
        'cyan-bright': '#1A6FDB',
        'cyan-mid': '#2D8EF0',
        'bio-green': '#16C784',
        'med-amber': '#F59E0B',
        'med-red': '#EF4444',
        'med-purple': '#7C3AED',
        'text-primary': '#0D1B3E',
        'text-secondary': '#375A87',
        'text-muted': '#94A8C3',
      },
      fontFamily: {
        display: ['Outfit', 'sans-serif'],
        body:    ['Inter', 'sans-serif'],
        mono:    ['JetBrains Mono', 'monospace'],
        sans:    ['Inter', 'sans-serif'],
        orbitron: ['Outfit', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
