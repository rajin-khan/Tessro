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
      },
    },
    plugins: [],
  };
  