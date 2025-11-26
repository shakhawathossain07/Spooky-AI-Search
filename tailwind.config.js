/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'spooky-dark': '#0a0a0f',
        'spooky-purple': '#8b5cf6',
        'spooky-blue': '#3b82f6',
      },
    },
  },
  plugins: [],
}
