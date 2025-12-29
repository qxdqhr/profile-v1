import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: ["class"],
    content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/modules/**/*.{js,ts,jsx,tsx,mdx}",
    // 添加 sa2kit 包的路径，以便 Tailwind 扫描其中的类名
    "./node_modules/sa2kit/**/*.{js,ts,jsx,tsx,mjs}",
  ],
  theme: {
  	extend: {
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			},
  			// ShowMasterpiece 专用配色方案
  			'oxford-blue': {
  				DEFAULT: '#000028',
  				100: '#000008',
  				200: '#000010',
  				300: '#000018',
  				400: '#000021',
  				500: '#000028',
  				600: '#000087',
  				700: '#0000e4',
  				800: '#4343ff',
  				900: '#a1a1ff'
  			},
  			'prussian-blue': {
  				DEFAULT: '#21314B',
  				100: '#070a0f',
  				200: '#0d131e',
  				300: '#141d2d',
  				400: '#1a273c',
  				500: '#21314b',
  				600: '#395582',
  				700: '#577bb5',
  				800: '#8fa7ce',
  				900: '#c7d3e6'
  			},
  			'rich-black': {
  				DEFAULT: '#010017',
  				100: '#000005',
  				200: '#01000a',
  				300: '#01000f',
  				400: '#010014',
  				500: '#010017',
  				600: '#06007a',
  				700: '#0b00db',
  				800: '#473dff',
  				900: '#a39eff'
  			},
  			'moonstone': {
  				DEFAULT: '#36B5C9',
  				100: '#0b2428',
  				200: '#154951',
  				300: '#206d79',
  				400: '#2b91a1',
  				500: '#36b5c9',
  				600: '#5ec4d4',
  				700: '#86d3df',
  				800: '#aee2ea',
  				900: '#d7f0f4'
  			},
  			'cerulean': {
  				DEFAULT: '#21759F',
  				100: '#071820',
  				200: '#0d2f40',
  				300: '#144761',
  				400: '#1a5f81',
  				500: '#21759f',
  				600: '#2d9cd4',
  				700: '#62b5df',
  				800: '#96cee9',
  				900: '#cbe6f4'
  			}
  		},
  		keyframes: {
  			shake: {
  				'0%, 100%': {
  					transform: 'translateX(-50%) rotate(0deg)'
  				},
  				'25%': {
  					transform: 'translateX(-50%) rotate(-5deg)'
  				},
  				'75%': {
  					transform: 'translateX(-50%) rotate(5deg)'
  				}
  			},
  			blink: {
  				'0%, 100%': {
  					opacity: '1'
  				},
  				'50%': {
  					opacity: '0'
  				}
  			}
  		},
  		animation: {
  			shake: 'shake 0.5s ease-in-out',
  			blink: 'blink 1s step-end infinite'
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
