/**
 * Arbeitsweise der Dienstleistung – eine Quelle für die Startseite („Wie wir arbeiten“) und die
 * Leistungsseite (Vorgehen, Prinzipien). Keine Wochenangaben, keine Kennzahlen
 * (docs/website-entscheidungen.md → Dienstleistung).
 */

/** Vorgehen – vier Schritte, bewusst ohne Wochenangaben */
export const vorgehen: { titel: string; text: string; ergebnis: string }[] = [
  {
    titel: 'Verstehen',
    text: 'Wir sehen uns an, wie Ihr Ablauf heute wirklich läuft – mit den Menschen, die damit arbeiten, und an echten Beispielen.',
    ergebnis: 'Ein gemeinsames Bild des Ablaufs und ein sinnvoller erster Schritt',
  },
  {
    titel: 'Durchstich',
    text: 'Statt Folien bauen wir früh einen schmalen, lauffähigen Teil der Lösung, der mit Beispielen aus Ihrem Alltag arbeitet.',
    ergebnis: 'Sie sehen früh, ob die Richtung stimmt – bevor viel gebaut ist',
  },
  {
    titel: 'In Etappen bauen',
    text: 'Wir erweitern die Software Schritt für Schritt. Nach jeder Etappe sehen Sie den Stand und entscheiden mit, was als Nächstes kommt.',
    ergebnis: 'Nutzbare Zwischenstände statt eines großen Stichtags',
  },
  {
    titel: 'Betreiben und übergeben',
    text: 'Nach dem Start betreuen wir die Software und entwickeln sie weiter – oder übergeben sie mit Dokumentation an Ihr Team.',
    ergebnis: 'Software, die im Alltag läuft, und klare Zuständigkeit dafür',
  },
];

/**
 * ANNAHME – Grundsätze aus der alten Seite (docs/website-entscheidungen.md, „Dienstleistung“).
 * Bitte bestätigen; bis dahin nicht weiter zuspitzen.
 */
export const grundsaetze: { titel: string; text: string }[] = [
  {
    titel: 'Zuerst zuhören',
    text: 'Wir beginnen mit Ihrem Arbeitstag, nicht mit Technik. Was sich nicht lohnt, sagen wir Ihnen auch.',
  },
  {
    titel: 'Früh ein lauffähiger Durchstich statt Folien',
    text: 'Sie sehen früh echte Software mit Beispielen aus Ihrem Alltag – keine Präsentation darüber, wie es einmal werden soll.',
  },
  {
    titel: 'In Etappen liefern',
    text: 'Kleine, nutzbare Schritte statt eines großen Stichtags. Nach jeder Etappe entscheiden Sie mit.',
  },
  {
    titel: 'Code und Dokumentation gehören Ihnen',
    text: 'Sie bleiben unabhängig: Ihr Team oder ein anderer Dienstleister kann die Software weiterentwickeln.',
  },
  {
    titel: 'Sie sprechen direkt mit den Menschen, die bauen',
    text: 'Keine Stille Post über mehrere Stationen: Ihre Ansprechpartner entwickeln die Software selbst.',
  },
];
