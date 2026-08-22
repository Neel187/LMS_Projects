/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg-dark': '#0b0f19',
        'bg-card': 'rgba(18, 24, 38, 0.85)',
        'bg-card-hover': 'rgba(28, 36, 56, 0.95)',
        'border-color': 'rgba(255, 255, 255, 0.08)',
        'border-glow': 'rgba(59, 130, 246, 0.3)',
        'primary-blue': '#3b82f6',
        'primary-indigo': '#6366f1',
        'primary-cyan': '#06b6d4',
        'accent-meta': '#1877f2',
        'status-new-bg': 'rgba(59, 130, 246, 0.15)',
        'status-new-text': '#60a5fa',
        'status-contacted-bg': 'rgba(245, 158, 11, 0.15)',
        'status-contacted-text': '#fbbf24',
        'status-qualified-bg': 'rgba(16, 185, 129, 0.15)',
        'status-qualified-text': '#34d399',
        'status-closed-bg': 'rgba(168, 85, 247, 0.15)',
        'status-closed-text': '#c084fc',
        'status-lost-bg': 'rgba(239, 68, 68, 0.15)',
        'status-lost-text': '#f87171',
        'text-main': '#f3f4f6',
        'text-muted': '#9ca3af',
        'text-dim': '#6b7280',
      },
    },
  },
  plugins: [],
}
