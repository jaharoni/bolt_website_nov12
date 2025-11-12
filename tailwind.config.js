/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // 5-Color Harmonious Palette
        // 1. Primary: Muted mustard yellow (thematic anchor)
        mustard: {
          50: '#fefbf3',
          100: '#fdf4d3',
          200: '#fae8a6',
          300: '#f6d76e',
          400: '#f0c043',
          500: '#d4a017', // Main mustard
          600: '#b8841a',
          700: '#9a6b1a',
          800: '#7f561c',
          900: '#6b471b',
        },
        // 2. Secondary: Warm charcoal (complementary accent)
        charcoal: {
          50: '#f7f7f6',
          100: '#e4e4e1',
          200: '#c9c9c3',
          300: '#a8a89f',
          400: '#87877a',
          500: '#6c6c5f',
          600: '#55554b',
          700: '#46463e',
          800: '#3a3a34',
          900: '#2d2d28',
          950: '#1a1a17',
        },
        // 3. Background/Base: Warm cream (neutral)
        cream: {
          50: '#fefefe',
          100: '#fefcf8',
          200: '#fdf8ed',
          300: '#fbf2dc',
          400: '#f7e6c1',
          500: '#f1d49e',
          600: '#e8c078',
          700: '#dca855',
          800: '#c8934a',
          900: '#a67c42',
        },
        // 4. UI Elements: Muted sage (buttons, inputs)
        sage: {
          50: '#f7f8f7',
          100: '#e8ebe8',
          200: '#d1d7d1',
          300: '#b0bbb0',
          400: '#8a9a8a',
          500: '#6d7d6d',
          600: '#576357',
          700: '#485148',
          800: '#3c433c',
          900: '#343834',
        },
        // 5. Highlight/Alert: Deep forest (optional accent)
        forest: {
          50: '#f6f7f6',
          100: '#e1e4e1',
          200: '#c3c9c3',
          300: '#9ea79e',
          400: '#7a857a',
          500: '#5f6b5f',
          600: '#4a554a',
          700: '#3d453d',
          800: '#333933',
          900: '#2b302b',
          950: '#161a16',
        }
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.6s ease-out',
        'float': 'float 3s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 3s infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'slide-up': 'slideUp 0.5s ease-out',
        'fade-in': 'fadeIn 0.8s ease-out',
        'micro-float': 'microFloat 0.3s ease-out',
        'card-shift': 'cardShift 0.4s ease-out',
      },
      keyframes: {
        fadeInUp: {
          '0%': {
            opacity: '0',
            transform: 'translateY(30px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '33%': { transform: 'translateY(-10px) rotate(120deg)' },
          '66%': { transform: 'translateY(5px) rotate(240deg)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(212, 160, 23, 0.1)' },
          '100%': { boxShadow: '0 0 40px rgba(212, 160, 23, 0.2)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        microFloat: {
          '0%': { transform: 'translateY(0px) scale(1)' },
          '100%': { transform: 'translateY(-5px) scale(1.02)' },
        },
        cardShift: {
          '0%': { transform: 'translateX(0px) translateY(0px)' },
          '100%': { transform: 'translateX(2px) translateY(-3px)' },
        },
      },
      transitionDuration: {
        '1500': '1500ms',
        '2000': '2000ms',
        '3000': '3000ms',
      },
      fontFamily: {
        // Hero/Display: Modern serif with character - for headlines and hero text
        'display': ['Fraunces', 'Playfair Display', 'Georgia', 'serif'],
        // Body Content: Clean, highly readable sans-serif for main content
        'body': ['Inter', 'SF Pro Text', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
        // Navigation: Distinctive sans-serif for UI elements and navigation
        'nav': ['Space Grotesk', 'Inter', 'SF Pro Display', 'system-ui', 'sans-serif'],
        // Accent/Captions: Refined serif for quotes, captions, and special text
        'accent': ['Crimson Pro', 'Georgia', 'Times New Roman', 'serif'],
        // Technical/Code: Monospace when needed
        'mono': ['JetBrains Mono', 'SF Mono', 'Monaco', 'monospace'],
      },
      fontSize: {
        // Consistent hierarchy with proper scaling
        'xs': ['0.75rem', { lineHeight: '1.5', letterSpacing: '0.025em' }],
        'sm': ['0.875rem', { lineHeight: '1.6', letterSpacing: '0.025em' }],
        'base': ['1rem', { lineHeight: '1.7', letterSpacing: '0.025em' }],
        'lg': ['1.125rem', { lineHeight: '1.7', letterSpacing: '0.025em' }],
        'xl': ['1.25rem', { lineHeight: '1.6', letterSpacing: '0.025em' }],
        '2xl': ['1.5rem', { lineHeight: '1.5', letterSpacing: '0.025em' }],
        '3xl': ['1.875rem', { lineHeight: '1.4', letterSpacing: '0.025em' }],
        '4xl': ['2.25rem', { lineHeight: '1.3', letterSpacing: '0.025em' }],
        '5xl': ['3rem', { lineHeight: '1.2', letterSpacing: '0.025em' }],
        '6xl': ['3.75rem', { lineHeight: '1.1', letterSpacing: '0.025em' }],
        '7xl': ['4.5rem', { lineHeight: '1.1', letterSpacing: '0.025em' }],
        '8xl': ['6rem', { lineHeight: '1', letterSpacing: '0.025em' }],
        '9xl': ['8rem', { lineHeight: '1', letterSpacing: '0.025em' }],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      backdropBlur: {
        'xs': '2px',
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'medium': '0 4px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        'hard': '0 10px 40px -10px rgba(0, 0, 0, 0.2), 0 2px 10px -2px rgba(0, 0, 0, 0.04)',
        'glow': '0 0 20px rgba(212, 160, 23, 0.1)',
        'glow-lg': '0 0 40px rgba(212, 160, 23, 0.15)',
        'float': '0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08)',
        '3xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.05)',
        'glass': '0 4px 16px rgba(0, 0, 0, 0.1), 0 1px 4px rgba(0, 0, 0, 0.06)',
        'glass-hover': '0 8px 32px rgba(0, 0, 0, 0.15), 0 2px 8px rgba(0, 0, 0, 0.08)',
      },
      opacity: {
        '4': '0.04',
        '6': '0.06',
        '8': '0.08',
        '12': '0.12',
        '15': '0.15',
        '25': '0.25',
        '2': '0.02',
        '5': '0.05',
        '3': '0.03',
      }
    },
  },
  plugins: [],
};