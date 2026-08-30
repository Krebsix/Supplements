/**
 * Deutsches Woerterbuch. Quelle: design_handoff_mysuplea_landing/
 * (Redesign 2026-08-30, "Evidenz-Dossier"), Copy dort verbindlich
 * uebernommen, gegen CLAIMS_CHECKLIST.md verifiziert.
 *
 * Regeln (tests/i18n.test.mjs erzwingt sie): keine Gedankenstriche, keine
 * Heilversprechen, kein "Medikament/Medikation", kein Werbeversprechen
 * ("keine Werbung/kein Shop/nie"), "ohne Konto nutzbar" statt "kein
 * Konto", echte Umlaute.
 *
 * Abweichung von der Design-Vorlage (Claim 8, siehe launch/landing-page-
 * claims-verification.md): Das Mockup-Label heisst "Dokumentiert", nicht
 * "Erledigt" (echter App-Text in i18n/de/dashboard.js:55).
 */
import type { Dictionary } from './types.ts';

export const de = {
  meta: {
    title: 'MySuplea: Supplement-Tracker ohne Verkaufsinteresse',
    description:
      'Einnahmeplan, Tagessummen gegen Obergrenzen, wörtlich zitierte Quellen. Ohne Konto nutzbar, Daten verschlüsselt auf deinem Gerät. Beta für iPhone.',
    ogHeadline: 'Supplements im Griff. Belegt statt behauptet.',
    ogAlt: 'MySuplea App-Icon neben der Zeile: Supplements im Griff, belegt statt behauptet.',
  },
  header: {
    tagline: 'Quellen zitiert · Daten lokal',
    skipLink: 'Zum Inhalt springen',
    switchLabel: 'English',
    switchAria: 'Switch to the English version',
    nav: {
      data: 'Daten',
      pricing: 'Preis',
      faq: 'Fragen',
      beta: 'Beta →',
    },
  },
  hero: {
    badge: 'Beta für iPhone, Android folgt',
    headlinePlain: 'Supplements im Griff.',
    headlineHighlight: 'Belegt statt behauptet.',
    subline:
      'MySuplea ordnet ein, was du nimmst, rechnet Tagessummen gegen veröffentlichte Obergrenzen und zitiert jede Quelle wörtlich. Deine Daten bleiben auf deinem Gerät.',
    storeSoon: 'Bald im',
    storeApple: 'App Store',
    storeGoogle: 'Google Play',
  },
  mockup: {
    aria: 'Nachgebauter App-Bildschirm: Tagessummen mit Obergrenzen-Balken und zwei Einträgen für den Morgen',
    date: 'Dienstag, 15. Sept.',
    title: 'Heute',
    sumsTitle: 'Tagessummen',
    sumsSub: 'über 6 Präparate',
    limitLabel: 'Obergrenze',
    rows: [
      { name: 'Magnesium', amount: '400 mg', limit: '250 mg', pct: 100, tone: 'caution' },
      { name: 'Vitamin D', amount: '20 µg', limit: '100 µg', pct: 20, tone: 'affirm' },
      { name: 'Zink', amount: '10 mg', limit: '25 mg', pct: 40, tone: 'affirm' },
    ],
    item1Name: 'Vitamin D3',
    item1Dose: '20 µg, zum Frühstück',
    item1State: 'Dokumentiert',
    item2Name: 'Omega-3',
    item2Dose: '1.000 mg, zur Mahlzeit',
    item2State: 'Offen',
  },
  stamp: {
    ring: 'QUELLEN ZITIERT · DATEN LOKAL · ',
    center: 'AES-256',
  },
  ticker: [
    'D-A-CH-Referenzwerte',
    'EFSA',
    'BfR',
    'HMPC',
    'NIH',
    'Open Food Facts',
    'Kölner Liste',
    'USP',
    'GMP',
    'Informed Sport',
  ],
  tricks: {
    tag: 'Befund 01',
    context: 'Der Markt',
    title: 'Der Supplement-Markt lebt von drei Tricks.',
    otherAppsLabel: 'Andere Apps',
    counterLabel: 'Deshalb MySuplea',
    items: [
      {
        number: '01',
        title: 'Verkaufsdruck',
        text: 'Die „Empfehlung" im Tracker ist eine Provision. Wer dir Magnesium vorschlägt, verdient am Klick.',
        counter:
          'MySuplea verkauft keine Produkte und empfiehlt keine. Die App zeigt Referenzwerte und lässt die Entscheidung bei dir.',
      },
      {
        number: '02',
        title: 'Heilversprechen in Grau',
        text: '„Könnte helfen bei", Sternchen, ein Quiz, das dir einen Mangel diagnostiziert. Fachlich unhaltbar, rechtlich heikel.',
        counter:
          'MySuplea behauptet nichts. Jeder Hinweis ist ein wörtliches Zitat aus EFSA, BfR, HMPC oder NIH, mit sichtbarer Quelle.',
      },
      {
        number: '03',
        title: 'Datensammeln',
        text: 'Beschwerden, Laborwerte und Routinen landen auf Servern, deren Geschäftsmodell niemand kennt.',
        counter:
          'Bei MySuplea bleiben deine Daten AES-256-verschlüsselt auf deinem Gerät. Löschen jederzeit, mit einem Tippen.',
      },
    ],
    closingPlain: 'Darum gibt es MySuplea: einordnen statt verkaufen.',
    closingHighlight: 'Jeder dieser Punkte ist nachprüfbar im Produkt gebaut.',
  },
  stance: {
    tag: 'Prinzip 02',
    context: 'Die Haltung',
    title: 'Was MySuplea stattdessen macht.',
    items: [
      {
        tag: 'REF 01',
        title: 'Obergrenzen statt Empfehlungen',
        text: '„Enthält 400 mg, die Obergrenze liegt bei 250 mg." Die App zeigt den Referenzwert. Sie sagt nie „nimm X".',
      },
      {
        tag: 'SUM 02',
        title: 'Tagessummen über alles, was du nimmst',
        text: 'Drei unauffällige Präparate können zusammen die Obergrenze reißen. MySuplea addiert Wirkstoffe über deinen ganzen Bestand, nicht pro Dose.',
      },
      {
        tag: 'CIT 03',
        title: 'Zitate statt Modellwissen',
        text: 'Hinweise zu Wirkstoffen sind wörtliche Zitate aus EFSA, BfR, HMPC und NIH. Ein automatischer Test bricht den Build, wenn ein Zitat nicht mehr wörtlich in der Quelle steht.',
      },
      {
        tag: 'TRI 04',
        title: 'Beschwerden werden nicht zur Kaufberatung',
        text: 'Wer „müde" eingibt, bekommt zuerst die Einordnung, dann Schlaf, Stress und Alltag als häufigste Ursachenbereiche. Nährstoffe stehen ganz unten, eingeklappt.',
      },
    ],
    quote: 'Enthält 400 mg, die Obergrenze liegt bei 250 mg. Die App zeigt den Referenzwert. Sie sagt nie »nimm X«.',
    quoteCaption: 'So spricht MySuplea · Jeder Hinweis nennt seine Quelle wörtlich',
  },
  data: {
    tag: 'Protokoll 03',
    context: 'Deine Daten',
    title: 'Deine Routine, deine Werte, dein Gerät.',
    paragraphs: [
      'Alles, was du eingibst, bleibt auf dem Handy, AES-256-verschlüsselt. Backup als Datei, komplettes Löschen mit einem Tippen.',
      'Ein Konto ist freiwillig. Wer eines anlegt, bekommt später Sync auf mehrere Geräte. Der Schlüssel dafür entsteht auf dem Gerät. Aus den gespeicherten Daten allein kann niemand etwas lesen, auch wir nicht.',
      'Nur die freiwillige Foto-Analyse schickt Etikettenfotos zur Auswertung, nach ausdrücklicher Zustimmung, und speichert sie nicht.',
    ],
    facts: [
      { key: 'Verschlüsselung', value: 'AES-256 auf dem Gerät' },
      { key: 'Schlüssel', value: 'iOS-Keychain / Android-Keystore' },
      { key: 'Backup', value: 'Als Datei, portabel' },
      { key: 'Löschen', value: 'Vollständig, ein Tippen' },
    ],
    reportTag: 'Für die Sprechstunde',
    reportTitle: 'Ein Bericht zum Mitnehmen.',
    reportBody: 'Als Übersicht für Praxis oder Apotheke, Abschnitte wählbar. Die Bewertung gehört dorthin, nicht in eine App.',
    reportItems: ['Präparate und Dosen', 'Tagessummen', 'Laborwerte im Verlauf', 'Wirkstoffhinweise mit Quelle'],
    limitsTag: 'Klare Grenzen',
    limitsTitle: 'Was die App nicht tut.',
    limitsItems: [
      'Sie empfiehlt keine Produkte und keine Dosierungen.',
      'Sie bewertet keine Marken und verlinkt keine Shops.',
      'Sie stellt keine Diagnosen und ersetzt keine ärztliche Beratung.',
    ],
  },
  pricing: {
    tag: 'Modell 04',
    context: 'Preis',
    title: 'Kostenlos. Pro finanziert die KI-Auswertung.',
    freeTag: 'Stufe A',
    freeTitle: 'Kostenlos, für immer',
    freeItems: ['Barcode-Scan ohne Limit', 'Drei KI-Foto-Scans', 'Bis zu fünf Präparate', 'Bericht für die Sprechstunde', 'Backup und Löschen'],
    proTag: 'Stufe B · Optional',
    proTitle: 'Pro, optionales Abo',
    proItems: [
      'Unbegrenzte KI-Scans (Fair Use)',
      'Unbegrenzter Bestand',
      'Wirkungskontrolle mit Störfaktoren',
      'Kostenanalyse',
      'Laborwerte-Verlauf',
      'Kur-Zyklen',
    ],
    whyTag: 'Transparenz',
    whyTitle: 'Warum überhaupt Geld',
    whyBody:
      'Jede Foto-Auswertung kostet uns rund 25 Cent bei der KI. Das Abo bezahlt das und die Pflege der Wirkstoff-Datenbank. Kein Affiliate, keine Markenkooperation. Wer nicht abonnieren will, kauft Scan-Pakete einzeln. Preise nennen wir mit dem Store-Start.',
  },
  faq: {
    tag: 'Anhang 05',
    context: 'Fragen',
    title: 'Was Leute uns fragen.',
    items: [
      {
        q: 'Wovon lebt die App?',
        a: 'Vom Pro-Abo. Das finanziert die KI-Auswertung der Scans und die Pflege der Datenbank. Beides sind echte laufende Kosten.',
      },
      {
        q: 'Warum sagt die App nicht, was ich nehmen soll?',
        a: 'Weil sie deine gesundheitliche Situation nicht beurteilen kann und darf. Sie ordnet ein und dokumentiert. Die Bewertung gehört in die Praxis oder Apotheke, dafür gibt es den Bericht.',
      },
      {
        q: 'Brauche ich ein Konto?',
        a: 'Nein. Die App läuft komplett ohne. Ein Konto ist die Grundlage für Sync auf mehrere Geräte, den wir gerade bauen.',
      },
      {
        q: 'Woher kommen die Referenzwerte?',
        a: 'Aus veröffentlichten Quellen: D-A-CH-Referenzwerte, EFSA, BfR, HMPC, NIH. Jeder Hinweis nennt seine Quelle wörtlich.',
      },
      {
        q: 'Für wen ist die App nicht gedacht?',
        a: 'Für niemanden unter 16 und für niemanden, der eine Diagnose sucht. MySuplea ersetzt keine ärztliche Beratung.',
      },
    ],
  },
  form: {
    label: 'E-Mail-Adresse',
    placeholder: 'E-Mail-Adresse',
    cta: 'Eintragen',
    ctaDone: 'Eingetragen ✓',
    consentPrefix: 'Nur für die Beta-Einladung, gespeichert in der EU. Austragen jederzeit.',
    consentLink: 'Datenschutzerklärung',
    pending: 'Die Anmeldung öffnet in Kürze. Bis dahin erreichst du uns per Mail.',
    error: 'Das hat nicht geklappt. Bitte versuch es gleich noch einmal oder schreib uns eine Mail.',
  },
  beta: {
    title: 'Die Beta startet auf iPhone.',
    body: 'Trag dich ein. Sobald es losgeht, kommt die TestFlight-Einladung per Mail. Eine Mail, keine Serie.',
  },
  footer: {
    madeBy: 'MySuplea ist ein Produkt von indoo home LLC.',
    privacy: 'Datenschutz',
    imprint: 'Impressum',
    terms: 'Nutzungsbedingungen',
    support: 'Support',
    deletion: 'Konto löschen',
    contact: 'Kontakt',
    odbl: 'Produktdaten teilweise aus Open Food Facts, ODbL.',
  },
} as const satisfies Dictionary;
