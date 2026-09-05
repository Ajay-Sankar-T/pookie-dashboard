import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        pookie: {
          bg: "#FFF7FB",
          surface: "#FFFFFF",
          primary: "#FF6FAE",
          primaryHover: "#F4589E",
          dark: "#D63384",
          soft: "#FFD6E7",
          blush: "#FFF0F6",
          accent: "#FFB3D1",
          text: "#4A3040",
          muted: "#927A87",
          border: "#FFDCE8",
          mint: "#0D9488",
          mintBg: "#E8FAF4",
          mintBorder: "#A7F3D0",
          peach: "#D97706",
          peachBg: "#FFF4EB",
          peachBorder: "#FDE68A",
          coral: "#E11D48",
          coralBg: "#FFEBF0",
          coralBorder: "#FECDD3",
          lavender: "#C9A6FF",
          lavenderBg: "#F3ECFF",
          sky: "#8ED2FF",
        },
      },
      fontFamily: {
        sans: ["'Nunito'", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        display: ["'Fredoka'", "'Nunito'", "sans-serif"],
        handwriting: ["'Caveat'", "cursive"],
        kawaii: ["'Baloo 2'", "'Fredoka'", "sans-serif"],
      },
      boxShadow: {
        'pookie-sm': '0 2px 8px -2px rgba(214, 51, 132, 0.08), 0 1px 4px -1px rgba(0, 0, 0, 0.04)',
        'pookie': '0 8px 24px -4px rgba(255, 111, 174, 0.16), 0 2px 8px -2px rgba(214, 51, 132, 0.06)',
        'pookie-lg': '0 16px 36px -6px rgba(255, 111, 174, 0.22), 0 4px 12px -2px rgba(214, 51, 132, 0.08)',
        'pookie-inner': 'inset 0 2px 4px 0 rgba(214, 51, 132, 0.06)',
        'pookie-glow': '0 0 0 1px rgba(255,255,255,0.6), 0 8px 30px -4px rgba(201, 166, 255, 0.35), 0 4px 18px -4px rgba(255, 111, 174, 0.35)',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      animation: {
        'subtle-bounce': 'subtleBounce 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'float-gentle': 'floatGentle 3s ease-in-out infinite',
        'pop-in': 'popIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        'sparkle-drift': 'sparkleDrift linear infinite',
        'holo-shimmer': 'holoShimmer 3.5s ease-in-out infinite',
        'chibi-bob': 'chibiBob 2.6s ease-in-out infinite',
      },
      keyframes: {
        subtleBounce: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(0.96)' },
          '100%': { transform: 'scale(1)' },
        },
        floatGentle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-3px)' },
        },
        popIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        sparkleDrift: {
          '0%': { opacity: '0', transform: 'translateY(0) scale(0.6) rotate(0deg)' },
          '15%': { opacity: '1' },
          '50%': { opacity: '0.9', transform: 'translateY(-14px) scale(1) rotate(15deg)' },
          '85%': { opacity: '0.4' },
          '100%': { opacity: '0', transform: 'translateY(-28px) scale(0.7) rotate(-10deg)' },
        },
        holoShimmer: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        chibiBob: {
          '0%, 100%': { transform: 'translateY(0) rotate(-2deg)' },
          '50%': { transform: 'translateY(-8px) rotate(2deg)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;

