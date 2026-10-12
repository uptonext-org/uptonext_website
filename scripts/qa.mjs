#!/usr/bin/env node
/**
 * QA für einen statischen Build.
 *
 *   node scripts/qa.mjs [buildDir] [--only /,/tafelwerk/] [--strict] [--out dir] [--concurrency 3]
 *   npm run qa                         # build + QA (buildDir = $OUT_DIR oder dist)
 *   OUT_DIR=./dist-tw npm run qa -- --only /tafelwerk/
 *
 * Prüft je HTML-Seite im Build:
 *   - axe (WCAG 2.0/2.1/2.2 A+AA) in Hell und Dunkel (1280 px) sowie mobil (360 px, hell)
 *   - Netzwerk: jeder Request muss an den lokalen Server gehen; lokale 4xx/5xx = Fehler
 *   - Konsolenfehler und JS-Ausnahmen
 *   - horizontales Scrollen bei 360 px
 *   - Inhalte ohne JavaScript sichtbar (Textmenge in <main> mit/ohne JS)
 *   - Struktur: genau eine H1, keine übersprungenen Überschriftenebenen, <title>, Description ≤ 155,
 *     canonical (außer noindex), lang, doppelte IDs, Bilder mit alt und width/height
 *   - Größen je Seite: JS / CSS / Fonts (roh und gzip); Budgets laut Entscheidungen
 *     (übertragen/gzip): JS < 60 KB, CSS < 30 KB, Fonts < 100 KB
 *   - interne Links auf Seiten, die es im Build nicht gibt (Warnung; mit --strict Fehler)
 *   - Sprungmarken (#id) auf derselben oder einer anderen Seite, deren Ziel-id fehlt (Fehler)
 *   - ohne JavaScript: Hauptnavigation und Rechtslinks sichtbar und erreichbar (Fehler)
 *
 * Ergebnis: <out>/report.json (Standard qa-output/ bzw. $QA_OUT_DIR) + Zusammenfassung auf stdout.
 * Exit-Code 1 bei Fehlern.
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, relative, resolve, sep } from 'node:path';
import { gzipSync } from 'node:zlib';
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import { chromiumLaunchOptions, startStaticServer, themeInitScript } from './lib/static-server.mjs';

const BUDGET = { js: 60 * 1024, css: 30 * 1024, font: 100 * 1024 };
const AXE_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

// -- Argumente ---------------------------------------------------------------
const argv = process.argv.slice(2);
const opts = { only: null, strict: false, out: '', concurrency: Number(process.env.QA_CONCURRENCY) || 3 };
const positional = [];
for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (a === '--only') opts.only = argv[++i].split(',').map((p) => p.trim()).filter(Boolean);
  else if (a === '--strict') opts.strict = true;
  else if (a === '--out') opts.out = argv[++i];
  else if (a === '--concurrency') opts.concurrency = Math.max(1, Number(argv[++i]) || 1);
  else positional.push(a);
}
const buildDir = resolve(positional[0] || process.env.OUT_DIR || 'dist');
const outDir = resolve(opts.out || process.env.QA_OUT_DIR || 'qa-output');
if (!existsSync(buildDir)) {
  console.error(`Build-Verzeichnis nicht gefunden: ${buildDir} – erst "npm run build" ausführen.`);
  process.exit(2);
}

// -- Seiten finden -------------------------------------------------------------
function findHtml(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (name === '_astro') continue;
    const st = statSync(full);
    if (st.isDirectory()) out.push(...findHtml(full));
    else if (name.endsWith('.html')) out.push(full);
  }
  return out;
}

const toUrlPath = (file) => {
  const rel = relative(buildDir, file).split(sep).join('/');
  if (rel === 'index.html') return '/';
  if (rel.endsWith('/index.html')) return '/' + rel.slice(0, -'index.html'.length);
  return '/' + rel;
};

let pages = findHtml(buildDir).map(toUrlPath).sort();
if (opts.only) {
  const wanted = new Set(opts.only.map((p) => (p.endsWith('/') || p.endsWith('.html') ? p : p + '/')));
  pages = pages.filter((p) => wanted.has(p));
}
if (pages.length === 0) {
  console.error('Keine Seiten gefunden.');
  process.exit(2);
}

/** ids einer Seite im Build (für Sprungmarken auf andere Seiten) */
const idCache = new Map();
function idsInBuild(pathname) {
  const clean = decodeURIComponent(pathname.split('#')[0].split('?')[0]);
  if (idCache.has(clean)) return idCache.get(clean);
  let file = join(buildDir, clean);
  if (existsSync(join(file, 'index.html'))) file = join(file, 'index.html');
  const ids = new Set();
  if (existsSync(file) && statSync(file).isFile() && file.endsWith('.html')) {
    for (const m of readFileSync(file, 'utf8').matchAll(/\sid="([^"]+)"/g)) ids.add(m[1]);
  }
  idCache.set(clean, ids);
  return ids;
}

