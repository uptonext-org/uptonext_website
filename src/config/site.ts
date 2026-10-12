/**
 * Zentrale Daten der Website – die einzige Stelle für Firmen- und Produktangaben.
 *
 * Regeln
 * - Seiten lesen Namen, Kontakt und CTAs ausschließlich von hier (keine Literale im Markup).
 * - Unbekannte Angaben sind `null`. Seiten rendern dann sichtbar einen Platzhalter, z. B.:
 *     <Placeholder label={placeholders.phone} value={company.phone} />
 * - Der Produktname kommt nur aus `product.name` (Arbeitsname, austauschbar). Keine Wortspiele damit.
 * - Alles mit ANNAHME ist laut docs/website-entscheidungen.md noch zu bestätigen.
 */

export interface Link {
  /** Sichtbarer Text */
  label: string;
  /** Interner Pfad mit Schrägstrich am Ende (trailingSlash: 'always') oder vollständige URL */
  href: string;
}

export interface Address {
  street: string;
  postalCode: string;
  city: string;
  country: string;
}

export interface Company {
  /** Marke, wie sie im Text erscheint */
  name: string;
  /** Firmierung inkl. Rechtsform – null = noch nicht bestätigt */
  legalName: string | null;
  /** ANNAHME: E-Mail-Adresse aus der alten Seite übernommen */
  email: string;
  phone: string | null;
  address: Address | null;
  /** Registergericht und Registernummer, z. B. „Amtsgericht … HRB …“ */
  register: string | null;
  /** Umsatzsteuer-Identifikationsnummer */
  vat: string | null;
  /** Vertretungsberechtigte Person(en) */
  managingDirector: string | null;
}

export const company: Company = {
  name: 'UpToNext',
  legalName: null,
  email: 'hallo@uptonext.de',
  phone: null,
  address: null,
  register: null,
  vat: null,
  managingDirector: null,
};

/** Beschriftungen für Platzhalter, wenn eine Angabe in `company` null ist. */
export const placeholders = {
  legalName: 'Firmierung mit Rechtsform',
  phone: 'Telefonnummer',
  address: 'Anschrift (Straße, PLZ, Ort)',
  register: 'Registergericht und Registernummer',
  vat: 'USt-IdNr.',
  managingDirector: 'Vertretungsberechtigte Person(en)',
  responseTime: 'zugesagte Antwortzeit',
  legalReview: 'juristische Prüfung erforderlich',
} as const;

export type ProductStatus = 'in Entwicklung';

export interface Product {
  /** Arbeitsname – nur hier ändern */
  name: string;
  /** Markenzusatz, z. B. „Tafelwerk – von UpToNext“ */
  byline: string;
  /** Öffentlicher Status (laut Entscheidungen nur „in Entwicklung“) – klein, für den Satz */
  status: ProductStatus;
  /** Derselbe Status mit großem Anfangsbuchstaben – für Badges und Satzanfänge */
  statusLabel: string;
  /** Produktseite */
  href: string;
}

const productStatus: ProductStatus = 'in Entwicklung';

export const product: Product = {
  name: 'Tafelwerk',
  byline: `von ${company.name}`,
  status: productStatus,
  statusLabel: productStatus.charAt(0).toUpperCase() + productStatus.slice(1),
  href: '/tafelwerk/',
};

/** „Tafelwerk – von UpToNext“ (Halbgeviertstrich mit Leerzeichen) */
export const productFullName = `${product.name} – ${product.byline}`;

/** ANNAHME: Domain. Muss mit `site` in astro.config.mjs übereinstimmen. */
export const url = 'https://uptonext.de';

export const meta = {
  lang: 'de',
  locale: 'de_DE',
  /** Standard-Beschreibung (≤ 155 Zeichen), falls eine Seite keine eigene setzt */
  defaultDescription: `${company.name} baut Software, die Abläufe einfacher macht – individuell für Ihr Unternehmen oder mit ${product.name} für Handwerksbetriebe.`,
  /** Standard-Bild für Open Graph (1200 × 630) */
  ogImage: { src: '/og-image.png', width: 1200, height: 630, alt: `${company.name} Logo` },
} as const;

