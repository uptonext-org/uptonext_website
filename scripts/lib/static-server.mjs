// Kleiner statischer Server für QA/Screenshots (keine Abhängigkeiten).
// Bildet das Verhalten des Hostings nach: /pfad/ → /pfad/index.html, unbekannt → 404.html (Status 404).
import { createServer } from 'node:http';
import { createReadStream, existsSync, statSync } from 'node:fs';
import { extname, join, normalize, resolve, sep } from 'node:path';

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.webmanifest': 'application/manifest+json',
  '.pdf': 'application/pdf',
};

/**
 * Startet den Server auf einem freien Port.
 * @param {string} rootDir Build-Verzeichnis
 * @returns {Promise<{ origin: string, port: number, close: () => Promise<void> }>}
 */
export async function startStaticServer(rootDir) {
  const root = resolve(rootDir);
  if (!existsSync(root)) throw new Error(`Build-Verzeichnis nicht gefunden: ${root}`);

  const server = createServer((req, res) => {
    const url = new URL(req.url || '/', 'http://localhost');
    let pathname = decodeURIComponent(url.pathname);
    let file = normalize(join(root, pathname));
    if (!file.startsWith(root + sep) && file !== root) {
      res.writeHead(403).end();
      return;
    }
    let status = 200;
    if (existsSync(file) && statSync(file).isDirectory()) {
      if (!pathname.endsWith('/')) {
        res.writeHead(301, { Location: pathname + '/' + url.search }).end();
        return;
      }
      file = join(file, 'index.html');
    }
    if (!existsSync(file)) {
      const notFound = join(root, '404.html');
      const notFoundDir = join(root, '404', 'index.html');
      status = 404;
      file = existsSync(notFound) ? notFound : existsSync(notFoundDir) ? notFoundDir : '';
      if (!file) {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('404');
        return;
      }
    }
    const type = TYPES[extname(file).toLowerCase()] || 'application/octet-stream';
    res.writeHead(status, { 'Content-Type': type, 'Cache-Control': 'no-store' });
    createReadStream(file).pipe(res);
  });

  await new Promise((ok, fail) => {
    server.once('error', fail);
    server.listen(0, '127.0.0.1', ok);
  });
  const address = server.address();
  const port = typeof address === 'object' && address ? address.port : 0;
  return {
    origin: `http://127.0.0.1:${port}`,
    port,
    close: () => new Promise((ok) => server.close(() => ok())),
  };
}

/** Pfad zum vorinstallierten Chromium (Playwright 1.56.x → chromium-1194). */
export const CHROMIUM_PATH =
  process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';

/** Launch-Optionen für Playwright; fällt auf den Playwright-Standard zurück, wenn der Pfad fehlt. */
export function chromiumLaunchOptions() {
  // Hintergrund-Netzwerk des Browsers (Updates, Dienste) abschalten – es zählt nur die Seite
  const args = ['--disable-background-networking', '--disable-component-update', '--no-default-browser-check'];
  return existsSync(CHROMIUM_PATH) ? { executablePath: CHROMIUM_PATH, args } : { args };
}

/** localStorage-Schlüssel des Themes (muss theme.storageKey in src/config/site.ts entsprechen) */
export const THEME_KEY = 'utn-theme';

/**
 * Init-Skript: setzt das Theme vor dem ersten Rendern (wie eine gespeicherte Wahl).
 * @param {'light' | 'dark'} theme
 */
export function themeInitScript(theme) {
  return `try{localStorage.setItem(${JSON.stringify(THEME_KEY)}, ${JSON.stringify(theme)})}catch(e){};if(document.documentElement)document.documentElement.setAttribute('data-theme', ${JSON.stringify(theme)});`;
}