/** existiert ein interner Pfad im Build? */
function existsInBuild(pathname) {
  const clean = decodeURIComponent(pathname.split('#')[0].split('?')[0]);
  const target = join(buildDir, clean);
  if (!target.startsWith(buildDir)) return false;
  if (existsSync(target) && statSync(target).isFile()) return true;
  if (existsSync(join(target, 'index.html'))) return true;
  return false;
}

// -- Lauf --------------------------------------------------------------------
const server = await startStaticServer(buildDir);
const browser = await chromium.launch(chromiumLaunchOptions());
const report = { buildDir, origin: server.origin, startedAt: new Date().toISOString(), budgets: BUDGET, pages: [] };
const linkTargets = new Map(); // pfad → Set(seiten)

const isLocal = (url) =>
  url.startsWith(server.origin) || url.startsWith('data:') || url.startsWith('blob:') || url.startsWith('about:');

async function scrollThrough(page) {
  await page.evaluate(async () => {
    const step = Math.max(200, window.innerHeight * 0.8);
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      window.scrollTo({ top: y, behavior: 'instant' });
      await new Promise((r) => setTimeout(r, 25));
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
            // lazy Bilder sicher laden (Screenshot/Prüfung soll alles enthalten)
            document.querySelectorAll('img[loading="lazy"]').forEach((img) => (img.loading = 'eager'));
  });
  await page.waitForLoadState('networkidle').catch(() => {});
}

/** Öffnet eine Seite in einem neuen Kontext und sammelt Netzwerk/Konsole. */
async function openPage(path, { theme = 'light', width = 1280, js = true, collectBodies = false } = {}) {
  const context = await browser.newContext({
    viewport: { width, height: 900 },
    colorScheme: theme,
    javaScriptEnabled: js,
    reducedMotion: 'no-preference',
  });
  await context.addInitScript(themeInitScript(theme));
  // Externe Requests nie wirklich ausführen (werden aber protokolliert und als Fehler gemeldet)
  await context.route(
    (url) => !isLocal(url.href),
    (route) => route.abort('blockedbyclient'),
  );
  const page = await context.newPage();
  const log = { requests: [], external: [], failed: [], console: [], bodies: [] };
  page.on('request', (req) => {
    const url = req.url();
    log.requests.push(url);
    if (!isLocal(url)) log.external.push(url);
  });
  page.on('requestfailed', (req) => {
    if (isLocal(req.url()) && !req.url().startsWith('data:')) log.failed.push(`${req.url()} (${req.failure()?.errorText})`);
  });
  page.on('response', (res) => {
    const url = res.url();
    if (!url.startsWith(server.origin)) return;
    const type = res.request().resourceType();
    const isDoc = type === 'document';
    if (res.status() >= 400 && !(isDoc && path.includes('404'))) log.failed.push(`${url} → HTTP ${res.status()}`);
    if (collectBodies && res.status() < 300) {
      log.bodies.push(
        res
          .body()
          .then((b) => ({ url, type, bytes: b.length, gzip: gzipSync(b).length }))
          .catch(() => null),
      );
    }
  });
  page.on('console', (msg) => {
    if (msg.type() === 'error' && !msg.text().includes('ERR_BLOCKED_BY_CLIENT')) log.console.push(msg.text());
  });
  page.on('pageerror', (err) => log.console.push(`Ausnahme: ${err.message}`));

  const response = await page.goto(server.origin + path, { waitUntil: 'networkidle' });
  // Ohne JavaScript laufen in der Seite keine Timer – dann nur synchrone evaluate-Aufrufe
  if (js) {
    await page.evaluate((t) => document.documentElement.setAttribute('data-theme', t), theme);
    await page.evaluate(() => document.fonts.ready);
    await scrollThrough(page);
  }
  return { context, page, log, status: response?.status() ?? 0 };
}

