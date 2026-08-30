/**
 * Englisches Woerterbuch. Uebersetzung von de.ts mit derselben Disziplin
 * wie die EN-Fachtexte der App: keine Heilversprechen, keine
 * Gedankenstriche, "works without an account".
 */
import type { Dictionary } from './types.ts';

export const en = {
  meta: {
    title: 'MySuplea: the supplement tracker that sells nothing',
    description:
      'Intake plan, daily totals against upper limits, sources quoted verbatim. Works without an account, data encrypted on your device. iPhone beta.',
    ogHeadline: 'Supplements under control. Backed, not claimed.',
    ogAlt: 'MySuplea app icon next to the line: Supplements under control, backed not claimed.',
  },
  header: {
    tagline: 'Sources cited · Data local',
    skipLink: 'Skip to content',
    switchLabel: 'Deutsch',
    switchAria: 'Zur deutschen Version wechseln',
    nav: {
      data: 'Data',
      pricing: 'Pricing',
      faq: 'Questions',
      beta: 'Beta →',
    },
  },
  hero: {
    badge: 'iPhone beta, Android to follow',
    headlinePlain: 'Supplements under control.',
    headlineHighlight: 'Backed, not claimed.',
    subline:
      'MySuplea organises what you take, adds up daily totals against published upper limits and quotes every source verbatim. Your data stays on your device.',
    storeSoon: 'Coming to the',
    storeApple: 'App Store',
    storeGoogle: 'Google Play',
  },
  mockup: {
    aria: 'Rebuilt app screen: daily totals with upper-limit bars and two morning entries',
    date: 'Tuesday, 15 Sept',
    title: 'Today',
    sumsTitle: 'Daily totals',
    sumsSub: 'across 6 products',
    limitLabel: 'Upper limit',
    rows: [
      { name: 'Magnesium', amount: '400 mg', limit: '250 mg', pct: 100, tone: 'caution' },
      { name: 'Vitamin D', amount: '20 µg', limit: '100 µg', pct: 20, tone: 'affirm' },
      { name: 'Zinc', amount: '10 mg', limit: '25 mg', pct: 40, tone: 'affirm' },
    ],
    item1Name: 'Vitamin D3',
    item1Dose: '20 µg, with breakfast',
    item1State: 'Logged',
    item2Name: 'Omega-3',
    item2Dose: '1,000 mg, with a meal',
    item2State: 'Open',
  },
  stamp: {
    ring: 'SOURCES CITED · DATA LOCAL · ',
    center: 'AES-256',
  },
  ticker: [
    'D-A-CH reference values',
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
    tag: 'Finding 01',
    context: 'The market',
    title: 'The supplement market runs on three tricks.',
    otherAppsLabel: 'Other apps',
    counterLabel: 'That is why MySuplea',
    items: [
      {
        number: '01',
        title: 'Sales pressure',
        text: 'The "suggestion" inside the tracker is a commission. Whoever suggests magnesium earns on the click.',
        counter:
          'MySuplea sells no products and recommends none. The app shows reference values and leaves the decision to you.',
      },
      {
        number: '02',
        title: 'Health claims in grey',
        text: '"May support", star ratings, a quiz that diagnoses a deficiency. Untenable on the facts, risky in law.',
        counter:
          'MySuplea claims nothing. Every note is a verbatim quote from EFSA, BfR, HMPC or NIH, with a visible source.',
      },
      {
        number: '03',
        title: 'Data harvesting',
        text: 'Complaints, lab values and routines end up on servers whose business model nobody knows.',
        counter:
          'With MySuplea your data stays AES-256 encrypted on your device. Delete it any time, with one tap.',
      },
    ],
    closingPlain: 'That is why MySuplea exists: organising instead of selling.',
    closingHighlight: 'Every one of these points is built into the product where you can check it.',
  },
  stance: {
    tag: 'Principle 02',
    context: 'The stance',
    title: 'What MySuplea does instead.',
    items: [
      {
        tag: 'REF 01',
        title: 'Upper limits instead of suggestions',
        text: '"Contains 400 mg, the upper limit is 250 mg." The app shows the reference value. It never says "take X".',
      },
      {
        tag: 'SUM 02',
        title: 'Daily totals across everything you take',
        text: 'Three unremarkable products can break the upper limit together. MySuplea adds up substances across your whole stack, not per bottle.',
      },
      {
        tag: 'CIT 03',
        title: 'Quotes instead of model knowledge',
        text: 'Notes on substances are verbatim quotes from EFSA, BfR, HMPC and NIH. An automated test breaks the build when a quote no longer appears word for word in its source.',
      },
      {
        tag: 'TRI 04',
        title: 'Complaints never turn into a sales pitch',
        text: 'Type "tired" and you first get context, then sleep, stress and daily life as the most common areas. Nutrients sit at the very bottom, collapsed.',
      },
    ],
    quote: '"Contains 400 mg, the upper limit is 250 mg. The app shows the reference value. It never says "take X".',
    quoteCaption: 'How MySuplea talks · every note names its source verbatim',
  },
  data: {
    tag: 'Protocol 03',
    context: 'Your data',
    title: 'Your routine, your values, your device.',
    paragraphs: [
      'Everything you enter stays on your phone, AES-256 encrypted. Backup as a file, complete deletion with one tap.',
      'An account is optional. If you create one, you will later get sync across devices. The key for that is generated on your device. Nobody can read anything from the stored data alone, including us.',
      'Only the optional photo analysis sends label photos for processing, after explicit consent, and does not keep them.',
    ],
    facts: [
      { key: 'Encryption', value: 'AES-256 on the device' },
      { key: 'Key', value: 'iOS Keychain / Android Keystore' },
      { key: 'Backup', value: 'As a file, portable' },
      { key: 'Deletion', value: 'Complete, one tap' },
    ],
    reportTag: 'For the consultation',
    reportTitle: 'A report to take along.',
    reportBody: 'An overview for your doctor or pharmacist, sections selectable. The assessment belongs there, not in an app.',
    reportItems: ['Products and doses', 'Daily totals', 'Lab values over time', 'Substance notes with source'],
    limitsTag: 'Clear limits',
    limitsTitle: 'What the app does not do.',
    limitsItems: [
      'It does not suggest products or dosages.',
      'It does not rate brands and links no shops.',
      'It does not diagnose and does not replace medical advice.',
    ],
  },
  pricing: {
    tag: 'Model 04',
    context: 'Pricing',
    title: 'Free. Pro pays for the AI analysis.',
    freeTag: 'Tier A',
    freeTitle: 'Free, forever',
    freeItems: ['Barcode scan without limit', 'Three AI photo scans', 'Up to five products', 'Report for the consultation', 'Backup and deletion'],
    proTag: 'Tier B · Optional',
    proTitle: 'Pro, optional subscription',
    proItems: [
      'Unlimited AI scans (fair use)',
      'Unlimited stack',
      'Outcome tracking with confounders',
      'Cost analysis',
      'Lab values over time',
      'Intake cycles',
    ],
    whyTag: 'Transparency',
    whyTitle: 'Why charge at all',
    whyBody:
      'Every photo analysis costs us around 25 cents in AI fees. The subscription pays for that and for maintaining the substance database. No affiliate links, no brand partnerships. If you prefer not to subscribe, scan packs are available individually. Prices follow with the store launch.',
  },
  faq: {
    tag: 'Appendix 05',
    context: 'Questions',
    title: 'What people ask us.',
    items: [
      {
        q: 'How does the app make money?',
        a: 'Through the Pro subscription. It funds the AI analysis of scans and the upkeep of the database. Both are real running costs.',
      },
      {
        q: 'Why does the app not tell me what to take?',
        a: 'Because it cannot assess your health situation, and it is not allowed to. It organises and documents. The assessment belongs to your doctor or pharmacist, and that is what the report is for.',
      },
      {
        q: 'Do I need an account?',
        a: 'No. The app works entirely without one. An account is the basis for sync across devices, which we are building now.',
      },
      {
        q: 'Where do the reference values come from?',
        a: 'From published sources: D-A-CH reference values, EFSA, BfR, HMPC, NIH. Every note names its source verbatim.',
      },
      {
        q: 'Who is the app not for?',
        a: 'Nobody under 16, and nobody looking for a diagnosis. MySuplea does not replace medical advice.',
      },
    ],
  },
  form: {
    label: 'Email address',
    placeholder: 'Email address',
    cta: 'Join',
    ctaDone: 'Joined ✓',
    consentPrefix: 'Only for the beta invitation, stored in the EU. Remove yourself any time.',
    consentLink: 'Privacy policy',
    pending: 'Sign-up opens shortly. Until then you can reach us by email.',
    error: 'That did not work. Please try again in a moment or send us an email.',
  },
  beta: {
    title: 'The beta starts on iPhone.',
    body: 'Sign up. As soon as it begins, the TestFlight invitation arrives by email. One email, not a series.',
  },
  footer: {
    madeBy: 'MySuplea is a product of indoo home LLC.',
    privacy: 'Privacy',
    imprint: 'Imprint',
    terms: 'Terms of use',
    support: 'Support',
    deletion: 'Delete account',
    contact: 'Contact',
    odbl: 'Some product data from Open Food Facts, ODbL.',
  },
} as const satisfies Dictionary;
