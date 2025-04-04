/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}", // Covers all client-side files
    ],
    theme: {
      extend: {
        colors: {
          'brand-violet': '#6d28d9',
          'brand-yellow': '#facc15',
          'dark-bg': '#111827',
          'dark-surface': '#1f2937',
          'brand-dark-purple': '#130D2D',
          'brand-tekhelet': '#4C2E90',
          'brand-grape': '#6435AC',
          'brand-rich-black': '#010515',
          'brand-tekhelet-2': '#482A82',
          // Aliases
          'brand-bg': '#010515',
          'brand-primary': '#6435AC',
          'brand-accent': '#4C2E90',
        },
        fontFamily: {
          barlow: ['"Barlow Condensed"', 'sans-serif'],
        },
        keyframes: {
          fadeIn: {
            '0%': { opacity: 0 },
            '100%': { opacity: 1 },
          },
          'fade-in-up': {
            '0%': { opacity: 0, transform: 'translateY(20px) scale(0.95)' },
            '100%': { opacity: 1, transform: 'translateY(0) scale(1)' },
          },
        },
        animation: {
          'fade-in': 'fadeIn 0.3s ease-in-out',
          'fade-in-up': 'fade-in-up 0.3s ease-out forwards',
        },
      },
    },
    plugins: [],
  };
  