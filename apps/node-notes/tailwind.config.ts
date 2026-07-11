import type { Config } from 'tailwindcss';
import uiPreset from '@profile/ui/tailwind.preset';

const config: Config = {
  presets: [uiPreset],
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/node-notes-core/src/**/*.{js,ts,jsx,tsx}',
    '../../sa2kit/src/**/*.{ts,tsx}',
    '../../sa2kit/dist/**/*.{js,mjs,ts,tsx}',
    './node_modules/sa2kit/dist/**/*.{js,mjs}',
  ],
};

export default config;
