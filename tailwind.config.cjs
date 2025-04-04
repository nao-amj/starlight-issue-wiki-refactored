
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        primary: '#28a745',    // 「崩壊」能力をイメージした緑色
        secondary: '#007bff',  // 「凍結」能力をイメージした青色
        accent: '#dc3545',     // 「共鳴」能力をイメージした赤色
        dark: '#212529',
        light: '#f8f9fa'
      },
      fontFamily: {
        sans: ['"Noto Sans JP"', 'sans-serif'],
        heading: ['"M PLUS Rounded 1c"', 'sans-serif']
      }
    },
  },
  plugins: [],
};