async function runAxe(page) {
  const result = await new AxeBuilder({ page }).withTags(AXE_TAGS).analyze();
  return result.violations.map((v) => ({
    id: v.id,
    impact: v.impact,
    help: v.help,
    nodes: v.nodes.length,
    targets: v.nodes.slice(0, 4).map((n) => n.target.join(' ')),
    summary: v.nodes[0]?.failureSummary?.split('\n').slice(0, 3).join(' ') || '',
  }));
}

async function checkPage(path) {
  const result = { path, errors: [], warnings: [], sizes: {}, requests: 0, axe: {} };
  const err = (msg) => result.errors.push(msg);
  const warn = (msg) => result.warnings.push(msg);
  process.stdout.write(`… ${path}\n`);

  try {
    // 1) Hell, Desktop: Struktur, Größen, axe, Netzwerk
    const light = await openPage(path, { theme: 'light', width: 1280, collectBodies: true });
    const isNotFoundPage = path.includes('404');
    if (light.status >= 400 && !isNotFoundPage) err(`HTTP ${light.status} beim Laden der Seite`);

    const info = await light.page.evaluate(() => {
      const q = (s) => [...document.querySelectorAll(s)];
      const headings = q('h1,h2,h3,h4,h5,h6').map((h) => ({ level: Number(h.tagName[1]), text: h.textContent.trim().slice(0, 60) }));
      const ids = q('[id]').map((e) => e.id);
      const dupIds = [...new Set(ids.filter((id, i) => ids.indexOf(id) !== i))];
      const robots = document.querySelector('meta[name="robots"]')?.getAttribute('content') || '';
      const imgs = q('img').map((i) => ({
        src: i.getAttribute('src'),
        alt: i.hasAttribute('alt'),
        dims: i.hasAttribute('width') && i.hasAttribute('height'),
      }));
      const links = q('a[href]').map((a) => a.getAttribute('href'));
      const inlineJs = q('script:not([src])')
        .filter((s) => !s.type || s.type === 'module' || s.type === 'text/javascript')
        .map((s) => s.textContent || '');
      const inlineCss = q('style').map((s) => s.textContent || '');
      const main = document.querySelector('main');
      return {
        title: document.title,
        lang: document.documentElement.lang,
        description: document.querySelector('meta[name="description"]')?.getAttribute('content') ?? null,
        canonical: document.querySelector('link[rel="canonical"]')?.getAttribute('href') ?? null,
        noindex: /noindex/i.test(robots),
        headings,
        dupIds,
        imgs,
        links,
        inlineJs,
        inlineCss,
        mainText: main ? main.innerText.replace(/\s+/g, ' ').trim().length : 0,
        emptyLinks: q('a').filter((a) => !a.getAttribute('href') || a.getAttribute('href') === '#').length,
      };
    });

    // Struktur
    if (!info.title) err('<title> fehlt');
    if (info.lang !== 'de') err(`<html lang> ist "${info.lang}" statt "de"`);
    if (info.description === null) err('meta description fehlt');
    else if (info.description.length > 155) err(`meta description hat ${info.description.length} Zeichen (max. 155)`);
    if (!info.noindex && !isNotFoundPage && !info.canonical) err('canonical fehlt');
    const h1 = info.headings.filter((h) => h.level === 1).length;
    if (h1 !== 1) err(`${h1} H1 gefunden (erwartet: genau 1)`);
    let prev = 0;
    for (const h of info.headings) {
      if (prev && h.level > prev + 1) err(`Überschriftenebene übersprungen: h${prev} → h${h.level} („${h.text}“)`);
      prev = h.level;
    }
    if (info.headings[0] && info.headings[0].level !== 1) warn(`erste Überschrift ist h${info.headings[0].level}, nicht h1`);
    for (const id of info.dupIds) err(`doppelte id="${id}"`);
    for (const img of info.imgs) {
      if (!img.alt) err(`<img> ohne alt: ${img.src}`);
      if (!img.dims) warn(`<img> ohne width/height (CLS): ${img.src}`);
    }
    if (info.emptyLinks) err(`${info.emptyLinks} Link(s) ohne Ziel (href fehlt oder "#")`);

    // Sprungmarken auf derselben Seite
    const pageIds = new Set(await light.page.evaluate(() => [...document.querySelectorAll('[id]')].map((e) => e.id)));
    for (const href of new Set(info.links)) {
      if (href && href.startsWith('#') && href.length > 1 && !pageIds.has(decodeURIComponent(href.slice(1)))) {
        err(`Sprungmarke ohne Ziel: ${href}`);
      }
    }

    // Interne Links sammeln
    for (const href of info.links) {
      if (!href || /^(mailto:|tel:|#|javascript:)/i.test(href)) continue;
      let u;
      try {
        u = new URL(href, server.origin + path);
      } catch {
        continue;
      }
      if (u.origin !== server.origin) {
        if (/^https?:\/\/(www\.)?uptonext\.de/i.test(href)) warn(`absoluter Link auf die eigene Domain: ${href}`);
        continue;
      }
      if (!linkTargets.has(u.pathname)) linkTargets.set(u.pathname, new Set());
      linkTargets.get(u.pathname).add(path);
      if (u.hash.length > 1 && existsInBuild(u.pathname) && !idsInBuild(u.pathname).has(decodeURIComponent(u.hash.slice(1)))) {
        err(`Sprungmarke ohne Ziel: ${href} (id fehlt auf ${u.pathname})`);
      }
    }

    // Größen
    const bodies = (await Promise.all(light.log.bodies)).filter(Boolean);
    const sum = (type) => bodies.filter((b) => b.type === type).reduce((a, b) => ({ bytes: a.bytes + b.bytes, gzip: a.gzip + b.gzip }), { bytes: 0, gzip: 0 });
    const inline = (arr) => arr.reduce((a, s) => ({ bytes: a.bytes + Buffer.byteLength(s), gzip: a.gzip + gzipSync(s).length }), { bytes: 0, gzip: 0 });
    const js = sum('script');
    const jsInline = inline(info.inlineJs);
    const css = sum('stylesheet');
    const cssInline = inline(info.inlineCss);
    const fonts = sum('font');
    const images = sum('image');
    const doc = sum('document');
    result.sizes = {
      html: doc,
      js: { bytes: js.bytes + jsInline.bytes, gzip: js.gzip + jsInline.gzip },
      css: { bytes: css.bytes + cssInline.bytes, gzip: css.gzip + cssInline.gzip },
      fonts,
      images,
    };
    if (result.sizes.js.gzip > BUDGET.js) err(`JS-Budget überschritten: ${kb(result.sizes.js.gzip)} gzip (max. ${kb(BUDGET.js)})`);
    if (result.sizes.css.gzip > BUDGET.css) err(`CSS-Budget überschritten: ${kb(result.sizes.css.gzip)} gzip (max. ${kb(BUDGET.css)})`);
    if (fonts.bytes > BUDGET.font) err(`Font-Budget überschritten: ${kb(fonts.bytes)} (max. ${kb(BUDGET.font)})`);

    result.axe.light = await runAxe(light.page);
    collectNet(light.log, 'hell');
    result.requests = light.log.requests.length;
    await light.context.close();

    // 2) Dunkel, Desktop: axe, Konsole, Netzwerk
    const dark = await openPage(path, { theme: 'dark', width: 1280 });
    result.axe.dark = await runAxe(dark.page);
    collectNet(dark.log, 'dunkel');
    await dark.context.close();

    // 3) Mobil 360 px: horizontales Scrollen, axe
    const mobile = await openPage(path, { theme: 'light', width: 360 });
    const overflow = await mobile.page.evaluate(() => {
      const vw = document.documentElement.clientWidth;
      const sw = document.documentElement.scrollWidth;
      if (sw <= vw) return null;
      const offenders = [];
      for (const el of document.querySelectorAll('body *')) {
        const r = el.getBoundingClientRect();
        if (r.right > vw + 1 && r.width > 0) {
          const name = el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + (el.classList.length ? '.' + [...el.classList].slice(0, 2).join('.') : '');
          offenders.push(`${name} (rechts ${Math.round(r.right)} px)`);
          if (offenders.length >= 5) break;
        }
      }
      return { vw, sw, offenders };
    });
    if (overflow) err(`horizontales Scrollen bei 360 px: Breite ${overflow.sw} > ${overflow.vw}; z. B. ${overflow.offenders.join(', ')}`);
    result.axe.mobile = await runAxe(mobile.page);
    collectNet(mobile.log, 'mobil');
    await mobile.context.close();

    // 4) Ohne JavaScript: Inhalte sichtbar?
    const nojs = await openPage(path, { theme: 'light', width: 1280, js: false });
    const noJsText = await nojs.page.evaluate(() => {
      const main = document.querySelector('main');
      return main ? main.innerText.replace(/\s+/g, ' ').trim().length : 0;
    });
    await nojs.context.close();

    // Ohne JavaScript, 360 px: Hauptnavigation und Rechtslinks sichtbar und innerhalb des Viewports
    const nojsMobile = await openPage(path, { theme: 'light', width: 360, js: false });
    const navCheck = await nojsMobile.page.evaluate(() => {
      const vw = document.documentElement.clientWidth;
      const visible = (a) => {
        const r = a.getBoundingClientRect();
        const st = getComputedStyle(a);
        return r.width > 0 && r.height > 0 && r.left >= 0 && r.right <= vw + 1 && st.visibility !== 'hidden' && st.display !== 'none';
      };
      const nav = [...document.querySelectorAll('nav[aria-label="Hauptnavigation"] a')];
      const legal = [...document.querySelectorAll('footer a[href*="impressum"], footer a[href*="datenschutz"]')];
      return {
        nav: nav.length,
        navHidden: nav.filter((a) => !visible(a)).map((a) => a.textContent.trim()),
        legal: legal.length,
        legalHidden: legal.filter((a) => !visible(a)).map((a) => a.textContent.trim()),
      };
    });
    await nojsMobile.context.close();
    result.noJsNav = navCheck;
    if (navCheck.nav === 0) err('ohne JavaScript: keine Hauptnavigation gefunden');
    if (navCheck.navHidden.length) err(`ohne JavaScript (360 px) nicht sichtbar: Navigation ${navCheck.navHidden.join(', ')}`);
    if (navCheck.legal < 2) err('Impressum/Datenschutz fehlen im Footer');
    if (navCheck.legalHidden.length) err(`ohne JavaScript (360 px) nicht sichtbar: ${navCheck.legalHidden.join(', ')}`);
    if (info.mainText > 0) {
      const ratio = noJsText / info.mainText;
      result.noJsTextRatio = Math.round(ratio * 100) / 100;
      if (ratio < 0.7) err(`ohne JavaScript nur ${Math.round(ratio * 100)} % des Textes in <main> sichtbar`);
      else if (ratio < 0.95) warn(`ohne JavaScript ${Math.round(ratio * 100)} % des Textes in <main> sichtbar`);
    }

    for (const [mode, list] of Object.entries(result.axe)) {
      for (const v of list) err(`axe (${mode}) ${v.id} [${v.impact}]: ${v.help} – ${v.nodes}× z. B. ${v.targets.join(' | ')}`);
    }
  } catch (e) {
    err(`QA-Lauf abgebrochen: ${e.message}`);
  }

  function collectNet(log, label) {
    for (const url of new Set(log.external)) err(`externer Request (${label}): ${url}`);
    for (const f of new Set(log.failed)) err(`Ressource fehlgeschlagen (${label}): ${f}`);
    for (const c of new Set(log.console)) err(`Konsole (${label}): ${c}`);
  }

  return result;
}

// Seiten parallel prüfen (Standard 3 gleichzeitig; --concurrency n oder QA_CONCURRENCY)
const queue = [...pages];
const results = [];
await Promise.all(
  Array.from({ length: Math.min(opts.concurrency, queue.length) }, async () => {
    while (queue.length) {
      const path = queue.shift();
      results.push(await checkPage(path));
    }
  }),
);
report.pages = results.sort((a, b) => a.path.localeCompare(b.path));

await browser.close();
await server.close();

// -- Interne Links -----------------------------------------------------------
report.brokenLinks = [];
for (const [target, from] of linkTargets) {
  if (!existsInBuild(target)) report.brokenLinks.push({ target, from: [...from] });
}

// -- Ausgabe -----------------------------------------------------------------
function kb(n) {
  return (n / 1024).toFixed(1).replace('.', ',') + ' KB';
}

mkdirSync(outDir, { recursive: true });
report.finishedAt = new Date().toISOString();
const errorCount = report.pages.reduce((a, p) => a + p.errors.length, 0) + (opts.strict ? report.brokenLinks.length : 0);
const warnCount = report.pages.reduce((a, p) => a + p.warnings.length, 0) + (opts.strict ? 0 : report.brokenLinks.length);
report.summary = { pages: report.pages.length, errors: errorCount, warnings: warnCount };
const reportFile = join(outDir, 'report.json');
writeFileSync(reportFile, JSON.stringify(report, null, 2));

console.log('\nQA-Ergebnis');
console.log('Seite'.padEnd(26) + 'Fehler  Warn.  JS (gzip)   CSS (gzip)   Fonts      Requests');
for (const p of report.pages) {
  const s = p.sizes;
  console.log(
    p.path.padEnd(26) +
      String(p.errors.length).padEnd(8) +
      String(p.warnings.length).padEnd(7) +
      (s.js ? kb(s.js.gzip) : '–').padEnd(12) +
      (s.css ? `${kb(s.css.gzip)}`.padEnd(13) : '–'.padEnd(13)) +
      (s.fonts ? kb(s.fonts.bytes) : '–').padEnd(11) +
      p.requests,
  );
}
for (const p of report.pages) {
  if (!p.errors.length && !p.warnings.length) continue;
  console.log(`\n${p.path}`);
  for (const e of p.errors) console.log(`  ✗ ${e}`);
  for (const w of p.warnings) console.log(`  ! ${w}`);
}
if (report.brokenLinks.length) {
  console.log(`\nInterne Links auf fehlende Seiten (${opts.strict ? 'Fehler' : 'Warnung; --strict macht Fehler daraus'}):`);
  for (const b of report.brokenLinks) console.log(`  ${opts.strict ? '✗' : '!'} ${b.target}  ← ${b.from.join(', ')}`);
}
console.log(`\n${report.pages.length} Seite(n), ${errorCount} Fehler, ${warnCount} Warnung(en). Bericht: ${reportFile}`);
process.exit(errorCount ? 1 : 0);
