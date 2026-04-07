/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Manrope", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        earth: {
          50: "#f8fbf3",
          100: "#eef5e2",
          200: "#dce9c6",
          300: "#bdd79f",
          500: "#5a9a4a",
          600: "#41783a",
          700: "#315f31",
          800: "#284d2c",
        },
      },
      boxShadow: {
        soft: "0 12px 32px rgba(26, 54, 29, 0.12)",
      },
    },
  },
  plugins: [],
};