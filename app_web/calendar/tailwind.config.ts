import type { Config } from 'tailwindcss';
import uiPreset from '@profile/ui/tailwind.preset';

const config: Config = {
  presets: [uiPreset],
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/calendar-core/src/**/*.{js,ts,jsx,tsx}',
    '../../packages/sa2kit/src/business/calendar/ui/web/**/*.{js,ts,jsx,tsx}',
    '../../packages/sa2kit/src/**/*.{ts,tsx}',
    '../../packages/sa2kit/dist/**/*.{js,mjs,ts,tsx}',
    './node_modules/sa2kit/dist/**/*.{js,mjs}',
  ],
};

export default config;
