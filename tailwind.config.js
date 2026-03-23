/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // SPEC-defined semantic colors
        navy: { DEFAULT: '#1E3A5F', 50: '#EBF0F7', 100: '#C5D4E8', 500: '#1E3A5F', 700: '#162D4A', 900: '#0D1B2E' },
        'sa-purple': { DEFAULT: '#6A1B9A', 50: '#F3E5F5', 100: '#E1BEE7', 500: '#6A1B9A', 700: '#4A148C', 900: '#2E0066' },
        amber: { DEFAULT: '#F9A825', surface: '#FFF8E1', warn: '#F57F17' },
        'status-blue': { DEFAULT: '#1565C0', surface: '#E3F2FD' },
        'status-green': { DEFAULT: '#2E7D32', surface: '#E8F5E9' },
        'status-red': { DEFAULT: '#C62828', surface: '#FFEBEE' },
      },
      fontFamily: {
        heading: ['"Fira Code"', 'monospace'],
        body: ['"Fira Sans"', 'sans-serif'],
        sans: ['"Fira Sans"', 'sans-serif'],
        mono: ['"Fira Code"', 'monospace'],
      },
      borderRadius: { '2xl': '1rem', '3xl': '1.5rem' },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)',
        'card-hover': '0 4px 6px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.05)',
        modal: '0 20px 25px rgba(0,0,0,0.12), 0 10px 10px rgba(0,0,0,0.06)',
        fab: '0 4px 14px rgba(30,58,95,0.35)',
      },
      animation: {
        shimmer: 'shimmer 1.5s infinite linear',
        'slide-up': 'slideUp 300ms cubic-bezier(0.32,0.72,0,1)',
        'fade-in': 'fadeIn 200ms ease',
        'snack-in': 'snackIn 200ms cubic-bezier(0.32,0.72,0,1)',
      },
      keyframes: {
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        slideUp: { from: { transform: 'translateY(100%)' }, to: { transform: 'translateY(0)' } },
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        snackIn: { from: { opacity: 0, transform: 'translateY(8px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
}
