/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}", // Make sure this covers your file types
    ],
    theme: {
      extend: {
        // Add custom theme extensions later (colors, fonts)
        colors: {
          'brand-violet': '#6d28d9', // Example violet
          'brand-yellow': '#facc15', // Example neon yellow
          'dark-bg': '#111827',     // Example dark background
          'dark-surface': '#1f2937', // Example slightly lighter surface
        }
      },
    },
    plugins: [],
  }
