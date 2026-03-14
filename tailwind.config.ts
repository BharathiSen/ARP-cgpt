import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      colors: {
        background: '#020617',
        foreground: '#ffffff',
        primary: '#00C8FF',
        secondary: '#1EA7FF',
        accent: '#4DEBFF',
        highlight: '#7C8CFF',
        muted: '#9AA6C4',
        'navy-dark': '#020c1b',
      }
    },
  },
  plugins: [],
}
export default config
