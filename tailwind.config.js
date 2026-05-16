/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        linkedin: {
          blue: '#0a66c2',
          bg: '#f3f2ef',
        }
      }
    },
  },
  plugins: [],
};
