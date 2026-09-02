import type { Config } from 'tailwindcss';
import uiPreset from '@profile/ui/tailwind.preset';

const config: Config = {
  presets: [uiPreset],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/modules/**/*.{js,ts,jsx,tsx,mdx}',
    '../../sa2kit/src/**/*.{ts,tsx}',
    '../../sa2kit/dist/**/*.{js,mjs,ts,tsx}',
    './node_modules/sa2kit/dist/**/*.{js,mjs}',
  ],
};

export default config;
