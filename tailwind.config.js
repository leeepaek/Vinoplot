/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Pretendard"', '"Inter"', '"Noto Sans KR"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['"Outfit"', '"Pretendard"', 'sans-serif'],
        serif: ['"Noto Serif KR"', 'ui-serif', 'Georgia', 'serif'],
      },
      colors: {
        burgundy: {
          500: '#800020',
          900: '#2C041C',
        },
        champagne: {
          400: '#F7E7CE',
          500: '#EED9C4',
        },
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2.5s linear infinite',
        'aurora': 'aurora 20s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        aurora: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
      },
    },
  },
  plugins: [],
}
