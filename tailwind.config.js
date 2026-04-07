/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        dojo: {
          black: '#0a0a0a',
          dark: '#111111',
          carbon: '#1a1a1a',
          slate: '#222222',
          red: '#dc2626',
          crimson: '#b91c1c',
          blood: '#991b1b',
          gold: '#d4a017',
          amber: '#f59e0b',
        },
      },
      fontFamily: {
        heading: ['"Bebas Neue"', 'Impact', 'sans-serif'],
        body: ['"Inter"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'strike': 'strike 2s ease-out infinite',
        'belt-flow': 'beltFlow 8s linear infinite',
        'ticker': 'ticker 70s linear infinite',
        'fade-in': 'fadeIn 0.8s ease-out forwards',
        'slide-up': 'slideUp 0.6s ease-out forwards',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        strike: {
          '0%': { transform: 'translateX(-100%) rotate(-45deg)', opacity: '0' },
          '50%': { opacity: '1' },
          '100%': { transform: 'translateX(100%) rotate(-45deg)', opacity: '0' },
        },
        beltFlow: {
          '0%': { backgroundPosition: '0% 50%' },
          '100%': { backgroundPosition: '200% 50%' },
        },
        ticker: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(-100%)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(40px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(220,38,38,0.3), 0 0 20px rgba(220,38,38,0.1)' },
          '100%': { boxShadow: '0 0 20px rgba(220,38,38,0.6), 0 0 60px rgba(220,38,38,0.2)' },
        },
      },
    },
  },
  plugins: [],
};
