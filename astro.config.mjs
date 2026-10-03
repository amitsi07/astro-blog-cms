import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// Astro Static Site Generation for 100% Free Cloudflare Pages CDN
export default defineConfig({
  site: 'https://promptplumai.pages.dev',
  output: 'static',
  vite: {
    plugins: [tailwindcss()],
  },
  compressHTML: true,
});
