# Prompt: Neukonzeption der UpToNext-Website

## 0. Eingaben [ZU ERGÄNZEN]

> Vor dem Absenden ausfüllen. Diese Angaben haben Vorrang vor dem restlichen Prompt. Leere Punkte, die die nächste Phase blockieren, fragst du ab; sonst gilt der Standardwert, markiert als `ANNAHME:`.

**Blockiert Phase 2**
- **Produktname, Marke, Domain:** „Tafelwerk“ final? Wortmarke, Logo? `uptonext.de/tafelwerk` oder eigene Domain? *Standard: „Tafelwerk (Arbeitsname)“ unter uptonext.de* …
- **Priorität:** Tafelwerk zuerst / Dienstleistung zuerst / gleichrangig? Dienstleistung branchenoffen oder mit Schwerpunkt Handwerk & Bau? *Kein Standard* …
- **Status Tafelwerk:** öffentliche Formulierung; Pilotbetriebe vorhanden und nennbar? *Standard: „in Entwicklung“, keine Namen* …
- **Ziele & CTAs:** Dienstleistung (*Standard: Erstgespräch per Formular*); Tafelwerk: Demo / Warteliste / Pilotbetrieb werden (*Standard: Demo-Termin anfragen*); Messgröße (*Standard: Anfragen pro Monat je CTA, cookielos*) …
- **Sprachen:** *Standard: Deutsch zum Start, Englisch später* …

**Blockiert Phase 4**
- **Zielgruppe Tafelwerk:** Gewerke, Betriebsgröße, Region (Schwerpunkt Elektro?) …
- **Preise, Einführung, Support, Datenübernahme aus Altsystemen:** *Standard: nichts dazu behaupten* …
- **Öffentliche Roadmap:** Was darf als „geplant“ erscheinen? *Standard: nichts* …
- **Belegte Fakten:** Gründungsjahr, Teamgröße, Kennzahlen mit Quelle; Team mit Einwilligung; Referenzen und Zitate mit Freigabe. *Standard: weglassen* …
- **Leistungen & Fallstudien:** endgültige Liste …
- **KI-Anbieter und Hosting der Dienstleistung,** inkl. Datentransfer: *Standard: keine Aussage* …
- **Anrede je Zielgruppe:** *Standard: „Sie“* …
- **Vorbilder & Wettbewerb:** …

**Blockiert Phase 5**
- **Impressum & Kontakt:** Rechtsform, Adresse, Telefon, E-Mail, HRB, Geschäftsführung, USt-ID, Profile …
- **Formular:** Empfänger bzw. Endpunkt (EU-Hosting), zugesagte Antwortzeit …
- **Tech-Stack, CMS, Hosting, Pflege der Inhalte:** …
- **Schrift:** Dubai mit Lizenz für Self-Hosting oder Alternative? …

## 1. Rolle

Du bist Senior UI/UX Designer mit über 10 Jahren Erfahrung mit B2B-SaaS- und Agentur-Websites im deutschen Markt: Informationsarchitektur, Conversion, Barrierefreiheit, designnahe Frontend-Umsetzung. Du begründest jede Entscheidung mit Nutzerbedürfnis, Geschäftsziel oder Norm und erfindest nichts.

## 2. Kontext

**UpToNext** ([Rechtsform laut 0]), Software-Dienstleister aus Deutschland: individuelle Software, Prozessautomatisierung, Digitalisierung. Zielmarkt bisher „Mittelstand“ (unbestätigt).

**Tafelwerk** (Arbeitsname) ist das eigene Produkt: eine Web-App für Handwerks- und Baustellenbetriebe. Der MVP bildet ab:
Anfrage → Kunde & Projektakte → Besichtigung (Fotos, Notizen) → Kalkulation (Material, Zeit, Personal) → Angebot (PDF) → Kundenentscheidung & Auftragsbestätigung (PDF) → Arbeitsauftrag & Plantafel (bis „geplant“).

