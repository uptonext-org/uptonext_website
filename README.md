# uptonext.de – Website (Release 1)

Statische Website von UpToNext mit [Astro](https://astro.build), nur Deutsch.
Verbindliche Grundlagen stehen in `docs/`:

- `docs/website-entscheidungen.md` – Entscheidungen und **ANNAHMEN** (hat Vorrang; alle ANNAHMEN sind vor dem Launch zu bestätigen, siehe Checkliste unten)
- `docs/prompts/senior-ui-ux-designer.md` – Briefing, besonders Abschnitt 5 „Leitplanken“
- `docs/prompts/index-ohne-logos.html` – alte Seite, gestalterische Basis

## Start

```bash
npm install            # Node ≥ 22.12
npm run dev            # http://localhost:4321
npm run build          # → dist/
npm run preview        # Build lokal ansehen
```

Playwright nutzt das vorinstallierte Chromium unter `/opt/pw-browsers/chromium-1194/` (passend zu `playwright@1.56.1`).
Einen anderen Pfad setzen Sie über `CHROMIUM_PATH`. `npx playwright install` ist nicht nötig.

## Seiten

| Pfad | Datei | Zweck | H1 | CTA im Header |
|---|---|---|---|---|
| `/` | `src/pages/index.astro` | Weiche: Handwerksbetrieb → Produkt, Unternehmen → Leistungen (gleich gewichtet) | „Software, die Abläufe einfacher macht.“ | Kontakt aufnehmen |
| `/tafelwerk/` | `src/pages/tafelwerk.astro` | Produktseite mit Ablauf-Demo (Beispieldaten), Rollen, Daten, Stand, FAQ | „Von der Anfrage bis zur Einsatzplanung.“ | Demo anfragen |
| `/leistungen/` | `src/pages/leistungen.astro` | Dienstleistung: fünf Leistungen, Simulation „Ordnung aus Chaos“, Vorgehen, Prinzipien, FAQ | „Software, die zu Ihren Abläufen passt.“ | Erstgespräch anfragen |
| `/kontakt/` | `src/pages/kontakt.astro` | Formular für beide Wege (`?anliegen=projekt\|tafelwerk\|sonstiges`), ohne Endpunkt per `mailto:` | „Erzählen Sie uns, worum es geht.“ | – |
| `/impressum/` | `src/pages/impressum.astro` | Gliederung mit Platzhaltern, „juristische Prüfung erforderlich“ | „Impressum“ | Kontakt aufnehmen |
| `/datenschutz/` | `src/pages/datenschutz.astro` | 13 Abschnitte mit Platzhaltern, Text folgt `form.endpoint` | „Datenschutzerklärung“ | Kontakt aufnehmen |
| `/404.html` | `src/pages/404.astro` | Wege zurück (noindex) | „Diese Seite haben wir nicht gefunden.“ | Kontakt aufnehmen |
| `/styleguide/` | `src/pages/styleguide.astro` | Abnahme der Komponenten (noindex, nicht in der Sitemap) | „Styleguide“ | Kontakt aufnehmen |

Der Produktname „Tafelwerk“ ist ein Arbeitsname und kommt überall aus `src/config/site.ts` (`product.name`).

## Struktur

```
astro.config.mjs          site, trailingSlash 'always', OUT_DIR/CACHE_DIR, Sitemap
public/
  brand/                  Logos (PNG + WebP, hell/dunkel): lockup, stacked, mark
  favicon.svg  apple-touch-icon.png  og-image.png  robots.txt
scripts/
  qa.mjs                  axe, Netzwerk, Konsole, 360 px, ohne JS (Text + Navigation), Struktur, Anker, Größen
  serve-and-shoot.mjs     Screenshots (360/1280, hell/dunkel, Menü, ohne JS, reduzierte Bewegung)
  placeholders.mjs        Checkliste aller Platzhalter/ANNAHMEN/TODOs mit Datei + Zeile (npm run placeholders)
  contrast.mjs            berechnet alle Token-Kontraste (npm run contrast)
  lib/static-server.mjs   statischer Server + Chromium-Optionen für die Skripte
  brand/build-brand.py    erzeugt public/brand/* aus den extrahierten Logo-PNGs
src/
  config/site.ts          ALLE Firmen-/Produktangaben, Seitenpfade, Navigation, CTAs, Formular, Platzhalter-Texte
  config/ablauf.ts        Produkt-Ablauf (7 Schritte) und Rollen – eine Quelle für Start, Produkt und Leistungen
  config/arbeitsweise.ts  Vorgehen (4 Schritte) und Grundsätze (ANNAHME) – eine Quelle für Start und Leistungen
  styles/tokens.css       Design-Tokens (Farben hell/dunkel mit Kontrasten, Typo, Abstände, Hero-Abstände …)
  styles/global.css       Reset, Basistypo, Layout- und Text-Utilities, Buttons, Pills, Badges, Platzhalter
  styles/forms.css        Formularfelder (nur auf Seiten mit Formular importieren)
  layouts/Base.astro      Grundlayout jeder Seite (Meta, OG, JSON-LD, Theme, Header, Footer)
  components/layout/      Header, Footer, ThemeToggle
  components/ui/          Button, Section, SectionHeader, Card, Faq, FaqSection, CtaBox, StatusPill, Badge,
                          Placeholder, ScreenFrame, Icon (+ icons.ts), Logo, MotionToggle, types.ts
  components/home/        HomeHero, TafelwerkTeaser, ProjektakteMock, ServicesTeaser, WorkingSteps
  components/tafelwerk/   AblaufDemo („ein Datensatz, drei Ansichten“), AblaufSchritte
  components/leistungen/  inhalte.ts (Texte der Seite), LeistungenHero, LeistungsListe, WildwuchsStruktur,
                          OrdnungAusChaos (Simulation), Vorgehen, Prinzipien, EigenesBeispiel
  components/kontakt/     KontaktFormular, Rechtstext (Rahmen Impressum/Datenschutz), RechtsHinweis
  scripts/motion.ts       Helfer für Animationen (Sichtbarkeit, Reduced Motion, Pause)
  lib/color.mjs           Kontrastberechnung (Skript + Styleguide)
  pages/                  eine Datei je Seite
```

## Wo wird was gepflegt?

| Was | Wo |
|---|---|
| Produktname (Arbeitsname), Byline, Status, `statusLabel` („In Entwicklung“) | `src/config/site.ts` → `product` |
| Firmenname, E-Mail, Telefon, Anschrift, Register, USt-ID, Geschäftsführung | `src/config/site.ts` → `company` (unbekannt = `null` → Platzhalter) |
| Seitenpfade | `pages` (alle Links nutzen diese Werte) |
| Navigation, Footer-Links | `navigation`, `legalNavigation` |
| CTAs „Erstgespräch anfragen“ / „Demo anfragen“ / „Kontakt aufnehmen“ / „Tafelwerk ansehen“ / „Leistungen ansehen“ | `ctas.projekt`, `ctas.tafelwerk`, `ctas.kontakt`, `ctas.produkt`, `ctas.leistungen` |
| Formular-Endpunkt (leer = `mailto:`), Anliegen-Auswahl, Honeypot, zugesagte Antwortzeit | `form` (`endpoint`, `anliegen`, `honeypotName`, `responseTime`) |
| Schritte des Produkt-Ablaufs (Namen, Texte, Beispieldaten der Demo), Rollen | `src/config/ablauf.ts` |
| Vorgehen und Grundsätze der Dienstleistung | `src/config/arbeitsweise.ts` |
| Texte der Leistungsseite (Leistungen, Ergebnisse, vorher/nachher, Belege) | `src/components/leistungen/inhalte.ts` |
| Farben, Schrift, Abstände | `src/styles/tokens.css` (danach `npm run contrast`) |

## Gemeinsame Bausteine

- **Komponenten:** `Card size="lg"` mit `audience` (Zielgruppe im Linknamen) und Slot `badge` (Weiche im Hero) ·
  `CtaBox` mit `paths` (zwei gleich gewichtete Wege) oder `primary`/`secondary` · `FaqSection` (FAQ-Abschnitt,
  überall gleich, mit E-Mail-Hinweis) · `ScreenFrame fill` (volle Breite), kompakte Kennzeichnung im Smartphone-Rahmen ·
  `Section flushTop` (Abschluss-CTA direkt unter der FAQ) · `Button type="submit"`.
- **Utilities (global.css):** `.actions` (Button-Zeile, unter 480 px volle Breite) · `.label` (Versalien-Label in Muted;
  `.eyebrow` = dasselbe in Grün) · `.page-hero` (Seitenkopf mit Abstand und Tönung) / `.page-top` (nur Abstand oben) ·
  `.sr-only-mobile` (unter 760 px nur für Screenreader).
- **Tokens:** `--green-tint` / `--amber-tint` (deckende Tönungen, Kontraste geprüft) · `--green-line` (dekorative Linie) ·
  `--hero-pt` / `--hero-pb` (Abstände des Seitenkopfs).

## Regeln für Seiten

- Jede Seite nutzt `Base` und hat genau **eine sichtbare H1**; Ebenen nicht überspringen.
- `description` ≤ 155 Zeichen. Titel ohne Marke übergeben, Base hängt „– UpToNext“ an.
- Produktname, Firmenname, E-Mail, CTAs, Pfade, Ablauf-Schritte **nur aus `src/config/`**, keine Texte in JavaScript.
- Komponenten **einzeln importieren** (`import Card from '../components/ui/Card.astro'`). Astro lädt die Styles
  jeder importierten Komponente, auch wenn sie nicht gerendert wird.
- Keine externen Requests (Fonts, Bilder, Skripte, Karten, Videos). Alles liegt in `public/` oder wird gebündelt.
- Inhalte müssen ohne JavaScript sichtbar sein. Kein Reveal-Effekt.
- Bewegung nur über `src/scripts/motion.ts` (Sichtbarkeit, Pause-Button, Standbild bei reduzierter Bewegung).
- Produkt-Darstellungen nur im Demo-Umfang (Anfrage bis Plantafel), immer mit „Beispieldaten“ (`ScreenFrame`).
- Amber nur für „wartet auf einen Menschen“ (`StatusPill status="wait"`) und Platzhalter.
- Astro verschluckt das Leerzeichen zwischen Text am Zeilenende und einem Inline-Element in der nächsten Zeile –
  dort `{' '}` setzen.

## QA

```bash
npm run contrast                                   # Token-Kontraste + Gleichheit der Dunkel-Blöcke
npm run qa                                         # Build + QA über alle Seiten
node scripts/qa.mjs dist --strict                  # zusätzlich fehlende interne Linkziele als Fehler
node scripts/qa.mjs dist --only /,/tafelwerk/      # nur bestimmte Seiten
node scripts/serve-and-shoot.mjs dist / /tafelwerk/ /leistungen/ /kontakt/ /impressum/ /datenschutz/ /404.html
node scripts/serve-and-shoot.mjs dist / --widths 360 --click "[data-menu-button]" --suffix menu --no-full
node scripts/serve-and-shoot.mjs dist / --no-js --themes light
node scripts/serve-and-shoot.mjs dist /tafelwerk/ --reduced-motion --suffix reduced
npm run check                                      # TypeScript/Astro-Prüfung
npm run placeholders                               # offene Platzhalter, ANNAHMEN, TODOs
```

`qa.mjs` schreibt `qa-output/report.json` und eine Zusammenfassung; Exit-Code 1 bei Fehlern. Geprüft werden je Seite
axe (hell, dunkel, 360 px), externe Requests, Konsole, horizontales Scrollen bei 360 px, Text und Navigation ohne
JavaScript, H1/Überschriften/Title/Description/canonical/IDs/Bilder, Sprungmarken (#id) und die Budgets.
Screenshots ganzer Seiten spulen einmalige CSS-Animationen ans Ende (`animations: 'disabled'`).

**Budgets:** gemessen wird übertragen (gzip): JS < 60 KB, CSS < 30 KB, Fonts < 100 KB je Seite. Stand der letzten Messung:

| Seite | JS gzip (roh) | CSS gzip (roh) | Fonts |
|---|---|---|---|
| `/` | 1,0 KB (1,7) | 12,0 KB (50,3) | 19,7 KB |
| `/tafelwerk/` | 3,5 KB (7,1) | 13,3 KB (58,0) | 19,7 KB |
| `/leistungen/` | 3,8 KB (7,4) | 10,4 KB (44,5) | 19,7 KB |
| `/kontakt/` | 2,1 KB (4,1) | 8,3 KB (33,6) | 19,7 KB |
| `/impressum/`, `/datenschutz/` | 1,0 KB (1,7) | 6,9 KB (27,2) | 19,7 KB |
| `/404.html` | 1,0 KB (1,7) | 7,2 KB (28,4) | 19,7 KB |

Offen: Sollte das CSS-Budget roh gemeint sein, liegen Start, Produkt, Leistungen und Kontakt darüber (siehe Tabelle).

### Parallel bauen

Mehrere Builds gleichzeitig brauchen getrennte Verzeichnisse:

```bash
OUT_DIR=./dist-start CACHE_DIR=./node_modules/.astro-start npm run build
QA_OUT_DIR=qa-output/start node scripts/qa.mjs ./dist-start --only /
node scripts/serve-and-shoot.mjs ./dist-start / --out qa-output/start/shots
```

## Checkliste vor dem Launch

Platzhalter nie durch erfundene Inhalte ersetzen. Werte aus `company`/`form` in `src/config/site.ts` pflegen; die Seiten
zeigen sie dann automatisch statt des Platzhalters. Danach `npm run placeholders -- --write` (aktualisiert diese Liste),
`npm run qa` und den Hinweis „Entwurf – juristische Prüfung erforderlich“ (`src/components/kontakt/RechtsHinweis.astro`)
erst nach der Prüfung entfernen. Im Build finden: `grep -rl "PLATZHALTER" dist/`.

<!-- platzhalter:start -->
_Erzeugt mit `npm run placeholders` – nicht von Hand pflegen._

### Platzhalter auf den Seiten (27)

- [ ] `src/pages/datenschutz.astro:77` **Firmierung mit Rechtsform** – füllt sich aus `company.legalName` in site.ts
- [ ] `src/pages/datenschutz.astro:92` **Anschrift (Straße, PLZ, Ort)** – füllt sich aus `company.address` in site.ts
- [ ] `src/pages/datenschutz.astro:99` **Vertretungsberechtigte Person(en)** – füllt sich aus `company.managingDirector` in site.ts
- [ ] `src/pages/datenschutz.astro:107` **Telefonnummer** – füllt sich aus `company.phone` in site.ts
- [ ] `src/pages/datenschutz.astro:115` **Kontaktdaten der oder des Datenschutzbeauftragten**<br>Nur, wenn eine Benennungspflicht besteht (Art. 37 DSGVO, § 38 BDSG) oder freiwillig benannt wurde. Sonst diesen Abschnitt streichen; Anfrag…
- [ ] `src/pages/datenschutz.astro:127` **Name und Anschrift des Hosting-Anbieters**
- [ ] `src/pages/datenschutz.astro:154` **Speicherdauer der Logdateien beim Hoster**
- [ ] `src/pages/datenschutz.astro:158` **Vertrag nach Art. 28 DSGVO mit dem Hoster bestätigen**
- [ ] `src/pages/datenschutz.astro:161` **Angaben des Hosters prüfen**<br>Welche Daten der Hoster tatsächlich protokolliert und ob er selbst Cookies setzt (z. B. zum Schutz vor Angriffen). Liste und Überblick oben…
- [ ] `src/pages/datenschutz.astro:176` **Name, Sitz und Auftragsverarbeitung des Formular-Dienstes**
- [ ] `src/pages/datenschutz.astro:207` **konkrete Lösch- und Aufbewahrungsfristen**
- [ ] `src/pages/datenschutz.astro:212` **E-Mail-Anbieter (Auftragsverarbeiter)**
- [ ] `src/pages/datenschutz.astro:266` **Übermittlung in Drittländer**<br>Nach Wahl von Hoster und E-Mail-Anbieter prüfen, ob Daten außerhalb der EU bzw. des EWR verarbeitet werden. Falls ja: Land und Garantien na…
- [ ] `src/pages/datenschutz.astro:315` **zuständige Datenschutz-Aufsichtsbehörde mit Anschrift (richtet sich nach dem Firmensitz)**
- [ ] `src/pages/datenschutz.astro:332` **Datum der Freigabe**
- [ ] `src/pages/impressum.astro:31` **Firmierung mit Rechtsform** – füllt sich aus `company.legalName` in site.ts
- [ ] `src/pages/impressum.astro:46` **Anschrift (Straße, PLZ, Ort)** – füllt sich aus `company.address` in site.ts
- [ ] `src/pages/impressum.astro:53` **Vertretungsberechtigte Person(en)** – füllt sich aus `company.managingDirector` in site.ts
- [ ] `src/pages/impressum.astro:72` **Telefonnummer** – füllt sich aus `company.phone` in site.ts
- [ ] `src/pages/impressum.astro:89` **Registergericht und Registernummer** – füllt sich aus `company.register` in site.ts
- [ ] `src/pages/impressum.astro:99` **USt-IdNr.** – füllt sich aus `company.vat` in site.ts
- [ ] `src/pages/impressum.astro:103` **W-IdNr. nach § 139c AO, falls vergeben**
- [ ] `src/pages/impressum.astro:110` **Weitere Angaben nach § 5 DDG prüfen**<br>Zum Beispiel zuständige Aufsichtsbehörde bei einer erlaubnispflichtigen Tätigkeit, Angaben zu reglementierten Berufen (Kammer, Berufsbezeic…
- [ ] `src/pages/impressum.astro:120` **Name und Anschrift der inhaltlich verantwortlichen Person**
- [ ] `src/pages/impressum.astro:126` **Erklärung nach § 36 VSBG**<br>Ob wir an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilnehmen. Nur erforderlich, wenn die gesetzlichen Voraussetzu…
- [ ] `src/pages/kontakt.astro:90` **Telefonnummer** – füllt sich aus `company.phone` in site.ts
- [ ] `src/pages/kontakt.astro:116` **zugesagte Antwortzeit** – füllt sich aus `form.responseTime` in site.ts

### Offene Werte in `src/config/site.ts` (8)

- [ ] `src/config/site.ts:45` `company.legalName` (Firmierung mit Rechtsform)
- [ ] `src/config/site.ts:47` `company.phone` (Telefonnummer)
- [ ] `src/config/site.ts:48` `company.address` (Anschrift (Straße, PLZ, Ort))
- [ ] `src/config/site.ts:49` `company.register` (Registergericht und Registernummer)
- [ ] `src/config/site.ts:50` `company.vat` (USt-IdNr.)
- [ ] `src/config/site.ts:51` `company.managingDirector` (Vertretungsberechtigte Person(en))
- [ ] `src/config/site.ts:163` `form.responseTime` (zugesagte Antwortzeit)
- [ ] `src/config/site.ts:155` `form.endpoint` (leer = Versand per mailto: (ANNAHME))

### ANNAHME und TODO im Code (14)

- [ ] `src/components/home/WorkingSteps.astro:5` Grundsätze sind laut docs/website-entscheidungen.md eine ANNAHME (Bestätigung ausstehend).
- [ ] `src/components/kontakt/KontaktFormular.astro:11` - ANNAHME (docs/website-entscheidungen.md → Conversion): Kein Endpunkt bekannt. Dann gilt
- [ ] `src/components/leistungen/Prinzipien.astro:4` ANNAHME: aus der alten Seite übernommen (docs/website-entscheidungen.md), Bestätigung ausstehend.
- [ ] `src/components/leistungen/inhalte.ts:9` - Grundsätze sind eine ANNAHME (aus der alten Seite übernommen, Bestätigung ausstehend).
- [ ] `src/components/ui/Logo.astro:11` TODO: SVG-Logo vom Designer nachliefern (currentColor), dann diese Komponente umstellen.
- [ ] `src/config/arbeitsweise.ts:32` ANNAHME – Grundsätze aus der alten Seite (docs/website-entscheidungen.md, „Dienstleistung“).
- [ ] `src/config/site.ts:9` - Alles mit ANNAHME ist laut docs/website-entscheidungen.md noch zu bestätigen.
- [ ] `src/config/site.ts:31` ANNAHME: E-Mail-Adresse aus der alten Seite übernommen
- [ ] `src/config/site.ts:94` ANNAHME: Domain. Muss mit `site` in astro.config.mjs übereinstimmen.
- [ ] `src/config/site.ts:152` ANNAHME: Kein Endpunkt bekannt. Leer = Versand per `mailto:` an `form.mailto`.
- [ ] `src/pages/datenschutz.astro:9` - Kontaktformular: ohne Endpunkt per mailto: (ANNAHME laut docs/website-entscheidungen.md),
- [ ] `src/pages/index.astro:10` 4. Wie wir arbeiten: vier Schritte + Grundsätze (ANNAHME)
- [ ] `src/pages/leistungen.astro:11` 5. Prinzipien (ANNAHME, aus der alten Seite)
- [ ] `src/pages/leistungen.astro:63` ANNAHME: „Code und Dokumentation gehören Ihnen“ (docs/website-entscheidungen.md)

### ANNAHMEN in `docs/website-entscheidungen.md` (5)

- [ ] `docs/website-entscheidungen.md:8` ANNAHME – Priorität: gleichrangig. Absender ist UpToNext. Die Startseite ist eine Weiche mit zwei
- [ ] `docs/website-entscheidungen.md:33` ANNAHME – aus der alten Seite übernommene Versprechen (bitte bestätigen): „Zuerst zuhören“,
- [ ] `docs/website-entscheidungen.md:49` ANNAHME: Kein Endpunkt bekannt → `form.endpoint` in `site.ts` ist leer; dann wird per `mailto:` an
- [ ] `docs/website-entscheidungen.md:63` ANNAHME – Schrift: Figtree (OFL), selbst gehostet über `@fontsource-variable/figtree`, über ein Token austauschbar.
- [ ] `docs/website-entscheidungen.md:76` ANNAHME – Domain: `https://uptonext.de`.
<!-- platzhalter:end -->

### Inhaltlich zu bestätigen (aus den Seitenberichten, nicht im Code markiert)

- [ ] Startseite: Hinweis „Eine Demo zeigen wir ausgewählten Betrieben“ (Start, Produkt, Leistungen)
- [ ] Startseite: FAQ „Entwickeln Sie auch Software für unser Unternehmen? – Ja …“ (hängt an: Dienstleistung branchenoffen?)
- [ ] Produkt: FAQ „Was kann Tafelwerk noch nicht?“ nennt öffentlich, was fehlt (Rechnung, Zeiterfassung, Monteur-Funktionen, Kundenportal, App, Schnittstellen)
- [ ] Produkt: Aufgaben je Rolle (aus den Rollennamen abgeleitet), „im Browser“ (aus „Web-App“ abgeleitet), Ablauf „So geht es weiter“, FAQ „Wer hilft bei der Einführung?“
- [ ] Leistungen: „Apps für iOS und Android“, „Zugänge für Kunden oder Partner“, „Vorhandene Listen und Bestände, bereinigt und zusammengeführt“, „Updates und Sicherheitsaktualisierungen“, „Überwachung des Betriebs“
- [ ] Leistungen: FAQ „Wem gehört der Code?“ (rechtlich bindend wirkende Zusage)
- [ ] Kontakt/Datenschutz: Zusage „Wir verwenden Ihre Angaben nur, um Ihre Anfrage zu bearbeiten“ und Rechtsgrundlagen (juristische Prüfung)
- [ ] Mit Formular-Endpunkt: Bestätigungsseite (z. B. `/kontakt/danke/`, noindex) und Zeitprüfung auf dem Server
- [ ] Beispieldaten in den Produkt-Darstellungen (Familie Muster/Neumann, Projektnummern, Beträge, Daten) sind erfunden und gekennzeichnet

## Logo

Die Logos sind Rastergrafiken, die aus der alten Seite extrahiert wurden (`scripts/brand/build-brand.py`).
**TODO:** SVG-Logo vom Designer nachliefern (`currentColor`), dann `src/components/ui/Logo.astro` umstellen.
