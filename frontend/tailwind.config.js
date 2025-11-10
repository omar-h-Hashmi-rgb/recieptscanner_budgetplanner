/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Primary gradient colors
        primary: {
          light: {
            from: '#2dd4bf', // teal-400
            to: '#3b82f6',   // blue-500
          },
          dark: {
            from: '#14b8a6', // teal-500
            to: '#2563eb',   // blue-600
          },
        },
        // Custom background colors for better control
        bg: {
          light: '#f8fafc',  // slate-100
          'light-card': '#ffffff', // white
          dark: '#0f172a',   // slate-900
          'dark-card': '#1e293b', // slate-800
        },
        // Custom text colors
        text: {
          'primary-light': '#1e293b', // slate-800
          'secondary-light': '#64748b', // slate-500
          'primary-dark': '#e2e8f0', // slate-200
          'secondary-dark': '#94a3b8', // slate-400
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'bounce-gentle': 'bounceGentle 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        bounceGentle: {
          '0%, 20%, 50%, 80%, 100%': { transform: 'translateY(0)' },
          '40%': { transform: 'translateY(-5px)' },
          '60%': { transform: 'translateY(-3px)' },
        },
      },
    },
  },
  plugins: [],
}