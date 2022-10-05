/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      animation: {
        fade: "fadeIn 5s ease-in-out",
      },
      keyframes: (theme) => ({
        fadeIn: {
          "0%": { backgroundColor: theme("opacity.0") },
          "100%": { backgroundColor: theme("opacity.100") },
        },
      }),
    },
  },
  plugins: [],
};
