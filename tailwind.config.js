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
        // Core theme colors aligned with DESIGN.md
        primary: {
          DEFAULT: '#0284c7', // Sky 600 (WCAG AA compliant contrast on light)
          light: '#38bdf8',   // Sky 400 (Luminous accent for dark mode)
          dark: '#0369a1',    // Sky 700
        },
        accent: {
          DEFAULT: '#38bdf8', // Luminous Sky Blue (Dark mode accent)
          hover: '#0ea5e9',
        },
        dark: {
          DEFAULT: '#090D16', // Deep Night Void
          base: '#090D16',
          surface: '#121826', // Night Slate
          elevated: '#1A2234',
        },
        surface: {
          DEFAULT: '#121826',
          elevated: '#1A2234',
        },
        // Light mode surfaces
        light: {
          base: '#F8FAFC',
          surface: '#FFFFFF',
          elevated: '#FFFFFF',
          border: '#E2E8F0',
        },
        // Semantic status colors
        profit: '#10b981',
        loss: '#f43f5e',
        couple: '#f43f5e',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      transitionTimingFunction: {
        spring: 'cubic-bezier(0.2, 0, 0, 1)',
        smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s cubic-bezier(0.2, 0, 0, 1) forwards',
        'slide-in': 'slideIn 0.25s cubic-bezier(0.2, 0, 0, 1) forwards',
        'slide-in-left': 'slideInLeft 0.25s cubic-bezier(0.2, 0, 0, 1) forwards',
        'slide-in-right': 'slideInRight 0.25s cubic-bezier(0.2, 0, 0, 1) forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-12px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(12px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
      scale: {
        '102': '1.02',
      },
    },
  },
  plugins: [],
}
