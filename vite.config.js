import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Served from Cloudflare Pages at the root of its own *.pages.dev subdomain
// (no repo-name subpath, unlike the old GitHub Pages project-site setup).
export default defineConfig({
  base: '/',
  plugins: [react()],
});
