#!/usr/bin/env node
/**
 * Screenshots eines Builds – 360 und 1280 px breit, hell und dunkel, ganze Seite.
 *
 *   node scripts/serve-and-shoot.mjs <buildDir> <pfad...> [Optionen]
 *   node scripts/serve-and-shoot.mjs dist / /styleguide/
 *   OUT_DIR=./dist-start node scripts/serve-and-shoot.mjs ./dist-start / --out qa-output/shots-start
 *
 * Optionen
 *   --out <dir>          Zielordner (Standard: qa-output/shots oder $QA_OUT_DIR/shots)
 *   --widths 360,1280    Breiten
 *   --themes light,dark  Themes (gesetzt über colorScheme UND data-theme)
 *   --click <selector>   vor dem Screenshot klicken (z. B. "[data-menu-button]" für das offene Mobilmenü)
 *   --suffix <text>      an den Dateinamen anhängen (z. B. "menu")
 *   --no-full            nur den sichtbaren Bereich (Standard: ganze Seite)
 *   --reduced-motion     prefers-reduced-motion: reduce emulieren
 *   --no-js              JavaScript deaktivieren
 *
 * Dateinamen: <slug>_<breite>_<theme>[_suffix].png, Slug "/" → "index", "/tafelwerk/" → "tafelwerk".
 */
import { mkdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { chromium } from 'playwright';
import { chromiumLaunchOptions, startStaticServer, themeInitScript } from './lib/static-server.mjs';

const args = process.argv.slice(2);
const opts = { out: '', widths: [360, 1280], themes: ['light', 'dark'], click: '', suffix: '', full: true, reduced: false, js: true };
const positional = [];
for (let i = 0; i < args.length; i++) {
  const a = args[i];
  if (a === '--out') opts.out = args[++i];
  else if (a === '--widths') opts.widths = args[++i].split(',').map(Number);
  else if (a === '--themes') opts.themes = args[++i].split(',');
  else if (a === '--click') opts.click = args[++i];
  else if (a === '--suffix') opts.suffix = args[++i];
  else if (a === '--no-full') opts.full = false;
  else if (a === '--reduced-motion') opts.reduced = true;
  else if (a === '--no-js') opts.js = false;
  else positional.push(a);
}

const [buildDir, ...paths] = positional;
if (!buildDir || paths.length === 0) {
  console.error('Aufruf: node scripts/serve-and-shoot.mjs <buildDir> <pfad...> [--out dir] [--click selector]');
  process.exit(2);
}

const outDir = resolve(opts.out || join(process.env.QA_OUT_DIR || 'qa-output', 'shots'));
mkdirSync(outDir, { recursive: true });

const slug = (p) => p.replace(/^\/+|\/+$/g, '').replace(/[^\w-]+/g, '-') || 'index';

const server = await startStaticServer(buildDir);
const browser = await chromium.launch(chromiumLaunchOptions());
const written = [];
let failed = 0;

try {
  for (const path of paths) {
    for (const theme of opts.themes) {
      for (const width of opts.widths) {
        const context = await browser.newContext({
          viewport: { width, height: 900 },
          deviceScaleFactor: 1,
          colorScheme: theme === 'dark' ? 'dark' : 'light',
          reducedMotion: opts.reduced ? 'reduce' : 'no-preference',
          javaScriptEnabled: opts.js,
        });
        await context.addInitScript(themeInitScript(theme));
        // keine externen Requests (DSGVO-Ziel); werden blockiert und gemeldet
        await context.route(
          (u) => !u.href.startsWith(server.origin) && !/^(data|blob|about):/.test(u.href),
          (route) => {
            console.warn(`! externer Request blockiert: ${route.request().url()}`);
            return route.abort('blockedbyclient');
          },
        );
        const page = await context.newPage();
        try {
          const url = server.origin + (path.startsWith('/') ? path : '/' + path);
          const res = await page.goto(url, { waitUntil: 'networkidle' });
          if (!res || res.status() >= 400) console.warn(`! ${path}: HTTP ${res?.status()}`);
          if (opts.js) {
            await page.evaluate((t) => document.documentElement.setAttribute('data-theme', t), theme);
          }
          // Einmal durchscrollen, damit lazy Bilder laden; dann zurück nach oben
          // (ohne JavaScript laufen keine Timer in der Seite → überspringen)
          if (opts.js) await page.evaluate(async () => {
            await document.fonts.ready;
            const step = Math.max(200, window.innerHeight * 0.8);
            for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
              window.scrollTo({ top: y, behavior: 'instant' });
              await new Promise((r) => setTimeout(r, 30));
            }
            window.scrollTo({ top: 0, behavior: 'instant' });
            // lazy Bilder sicher laden (Screenshot/Prüfung soll alles enthalten)
            document.querySelectorAll('img[loading="lazy"]').forEach((img) => (img.loading = 'eager'));
          });
          await page.waitForLoadState('networkidle');
          // Einmalige CSS-Animationen (z. B. Logo-Bewegung im Hero, ≤ 800 ms) erst zu Ende laufen lassen,
          // sonst zeigt der Screenshot einen Zwischenzustand. Endlose Animationen werden ignoriert.
          if (opts.js) {
            await page.evaluate(() =>
              Promise.race([
                Promise.all(
                  document
                    .getAnimations()
                    .filter((a) => a.effect?.getComputedTiming().iterations !== Infinity)
                    .map((a) => a.finished.catch(() => {})),
                ),
                new Promise((r) => setTimeout(r, 2000)),
              ]),
            );
          } else {
            await page.waitForTimeout(900);
          }
          if (opts.click) {
            await page.click(opts.click);
            await page.waitForTimeout(400);
          }
          await page.waitForTimeout(250);
          const file = join(
            outDir,
            `${slug(path)}_${width}_${theme}${opts.suffix ? '_' + opts.suffix : ''}${opts.js ? '' : '_nojs'}.png`,
          );
          // animations: 'disabled' spult endliche CSS-Animationen ans Ende (Ganzseiten-Aufnahmen ändern die
          // Viewport-Höhe und erwischen sonst Zwischenstände), endlose werden auf den Anfang gesetzt.
          await page.screenshot({ path: file, fullPage: opts.full, animations: 'disabled' });
          written.push(file);
        } catch (err) {
          failed++;
          console.error(`✗ ${path} ${width} ${theme}: ${err.message}`);
        } finally {
          await context.close();
        }
      }
    }
  }
} finally {
  await browser.close();
  await server.close();
}

for (const f of written) console.log(f);
console.log(`\n${written.length} Screenshot(s) in ${outDir}`);
process.exit(failed ? 1 : 0);
