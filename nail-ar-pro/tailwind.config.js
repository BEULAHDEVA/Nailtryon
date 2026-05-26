/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
    './lib/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        pink: {
          hot: '#FF2D78',
          neon: '#FF6EB4',
          soft: '#FFB3D1',
          glow: 'rgba(255,45,120,0.20)',
        },
        dark: {
          bg: '#0D0D1A',
          surface: '#1A1A2E',
          card: '#1E1E35',
        },
      },
      fontFamily: {
        display: ['Playfair Display', 'serif'],
        sans: ['Inter', 'sans-serif'],
      },
      animation: {
        'pulse-pink': 'pulsePink 1.5s ease-in-out infinite',
        'fade-in': 'fadeIn 0.4s ease',
        'slide-up': 'slideUp 0.5s cubic-bezier(0.34,1.56,0.64,1)',
      },
      keyframes: {
        pulsePink: {
          '0%,100%': { boxShadow: '0 0 0 0 rgba(255,45,120,0.4)' },
          '50%':      { boxShadow: '0 0 0 10px rgba(255,45,120,0)' },
        },
        fadeIn:  { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp: { from: { transform: 'translateY(20px)', opacity: '0' }, to: { transform: 'none', opacity: '1' } },
      },
    },
  },
  plugins: [],
};
