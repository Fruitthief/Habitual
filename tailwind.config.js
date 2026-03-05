/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#2d5a27',
          dark: '#1a2e1a',
          light: '#0a1f0c',
          pale: '#060e06',
        },
        background: '#000000',
        surface: '#0f0f0f',
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        body: ['Epilogue', 'system-ui', 'sans-serif'],
        sans: ['Epilogue', 'system-ui', 'sans-serif'],
      },
      animation: {
        'spring-bounce': 'springBounce 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'fire-pulse': 'firePulse 1.5s ease-in-out infinite',
        'fade-in': 'fadeIn 0.25s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'confetti-fall': 'confettiFall 1.2s ease-in forwards',
        'celebration': 'celebration 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'shimmer': 'shimmer 1.5s infinite',
      },
      keyframes: {
        springBounce: {
          '0%': { transform: 'scale(1)' },
          '40%': { transform: 'scale(1.35)' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { transform: 'scale(1)' },
        },
        firePulse: {
          '0%, 100%': { transform: 'scale(1)', filter: 'brightness(1)' },
          '50%': { transform: 'scale(1.25)', filter: 'brightness(1.2)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        confettiFall: {
          '0%': { transform: 'translateY(-30px) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'translateY(110vh) rotate(720deg)', opacity: '0' },
        },
        celebration: {
          '0%': { transform: 'scale(0)', opacity: '0' },
          '60%': { transform: 'scale(1.08)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.3)',
        'card-hover': '0 4px 12px rgba(0,0,0,0.5)',
        modal: '0 20px 60px rgba(0,0,0,0.7)',
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
}
