import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Project is served from https://mattrhornct.github.io/scc-site-demo/ on GitHub Pages,
// so all built asset URLs need the repo name as a base path.
export default defineConfig({
  base: '/scc-site-demo/',
  plugins: [react()],
});
