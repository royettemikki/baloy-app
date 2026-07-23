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
      }
    }
  },
  plugins: []
};
