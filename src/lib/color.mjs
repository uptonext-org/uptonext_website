// @ts-check
/**
 * Kleine Farb-Hilfen (ohne Abhängigkeiten) für Kontrastberechnungen nach WCAG 2.x.
 * Wird von scripts/contrast.mjs und src/pages/styleguide.astro genutzt,
 * damit die Werte im Styleguide immer aus tokens.css berechnet werden.
 */

/** @typedef {{ r: number, g: number, b: number, a: number }} RGBA */

/**
 * Liest #rgb, #rrggbb, #rrggbbaa und rgb()/rgba() (Komma- oder Leerzeichen-Syntax).
 * @param {string} input
 * @returns {RGBA | null}
 */
export function parseColor(input) {
  const s = input.trim().toLowerCase();
  let m = s.match(/^#([0-9a-f]{3,8})$/);
  if (m) {
    let h = m[1];
    if (h.length === 3 || h.length === 4) h = [...h].map((c) => c + c).join('');
    if (h.length !== 6 && h.length !== 8) return null;
    /** @param {number} i */
    const n = (i) => parseInt(h.slice(i, i + 2), 16);
    return { r: n(0), g: n(2), b: n(4), a: h.length === 8 ? n(6) / 255 : 1 };
  }
  m = s.match(/^rgba?\(([^)]+)\)$/);
  if (m) {
    const parts = m[1].split(/[\s,/]+/).filter(Boolean);
    const [r, g, b] = parts.slice(0, 3).map(Number);
    let a = 1;
    if (parts[3] !== undefined) a = parts[3].endsWith('%') ? parseFloat(parts[3]) / 100 : Number(parts[3]);
    return { r, g, b, a };
  }
  return null;
}

/**
 * Legt eine (halb)transparente Farbe über einen deckenden Hintergrund.
 * @param {RGBA} fg
 * @param {RGBA} bg
 * @returns {RGBA}
 */
export function blend(fg, bg) {
  const a = fg.a;
  return {
    r: Math.round(fg.r * a + bg.r * (1 - a)),
    g: Math.round(fg.g * a + bg.g * (1 - a)),
    b: Math.round(fg.b * a + bg.b * (1 - a)),
    a: 1,
  };
}

