/**
 * Inhalte der Leistungsseite (/leistungen/) – an einer Stelle, damit Texte gepflegt
 * und später für /en/ übersetzt werden können. Keine Texte im Client-JavaScript.
 *
 * Regeln (docs/website-entscheidungen.md)
 * - Nutzen vor Technik: jede Leistung über typische Ergebnisse beschreiben, nicht über Werkzeuge.
 * - Keine Wochenangaben, keine Kennzahlen, keine Hosting-Ortsangabe, keine KI-Anbieter.
 * - Produktname nur aus site.ts (`product.name`).
 * - Grundsätze sind eine ANNAHME (aus der alten Seite übernommen, Bestätigung ausstehend).
 * - Referenzen fehlen bewusst (Release 2, nur nach Freigabe) – kein sichtbarer Platzhalter.
 */
import type { IconName } from '../ui/types';
import { product } from '../../config/site';
import { schritte } from '../../config/ablauf';

/** Vorgehen und Grundsätze sind mit der Startseite geteilt: src/config/arbeitsweise.ts */
export { grundsaetze, vorgehen } from '../../config/arbeitsweise';

export interface Leistung {
  /** Anker auf der Seite (#id) */
  id: string;
  titel: string;
  /** Kurzform für den Überblick im Hero */
  kurz: string;
  /** ein Satz für die Kurzvorstellung auf der Startseite */
  teaser: string;
  icon: IconName;
  text: string;
  /** typische Ergebnisse – was danach bei Ihnen läuft */
  ergebnisse: string[];
}

export const leistungen: Leistung[] = [
  {
    id: 'individuelle-software',
    titel: 'Individuelle Software',
    kurz: 'Wenn Standardsoftware nicht passt',
    teaser: 'Anwendungen, die zu Ihren Abläufen passen – statt Abläufe, die sich einer Software anpassen müssen.',
    icon: 'code',
    text: 'Wenn Standardsoftware Ihren Ablauf nur über Umwege abbildet, entwickeln wir eine Anwendung, die genau dazu passt. Bestehende Systeme binden wir an, statt sie ohne Not zu ersetzen.',
    ergebnisse: [
      'Eine Anwendung für einen Ablauf, der heute über mehrere Programme, Listen und E-Mails verteilt ist',
      'Die Ablösung eines Altsystems, das kaum noch jemand anfassen möchte',
      'Ein internes Werkzeug, in dem jede Rolle sieht, was sie für ihre Arbeit braucht',
      'Schnittstellen, über die Ihre Systeme Daten austauschen, statt dass jemand sie abtippt',
    ],
  },
  {
    id: 'prozessautomatisierung',
    titel: 'Prozessautomatisierung',
    kurz: 'Freigaben, Fristen – der Mensch entscheidet',
    teaser: 'Wiederkehrende Arbeitsschritte laufen automatisch. Wo ein Mensch entscheiden soll, bleibt die Freigabe bei Ihnen.',
    icon: 'workflow',
    text: 'Wiederkehrende Schritte laufen von selbst: Daten werden übernommen, geprüft und weitergegeben. Wo eine Entscheidung nötig ist, wartet der Ablauf auf einen Menschen – mit klarer Zuständigkeit und Frist.',
    ergebnisse: [
      'Freigaben mit klarer Zuständigkeit: Wer entscheidet, sieht alles Nötige an einer Stelle',
      'Fristen und Erinnerungen, damit nichts liegen bleibt',
      'Dokumente wie Angebote, Bestätigungen oder Berichte, die aus vorhandenen Daten entstehen',
      'Ein Verlauf, der zeigt, wer wann was entschieden hat',
    ],
  },
  {
    id: 'digitalisierung',
    titel: 'Digitalisierung',
    kurz: 'Von Papier und Excel zu sauberen Daten',
    teaser: 'Von Papier und Excel zu sauberen Daten, mit denen Ihr Team arbeiten kann.',
    icon: 'data',
    text: 'Wir bringen Informationen aus Papierformularen, Excel-Listen und verstreuten Ablagen in eine gemeinsame Datenbasis – mit festen Feldern, klaren Zuständigkeiten und nachvollziehbarem Verlauf.',
    ergebnisse: [
      'Formulare, die direkt am Rechner, Tablet oder Smartphone ausgefüllt werden, statt abends abgetippt',
      'Eine gemeinsame Datenbasis statt mehrerer Excel-Stände',
      'Vorhandene Listen und Bestände, bereinigt und zusammengeführt',
      'Auswertungen, die auf aktuellen Daten beruhen statt auf Kopien',
    ],
  },
  {
    id: 'web-und-mobile-apps',
    titel: 'Web- und Mobile-Apps',
    kurz: 'Für Browser, Tablet und Smartphone',
    teaser: 'Anwendungen für Browser, Tablet und Smartphone.',
    icon: 'devices',
    text: 'Anwendungen für das Büro, für unterwegs und für Ihre Kunden oder Partner – im Browser oder als App, so wie es zu den Menschen passt, die damit arbeiten.',
    ergebnisse: [
      'Eine Web-Anwendung, die ohne Installation im Browser läuft',
      'Oberflächen, die sich an Bildschirm, Tablet und Smartphone anpassen',
      'Apps für iOS und Android, wenn Ihre Nutzer sie installieren sollen',
      'Zugänge für Kunden oder Partner, die nur sehen, was sie betrifft',
    ],
  },
  {
    id: 'betrieb-und-weiterentwicklung',
    titel: 'Betrieb und Weiterentwicklung',
    kurz: 'Nach dem Start geht es weiter',
    teaser: 'Wir betreuen Ihre Software nach dem Start und entwickeln sie weiter, wenn sich Ihre Anforderungen ändern.',
    icon: 'layers',
    text: 'Mit dem Start ist Software nicht fertig. Wir betreuen sie, halten sie aktuell und entwickeln sie weiter, wenn sich Ihre Anforderungen ändern – oder übergeben sie mit Dokumentation an Ihr Team.',
    ergebnisse: [
      'Updates und Sicherheitsaktualisierungen, ohne dass Sie daran denken müssen',
      'Überwachung des Betriebs, damit Fehler früh auffallen',
      'Weiterentwicklung in kleinen Schritten, wenn sich Abläufe ändern',
      'Eine dokumentierte Übergabe, wenn Ihr eigenes Team übernehmen soll',
    ],
  },
];

