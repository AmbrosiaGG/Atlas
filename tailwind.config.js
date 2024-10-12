/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./node_modules/preline/dists/*",
    "./assets/css/**/*",
    "./assets/js/**/*",
    "./dashboard/views/**/*",
  ],
  theme: {
    extend: {
     fontFamily: {
      apple: "SF Pro Display",
      calsans: ["Cal Sans"] // CAL FUCKING SANS!!!!!!!!!!!!!!!!!!!!!!!!!!!!
     }
    },
  },
  plugins: [require("preline/plugin")],
};
