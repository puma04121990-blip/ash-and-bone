import { defineConfig } from 'vite';

// Project Pages URL: https://<user>.github.io/ash-and-bone/
export default defineConfig({
  base: '/ash-and-bone/',
  server: {
    port: 5173,
    host: true,
  },
  build: {
    target: 'es2022',
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
  },
});
