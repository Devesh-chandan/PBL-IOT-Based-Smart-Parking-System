/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        darkBg: '#0f172a',
        electricBlue: '#3b82f6',
        luminousTeal: '#2dd4bf',
        occupiedRed: '#f43f5e',
      },
    },
  },
  plugins: [],
}