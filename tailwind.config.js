/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{vue,js,ts,jsx,tsx}", // This includes all Vue components
    "./src/**/*.html",
    "./src/**/*.{js,jsx,ts,tsx,vue}",
  ],
  theme: {
    extend: {
      zIndex: {
        'settings': '50',  // Custom z-index for settings panel
      },
    },
  },
  plugins: [],
}