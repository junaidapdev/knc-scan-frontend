import type { Config } from 'tailwindcss';
// tailwindcss-rtl ships CJS with no types; the shim below keeps strict mode happy.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore — no types available
import tailwindcssRtl from 'tailwindcss-rtl';

/**
 * Design system — Precision (black) · Energy (yellow) · Clarity (white).
 * Yellow is used sparingly and purposefully — primary buttons, active nav
 * states, key metric highlights, and accent lines only. Never as a bg fill.
 */
const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Primary — Energy
        yellow: {
          DEFAULT: '#FFD700',
          hover: '#F5C200',
          tint: '#FFF8D6',
        },
        // Obsidian — Precision
        obsidian: {
          DEFAULT: '#0D0D0D',
          surface: '#1A1A1A',
          border: '#2E2E2E',
        },
        // Clarity
        canvas: {
          DEFAULT: '#FFFFFF',
          bg: '#F7F7F5',
        },
        // Semantic
        success: '#27AE60',
        danger: '#E74C3C',
        warning: '#F39C12',
        info: '#2980B9',
      },
      fontFamily: {
        display: ['"Bebas Neue"', 'Impact', 'sans-serif'],
        sans: [
          '"DM Sans"',
          'system-ui',
          '-apple-system',
          '"Segoe UI"',
          'Roboto',
          '"Noto Sans Arabic"',
          'sans-serif',
        ],
        mono: ['"Space Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      fontSize: {
        eyebrow: ['10px', { lineHeight: '1.2', letterSpacing: '3px' }],
        'display-sm': ['32px', { lineHeight: '1.05', letterSpacing: '3px' }],
        'display-md': ['40px', { lineHeight: '1.05', letterSpacing: '3px' }],
        'display-lg': ['48px', { lineHeight: '1.05', letterSpacing: '3px' }],
      },
      letterSpacing: {
        display: '3px',
      },
      spacing: {
        // Spacing scale → 4 · 8 · 12 · 16 · 24 · 32 · 48 (Tailwind covers all).
      },
      borderRadius: {
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px',
      },
      borderWidth: {
        hairline: '0.5px',
      },
      boxShadow: {
        'focus-yellow': '0 0 0 3px rgba(255, 215, 0, 0.4)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        'fade-in': 'fade-in 150ms ease-out',
      },
    },
  },
  plugins: [tailwindcssRtl],
};

export default config;
