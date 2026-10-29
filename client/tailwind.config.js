/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#070B19',
          900: '#0B132B',
          800: '#111A36',
          700: '#1C2951',
          600: '#283A6D',
        },
        charcoal: {
          900: '#12151C',
          800: '#1A1E29',
          700: '#252B3A',
          600: '#343C50',
        },
        forensic: {
          purple: '#8B5CF6',
          indigo: '#6366F1',
          cyan: '#06B6D4',
          accent: '#7C3AED',
          warning: '#F59E0B',
          danger: '#EF4444',
          success: '#10B981',
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'grid-pattern': "radial-gradient(rgba(139, 92, 246, 0.08) 1px, transparent 1px)",
      },
    },
  },
  plugins: [],
};
