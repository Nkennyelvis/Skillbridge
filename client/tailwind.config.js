/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#3A7BFF',
        accent: '#28C76F',
        danger: '#FF4D4F',
        warning: '#FAAD14',
        surface: '#F5F7FB',
        dark: '#2B2B2B',
      },
      fontFamily: {
        heading: ['Poppins', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
      },
      boxShadow: {
        card: '0 2px 16px rgba(0,0,0,0.07)',
        'card-hover': '0 8px 32px rgba(58,123,255,0.13)',
      },
    },
  },
  plugins: [],
}
