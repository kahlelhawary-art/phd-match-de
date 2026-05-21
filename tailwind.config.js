/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Editorial Scientific Palette
        paper: '#F4EFE6',       // cream paper background
        paper2: '#EBE4D6',      // slightly deeper for cards
        ink: '#1A1814',         // deep almost-black
        ink2: '#3D362C',        // softer text
        muted: '#7A6E5B',       // metadata color
        rule: '#C9BFA8',        // hairline borders

        navy: '#1B2A4E',        // primary accent (links, headings emphasis)
        sienna: '#9C4A2C',      // secondary accent (CTA, important deadlines)
        sage: '#5F7257',        // success / "accepting students"
        ochre: '#B8893F',       // tertiary highlight

        danger: '#8B2C2C'
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        body: ['Geist', 'system-ui', 'sans-serif'],
        mono: ['"Geist Mono"', 'ui-monospace', 'monospace'],
        arabic: ['"Noto Naskh Arabic"', 'serif']
      },
      fontSize: {
        'display-xl': ['clamp(3rem, 8vw, 6rem)', { lineHeight: '0.95', letterSpacing: '-0.03em' }],
        'display-lg': ['clamp(2.25rem, 5vw, 3.75rem)', { lineHeight: '1.0', letterSpacing: '-0.025em' }],
        'display-md': ['clamp(1.75rem, 3.5vw, 2.5rem)', { lineHeight: '1.05', letterSpacing: '-0.02em' }],
      },
      letterSpacing: {
        tightest: '-0.04em'
      },
      animation: {
        'fade-up': 'fadeUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-in': 'fadeIn 0.5s ease-out forwards',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: 0, transform: 'translateY(12px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' }
        },
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 }
        }
      }
    }
  },
  plugins: []
};
