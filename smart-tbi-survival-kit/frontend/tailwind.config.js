/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        dark: '#0B1220',
        card: '#1E293B',
        accent: '#F5B700',
        success: '#22C55E',
        warning: '#EAB308',
        danger: '#EF4444',
      },
      animation: {
        'danger-pulse': 'dangerPulse 1s ease-in-out infinite',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        dangerPulse: {
          '0%, 100%': {
            opacity: '1',
            boxShadow: '0 0 0 0 rgba(239, 68, 68, 0.7)',
          },
          '50%': {
            opacity: '0.85',
            boxShadow: '0 0 0 20px rgba(239, 68, 68, 0)',
          },
        },
      },
    },
  },
  plugins: [],
};