/** Mini-Ablauf in der Karte „Prozessautomatisierung“ – Amber nur am Schritt, der auf einen Menschen wartet */
export const automatisierungsSchritte: { titel: string; text: string; wartet?: boolean }[] = [
  { titel: 'Erfassen', text: 'Daten kommen strukturiert an' },
  { titel: 'Prüfen', text: 'Regeln prüfen Vollständigkeit' },
  { titel: 'Freigeben', text: 'Der Mensch entscheidet', wartet: true },
  { titel: 'Ausführen', text: 'Ausgelöst und dokumentiert' },
];

/** „Aus Wildwuchs wird Struktur“ – vorher/nachher (aus der alten Seite, ohne „offline“) */
export const vorherNachher: { vorher: string; nachher: string }[] = [
  {
    vorher: 'Viele Listen, mehrere Wahrheiten, kein Verlauf',
    nachher: 'Ein Modell, eine Wahrheit, nachvollziehbarer Verlauf',
  },
  {
    vorher: 'Zettel, die abends abgetippt werden',
    nachher: 'Erfassung direkt dort, wo die Arbeit passiert',
  },
  {
    vorher: 'Freigaben per Zuruf – oder vergessen im Postfach',
    nachher: 'Freigaben mit Zuständigkeit und Frist',
  },
  {
    vorher: 'Daten werden von Hand zwischen Programmen kopiert',
    nachher: 'Systeme tauschen Daten über Schnittstellen aus',
  },
];

/** Ablauf in der Produkt-Demo (Anfrage bis Plantafel) – dieselben Schritte wie auf der Produktseite */
export const produktAblauf: string[] = schritte.map((s) => s.titel);

/** Was am eigenen Produkt typisch für unsere Arbeit ist – nur belegte Eigenschaften */
export const produktBelege: { leistung: string; text: string }[] = [
  {
    leistung: 'Individuelle Software',
    text: `Ein durchgehender Ablauf statt einzelner Insellösungen: In ${product.name} hängen Anfrage, Kalkulation, Angebot und Planung an einer Projektakte.`,
  },
  {
    leistung: 'Digitalisierung',
    text: 'Was früher auf dem Block stand, wird strukturiert erfasst – Fotos und Notizen der Besichtigung eingeschlossen.',
  },
  {
    leistung: 'Prozessautomatisierung',
    text: 'Angebot und Auftragsbestätigung entstehen als PDF aus den erfassten Daten; versendete Fassungen werden versioniert.',
  },
  {
    leistung: 'Web- und Mobile-Apps',
    text: 'Läuft im Browser auf Computer, Tablet und Smartphone. Was jemand sieht, hängt von seiner Rolle ab.',
  },
];
