#!/usr/bin/env node
/**
 * Berechnet die WCAG-Kontraste aller Farb-Tokens aus src/styles/tokens.css
 * und prüft, ob die beiden Dunkel-Blöcke identisch sind.
 *
 *   npm run contrast        # Tabelle, Exit-Code 1 bei Unterschreitung
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { checkPairs, formatRatio, readTokenBlock, TOKEN_MARKERS } from '../src/lib/color.mjs';

const cssPath = fileURLToPath(new URL('../src/styles/tokens.css', import.meta.url));
const css = readFileSync(cssPath, 'utf8');

const light = readTokenBlock(css, TOKEN_MARKERS.light);
const dark = readTokenBlock(css, TOKEN_MARKERS.dark);
const darkAuto = readTokenBlock(css, TOKEN_MARKERS.darkAuto);

let failed = 0;

// Dunkel-Blöcke müssen identisch sein
const keys = new Set([...Object.keys(dark), ...Object.keys(darkAuto)]);
for (const k of keys) {
  if (dark[k] !== darkAuto[k]) {
    console.error(`✗ Dunkel-Blöcke unterscheiden sich bei ${k}: "${dark[k]}" vs. "${darkAuto[k]}"`);
    failed++;
  }
}
for (const k of Object.keys(light)) {
  if (!(k in dark)) {
    console.error(`✗ ${k} fehlt im Dunkel-Block`);
    failed++;
  }
}

for (const [name, tokens] of [
  ['Hell', light],
  ['Dunkel', dark],
]) {
  console.log(`\n${name}`);
  console.log('Vordergrund      Hintergrund              Kontrast   Soll   Zweck');
  for (const r of checkPairs(tokens)) {
    const flag = r.ok ? ' ' : '✗';
    if (!r.ok) failed++;
    console.log(
      `${flag} ${r.fg.padEnd(15)}${r.bg.padEnd(25)}${formatRatio(r.ratio).padEnd(11)}${String(r.min).replace('.', ',').padEnd(7)}${r.purpose}`,
    );
  }
}

if (failed) {
  console.error(`\n${failed} Problem(e).`);
  process.exit(1);
}
console.log('\nAlle Kontraste erfüllt, Dunkel-Blöcke identisch.');
