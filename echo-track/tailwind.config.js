/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        teal: {
          50: '#f0fdf9',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#56cc9d', // Requested color
          600: '#48ab84', // Darker for hover
          700: '#3b876a',
          800: '#326b56',
          900: '#2a5848',
          950: '#16352c',
        },
      },
    },
  },
  plugins: [],
}
