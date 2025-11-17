/**
 * FinPilot SaaS Design Tokens
 * Centralized design system tokens for consistent styling across the application
 */

export const colors = {
  // Primary gradient colors (teal → blue)
  primary: {
    teal: '#0ea5a4',
    green: '#34d399',
    blue: '#60a5fa',
  },
  // Neutral backgrounds
  background: {
    hero: '#0b1116', // Dark hero background
    heroOverlay: '#0b1116', // Dark hero overlay
    main: '#f7fafc', // Light main content background
    white: '#ffffff', // Pure white
    card: '#ffffff', // Card background
  },
  // Text colors
  text: {
    dark: '#0f172a', // Dark text on light backgrounds
    light: '#e6eef6', // Light text on dark hero
    muted: '#64748b', // Muted text
    onDark: '#e6eef6', // Text on dark backgrounds
  },
  // Accent colors
  accent: {
    violet: '#7c3aed', // Violet for small highlights
    teal: '#0ea5a4',
    blue: '#60a5fa',
  },
  // Status colors
  status: {
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
  },
} as const;

export const typography = {
  fonts: {
    sans: ['Inter', 'system-ui', 'sans-serif'],
    heading: ['Space Grotesk', 'Inter', 'system-ui', 'sans-serif'],
    mono: ['Monaco', 'Menlo', 'monospace'],
  },
  sizes: {
    // Desktop sizes
    h1: {
      desktop: '4.5rem', // 72px
      mobile: '2.5rem', // 40px
    },
    h2: {
      desktop: '3rem', // 48px
      mobile: '2rem', // 32px
    },
    h3: {
      desktop: '2rem', // 32px
      mobile: '1.5rem', // 24px
    },
    h4: {
      desktop: '1.5rem', // 24px
      mobile: '1.25rem', // 20px
    },
    body: {
      desktop: '1rem', // 16px
      mobile: '0.875rem', // 14px
    },
    small: {
      desktop: '0.875rem', // 14px
      mobile: '0.75rem', // 12px
    },
  },
  weights: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  lineHeights: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
} as const;

export const spacing = {
  base: 8, // Base unit in pixels
  scale: {
    0: '0',
    1: '0.5rem', // 8px
    2: '1rem', // 16px
    3: '1.5rem', // 24px
    4: '2rem', // 32px
    6: '3rem', // 48px
    8: '4rem', // 64px
    12: '6rem', // 96px
    16: '8rem', // 128px
    24: '12rem', // 192px
  },
  section: {
    desktop: '6rem', // py-24 (96px)
    mobile: '3rem', // py-12 (48px)
  },
} as const;

export const shadows = {
  sm: '0 1px 2px 0 rgba(2, 6, 23, 0.05)',
  md: '0 4px 6px -1px rgba(2, 6, 23, 0.1)',
  lg: '0 8px 30px rgba(2, 6, 23, 0.35)', // Soft shadow for cards
  xl: '0 20px 25px -5px rgba(2, 6, 23, 0.1)',
  '2xl': '0 25px 50px -12px rgba(2, 6, 23, 0.25)',
} as const;

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

export const borderRadius = {
  none: '0',
  sm: '0.125rem', // 2px
  md: '0.375rem', // 6px
  lg: '0.5rem', // 8px
  xl: '0.75rem', // 12px
  '2xl': '1rem', // 16px
  full: '9999px',
} as const;

export const transitions = {
  default: '150ms ease-in-out',
  fast: '100ms ease-in-out',
  slow: '300ms ease-in-out',
} as const;

// Export CSS custom properties for use in globals.css
export const cssVariables = {
  '--color-primary-teal': colors.primary.teal,
  '--color-primary-green': colors.primary.green,
  '--color-primary-blue': colors.primary.blue,
  '--color-bg-hero': colors.background.hero,
  '--color-bg-main': colors.background.main,
  '--color-text-dark': colors.text.dark,
  '--color-text-light': colors.text.light,
  '--color-accent-violet': colors.accent.violet,
  '--spacing-base': `${spacing.base}px`,
  '--shadow-card': shadows.lg,
} as const;