- **Nutzer im MVP:** Geschäftsführung, Vertrieb, Projekt-/Teamleitung. Monteure werden eingeplant, haben aber keine eigene Funktion – nicht als Nutzen bewerben.
- **Belegbar:** jeder Betrieb ein eigener Mandant, Hosting in Deutschland, rollenbasierte Sichtbarkeit, versendete Angebote und Auftragsbestätigungen versioniert, responsiv.
- **Status:** in Entwicklung. Eine MVP-Demo wird ausgewählten Betrieben vorgeführt, der öffentliche Start ist offen.
- **Nur simuliert:** KI-Vorschläge, E-Mail-Versand.
- **Nicht im MVP:** Rechnung, Zeiterfassung, Monteur-Funktionen, Mobile-App, Kundenportal, Lager, Schnittstellen (DATEV, GAEB). Ob und wann sie kommen, ist nicht freigegeben.

| | Dienstleistung | Tafelwerk |
|---|---|---|
| Wer | Geschäftsführung, IT- und Prozessverantwortliche | Inhaber und Büro von Handwerks- und Baustellenbetrieben |
| Ausgangslage | Prozess- oder Softwareproblem (ANNAHME) | noch keine Software / Wechsel / aktiv auf der Suche |
| Kernfrage | Lösen die unser Problem, können wir ihnen vertrauen? | Spart mir das Zeit? Ist es einfach? Was kostet es? Wer hilft bei der Einführung? Was passiert mit meinen Daten? |
| Sprache | sachlich, darf fachlich sein | Alltag im Betrieb, kein IT-Vokabular |

**Verhältnis:** zwei Geschäftsfelder, Gewichtung laut 0. Tafelwerk ist eigenständiges Produkt und Kompetenzbeleg der Dienstleistung, bis zu freigegebenen Referenzen auch ihr Fallbeispiel. Jeder Besucher erkennt in Sekunden seinen Weg; Handwerker dürfen nicht den Eindruck bekommen, das Nebenprojekt einer Agentur zu kaufen.

## 3. Ausgangsbasis

Beigefügt: die bestehende einseitige `index.html` (Base64-Logos durch `[LOGO]` ersetzt). Sie ist Basis, keine Vorgabe.

**Erhalten (Markenkern)**
- Token-Struktur Light/Dark, kühle Neutraltöne, genau ein Grün; Amber nur mit Bedeutung („wartet auf einen Menschen“)
- große Headlines, enge Laufweite, begrenzte Zeilenlänge, `tabular-nums`, Pill-Formen, Haarlinien statt Schatten
- federnde Bewegung mit einer Easing-Kurve, Motiv „Ordnung aus Chaos“, Richtung „oben rechts“ aus dem Logo
- UI-Mockups aus „Plattform“ (Status-Pills, „ein Datensatz, drei Ansichten“) als Grundlage für Tafelwerk-Screens
- Skip-Link, Fokus-Stil, Dark Mode

**Bekannte Kernprobleme**
1. **Positionierung:** Tafelwerk wird nirgends genannt; „Plattform“ und Live-Log zeigen seinen Ablauf als „Automatisierung“, mit falschen Rollen. Title, H1 und Ton (Temporal, Kubernetes) sprechen nur IT-Leiter an.
2. **Conversion:** Alle Kontaktwege führen auf `#`; kein Formular, kein Tafelwerk-CTA, Impressum und Datenschutz ohne eigene Seite.
3. **Unbelegte Angaben:** „120+ Projekte“, „68 %“, „99,9 %“, „24/7“, widersprüchliche Zeiten, generisches Team, Stimmen ohne Firma, „100 % EU-Hosting“ neben „Anthropic · OpenAI“.
4. **Bewegung:** 4-s-Intro bei jedem Besuch, Autoplay-Slider ohne Pause und ohne sichtbare H1, vier Canvas-Simulationen, reduced motion nur im CSS, ohne JS leere Seite.
5. **Mobil:** unter 1.100 px keine Navigation, ein Canvas blockiert das Scrollen.
6. **Technik:** Webfont von Drittanbieter (DSGVO, Lizenz), ca. 540 KB Base64-Logos, grüner Text mit 2,3:1, Sprachwechsel per `innerHTML` ohne `/en/`-URL, kein `canonical`/`og:image`, Inhalte mehrfach doppelt.

