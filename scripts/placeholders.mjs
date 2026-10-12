#!/usr/bin/env node
/**
 * Listet alle offenen Platzhalter, Annahmen und TODOs mit Datei und Zeile – als Checkliste vor dem Launch.
 *
 *   npm run placeholders            # Markdown auf stdout
 *   npm run placeholders -- --write # Abschnitt in README.md zwischen den Markern ersetzen
 *
 * Quellen
 * - <Placeholder …/> in src/ (ohne Styleguide): Beschriftung aus label="…" oder placeholders.x (site.ts);
 *   mit value={…} füllt sich die Stelle automatisch, sobald der Wert in site.ts gepflegt ist.
 * - Felder in site.ts, die null sind (company.*, form.responseTime) bzw. leer (form.endpoint).
 * - Markierungen ANNAHME und TODO in src/ (Kommentare), dazu die ANNAHMEN in docs/website-entscheidungen.md.
 */
import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const rel = (p) => relative(root, p).split('\\').join('/');

function walk(dir, exts) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) out.push(...walk(full, exts));
    else if (exts.some((e) => name.endsWith(e))) out.push(full);
  }
  return out.sort();
}

const lineOf = (text, index) => text.slice(0, index).split('\n').length;

// placeholders-Map und Null-Felder aus site.ts
const sitePath = join(root, 'src/config/site.ts');
const site = readFileSync(sitePath, 'utf8');
const phBlock = site.match(/export const placeholders = \{([\s\S]*?)\} as const;/)?.[1] ?? '';
const phMap = Object.fromEntries([...phBlock.matchAll(/(\w+):\s*'([^']+)'/g)].map((m) => [m[1], m[2]]));

// 1) <Placeholder> im Markup
const items = [];
for (const file of walk(join(root, 'src'), ['.astro'])) {
  if (file.endsWith('styleguide.astro') || file.endsWith('Placeholder.astro')) continue;
  const text = readFileSync(file, 'utf8');
  for (const m of text.matchAll(/<Placeholder\b([\s\S]*?)\/>/g)) {
    const attrs = m[1];
    const literal = attrs.match(/label="([^"]+)"/)?.[1];
    const key = attrs.match(/label=\{placeholders\.(\w+)\}/)?.[1];
    const value = attrs.match(/value=\{([^}]+)\}/)?.[1];
    const note = attrs.match(/note="([^"]+)"/)?.[1];
    const label = literal ?? (key ? phMap[key] ?? key : '(unbekannt)');
    // Platzhalter im else-Zweig von „company.x ? … : <Placeholder/>“ füllt sich ebenfalls aus site.ts
    const before = text.slice(Math.max(0, m.index - 400), m.index);
    const condRaw = [...before.matchAll(/(company\.\w+|form\.\w+|\baddress)\s*\?/g)].pop()?.[1];
    const cond = condRaw === 'address' ? 'company.address' : condRaw;
    items.push({ file: rel(file), line: lineOf(text, m.index), label, value: value ?? cond, note, block: /variant="block"/.test(attrs) });
  }
}

// 2) offene Werte in site.ts
const configOpen = [];
for (const m of site.matchAll(/^\s{2}(\w+):\s*null,/gm)) {
  configOpen.push({ file: rel(sitePath), line: lineOf(site, m.index), label: `company.${m[1]}`, hint: phMap[m[1]] });
}
for (const m of site.matchAll(/^\s{2}(responseTime):\s*null/gm)) {
  configOpen.push({ file: rel(sitePath), line: lineOf(site, m.index), label: `form.${m[1]}`, hint: phMap[m[1]] });
}
for (const m of site.matchAll(/^\s{2}endpoint:\s*''/gm)) {
  configOpen.push({ file: rel(sitePath), line: lineOf(site, m.index), label: 'form.endpoint', hint: 'leer = Versand per mailto: (ANNAHME)' });
}

// 3) ANNAHME / TODO in src
const marks = [];
for (const file of walk(join(root, 'src'), ['.astro', '.ts', '.css', '.mjs'])) {
  if (file.endsWith('styleguide.astro')) continue;
  const lines = readFileSync(file, 'utf8').split('\n');
  lines.forEach((l, i) => {
    const m = l.match(/(ANNAHME|TODO)\b/);
    if (m) {
      const text = l.replace(/^\s*(\/\*\*?|\*|\/\/)\s*/, '').replace(/\*\/\s*$/, '').trim();
      marks.push({ kind: m[1], file: rel(file), line: i + 1, text });
    }
  });
}

// 4) ANNAHMEN in den Entscheidungen
const docPath = join(root, 'docs/website-entscheidungen.md');
const doc = readFileSync(docPath, 'utf8').split('\n');
const docMarks = [];
doc.forEach((l, i) => {
  const m = l.match(/\*\*ANNAHME[^*]*\*\*:?\s*(.*)$/);
  if (m && !/Alle Punkte mit/.test(l)) docMarks.push({ line: i + 1, text: l.replace(/^[-\s]*/, '').replace(/\*\*/g, '').trim() });
});

// -- Ausgabe ---------------------------------------------------------------
const out = [];
const short = (s, n = 140) => (s.length > n ? s.slice(0, n - 1) + '…' : s);
out.push(`_Erzeugt mit \`npm run placeholders\` – nicht von Hand pflegen._`, '');
out.push(`### Platzhalter auf den Seiten (${items.length})`, '');
for (const it of items) {
  const auto = it.value ? ` – füllt sich aus \`${it.value}\` in site.ts` : '';
  const note = it.note ? `<br>${short(it.note)}` : '';
  out.push(`- [ ] \`${it.file}:${it.line}\` **${it.label}**${auto}${note}`);
}
out.push('', `### Offene Werte in \`src/config/site.ts\` (${configOpen.length})`, '');
for (const c of configOpen) out.push(`- [ ] \`${c.file}:${c.line}\` \`${c.label}\`${c.hint ? ` (${c.hint})` : ''}`);
out.push('', `### ANNAHME und TODO im Code (${marks.length})`, '');
for (const m of marks) out.push(`- [ ] \`${m.file}:${m.line}\` ${short(m.text)}`);
out.push('', `### ANNAHMEN in \`docs/website-entscheidungen.md\` (${docMarks.length})`, '');
for (const d of docMarks) out.push(`- [ ] \`docs/website-entscheidungen.md:${d.line}\` ${short(d.text, 200)}`);
const md = out.join('\n');

if (process.argv.includes('--write')) {
  const readmePath = join(root, 'README.md');
  const readme = readFileSync(readmePath, 'utf8');
  const start = '<!-- platzhalter:start -->';
  const end = '<!-- platzhalter:end -->';
  const a = readme.indexOf(start);
  const b = readme.indexOf(end);
  if (a < 0 || b < 0) {
    console.error('Marker in README.md fehlen.');
    process.exit(1);
  }
  writeFileSync(readmePath, readme.slice(0, a + start.length) + '\n' + md + '\n' + readme.slice(b));
  console.log(`README.md aktualisiert: ${items.length} Platzhalter, ${configOpen.length} Config-Werte, ${marks.length} Markierungen, ${docMarks.length} ANNAHMEN.`);
} else {
  console.log(md);
}