/** @param {RGBA} c */
export function luminance(c) {
  /** @param {number} v */
  const ch = (v) => {
    const x = v / 255;
    return x <= 0.04045 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * ch(c.r) + 0.7152 * ch(c.g) + 0.0722 * ch(c.b);
}

/**
 * Kontrastverhältnis zweier Farben. Transparente Vordergründe werden über den
 * Hintergrund gelegt; transparente Hintergründe über `base` (Standard: Weiß).
 * @param {string | RGBA} fg
 * @param {string | RGBA} bg
 * @param {string | RGBA} [base]
 */
export function contrast(fg, bg, base = '#ffffff') {
  /** @param {string | RGBA} x */
  const P = (x) => (typeof x === 'string' ? parseColor(x) : x);
  let b = P(bg);
  const baseC = P(base);
  if (!b || !baseC) return NaN;
  if (b.a < 1) b = blend(b, baseC);
  let f = P(fg);
  if (!f) return NaN;
  if (f.a < 1) f = blend(f, b);
  const L1 = luminance(f);
  const L2 = luminance(b);
  const hi = Math.max(L1, L2);
  const lo = Math.min(L1, L2);
  return (hi + 0.05) / (lo + 0.05);
}

/** @param {number} ratio */
export function formatRatio(ratio) {
  return (Math.floor(ratio * 100) / 100).toFixed(2).replace('.', ',') + ':1';
}

/**
 * Zieht die Custom Properties eines Blocks aus tokens.css.
 * `marker` ist ein eindeutiger Selektortext, z. B. ':root[data-theme="dark"]';
 * gelesen wird der nächste {…}-Block danach.
 * @param {string} css
 * @param {string} marker
 * @returns {Record<string, string>}
 */
export function readTokenBlock(css, marker) {
  const clean = css.replace(/\/\*[\s\S]*?\*\//g, '');
  const start = clean.indexOf(marker);
  if (start < 0) return {};
  const open = clean.indexOf('{', start + marker.length);
  let depth = 0;
  let end = open;
  for (let i = open; i < clean.length; i++) {
    if (clean[i] === '{') depth++;
    else if (clean[i] === '}') {
      depth--;
      if (depth === 0) {
        end = i;
        break;
      }
    }
  }
  const body = clean.slice(open + 1, end);
  /** @type {Record<string, string>} */
  const out = {};
  for (const m of body.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) out[m[1]] = m[2].trim();
  return out;
}

/** Selektoren der Farbblöcke in src/styles/tokens.css */
export const TOKEN_MARKERS = {
  light: ":root[data-theme='light']",
  dark: ":root[data-theme='dark']",
  darkAuto: ':root:not([data-theme])',
};

/**
 * Die geprüften Paare: [Vordergrund, Hintergrund, Mindestwert, Zweck].
 * Ein Hintergrund `--x@--y` heißt: transparente Farbe --x über --y gelegt.
 * @type {Array<[string, string, number, string]>}
 */
export const CONTRAST_PAIRS = [
  ['--ink', '--bg', 4.5, 'Text'],
  ['--ink', '--surface', 4.5, 'Text'],
  ['--ink', '--card', 4.5, 'Text'],
  ['--muted', '--bg', 4.5, 'gedämpfter Text'],
  ['--muted', '--surface', 4.5, 'gedämpfter Text'],
  ['--muted', '--card', 4.5, 'gedämpfter Text'],
  ['--green-text', '--bg', 4.5, 'grüner Text'],
  ['--green-text', '--surface', 4.5, 'grüner Text'],
  ['--green-text', '--card', 4.5, 'grüner Text'],
  ['--green-text', '--green-soft@--card', 4.5, 'grüner Text auf Tönung'],
  ['--green-text', '--green-soft@--surface', 4.5, 'grüner Text auf Tönung'],
  ['--green-text', '--green-tint', 4.5, 'grüner Text auf deckender Tönung'],
  ['--ink', '--green-tint', 4.5, 'Text auf deckender Tönung'],
  ['--muted', '--green-tint', 4.5, 'gedämpfter Text auf deckender Tönung'],
  ['--on-green', '--green', 4.5, 'Text auf Grün-Fläche'],
  ['--amber-text', '--bg', 4.5, 'Amber-Text'],
  ['--amber-text', '--surface', 4.5, 'Amber-Text'],
  ['--amber-text', '--card', 4.5, 'Amber-Text'],
  ['--amber-text', '--amber-soft@--card', 4.5, 'Amber-Text auf Tönung'],
  ['--amber-text', '--amber-soft@--surface', 4.5, 'Amber-Text auf Tönung'],
  ['--amber-text', '--amber-tint', 4.5, 'Amber-Text auf deckender Tönung'],
  ['--ink', '--amber-tint', 4.5, 'Text auf deckender Tönung'],
  ['--muted', '--amber-tint', 4.5, 'gedämpfter Text auf deckender Tönung'],
  ['--danger', '--bg', 4.5, 'Fehlertext'],
  ['--danger', '--surface', 4.5, 'Fehlertext'],
  ['--danger', '--card', 4.5, 'Fehlertext'],
  ['--focus', '--bg', 3, 'Fokusrahmen'],
  ['--focus', '--surface', 3, 'Fokusrahmen'],
  ['--focus', '--card', 3, 'Fokusrahmen'],
  ['--line-strong', '--bg', 3, 'Rand Bedienelement'],
  ['--line-strong', '--surface', 3, 'Rand Bedienelement'],
  ['--line-strong', '--card', 3, 'Rand Bedienelement'],
];

/**
 * Prüft alle Paare gegen einen Token-Satz.
 * @param {Record<string, string>} tokens
 * @returns {Array<{ fg: string, bg: string, min: number, purpose: string, ratio: number, ok: boolean }>}
 */
export function checkPairs(tokens) {
  return CONTRAST_PAIRS.map(([fg, bgSpec, min, purpose]) => {
    const [bg, base] = bgSpec.split('@');
    const baseColor = tokens[base || '--card'] || '#ffffff';
    const ratio = contrast(tokens[fg] || '', tokens[bg] || '', baseColor);
    return { fg, bg: bgSpec, min, purpose, ratio, ok: ratio >= min };
  });
}
