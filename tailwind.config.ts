import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './context/**/*.{js,ts,jsx,tsx,mdx}',
    './hooks/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg:       '#0f0f13',
        surface:  '#16161d',
        surface2: '#1e1e28',
        surface3: '#252532',
        border:   '#2a2a38',
        border2:  '#333345',
        ink:      '#f0eefc',
        ink2:     '#a8a6c0',
        ink3:     '#5c5a72',
        accent:   '#7c6af7',
        accent2:  '#9d8fff',
        emerald:  '#2dd4a0',
        amber:    '#f5a623',
        danger:   '#f06060',
        azure:    '#60a5fa',
      },
      fontFamily: {
        serif: ['"DM Serif Display"', 'serif'],
        sans:  ['"DM Sans"', 'sans-serif'],
        mono:  ['"JetBrains Mono"', 'monospace'],
      },
      animation: {
        'pulse-dot':   'pulseDot 1.2s infinite',
        'flash-fade':  'flashFade 0.6s ease forwards',
        'slide-right': 'slideInRight 0.3s ease',
      },
      keyframes: {
        pulseDot:      { '0%,100%': { opacity: '1' }, '50%': { opacity: '0.35' } },
        flashFade:     { '0%': { opacity: '1' },      '100%': { opacity: '0' } },
        slideInRight:  { from: { transform: 'translateX(80px)', opacity: '0' }, to: { transform: 'translateX(0)', opacity: '1' } },
      },
    },
  },
  plugins: [],
}

export default config
