import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/modules/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
      },
      keyframes: {
        shake: {
          '0%, 100%': { transform: 'translateX(-50%) rotate(0deg)' },
          '25%': { transform: 'translateX(-50%) rotate(-5deg)' },
          '75%': { transform: 'translateX(-50%) rotate(5deg)' },
        },
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
      },
      animation: {
        'shake': 'shake 0.5s ease-in-out',
        'blink': 'blink 1s step-end infinite',
      },
    },
  },
  plugins: [],
};

export default config;
