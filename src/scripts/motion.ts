/**
 * Motion-Helfer für Canvas-/JS-Animationen (Tafelwerk-Ablauf-Demo, „Ordnung aus Chaos“, Hero-Logo).
 *
 * Regeln, die dieser Helfer durchsetzt
 * - Läuft nur, wenn das Element sichtbar ist (IntersectionObserver) und der Tab aktiv ist.
 * - prefers-reduced-motion: startet angehalten und zeigt ein Standbild (renderStatic).
 *   Änderungen der Einstellung werden live übernommen. Nutzer können trotzdem aktiv abspielen.
 * - Pause/Play über einen Button (MotionToggle.astro). Beschriftung wechselt zwischen
 *   „Animation anhalten“ und „Animation abspielen“ (Texte kommen aus data-Attributen, nicht aus JS).
 *
 * Verwendung (in einem <script> einer Seite/Komponente):
 *
 *   import { createMotion, setupCanvas, cssVar, onThemeChange } from '../scripts/motion';
 *
 *   const root = document.querySelector<HTMLElement>('[data-demo]')!;
 *   const canvas = root.querySelector('canvas')!;
 *   const view = setupCanvas(canvas);               // DPR-scharf, passt sich der Größe an
 *   let colors = { green: cssVar('--green') };
 *   onThemeChange(() => { colors = { green: cssVar('--green') }; draw(); });
 *
 *   const motion = createMotion({
 *     root,
 *     toggle: root.querySelector('[data-motion-toggle]'),
 *     step: (dt, t) => { update(dt); draw(); },    // dt in Sekunden (max. 1/20), t = Laufzeit
 *     renderStatic: () => drawFinalState(),        // Standbild bei reduzierter Bewegung
 *   });
 *   // motion.play(), motion.pause(), motion.state, motion.destroy()
 */

/* ---------------------------------------------------------------------------
   Easing & Feder
   ------------------------------------------------------------------------ */

/** Die Marken-Kurve cubic-bezier(.2,.9,.2,1) als Funktion t∈[0,1] → [0,1]. */
export function ease(t: number): number {
  if (t <= 0) return 0;
  if (t >= 1) return 1;
  // x(u) = t nach u auflösen (Newton), dann y(u)
  const x1 = 0.2;
  const y1 = 0.9;
  const x2 = 0.2;
  const y2 = 1;
  const cx = 3 * x1;
  const bx = 3 * (x2 - x1) - cx;
  const ax = 1 - cx - bx;
  const cy = 3 * y1;
  const by = 3 * (y2 - y1) - cy;
  const ay = 1 - cy - by;
  let u = t;
  for (let i = 0; i < 6; i++) {
    const x = ((ax * u + bx) * u + cx) * u - t;
    const d = (3 * ax * u + 2 * bx) * u + cx;
    if (Math.abs(x) < 1e-5 || d === 0) break;
    u -= x / d;
  }
  u = Math.min(1, Math.max(0, u));
  return ((ay * u + by) * u + cy) * u;
}

/** Gedämpfte Feder für „Federcharakter“. step(dt) aufrufen, x lesen. */
export class Spring {
  x: number;
  v = 0;
  target: number;
  stiffness: number;
  damping: number;
  constructor(value = 0, stiffness = 170, damping = 22) {
    this.x = value;
    this.target = value;
    this.stiffness = stiffness;
    this.damping = damping;
  }
  step(dt: number): number {
    const force = -this.stiffness * (this.x - this.target) - this.damping * this.v;
    this.v += force * dt;
    this.x += this.v * dt;
    return this.x;
  }
  /** springt ohne Bewegung ans Ziel (z. B. bei reduzierter Bewegung) */
  settle(): number {
    this.x = this.target;
    this.v = 0;
    return this.x;
  }
  get resting(): boolean {
    return Math.abs(this.x - this.target) < 0.001 && Math.abs(this.v) < 0.001;
  }
}

/* ---------------------------------------------------------------------------
   Umgebung: reduzierte Bewegung, Theme, Farben
   ------------------------------------------------------------------------ */

const reducedQuery = () => window.matchMedia('(prefers-reduced-motion: reduce)');

