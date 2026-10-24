import type { Config } from 'tailwindcss';
const config: Config = { content: ['./app/**/*.{js,ts,jsx,tsx,mdx}','./components/**/*.{js,ts,jsx,tsx,mdx}'], theme: { extend: { keyframes: { flip: { '0%': { transform:'rotateX(90deg)', opacity:'0.2' }, '100%': { transform:'rotateX(0)', opacity:'1' } } }, animation: { flip:'flip 500ms ease-out both' } } }, plugins: [] };
export default config;
