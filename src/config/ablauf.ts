/**
 * Ablauf der Produkt-Demo – die EINE Quelle für Schrittnamen und Rollen des Produkts auf allen Seiten:
 * Startseite (Weiche, Kurzvorstellung), Produktseite (Ablauf-Demo, Schrittliste, Rollen) und
 * Leistungsseite (Beispiel aus eigener Arbeit). Schrittnamen nie in Seiten neu schreiben.
 *
 * Regeln (docs/website-entscheidungen.md)
 * - Nur Demo-Umfang: Anfrage bis Plantafel („eingeplant“). Keine Rechnung, keine Zeiterfassung,
 *   keine Monteur-Funktionen, kein „offline“, kein echter E-Mail-Versand.
 * - Alle Projektangaben sind Beispieldaten und werden in der Darstellung so gekennzeichnet.
 * - Texte stehen hier (bzw. im Markup), nicht im JavaScript – für eine spätere /en/-Fassung.
 */
import { product } from './site';
import type { PillStatus } from '../components/ui/types';

/** Rollen im Demo-Umfang (Monteure werden eingeplant, haben aber keine eigenen Funktionen) */
export const rollen = {
  gf: 'Geschäftsführung',
  vertrieb: 'Vertrieb',
  projekt: 'Projekt- und Teamleitung',
} as const;

/** „Geschäftsführung, Vertrieb sowie Projekt- und Teamleitung“ – für Fließtext (oder: rollenListe('oder')) */
export const rollenListe = (und = 'sowie') => `${rollen.gf}, ${rollen.vertrieb} ${und} ${rollen.projekt}`;

/** Beispielprojekt der Demo (Beispieldaten) */
export const beispielProjekt = {
  nummer: 'P-2026-041',
  titel: 'Bad sanieren',
  kunde: 'Familie Neumann',
  kundeKurz: 'Neumann',
  woche: 'KW 43',
  team: 'Team Berg',
} as const;

/** Ansichten der Demo (für die Hervorhebung bei Änderungen) */
export type Ansicht = 'phone' | 'akte' | 'tafel';

export interface Schritt {
  nr: number;
  /** Kurzname (Schrittleiste der Demo, Weiche und Kurzvorstellung auf der Startseite). Weiches Trennzeichen erlaubt. */
  kurz: string;
  /** eine kurze Zeile für Übersichten (Startseite) */
  teaser: string;
  /** Überschrift in der Schrittliste */
  titel: string;
  /** Beschreibung in der Schrittliste (Alltagssprache) */
  text: string;
  /** Status des Projekts während dieses Schritts (synchron in allen Ansichten) */
  status: { text: string; ton: PillStatus };
  /** Bildunterschrift der Demo während dieses Schritts */
  caption: string;
  /** Eintrag im Verlauf der Projektakte: offen / gerade aktiv / erledigt (+ Datum, Beispieldaten) */
  verlauf: { offen: string; aktiv?: string; erledigt: string; datum: string };
  /** Ansichten, die sich in diesem Schritt ändern – in dieser Reihenfolge hervorgehoben */
  aenderung: Ansicht[];
  /** Verweildauer in der automatischen Wiedergabe (Sekunden) */
  dauer: number;
}

const p = beispielProjekt;