export function prefersReducedMotion(): boolean {
  return reducedQuery().matches;
}

/** Ruft cb bei jeder Änderung von prefers-reduced-motion auf. Gibt eine Abmeldefunktion zurück. */
export function onReducedMotionChange(cb: (reduced: boolean) => void): () => void {
  const mq = reducedQuery();
  const handler = (e: MediaQueryListEvent) => cb(e.matches);
  mq.addEventListener('change', handler);
  return () => mq.removeEventListener('change', handler);
}

/** Aktuelles, wirksames Theme (data-theme oder Systemeinstellung). */
export function currentTheme(): 'light' | 'dark' {
  const t = document.documentElement.dataset.theme;
  if (t === 'light' || t === 'dark') return t;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/** Ruft cb auf, wenn sich das wirksame Theme ändert (Umschalter oder System). */
export function onThemeChange(cb: (theme: 'light' | 'dark') => void): () => void {
  let last = currentTheme();
  const check = () => {
    const now = currentTheme();
    if (now !== last) {
      last = now;
      cb(now);
    }
  };
  const mo = new MutationObserver(check);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  const mq = window.matchMedia('(prefers-color-scheme: dark)');
  mq.addEventListener('change', check);
  return () => {
    mo.disconnect();
    mq.removeEventListener('change', check);
  };
}

/** Liest ein Token (z. B. '--green') als berechneten Wert – für Canvas-Farben. */
export function cssVar(name: string, el: Element = document.documentElement): string {
  return getComputedStyle(el).getPropertyValue(name).trim();
}

/* ---------------------------------------------------------------------------
   Canvas
   ------------------------------------------------------------------------ */

export interface CanvasView {
  ctx: CanvasRenderingContext2D;
  /** CSS-Pixel */
  width: number;
  height: number;
  dpr: number;
  destroy(): void;
}

/**
 * Macht ein Canvas DPR-scharf und hält es bei Größenänderungen aktuell.
 * Die Größe kommt aus dem CSS (width/height bzw. aspect-ratio am Canvas).
 * Zeichnen in CSS-Pixeln: ctx ist bereits skaliert.
 * onResize wird erst bei späteren Größenänderungen aufgerufen (nicht beim Einrichten) –
 * nach setupCanvas() also selbst einmal zeichnen.
 */
export function setupCanvas(
  canvas: HTMLCanvasElement,
  onResize?: (view: CanvasView) => void,
): CanvasView {
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D nicht verfügbar');
  const view: CanvasView = {
    ctx,
    width: 0,
    height: 0,
    dpr: 1,
    destroy: () => ro.disconnect(),
  };
  let ready = false;
  const apply = () => {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.max(1, Math.round(rect.width));
    const h = Math.max(1, Math.round(rect.height));
    if (w === view.width && h === view.height && dpr === view.dpr) return;
    view.width = w;
    view.height = h;
    view.dpr = dpr;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (ready) onResize?.(view);
  };
  const ro = new ResizeObserver(apply);
  apply();
  ready = true;
  ro.observe(canvas);
  return view;
}

/* ---------------------------------------------------------------------------
   Animationsschleife mit Sichtbarkeit, Reduced Motion und Pause-Button
   ------------------------------------------------------------------------ */

export interface MotionState {
  /** rAF-Schleife läuft gerade */
  running: boolean;
  /** Element ist im Viewport */
  visible: boolean;
  /** Tab ist im Hintergrund */
  hidden: boolean;
  /** prefers-reduced-motion: reduce */
  reduced: boolean;
  /** angehalten (durch Nutzer oder reduzierte Bewegung) */
  paused: boolean;
}

export interface MotionOptions {
  /** Element, dessen Sichtbarkeit beobachtet wird (meist die Demo-Fläche) */
  root: Element;
  /** pro Frame, solange die Animation läuft. dt in Sekunden (begrenzt auf 1/20), t = Laufzeit in s */
  step: (dt: number, t: number) => void;
  /** zeichnet ein aussagekräftiges Standbild (reduzierte Bewegung). Ohne: letzter Frame bleibt stehen */
  renderStatic?: () => void;
  /** Button aus MotionToggle.astro (oder null) */
  toggle?: HTMLButtonElement | null;
  /** Anteil, der sichtbar sein muss (Standard 0.15) */
  threshold?: number;
  /** IntersectionObserver rootMargin (Standard '0px') */
  rootMargin?: string;
  /** angehalten starten, auch ohne reduzierte Bewegung */
  startPaused?: boolean;
  /** wird bei jeder Zustandsänderung aufgerufen */
  onChange?: (state: MotionState) => void;
}

export interface MotionController {
  play(): void;
  pause(): void;
  /** play/pause wechseln (wie Klick auf den Button) */
  toggle(): void;
  readonly state: MotionState;
  /** Beobachter und Listener entfernen, Schleife stoppen */
  destroy(): void;
}

export function createMotion(options: MotionOptions): MotionController {
  const { root, step, renderStatic, toggle, threshold = 0.15, rootMargin = '0px', onChange } = options;

  let visible = false;
  let hidden = document.hidden;
  let reduced = prefersReducedMotion();
  /** 'user' = vom Nutzer angehalten, 'reduced' = wegen Einstellung, null = läuft frei */
  let pausedBy: 'user' | 'reduced' | null = reduced ? 'reduced' : options.startPaused ? 'user' : null;
  let raf = 0;
  let last = 0;
  let elapsed = 0;
  let destroyed = false;

  const state = (): MotionState => ({
    running: raf !== 0,
    visible,
    hidden,
    reduced,
    paused: pausedBy !== null,
  });

  const frame = (now: number) => {
    const dt = last ? Math.min((now - last) / 1000, 1 / 20) : 0;
    last = now;
    elapsed += dt;
    step(dt, elapsed);
    raf = requestAnimationFrame(frame);
  };

  const updateButton = () => {
    if (!toggle) return;
    const playing = pausedBy === null;
    toggle.dataset.state = playing ? 'playing' : 'paused';
    const label = playing ? toggle.dataset.labelPause : toggle.dataset.labelPlay;
    const target = toggle.querySelector<HTMLElement>('[data-motion-label]') ?? toggle;
    if (label) target.textContent = label;
  };

  const evaluate = () => {
    if (destroyed) return;
    const shouldRun = visible && !hidden && pausedBy === null;
    if (shouldRun && !raf) {
      last = 0;
      raf = requestAnimationFrame(frame);
    } else if (!shouldRun && raf) {
      cancelAnimationFrame(raf);
      raf = 0;
    }
    updateButton();
    onChange?.(state());
  };

  const showStatic = () => {
    if (renderStatic) renderStatic();
  };

  // Sichtbarkeit
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) visible = entry.isIntersecting;
      evaluate();
    },
    { threshold, rootMargin },
  );
  io.observe(root);

  // Tab im Hintergrund
  const onVisibility = () => {
    hidden = document.hidden;
    evaluate();
  };
  document.addEventListener('visibilitychange', onVisibility);

  // Reduzierte Bewegung live
  const offReduced = onReducedMotionChange((isReduced) => {
    reduced = isReduced;
    if (isReduced && pausedBy === null) {
      pausedBy = 'reduced';
      evaluate();
      showStatic();
    } else if (!isReduced && pausedBy === 'reduced') {
      pausedBy = null;
      evaluate();
    } else {
      evaluate();
    }
  });

  // Button
  const onClick = () => controller.toggle();
  if (toggle) {
    toggle.hidden = false;
    toggle.addEventListener('click', onClick);
  }

  const controller: MotionController = {
    play() {
      pausedBy = null;
      evaluate();
    },
    pause() {
      pausedBy = 'user';
      evaluate();
    },
    toggle() {
      if (pausedBy === null) controller.pause();
      else controller.play();
    },
    get state() {
      return state();
    },
    destroy() {
      destroyed = true;
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      io.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      offReduced();
      toggle?.removeEventListener('click', onClick);
    },
  };

  // Startbild: bei reduzierter Bewegung (oder angehaltenem Start) sofort ein Standbild
  if (pausedBy !== null) showStatic();
  updateButton();

  return controller;
}
