/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'herb-green': {
          50: '#E8F5E0',
          100: '#C8E6B4',
          200: '#A5D68A',
          300: '#82C660',
          400: '#6B9B37',
          500: '#4A7C2E',
          600: '#3D6826',
          700: '#2D5016',
          800: '#1E3A0F',
          900: '#0F2508',
        },
        'herb-amber': {
          50: '#FEF9E7',
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#FCD34D',
          400: '#D4A853',
          500: '#C28B2D',
          600: '#A16B15',
          700: '#8B6914',
          800: '#6B4F0F',
          900: '#4A360A',
        },
        'herb-cream': '#FEFCF3',
        'herb-terracotta': '#C75B39',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.5s ease-out',
        slideUp: 'slideUp 0.5s ease-out',
        slideDown: 'slideDown 0.5s ease-out',
        scaleIn: 'scaleIn 0.3s ease-out',
      },
    },
  },
  plugins: [],
}
