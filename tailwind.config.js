/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Brand tokens: driven by CSS variables so each client organization
        // can override them at runtime (see app/globals.css).
        brand: 'var(--brand)',
        'brand-soft': 'var(--brand-soft)',
        'brand-strong': 'var(--brand-strong)',
        'on-brand': 'var(--on-brand)',

        warning: 'var(--warning)',
        'warning-soft': 'var(--warning-soft)',
        danger: 'var(--danger)',
        'danger-soft': 'var(--danger-soft)',
        purple: 'var(--purple)',
        'purple-soft': 'var(--purple-soft)',
        coral: 'var(--coral)',
        'coral-soft': 'var(--coral-soft)',
        accentwarm: 'var(--accent-warm)',
        'accentwarm-soft': 'var(--accent-warm-soft)',

        ink: 'var(--ink)',
        'ink-soft': 'var(--ink-soft)',
        'ink-muted': 'var(--ink-muted)',
        surface: 'var(--surface)',
        'surface-muted': 'var(--surface-muted)',
        line: 'var(--line)'
      },
      borderRadius: {
        card: '18px',
        pill: '20px'
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(16px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' }
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        }
      },
      animation: {
        fadeInUp: 'fadeInUp 0.25s ease-out',
        slideInRight: 'slideInRight 0.25s ease-out',
        fadeIn: 'fadeIn 0.2s ease-out'
      }
    }
  },
  plugins: []
};
