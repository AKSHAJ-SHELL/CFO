import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/sections/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // SaaS color palette
        primary: {
          teal: '#0ea5a4',
          green: '#34d399',
          blue: '#60a5fa',
        },
        background: {
          DEFAULT: '#f7fafc',
          hero: '#0b1116',
          heroOverlay: '#0b1116',
          main: '#f7fafc',
          white: '#ffffff',
          card: '#ffffff',
        },
        text: {
          dark: '#0f172a',
          light: '#e6eef6',
          muted: '#64748b',
          onDark: '#e6eef6',
        },
        accent: {
          violet: '#7c3aed',
          teal: '#0ea5a4',
          blue: '#60a5fa',
        },
        status: {
          success: '#10b981',
          warning: '#f59e0b',
          error: '#ef4444',
          info: '#3b82f6',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['Space Grotesk', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['Monaco', 'Menlo', 'monospace'],
      },
      fontSize: {
        // Desktop sizes
        'h1-desktop': ['4.5rem', { lineHeight: '1.2', fontWeight: '700' }],
        'h2-desktop': ['3rem', { lineHeight: '1.2', fontWeight: '700' }],
        'h3-desktop': ['2rem', { lineHeight: '1.3', fontWeight: '600' }],
        'h4-desktop': ['1.5rem', { lineHeight: '1.4', fontWeight: '600' }],
        // Mobile sizes
        'h1-mobile': ['2.5rem', { lineHeight: '1.2', fontWeight: '700' }],
        'h2-mobile': ['2rem', { lineHeight: '1.3', fontWeight: '700' }],
        'h3-mobile': ['1.5rem', { lineHeight: '1.4', fontWeight: '600' }],
        'h4-mobile': ['1.25rem', { lineHeight: '1.5', fontWeight: '600' }],
      },
      spacing: {
        // 8px base units
        'section-desktop': '6rem', // 96px py-24
        'section-mobile': '3rem', // 48px py-12
      },
      boxShadow: {
        'card': '0 8px 30px rgba(2, 6, 23, 0.35)',
        'soft': '0 8px 30px rgba(2, 6, 23, 0.35)',
      },
      borderRadius: {
        'card': '0.75rem', // 12px
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-in-out',
        'slide-up': 'slideUp 0.6s ease-out',
        'fade-in-up': 'fadeInUp 0.6s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeInUp: {
          '0%': { transform: 'translateY(30px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
export default config

