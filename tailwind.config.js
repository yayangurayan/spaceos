/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1e3a8a',
        accent: '#06b6d4',
        couple: '#f43f5e',
        dark: '#0f172a',
        surface: '#1e293b',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.22, 1, 0.36, 1)',
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'slide-in': 'slideIn 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'slide-in-left': 'slideInLeft 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'slide-in-right': 'slideInRight 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 4s ease-in-out infinite',
        'shimmer': 'shimmer 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '25%': { transform: 'translateY(-12px) rotate(1deg)' },
          '75%': { transform: 'translateY(-18px) rotate(0.5deg)' },
        },
        glow: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.7' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      scale: {
        '102': '1.02',
      },
    },
  },
  plugins: [],
}
