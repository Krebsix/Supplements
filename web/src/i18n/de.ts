/**
 * Deutsches Woerterbuch. Quelle der Texte: launch/landingpage.md (Stand
 * 2026-08-29), Positionierung aus launch/story.md.
 *
 * Regeln (tests/i18n.test.mjs erzwingt sie): keine Gedankenstriche, keine
 * Heilversprechen, keine Preiszahlen, "ohne Konto nutzbar" statt "kein
 * Konto", echte Umlaute.
 */
import type { Dictionary } from './types.ts';

export const de = {
  meta: {
    title: 'MySuplea: Supplement-Tracker ohne Verkaufsinteresse',
    description:
      'Einnahmeplan, Tagessummen gegen Obergrenzen, wörtlich zitierte Quellen. Ohne Konto nutzbar, Daten verschlüsselt auf deinem Gerät. Beta für iPhone.',
    ogHeadline: 'Die Supplement-App, die dir nichts verkaufen will.',
    ogAlt: 'MySuplea App-Icon neben der Zeile: Die Supplement-App, die dir nichts verkaufen will.',
  },
  header: {
    switchLabel: 'English',
    switchAria: 'Switch to the English version',
    skipLink: 'Zum Inhalt springen',
    nav: {
      data: 'Deine Daten',
      pricing: 'Preis',
      faq: 'Fragen',
      beta: 'Beta',
    },
  },
  hero: {
    eyebrow: 'Beta für iPhone, Android folgt',
    headline: 'Die Supplement-App, die dir nichts verkaufen will.',
    subline:
      'MySuplea ordnet ein, was du nimmst, rechnet Tagessummen gegen veröffentlichte Obergrenzen und zitiert jede Quelle wörtlich. Deine Daten bleiben auf deinem Gerät.',
    note: 'Ohne Konto nutzbar. Keine Werbung, kein Shop, nie.',
  },
  mockup: {
    aria: 'Nachgebauter App-Bildschirm: Tagessummen mit Obergrenzen und der Tagesplan für den Morgen',
    screenTitle: 'Heute',
    screenDate: 'Dienstag, 15. Sept.',
    sumsTitle: 'Tagessummen',
    sumsSub: 'Über alle 6 Präparate addiert',
    limitLabel: 'Obergrenze',
    rows: [
      { name: 'Magnesium', amount: '400 mg', limit: '250 mg', tone: 'caution' },
      { name: 'Vitamin D', amount: '20 µg', limit: '100 µg', tone: 'affirm' },
      { name: 'Zink', amount: '10 mg', limit: '25 mg', tone: 'affirm' },
    ],
    slotTitle: 'Morgen',
    slotTime: '07:00 bis 09:00',
    slotItems: [
      { name: 'Vitamin D3', dose: '20 µg, zum Frühstück', done: true },
      { name: 'Omega-3', dose: '1.000 mg, zur Mahlzeit', done: false },
    ],
    doneLabel: 'Erledigt',
    openLabel: 'Offen',
    tabs: ['Heute', 'Entdecken', 'Scan', 'Mehr'],
  },
  tricks: {
    eyebrow: 'Der Markt',
    title: 'Der Supplement-Markt lebt von drei Tricks.',
    items: [
      {
        title: 'Verkaufsdruck',
        body: 'Die „Empfehlung" im Tracker ist eine Provision. Wer dir Magnesium vorschlägt, verdient am Klick.',
      },
      {
        title: 'Heilversprechen in Grau',
        body: '„Könnte helfen bei", Sternchen, ein Quiz, das dir einen Mangel diagnostiziert. Fachlich unhaltbar, rechtlich heikel.',
      },
      {
        title: 'Datensammeln',
        body: 'Beschwerden, Laborwerte, Medikamente landen auf Servern, deren Geschäftsmodell niemand kennt.',
      },
    ],
    closing: 'MySuplea macht keinen davon. Das ist kein Versprechen, das ist im Produkt nachprüfbar gebaut.',
  },
  pillars: {
    eyebrow: 'Die Haltung',
    title: 'Was MySuplea stattdessen macht.',
    items: [
      {
        icon: 'bar-chart',
        title: 'Obergrenzen statt Empfehlungen',
        body: '„Enthält 400 mg, die Obergrenze liegt bei 250 mg." Die App zeigt den Referenzwert. Sie sagt nie „nimm X".',
      },
      {
        icon: 'layers',
        title: 'Tagessummen über alles, was du nimmst',
        body: 'Drei unauffällige Präparate können zusammen die Obergrenze reißen. MySuplea addiert Wirkstoffe über deinen ganzen Bestand, nicht pro Dose.',
      },
      {
        icon: 'book-open',
        title: 'Zitate statt Modellwissen',
        body: 'Hinweise zu Medikamenten sind wörtliche Zitate aus EFSA, BfR, HMPC und NIH. Ein automatischer Test bricht den Build, wenn ein Zitat nicht mehr wörtlich in der Quelle steht.',
      },
      {
        icon: 'search',
        title: 'Beschwerden werden nicht zur Kaufberatung',
        body: 'Wer „müde" eingibt, bekommt zuerst die Einordnung, dann Schlaf, Stress und Medikamente als häufigste Ursachenbereiche. Nährstoffe stehen ganz unten, eingeklappt.',
      },
    ],
  },
  data: {
    eyebrow: 'Deine Daten',
    title: 'Ohne Konto nutzbar. Verschlüsselt auf deinem Gerät.',
    paragraphs: [
      'Alles, was du eingibst, bleibt auf dem Handy, AES-256-verschlüsselt. Backup als Datei, komplettes Löschen mit einem Tippen.',
      'Ein Konto ist freiwillig. Wer eines anlegt, bekommt später Sync auf mehrere Geräte. Der Schlüssel dafür entsteht auf dem Gerät, und aus den gespeicherten Daten allein kann niemand etwas lesen, auch wir nicht.',
      'Nur die freiwillige Foto-Analyse schickt Etikettenfotos zur Auswertung, nach ausdrücklicher Zustimmung, und speichert sie nicht.',
    ],
    facts: ['AES-256 auf dem Gerät', 'Backup als Datei', 'Löschen mit einem Tippen'],
  },
  report: {
    eyebrow: 'Für die Sprechstunde',
    title: 'Ein Bericht zum Mitnehmen.',
    body: 'Präparate, Dosen, Tagessummen, Laborwerte im Verlauf: als Übersicht für Praxis oder Apotheke, Abschnitte wählbar. Die Bewertung gehört dorthin, nicht in eine App.',
    sections: ['Präparate und Dosen', 'Tagessummen', 'Laborwerte im Verlauf', 'Medikamentenbezüge mit Quelle'],
  },
  notList: {
    eyebrow: 'Klare Grenzen',
    title: 'Was die App nicht tut.',
    items: [
      'Sie empfiehlt keine Produkte und keine Dosierungen.',
      'Sie bewertet keine Marken und verlinkt keine Shops.',
      'Sie stellt keine Diagnosen und ersetzt keine ärztliche Beratung.',
      'Sie zeigt keine Werbung und verkauft keine Daten.',
    ],
  },
  pricing: {
    eyebrow: 'Preis',
    title: 'Kostenlos. Pro finanziert die KI-Auswertung.',
    free: {
      title: 'Kostenlos, für immer',
      items: [
        'Barcode-Scan ohne Limit',
        'Drei KI-Foto-Scans',
        'Bis zu fünf Präparate',
        'Bericht für die Sprechstunde',
        'Backup und Löschen',
      ],
    },
    pro: {
      title: 'Pro, optionales Abo',
      items: [
        'Unbegrenzte KI-Scans (Fair Use)',
        'Unbegrenzter Bestand',
        'Wirkungskontrolle mit Störfaktoren',
        'Kostenanalyse',
        'Laborwerte-Verlauf',
        'Kur-Zyklen',
      ],
    },
    why: {
      title: 'Warum überhaupt Geld',
      body: 'Jede Foto-Auswertung kostet uns rund 25 Cent bei der KI. Das Abo bezahlt das und die Pflege der Wirkstoff-Datenbank. Kein Affiliate, keine Werbung, keine Markenkooperation. Wer nicht abonnieren will, kauft Scan-Pakete einzeln. Preise nennen wir mit dem Store-Start.',
    },
  },
  faq: {
    eyebrow: 'Fragen',
    title: 'Was Leute uns fragen.',
    items: [
      {
        q: 'Wovon lebt die App, wenn sie nichts verkauft?',
        a: 'Vom Pro-Abo. Das finanziert die KI-Auswertung der Scans und die Pflege der Datenbank. Beides sind echte laufende Kosten.',
      },
      {
        q: 'Warum sagt die App nicht, was ich nehmen soll?',
        a: 'Weil sie weder Befund noch Medikationshistorie beurteilen kann und darf. Sie ordnet ein und dokumentiert. Die Bewertung gehört in die Praxis oder Apotheke, dafür gibt es den Bericht.',
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
    eyebrow: 'Beta',
    title: 'Die Beta startet auf iPhone.',
    body: 'Trag dich ein, wir schicken dir den TestFlight-Link, wenn es losgeht. Eine Mail, keine Serie.',
    label: 'E-Mail-Adresse',
    placeholder: 'du@beispiel.de',
    cta: 'Für die Beta eintragen',
    consent:
      'Du bekommst eine Bestätigungsmail. Erst nach dem Klick darin bist du eingetragen. Abmelden jederzeit mit einem Klick. Details in der Datenschutzerklärung.',
    pending: 'Die Anmeldung öffnet in Kürze. Bis dahin erreichst du uns per Mail.',
    sending: 'Wird gesendet',
    success: 'Fast geschafft. Bitte bestätige den Link in der Mail, die gerade unterwegs ist.',
    error: 'Das hat nicht geklappt. Bitte versuch es gleich noch einmal oder schreib uns eine Mail.',
    noscript: 'Für die Anmeldung braucht das Formular JavaScript. Schreib uns stattdessen eine Mail.',
  },
  footer: {
    madeBy: 'MySuplea ist ein Produkt von indoo home LLC.',
    privacy: 'Datenschutz',
    imprint: 'Impressum',
    terms: 'Nutzungsbedingungen',
    contact: 'Kontakt',
    odbl: 'Produktdaten teilweise aus Open Food Facts, Lizenz ODbL.',
  },
} as const satisfies Dictionary;