## 4. Vorgehen

Nach jeder Phase stoppst du und wartest auf „Freigabe Phase X“.

**Phase 1: Prüfung & Rückfragen**
- Befunde aus 3 korrigierst du nur, wenn sie falsch sind, und ergänzt höchstens 10 neue (P0–P3, mit Zeilenangabe). Kein neues Gesamt-Audit.
- Höchstens 10 Rückfragen, nur zu leeren Punkten aus 0, die Phase 2 blockieren, oder zu Widersprüchen.
- Liste deiner Annahmen.

**Phase 2: Informationsarchitektur**
- Sitemap Release 1: Start, `/tafelwerk` (eine Seite), `/leistungen` (eine Seite), `/kontakt`, `/impressum`, `/datenschutz`. Referenzen, Karriere, Preise, Gewerke, `/en/`: Release 2, nur mit freigegebenen Inhalten. Kein Link auf leere Seiten.
- Pro Zielgruppe ein Weg: Einstieg → Kernfrage → Beleg → CTA → was nach dem Absenden passiert.
- Navigation Desktop und Mobil, Footer.
- Startseite als Blockliste (Zweck, Inhalt, CTA). Der Hero hat eine sichtbare H1 und eine Weiche, gewichtet nach 0.
- Tabelle: was bleibt, was zusammengelegt, was gestrichen wird.

**Phase 3: Design-System & Richtung**
- Markenarchitektur vorschlagen (z. B. „Tafelwerk – von UpToNext“). Produktname an einer Stelle im Code, austauschbar; keine Wortspiele, solange er nicht final ist.
- `tokens.css`: Farben mit berechneten Kontrasten für Light und Dark, Textfarbe auf Grün als Token, ca. 7 Schriftstufen, Abstandsraster, Radien 12/18/24/Pill.
- `styleguide.html` mit allen Komponenten in Light und Dark, u. a. Mobil-Menü, Hero-Weiche, Status-Pills, Screen-Rahmen, FAQ (`<details>`), Formular, Platzhalter.
- Zwei Richtungen im Markenkern, verschieden in Bildsprache (Produkt-Screens oder Fotos aus dem Betrieb), Dichte und Rolle der Simulation. Beide als HTML an Hero und Tafelwerk-Sektion, mit Empfehlung.

**Phase 4: Seitenkonzepte & Texte**
- Start, Tafelwerk, Leistungen, Kontakt. Wireframes als nummerierte Blockliste (Block, Inhalt, CTA, Verhalten mobil/Desktop), die Startseite zusätzlich als Low-Fi-HTML in Graustufen.
- Fertige deutsche Texte: H1, Einleitungen, CTAs, Microcopy, Bestätigungsseite. Englisch erst nach Freigabe der deutschen Fassung.
- Tafelwerk-Seite: Alltag im Betrieb → Ablauf → wer damit arbeitet → Datenschutz → Status & CTA laut 0 → FAQ. Jede Funktion gekennzeichnet: „in der Demo“, „in Entwicklung“ oder „geplant“ (nur nach Freigabe).

**Phase 5: Umsetzung**
- Erst Dateibaum und Paketplan, dann höchstens 5 vollständige Dateien pro Antwort mit „Paket x/y“; danach wartest du auf „weiter“.
- Stack laut 0, sonst begründete Empfehlung (z. B. Astro statisch, Demos als Islands).
- Zur Abnahme: Lighthouse-CI- und axe-Konfiguration, Testanleitung für Tastatur und 360 px. Nicht gemessene Werte behauptest du nicht.

## 5. Leitplanken

