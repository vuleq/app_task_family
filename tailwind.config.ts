import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Comic Neue"', 'sans-serif'],
        heading: ['"Baloo 2"', 'cursive'],
      },
      colors: {
        primary: {
          50: '#FAF5FF',
          100: '#F3E8FF',
          200: '#E9D5FF',
          300: '#D8B4FE',
          400: '#C084FC',
          500: '#A855F7',
          600: '#9333EA', // Primary Violet
          700: '#7E22CE',
          800: '#6B21A8',
          900: '#4C1D95', // Deep Purple text
        },
        accent: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316', // CTA Orange
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
        secondary: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa', // Light Violet
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
        },
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(124, 58, 237, 0.1), 0 2px 15px -3px rgba(124, 58, 237, 0.05)',
        'kid': '0 8px 0px 0px rgba(124, 58, 237, 0.1)',
      },
      borderRadius: {
        'v-2xl': '1.5rem',
        'v-3xl': '2rem',
      }
    },
  },
  plugins: [],
}
export default config

