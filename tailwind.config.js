/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Original light palette
        primary: {
          DEFAULT: '#F5B900',
          50: '#FFF9E6',
          100: '#FFF2CC',
          200: '#FFE599',
          300: '#FFD866',
          400: '#FFCF3D',
          500: '#F5B900',
          600: '#D4A520',
          700: '#9E7A18',
          800: '#695010',
          900: '#332808',
        },
        secondary: {
          DEFAULT: '#F7F7F7',
          50: '#FAFAFA',
          100: '#F5F5F5',
          150: '#F0F0F0',
          200: '#EEEEEE',
          250: '#E0E0E0',
          300: '#D6D6D6',
          400: '#9E9E9E',
          500: '#757575',
          600: '#616161',
          700: '#424242',
          800: '#303030',
          900: '#212121',
        },
        background: '#FFFFFF',
        foreground: '#202124',
        surface: '#FFFFFF',
        elevated: '#F7F7F7',
        accent: '#F5B900',
        border: 'rgba(0,0,0,0.08)',
        input: '#FFFFFF',
        ring: '#F5B900',
        muted: {
          DEFAULT: '#F7F7F7',
          foreground: '#6B6B6B',
        },
        destructive: {
          DEFAULT: '#EF4444',
          foreground: '#FFFFFF',
        },
        card: {
          DEFAULT: '#FFFFFF',
          foreground: '#202124',
        },
        popover: {
          DEFAULT: '#FFFFFF',
          foreground: '#202124',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'card': '20px',
        'button': '14px',
      },
      boxShadow: {
        'soft': '0 2px 12px -3px rgba(0, 0, 0, 0.08), 0 4px 8px -2px rgba(0, 0, 0, 0.04)',
        'soft-lg': '0 4px 16px -4px rgba(0, 0, 0, 0.1)',
        'soft-xl': '0 8px 30px -8px rgba(0, 0, 0, 0.12)',
        'soft-xs': '0 1px 3px rgba(0,0,0,0.06)',
        'cinema': '0 2px 12px rgba(0, 0, 0, 0.08)',
        'cinema-lg': '0 4px 20px rgba(0, 0, 0, 0.1)',
        'cinema-xl': '0 8px 30px rgba(0, 0, 0, 0.12)',
        'golden': '0 4px 16px -4px rgba(245, 185, 0, 0.25)',
        'golden-lg': '0 6px 24px -6px rgba(245, 185, 0, 0.3)',
        'glow-gold': '0 0 15px rgba(245, 185, 0, 0.1)',
        'glow-gold-lg': '0 0 25px rgba(245, 185, 0, 0.12)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'float-slow': 'float 10s ease-in-out infinite',
        'float-3d': 'float3d 12s ease-in-out infinite',
        'pulse-soft': 'pulse-soft 4s ease-in-out infinite',
        'glow-pulse': 'glow-pulse 4s ease-in-out infinite',
        'slide-up': 'slide-up 0.6s cubic-bezier(0.16,1,0.3,1)',
        'slide-down': 'slide-down 0.6s cubic-bezier(0.16,1,0.3,1)',
        'fade-in': 'fade-in 0.6s ease-out',
        'scale-in': 'scale-in 0.4s cubic-bezier(0.16,1,0.3,1)',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-16px)' },
        },
        float3d: {
          '0%, 100%': { transform: 'translateY(0px) translateZ(0px) rotateX(0deg)' },
          '25%': { transform: 'translateY(-10px) translateZ(5px) rotateX(1deg)' },
          '50%': { transform: 'translateY(-18px) translateZ(10px) rotateX(0deg)' },
          '75%': { transform: 'translateY(-8px) translateZ(3px) rotateX(-1deg)' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 10px rgba(245,185,0,0.08)' },
          '50%': { boxShadow: '0 0 20px rgba(245,185,0,0.15)' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(30px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-down': {
          '0%': { transform: 'translateY(-30px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'scale-in': {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-golden': 'linear-gradient(135deg, #F5B900 0%, #E5A800 100%)',
        'shimmer': 'linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)',
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
    require('@tailwindcss/forms'),
  ],
};