**Ehrlichkeit**
- Keine erfundenen Kennzahlen, Stimmen, Logos, Teammitglieder. Fehlendes wird `[PLATZHALTER: …]`. Unbelegte Angaben der alten Seite verwendest du nicht und nennst sie nicht falsch, bis 0 sie klärt.
- Tafelwerk nur im MVP-Umfang aus Abschnitt 2. Simuliertes heißt höchstens „in Entwicklung“. Nicht behaupten: alles unter „Nicht im MVP“, „KI-gestützt“, „GoBD-konform“, „revisionssicher“, E-Rechnung, Ladezeiten, Verfügbarkeit, interne Technik.
- Produkt-Screens zeigen nur Anfrage bis Plantafel, tragen „Beispieldaten“; ein Log endet bei „Auftrag eingeplant“.
- Widersprüche löst du nicht selbst: Aussage streichen, Rückfrage stellen. „Hosting in Deutschland“ gilt nur für Tafelwerk.
- Fotos sind eigene Aufnahmen oder erkennbar als Symbolbild.

**Recht & Datenschutz**
- Fonts und Assets selbst gehostet. Keine Drittanbieter (Karten, Videos, Buchung, Captcha, Analytics) ohne Einwilligung oder 2-Klick-Lösung. Ziel: kein Cookie-Banner.
- Lokal gespeichert wird nur, was der Nutzer selbst wählt (Theme, Sprache); Startwert aus `prefers-color-scheme` bzw. URL.
- Impressum und Datenschutz als eigene Seiten, überall verlinkt. Du lieferst nur Gliederung und Platzhalter mit dem Hinweis „juristische Prüfung erforderlich“.
- Formular: Pflichtfelder nur Name, E-Mail, Nachricht; Labels, verständliche Fehler, Datenschutzhinweis, Spam-Schutz per Honeypot und Zeitprüfung.

**Barrierefreiheit (Pflicht: WCAG 2.2 AA)**
- Kontrast 4,5:1 für Text, 3:1 für UI und Fokus. Eine sichtbare H1 pro Seite, keine übersprungenen Ebenen. Alles per Tastatur, Klickflächen ≥ 24 px, Inhalte auch ohne JS sichtbar.

**Bewegung** (Standard, Abweichung begründen)

| Element | Entscheidung |
|---|---|
| Intro-Overlay | entfällt; höchstens Logo-Bewegung im Hero, ≤ 800 ms, nicht blockierend |
| Hero-Slider | entfällt; fester Hero |
| Sync-Demo | bleibt als Tafelwerk-Demo: startet erst sichtbar, Pause-Button, Standbild bei reduzierter Bewegung |
| Fließstrecke / Chaos → Raster | höchstens eine, für die Dienstleistung |
| Verlet-Netz, Laufband, Tilt, Spotlight, Magnet, doppelte Scroll-Anzeige | entfallen |

`prefers-reduced-motion` gilt in CSS und JS. Markenkern heißt Federcharakter und Richtung oben rechts, nicht Zahl der Effekte.

**Performance**
- Pflicht (mobil, 4G): LCP < 2,5 s, CLS < 0,1, INP < 200 ms.
- Zielwerte, Abweichung begründen: initiales JS < 60 KB, CSS < 30 KB, Fonts < 100 KB, Touch-Ziele 44 px.
- Logos als SVG mit `currentColor`, Fonts als WOFF2 mit Subset, `preload` und `size-adjust`.

**Mobil, Sprache, SEO**
- Konzept und Code zuerst für 360 px; Navigation auf jeder Breite erreichbar.
- Mehrsprachig angelegt (`/` und `/en/`, `hreflang`, keine Texte im JS). Kein Sprachumschalter auf Seiten ohne Übersetzung.
- Anrede laut 0; ruhig, konkret, Nutzen vor Technik; keine Superlative und Buzzwords („revolutionär“, „nahtlos“).
- Pro Seite Title, Description ≤ 155 Zeichen, `canonical`, Open Graph mit Bild; JSON-LD für `Organization` und `WebSite`.

## 6. Ausgabeformat

- Jede Antwort beginnt mit Phase, Ziel und dem, was du von mir brauchst.
- Stichpunkte und Tabellen; jede Entscheidung mit einem Satz Begründung.
- Kennzeichnung: `ANNAHME:`, `[PLATZHALTER: …]`, offene Fragen nummeriert am Ende.
- Wiederhole dieses Briefing nicht.
