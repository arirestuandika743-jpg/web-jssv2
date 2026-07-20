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
        primary: {
          DEFAULT: '#FDB813',
          50: '#FFF8E7',
          100: '#FEF0CF',
          200: '#FDE29F',
          300: '#FDD36F',
          400: '#FCC53F',
          500: '#FDB813',
          600: '#D89A04',
          700: '#A07203',
          800: '#684A02',
          900: '#302201',
        },
        secondary: {
          DEFAULT: '#111111',
          50: '#F5F5F5',
          100: '#E0E0E0',
          200: '#B8B8B8',
          300: '#8F8F8F',
          400: '#666666',
          500: '#3D3D3D',
          600: '#2A2A2A',
          700: '#1F1F1F',
          800: '#161616',
          900: '#111111',
        },
        background: '#F8F8F8',
        foreground: '#111111',
        surface: '#FFFFFF',
        accent: '#FF6B35',
        border: '#E8E8E8',
        input: '#E8E8E8',
        ring: '#FDB813',
        muted: {
          DEFAULT: '#F2F2F2',
          foreground: '#666666',
        },
        destructive: {
          DEFAULT: '#EF4444',
          foreground: '#FFFFFF',
        },
        card: {
          DEFAULT: '#FFFFFF',
          foreground: '#111111',
        },
        popover: {
          DEFAULT: '#FFFFFF',
          foreground: '#111111',
        },
      },
      fontFamily: {
        sans: ['var(--font-poppins)', 'Poppins', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'card': '18px',
        'button': '14px',
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'soft-lg': '0 10px 40px -10px rgba(0, 0, 0, 0.1)',
        'soft-xl': '0 20px 60px -15px rgba(0, 0, 0, 0.12)',
        'golden': '0 10px 40px -10px rgba(253, 184, 19, 0.3)',
        'golden-lg': '0 20px 60px -15px rgba(253, 184, 19, 0.4)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'float-slow': 'float 8s ease-in-out infinite',
        'pulse-soft': 'pulse-soft 3s ease-in-out infinite',
        'slide-up': 'slide-up 0.5s ease-out',
        'slide-down': 'slide-down 0.5s ease-out',
        'fade-in': 'fade-in 0.5s ease-out',
        'scale-in': 'scale-in 0.3s ease-out',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-down': {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
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
        'gradient-golden': 'linear-gradient(135deg, #FDB813 0%, #FF6B35 100%)',
        'gradient-dark': 'linear-gradient(135deg, #111111 0%, #2A2A2A 100%)',
        'shimmer': 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
    require('@tailwindcss/forms'),
  ],
};
