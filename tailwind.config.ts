import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--color-bg)',
        paper: 'var(--color-bg-paper)',
        surface: 'var(--color-bg-surface)',
        primary: {
          DEFAULT: 'var(--color-primary)',
          light: 'var(--color-primary-light)',
          dark: 'var(--color-primary-dark)',
          contrast: 'var(--color-primary-contrast)',
          hover: 'var(--color-primary-hover)',
          surface: 'var(--color-primary-surface)',
          muted: 'var(--color-primary-muted)',
        },
        ink: {
          DEFAULT: 'var(--color-text-primary)',
          soft: 'var(--color-text-secondary)',
          faint: 'var(--color-text-disabled)',
          inverse: 'var(--color-text-inverse)',
        },
        line: {
          DEFAULT: 'var(--color-border)',
          strong: 'var(--color-border-strong)',
        },
        error: { DEFAULT: 'var(--color-error)', surface: 'var(--color-error-surface)' },
        warning: { DEFAULT: 'var(--color-warning)', surface: 'var(--color-warning-surface)' },
        success: { DEFAULT: 'var(--color-success)', surface: 'var(--color-success-surface)' },
      },
      fontFamily: {
        display: ['var(--font-display)'],
        body: ['var(--font-body)'],
      },
      boxShadow: {
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
      },
      keyframes: {
        'skeleton-pulse': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.4' },
        },
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(6px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'skeleton-pulse': 'skeleton-pulse 1.5s ease-in-out infinite',
        // No fill mode: an animation that keeps applying after it ends makes each
        // row its own stacking context, and later rows paint over an open menu.
        'fade-up': 'fade-up 200ms ease-out',
      },
    },
  },
  plugins: [],
};

export default config;