export const schritte: Schritt[] = [
  {
    nr: 1,
    kurz: 'Anfrage',
    teaser: 'Kunde und Projektakte anlegen',
    titel: 'Anfrage und Kunde',
    text: 'Eine Anfrage kommt rein, Sie legen den Kunden an. Daraus entsteht ein Projekt mit eigener Projektakte – dort landet ab jetzt alles, was dazugehört.',
    status: { text: 'Anfrage', ton: 'plan' },
    caption: 'Anfrage aufgenommen, Kunde und Projekt angelegt.',
    verlauf: { offen: 'Anfrage', erledigt: 'Anfrage aufgenommen', datum: '06.10.' },
    aenderung: ['akte', 'phone'],
    dauer: 2.6,
  },
  {
    nr: 2,
    kurz: 'Besichtigung',
    teaser: 'Fotos und Notizen vor Ort',
    titel: 'Besichtigung mit Fotos und Notizen',
    text: 'Vor Ort halten Sie Fotos und Notizen auf dem Smartphone fest. Sie stehen direkt in der Projektakte, statt auf dem Block und in der Fotogalerie.',
    status: { text: 'Besichtigung', ton: 'work' },
    caption: 'Besichtigung: Fotos und Notizen landen direkt in der Projektakte.',
    verlauf: { offen: 'Besichtigung', aktiv: 'Besichtigung läuft', erledigt: 'Besichtigung · 6 Fotos, 3 Notizen', datum: '08.10.' },
    aenderung: ['phone', 'akte'],
    dauer: 4,
  },
  {
    nr: 3,
    kurz: 'Kalkulation',
    teaser: 'Material, Zeit, Mitarbeiter',
    titel: 'Kalkulation',
    text: 'Sie erfassen Material, Arbeitszeit und Mitarbeiter. Die Kalkulation gehört zum Projekt und ist die Grundlage für das Angebot.',
    status: { text: 'Kalkulation', ton: 'work' },
    caption: 'Kalkulation mit Material, Arbeitszeit und Mitarbeitern erstellt.',
    verlauf: { offen: 'Kalkulation', aktiv: 'Kalkulation in Arbeit', erledigt: 'Kalkulation erstellt', datum: '09.10.' },
    aenderung: ['akte', 'phone'],
    dauer: 3.2,
  },
  {
    nr: 4,
    kurz: 'Angebot',
    teaser: 'als PDF, versendete Fassungen gespeichert',
    titel: 'Angebot als PDF',
    text: 'Aus der Kalkulation erstellen Sie das Angebot als PDF. Jede versendete Fassung bleibt gespeichert – später ist klar, welcher Stand beim Kunden lag.',
    status: { text: 'Angebot erstellt', ton: 'work' },
    caption: 'Angebot als PDF erstellt, Fassung 1 gespeichert.',
    verlauf: { offen: 'Angebot', erledigt: 'Angebot als PDF erstellt', datum: '09.10.' },
    aenderung: ['akte', 'phone'],
    dauer: 2.8,
  },
  {
    nr: 5,
    kurz: 'Kunden\u00ADentscheidung',
    teaser: 'wartet auf den Kunden',
    titel: 'Kundenentscheidung',
    text: 'Jetzt ist der Kunde am Zug. Das Projekt steht sichtbar auf „wartet auf Kunde“ – jeder im Büro sieht, wo noch eine Antwort fehlt, ohne nachzufragen.',
    status: { text: 'wartet auf Kunde', ton: 'wait' },
    caption: 'Das Projekt wartet auf die Entscheidung des Kunden.',
    verlauf: {
      offen: 'Kundenentscheidung',
      aktiv: 'Wartet auf Entscheidung des Kunden',
      erledigt: 'Kunde hat zugesagt',
      datum: '14.10.',
    },
    aenderung: ['akte', 'phone'],
    dauer: 3.6,
  },
  {
    nr: 6,
    kurz: 'Auftrags\u00ADbestätigung',
    teaser: 'als PDF, nach der Zusage',
    titel: 'Auftragsbestätigung als PDF',
    text: 'Sagt der Kunde zu, erstellen Sie die Auftragsbestätigung als PDF. Auch hier bleibt jede versendete Fassung nachvollziehbar.',
    status: { text: 'beauftragt', ton: 'work' },
    caption: 'Kunde hat zugesagt, Auftragsbestätigung als PDF erstellt.',
    verlauf: { offen: 'Auftragsbestätigung', erledigt: 'Auftragsbestätigung als PDF erstellt', datum: '14.10.' },
    aenderung: ['akte', 'phone', 'tafel'],
    dauer: 2.8,
  },
  {
    nr: 7,
    kurz: 'Plantafel',
    teaser: 'Arbeitsauftrag einplanen',
    titel: 'Arbeitsauftrag und Plantafel',
    text: `Aus dem Auftrag wird ein Arbeitsauftrag. Auf der Plantafel legen Sie fest, welches Team wann dran ist – danach steht das Projekt in ${product.name} auf „eingeplant“.`,
    status: { text: 'eingeplant', ton: 'done' },
    caption: `Arbeitsauftrag eingeplant: ${p.woche}, ${p.team}.`,
    verlauf: { offen: 'Plantafel', erledigt: `Eingeplant · ${p.woche}, ${p.team}`, datum: '15.10.' },
    aenderung: ['tafel', 'akte', 'phone'],
    dauer: 4.4,
  },
];
