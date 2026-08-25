/**
 * JSS DESIGN SYSTEM — Foundational Design Tokens
 * 
 * Inspired by Apple (clean typography & glassmorphism), Stripe (subtle gradients & mesh glows),
 * Linear (dark mode precision & micro-interactions), Grab/Gojek/Uber (vibrant brand & trust markers).
 */

export const DESIGN_TOKENS = {
  // 1. COLOR PALETTE
  colors: {
    primary: {
      50: '#FFF8E7',
      100: '#FEF0CF',
      200: '#FDE29F',
      300: '#FDD36F',
      400: '#FCC53F',
      500: '#FDB813', // JSS Signature Golden Yellow
      600: '#D89A04',
      700: '#A07203',
      800: '#684A02',
      900: '#302201',
    },
    accent: {
      DEFAULT: '#FF6B35', // Express Energetic Orange
      hover: '#E85520',
      light: '#FFECE5',
    },
    emerald: {
      50: '#ECFDF5',
      100: '#D1FAE5',
      500: '#10B981', // Live Driver & Success Status
      600: '#059669',
      700: '#047857',
    },
    dark: {
      900: '#111111', // Obsidian Core
      800: '#191919',
      700: '#222222',
      600: '#2D2D2D',
      500: '#3D3D3D',
    },
    neutral: {
      50: '#F8F9FA',
      100: '#F1F3F5',
      200: '#E9ECEF',
      300: '#DEE2E6',
      400: '#CED4DA',
      500: '#ADB5BD',
      600: '#6C757D',
      700: '#495057',
      800: '#343A40',
      900: '#212529',
    },
    surface: '#FFFFFF',
    background: '#F8F8F8',
  },

  // 2. TYPOGRAPHY SYSTEM
  typography: {
    fontFamily: 'var(--font-poppins), Poppins, system-ui, sans-serif',
    scale: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      base: '1rem',     // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',  // 24px
      '3xl': '1.875rem',// 30px
      '4xl': '2.25rem', // 36px
      '5xl': '3rem',    // 48px
      '6xl': '3.75rem', // 60px
    },
    weight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
      black: 900,
    },
    lineHeight: {
      tight: 1.1,
      snug: 1.25,
      normal: 1.5,
      relaxed: 1.625,
    },
  },

  // 3. SPACING SYSTEM (4px Baseline Grid)
  spacing: {
    1: '0.25rem',  // 4px
    2: '0.5rem',   // 8px
    3: '0.75rem',  // 12px
    4: '1rem',      // 16px
    5: '1.25rem',  // 20px
    6: '1.5rem',   // 24px
    8: '2rem',      // 32px
    10: '2.5rem',  // 40px
    12: '3rem',     // 48px
    16: '4rem',     // 64px
    20: '5rem',     // 80px
    24: '6rem',     // 96px
    32: '8rem',     // 128px
  },

  // 4. BORDER RADIUS
  radius: {
    xs: '6px',
    sm: '10px',
    md: '14px',
    lg: '18px',
    card: '24px',
    heroCard: '32px',
    full: '9999px',
  },

  // 5. SHADOWS & GLASSMORPHISM
  shadows: {
    soft: '0 4px 20px -2px rgba(0, 0, 0, 0.05), 0 2px 6px -1px rgba(0, 0, 0, 0.03)',
    softLg: '0 12px 35px -5px rgba(0, 0, 0, 0.08), 0 4px 12px -2px rgba(0, 0, 0, 0.04)',
    softXl: '0 24px 60px -12px rgba(0, 0, 0, 0.14)',
    golden: '0 10px 40px -10px rgba(253, 184, 19, 0.35)',
    goldenLg: '0 20px 60px -15px rgba(253, 184, 19, 0.45)',
    darkGlass: '0 20px 50px -10px rgba(0, 0, 0, 0.45)',
  },

  // 6. ANIMATION TIMING & EASING
  motion: {
    easing: {
      apple: [0.16, 1, 0.3, 1] as const, // Smooth cubic bezier
      easeInOut: [0.4, 0, 0.2, 1] as const,
      easeOut: [0, 0, 0.2, 1] as const,
    },
    duration: {
      fast: 0.15,
      normal: 0.3,
      slow: 0.5,
      hero: 0.7,
    },
    spring: {
      snappy: { stiffness: 300, damping: 25 },
      gentle: { stiffness: 120, damping: 20 },
      bouncy: { stiffness: 400, damping: 15 },
    },
  },

  // 7. GRID & CONTAINER BREAKPOINTS
  grid: {
    containerMaxWidth: '1280px',
    padding: {
      mobile: '1rem',
      tablet: '1.5rem',
      desktop: '2rem',
    },
    gap: {
      sm: '1rem',
      md: '1.5rem',
      lg: '2rem',
      xl: '3rem',
    },
  },
} as const;

export type DesignTokens = typeof DESIGN_TOKENS;