/**
 * Pfade aller Seiten (trailingSlash: 'always'). Seiten und Komponenten verlinken nur hierüber,
 * damit eine spätere Umbenennung (oder /en/) an einer Stelle passiert.
 */
export const pages = {
  start: '/',
  tafelwerk: product.href,
  leistungen: '/leistungen/',
  kontakt: '/kontakt/',
  impressum: '/impressum/',
  datenschutz: '/datenschutz/',
} as const;

/** Hauptnavigation (Header und Footer). Reihenfolge = Anzeige. */
export const navigation: Link[] = [
  { label: product.name, href: pages.tafelwerk },
  { label: 'Leistungen', href: pages.leistungen },
  { label: 'Kontakt', href: pages.kontakt },
];

/** Rechtliche Seiten (Footer) */
export const legalNavigation: Link[] = [
  { label: 'Impressum', href: pages.impressum },
  { label: 'Datenschutz', href: pages.datenschutz },
];

/** Werte des URL-Parameters `anliegen` auf /kontakt/ */
export type Anliegen = 'projekt' | 'tafelwerk' | 'sonstiges';

/**
 * Handlungsaufforderungen. `projekt` = Dienstleistung, `tafelwerk` = Produkt,
 * `kontakt` = neutral (z. B. Header auf der Startseite).
 * `produkt` und `leistungen` sind die einheitlichen Beschriftungen für Links auf die beiden Seiten.
 */
export const ctas = {
  projekt: { label: 'Erstgespräch anfragen', href: `${pages.kontakt}?anliegen=projekt` },
  tafelwerk: { label: 'Demo anfragen', href: `${pages.kontakt}?anliegen=tafelwerk` },
  kontakt: { label: 'Kontakt aufnehmen', href: pages.kontakt },
  produkt: { label: `${product.name} ansehen`, href: pages.tafelwerk },
  leistungen: { label: 'Leistungen ansehen', href: pages.leistungen },
} as const satisfies Record<string, Link>;

export type CtaKey = keyof typeof ctas;

export const form = {
  /**
   * ANNAHME: Kein Endpunkt bekannt. Leer = Versand per `mailto:` an `form.mailto`.
   * Später z. B. ein EU-gehosteter Formular-Endpunkt (POST).
   */
  endpoint: '',
  mailto: company.email,
  /** Name des Honeypot-Felds (muss leer bleiben) */
  honeypotName: 'website',
  /**
   * Zugesagte Antwortzeit, z. B. „zwei Werktagen“ (Satz: „… innerhalb von {responseTime}“).
   * null = noch nicht zugesagt → sichtbarer Platzhalter auf /kontakt/.
   */
  responseTime: null as string | null,
  /** Auswahl „Anliegen“ – `value` entspricht dem URL-Parameter `anliegen` */
  anliegen: [
    { value: 'projekt', label: ctas.projekt.label },
    { value: 'tafelwerk', label: `${product.name}: ${ctas.tafelwerk.label}` },
    { value: 'sonstiges', label: 'Etwas anderes' },
  ] satisfies { value: Anliegen; label: string }[],
};

/** Theme-Einstellungen (Inline-Skript in Base.astro und ThemeToggle nutzen dieselben Werte) */
export const theme = {
  storageKey: 'utn-theme',
  /** Für <meta name="theme-color"> – entspricht --bg in tokens.css */
  colors: { light: '#ffffff', dark: '#0e1113' },
} as const;

/** Gebündelt für bequeme Importe: `import { site } from '../config/site'` */
export const site = {
  company,
  product,
  productFullName,
  url,
  meta,
  pages,
  navigation,
  legalNavigation,
  ctas,
  form,
  theme,
  placeholders,
} as const;

export default site;
