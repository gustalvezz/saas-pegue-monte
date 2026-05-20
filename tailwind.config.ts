import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        teal: {
          DEFAULT: '#4ECDC4',
          dark: '#1FA8A4',
          light: '#E0F7F7',
        },
        coral: {
          DEFAULT: '#FF6B6B',
          light: '#FFF0EE',
        },
        green: {
          brand: '#95E1A3',
          dark: '#5CB85C',
          light: '#EDFAED',
        },
        purple: {
          brand: '#B39DDB',
          dark: '#9B6BC4',
          light: '#F5EEFB',
        },
        orange: {
          brand: '#FFAB76',
          light: '#FFF5E8',
        },
        brand: {
          dark: '#22223B',
          mid: '#66667A',
          light: '#AAAABC',
          border: '#E6DDF0',
          bg: '#FFF8FC',
        },
      },
      fontFamily: {
        nunito: ['Nunito', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
