/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          900: "#0b0f17",
          800: "#111827",
          700: "#1f2937",
          600: "#374151",
        },
        trade: {
          green: "#22c55e",
          red: "#ef4444",
          neonGreen: "#10b981",
          neonRed: "#f43f5e",
        }
      }
    },
  },
  plugins: [],
}
