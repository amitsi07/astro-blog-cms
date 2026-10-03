import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

// Astro Static Site Generation for 100% Free Cloudflare Pages CDN
export default defineConfig({
  site: 'https://astro-blog-cms-a84.pages.dev',
  output: 'static',
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
  },
  compressHTML: true,
});
