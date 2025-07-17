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
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: '#2563eb',
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#2563eb',
          600: '#1d4ed8',
          900: '#1e3a8a',
          foreground: '#ffffff',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: '#f97316',
          foreground: '#ffffff',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        // Modern SaaS colors
        success: '#059669',
        warning: '#f59e0b',
        danger: '#ef4444',
        bg: '#fafafa',
        line: '#e5e7eb',
        // Modern SaaS sidebar colors
        sidebar: {
          DEFAULT: '#fafafc',
          hover: '#f8fafc',
          active: '#f1f5f9',
          border: '#e2e8f0',
        },
        nav: {
          DEFAULT: '#64748b',
          hover: '#334155',
          active: '#0f172a',
        },
        slate: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      spacing: {
        'container': '72px',
        'sidebar': '16px',
        'sidebar-wide': '24px',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        DEFAULT: '8px',
        'card': '12px',
        'nav': '10px',
        'nav-lg': '12px',
      },
      fontSize: {
        'display': ['34px', { lineHeight: '1.2', fontWeight: '700' }],
        'heading': ['28px', { lineHeight: '1.3', fontWeight: '600' }],
        'subheading': ['20px', { lineHeight: '1.4', fontWeight: '600' }],
        'body': ['16px', { lineHeight: '1.5', fontWeight: '400' }],
        'small': ['14px', { lineHeight: '1.4', fontWeight: '400' }],
        'caption': ['12px', { lineHeight: '1.3', fontWeight: '500' }],
      },
      animation: {
        'nav-hover': 'navHover 0.2s ease-in-out',
        'nav-active': 'navActive 0.15s ease-out',
      },
      keyframes: {
        navHover: {
          '0%': { transform: 'translateX(0)', backgroundColor: 'transparent' },
          '100%': { transform: 'translateX(2px)', backgroundColor: '#f8fafc' },
        },
        navActive: {
          '0%': { transform: 'scale(0.98)' },
          '100%': { transform: 'scale(1)' },
        },
      },
      boxShadow: {
        'nav': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.1)',
        'nav-hover': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'nav-active': '0 2px 4px 0 rgba(59, 130, 246, 0.15)',
      },
    },
  },
  plugins: [],
}
export default config