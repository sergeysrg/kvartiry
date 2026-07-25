import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './hooks/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Палитра снята с сайта-референса: бирюзово-зелёный бренд.
        accent: {
          DEFAULT: '#458c8e', // бирюза — акценты
          dark: '#397374',
        },
        navy: {
          DEFAULT: '#175844', // зелёный — вторичные кнопки
          dark: '#243f2c', // hover зелёных кнопок
        },
        cta: {
          DEFAULT: '#24272a', // графит — главный CTA
          hover: '#175844', // на ховере зеленеет
        },
        ink: '#17161a',
        body: '#383838',
        muted: '#7c7c7c',
        soft: '#f0eff4',
        line: '#eaeaea',
        track: '#e7e7e7',
        danger: '#e0341c',
      },
      fontFamily: {
        sans: [
          'var(--font-manrope)',
          'TT Norms Pro',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Arial',
          'sans-serif',
        ],
      },
      borderRadius: {
        xs: '4px',
        pill: '100rem',
      },
      boxShadow: {
        card: '0 12px 40px rgba(23,22,26,.14)',
        header: '0 2px 20px rgba(23,22,26,.08)',
      },
      transitionTimingFunction: {
        smooth: 'cubic-bezier(.4,0,.2,1)',
      },
      keyframes: {
        stepIn: {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'none' },
        },
      },
      animation: {
        stepIn: 'stepIn .35s cubic-bezier(.4,0,.2,1) both',
      },
    },
  },
  plugins: [],
};

export default config;
