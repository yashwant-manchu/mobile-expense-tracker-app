/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        dark: '#222831',
        darkerGray: '#393E46',
        accent: '#00ADB5',
        light: '#EEEEEE',
      }
    },
  },
  plugins: [],
}