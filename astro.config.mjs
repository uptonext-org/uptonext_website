// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

/**
 * Astro-Konfiguration für uptonext.de (statisch).
 *
 * OUT_DIR / CACHE_DIR erlauben parallele Builds in getrennte Verzeichnisse, z. B.:
 *   OUT_DIR=./dist-start CACHE_DIR=./node_modules/.astro-start npm run build
 */
export default defineConfig({
  site: 'https://uptonext.de',
  trailingSlash: 'always',
  outDir: process.env.OUT_DIR || './dist',
  cacheDir: process.env.CACHE_DIR || './node_modules/.astro',
  build: {
    format: 'directory',
  },
  // Keine Telemetrie-/Dev-Toolbar-Requests in Screenshots und QA
  devToolbar: { enabled: false },
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/styleguide/') && !/\/404\/?$/.test(page),
    }),
  ],
});
