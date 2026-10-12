/**
 * Gemeinsame Typen der UI-Komponenten – für Props in Seiten/Komponenten:
 *   import type { PillStatus, CtaLink } from '../components/ui/types';
 */
export type { IconName } from './icons';

/** Status in Produkt-Darstellungen (StatusPill) */
export type PillStatus = 'plan' | 'work' | 'wait' | 'done' | 'neutral';

/** Feste Kennzeichnungen (Badge kind) */
export type BadgeKind = 'beispieldaten' | 'demo' | 'entwicklung';
export type BadgeTone = 'neutral' | 'accent' | 'outline';

/** Link mit Beschriftung – gleiche Form wie die Einträge in site.ts `ctas` */
export interface CtaLink {
  label: string;
  href: string;
}

/** Ein Eintrag für Faq.astro */
export interface FaqItem {
  frage: string;
  /** Klartext; Absätze mit Leerzeile trennen. Bei html: true wird HTML übernommen (nur eigene, geprüfte Inhalte). */
  antwort: string;
  html?: boolean;
}

export type HeadingLevel = 1 | 2 | 3 | 4;
