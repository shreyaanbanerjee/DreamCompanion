/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        csk: {
          yellow: '#FDB913',
          gold: '#FFD700',
          blue: '#002B49',
          navy: '#0B132B',
          dark: '#070C18',
          card: '#0F1A30',
          border: '#1E2D4A',
          accent: '#0084FF',
          crimson: '#FF2E54',
          emerald: '#00E676',
        }
      },
      animation: {
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ping-slow': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
      }
    },
  },
  plugins: [],
}

