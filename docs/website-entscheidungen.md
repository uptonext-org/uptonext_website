# Website Release 1 – Entscheidungen & Annahmen

Grundlage: `docs/prompts/senior-ui-ux-designer.md`. Wo Abschnitt 0 dort offen ist, gelten diese Annahmen,
bis sie bestätigt oder geändert werden. Alle Punkte mit **ANNAHME** sind zu prüfen.

## Positionierung

- **ANNAHME – Priorität:** gleichrangig. Absender ist UpToNext. Die Startseite ist eine Weiche mit zwei
  gleich gewichteten Wegen: „Handwerksbetrieb → Tafelwerk“ und „Software-Partner gesucht → Leistungen“.
- Markenarchitektur: „Tafelwerk – von UpToNext“. Der Produktname kommt ausschließlich aus
  `src/config/site.ts` (`product.name`), damit er an einer Stelle austauschbar ist. Keine Wortspiele mit dem Namen.
- Kernaussage UpToNext: Wir bauen Software, die Abläufe einfacher macht – individuell für Ihr Unternehmen
  oder mit Tafelwerk, unserer Software für Handwerksbetriebe.
- Kernaussage Tafelwerk: Von der Anfrage bis zur Einsatzplanung – ein System statt Zettel, Excel und Ordner.

## Tafelwerk – was gesagt werden darf (Quelle: Confluence, arc42 10/2026)

- Status öffentlich: **„in Entwicklung“**; eine Demo wird ausgewählten Betrieben vorgeführt. Kein Launch-Datum, keine Preise.
- In der Demo: Anfrage & Kunde → Projekt mit Projektakte → Besichtigung mit Fotos & Notizen → Kalkulation
  (Material, Zeit, Mitarbeiter) → Angebot als PDF → Kundenentscheidung & Auftragsbestätigung als PDF →
  Arbeitsauftrag & Plantafel (bis „geplant“). Rollen: Geschäftsführung, Vertrieb, Projekt-/Teamleitung.
- Belegt: eigener, getrennter Datenbereich je Betrieb; Datenhaltung in Deutschland; rollenbasierte Sichtbarkeit;
  versendete Angebote/AB versioniert und nachvollziehbar; responsiv (Desktop, Tablet, Smartphone).
- **Nicht** behaupten: KI-Funktionen, echter E-Mail-Versand, Rechnung/Zahlung/Mahnung, Zeiterfassung, Monteur-Funktionen,
  Mobile-App, offline, Kundenportal, Lager, DATEV/GAEB/DATANORM, E-Rechnung, GoBD, „revisionssicher“,
  Ladezeiten/Verfügbarkeit, Kundenzahlen, interne Technik (Hosting-Anbieter, Frameworks).
- Produkt-Darstellungen zeigen nur Anfrage bis Plantafel, sind als **„Beispieldaten“** gekennzeichnet.

## Dienstleistung

- Leistungen: Individuelle Software · Prozessautomatisierung · Digitalisierung (Papier/Excel → saubere Daten) ·
  Web- und Mobile-Apps · Betrieb & Weiterentwicklung.
- **ANNAHME** – aus der alten Seite übernommene Versprechen (bitte bestätigen): „Zuerst zuhören“,
  „Früh einen lauffähigen Durchstich statt Folien“, „In Etappen liefern“, „Code und Dokumentation gehören Ihnen“,
  „Sie sprechen direkt mit den Menschen, die bauen“.
- Keine Wochenangaben, keine Kennzahlen, keine Hosting-Ortsangabe, keine KI-Anbieter, kein Tech-Laufband.
- Tafelwerk dient als Kompetenzbeleg/Fallbeispiel, bis freigegebene Referenzen vorliegen.

## Inhalte, die bewusst fehlen

Team, Kundenstimmen, Kennzahlen, Referenzen, Karriere, Blog, Preise, Englisch → Release 2, nur mit freigegebenen Inhalten.
Keine Links auf leere Seiten.

## Conversion

- Dienstleistung: „Erstgespräch anfragen“ → `/kontakt/?anliegen=projekt`
- Tafelwerk: „Demo anfragen“ → `/kontakt/?anliegen=tafelwerk`
- Formular: Pflichtfelder Name, E-Mail, Nachricht; optional Firma, Telefon, Anliegen.
  **ANNAHME:** Kein Endpunkt bekannt → `form.endpoint` in `site.ts` ist leer; dann wird per `mailto:` an
  `hallo@uptonext.de` gesendet (ANNAHME, aus alter Seite). Honeypot-Feld vorhanden; Zeitprüfung erst serverseitig.
- Messung: keine Analytics, keine Cookies.

## Sprache & Ton

- Release 1 nur Deutsch, Anrede „Sie“. Struktur so, dass `/en/` später ergänzt werden kann (keine Texte im JS).
- Ruhig, konkret, Nutzen vor Technik. Für Handwerker: Alltag im Betrieb, kein IT-Vokabular.
  Verboten: „revolutionär“, „nahtlos“, „disruptiv“, „KI-gestützt“, „smart“, Superlative.

## Design

- Tokens aus der alten Seite: Grün `#2ec26a` (Text auf Hell: dunklere Variante mit ≥ 4,5:1), Amber `#d98a17` nur
  mit Bedeutung („wartet auf einen Menschen“), kühle Neutraltöne, Light/Dark.
- **ANNAHME – Schrift:** Figtree (OFL), selbst gehostet über `@fontsource-variable/figtree`, über ein Token austauschbar.
  Dubai ist nicht für Self-Hosting geklärt.
- Logo: aus der alten Seite extrahierte PNGs (hell/dunkel), zugeschnitten und optimiert. **TODO:** SVG-Logo vom Designer.
- Bewegung: kein Intro, kein Slider, kein Tilt/Magnet/Spotlight/Laufband/Verlet-Netz.
  Erlaubt: kurze Logo-Bewegung im Hero (≤ 800 ms, nicht blockierend), Tafelwerk-Ablauf-Demo
  (läuft nur sichtbar, Pause-Button, Standbild bei reduzierter Bewegung), eine Simulation „Ordnung aus Chaos“
  auf der Leistungsseite (gleiche Regeln). Federcharakter, Easing `cubic-bezier(.2,.9,.2,1)`.
- Theme: Start aus `prefers-color-scheme`; nur eine aktive Wahl des Nutzers wird in `localStorage` gespeichert.

## Technik

- Astro (statisch), Ausgabe `dist/`, Seiten: `/`, `/tafelwerk/`, `/leistungen/`, `/kontakt/`, `/impressum/`,
  `/datenschutz/`, `/404`, plus `/styleguide/` (noindex).
- **ANNAHME – Domain:** `https://uptonext.de`.
- Budgets: LCP < 2,5 s, CLS < 0,1, INP < 200 ms; JS initial < 60 KB, CSS < 30 KB, Fonts < 100 KB.
- Keine externen Requests zur Laufzeit (DSGVO). WCAG 2.2 AA. Inhalte ohne JS sichtbar.
- Impressum/Datenschutz: Gliederung mit `[PLATZHALTER: …]`, Hinweis „juristische Prüfung erforderlich“.
