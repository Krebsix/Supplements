/**
 * Englisches Woerterbuch. Uebersetzung von de.ts mit derselben Disziplin
 * wie die EN-Fachtexte der App (tests/substances-en.test.mjs): keine
 * Heilversprechen, keine Gedankenstriche, "works without an account".
 */
import type { Dictionary } from './types.ts';

export const en = {
  meta: {
    title: 'MySuplea: the supplement tracker that sells nothing',
    description:
      'Intake plan, daily totals against upper limits, sources quoted verbatim. Works without an account, data encrypted on your device. iPhone beta.',
    ogHeadline: 'The supplement app that has nothing to sell you.',
    ogAlt: 'MySuplea app icon next to the line: The supplement app that has nothing to sell you.',
  },
  header: {
    switchLabel: 'Deutsch',
    switchAria: 'Zur deutschen Version wechseln',
    skipLink: 'Skip to content',
    nav: {
      data: 'Your data',
      pricing: 'Pricing',
      faq: 'Questions',
      beta: 'Beta',
    },
  },
  hero: {
    eyebrow: 'iPhone beta, Android to follow',
    headline: 'The supplement app that has nothing to sell you.',
    subline:
      'MySuplea organises what you take, adds up daily totals against published upper limits and quotes every source verbatim. Your data stays on your device.',
    note: 'Works without an account. No ads, no shop, ever.',
  },
  mockup: {
    aria: 'Rebuilt app screen: daily totals with upper limits and the morning intake plan',
    screenTitle: 'Today',
    screenDate: 'Tuesday, 15 Sept',
    sumsTitle: 'Daily totals',
    sumsSub: 'Added up across all 6 products',
    limitLabel: 'Upper limit',
    rows: [
      { name: 'Magnesium', amount: '400 mg', limit: '250 mg', tone: 'caution' },
      { name: 'Vitamin D', amount: '20 µg', limit: '100 µg', tone: 'affirm' },
      { name: 'Zinc', amount: '10 mg', limit: '25 mg', tone: 'affirm' },
    ],
    slotTitle: 'Morning',
    slotTime: '07:00 to 09:00',
    slotItems: [
      { name: 'Vitamin D3', dose: '20 µg, with breakfast', done: true },
      { name: 'Omega-3', dose: '1,000 mg, with a meal', done: false },
    ],
    doneLabel: 'Done',
    openLabel: 'Open',
    tabs: ['Today', 'Discover', 'Scan', 'More'],
  },
  tricks: {
    eyebrow: 'The market',
    title: 'The supplement market runs on three tricks.',
    items: [
      {
        title: 'Sales pressure',
        body: 'The "suggestion" inside the tracker is a commission. Whoever suggests magnesium earns on the click.',
      },
      {
        title: 'Health claims in grey',
        body: '"May support", star ratings, a quiz that diagnoses a deficiency. Untenable on the facts, risky in law.',
      },
      {
        title: 'Data harvesting',
        body: 'Complaints, lab values and medication end up on servers whose business model nobody knows.',
      },
    ],
    closing: 'MySuplea does none of these. That is not a promise, it is built into the product where you can check it.',
  },
  pillars: {
    eyebrow: 'The stance',
    title: 'What MySuplea does instead.',
    items: [
      {
        icon: 'bar-chart',
        title: 'Upper limits instead of suggestions',
        body: '"Contains 400 mg, the upper limit is 250 mg." The app shows the reference value. It never says "take X".',
      },
      {
        icon: 'layers',
        title: 'Daily totals across everything you take',
        body: 'Three unremarkable products can break the upper limit together. MySuplea adds up substances across your whole stack, not per bottle.',
      },
      {
        icon: 'book-open',
        title: 'Quotes instead of model knowledge',
        body: 'Notes on medication are verbatim quotes from EFSA, BfR, HMPC and NIH. An automated test breaks the build when a quote no longer appears word for word in its source.',
      },
      {
        icon: 'search',
        title: 'Complaints never turn into a sales pitch',
        body: 'Type "tired" and you first get context, then sleep, stress and medication as the most common areas. Nutrients sit at the very bottom, collapsed.',
      },
    ],
  },
  data: {
    eyebrow: 'Your data',
    title: 'Works without an account. Encrypted on your device.',
    paragraphs: [
      'Everything you enter stays on your phone, AES-256 encrypted. Backup as a file, complete deletion with one tap.',
      'An account is optional. If you create one, you will later get sync across devices. The key for that is generated on your device, and nobody can read anything from the stored data alone, including us.',
      'Only the optional photo analysis sends label photos for processing, after explicit consent, and does not keep them.',
    ],
    facts: ['AES-256 on the device', 'Backup as a file', 'Delete with one tap'],
  },
  report: {
    eyebrow: 'For the consultation',
    title: 'A report to take along.',
    body: 'Products, doses, daily totals, lab values over time: an overview for your doctor or pharmacist, sections selectable. The assessment belongs there, not in an app.',
    sections: ['Products and doses', 'Daily totals', 'Lab values over time', 'Medication references with source'],
  },
  notList: {
    eyebrow: 'Clear limits',
    title: 'What the app does not do.',
    items: [
      'It does not suggest products or dosages.',
      'It does not rate brands and links no shops.',
      'It does not diagnose and does not replace medical advice.',
      'It shows no ads and sells no data.',
    ],
  },
  pricing: {
    eyebrow: 'Pricing',
    title: 'Free. Pro pays for the AI analysis.',
    free: {
      title: 'Free, forever',
      items: [
        'Barcode scan without limit',
        'Three AI photo scans',
        'Up to five products',
        'Report for the consultation',
        'Backup and deletion',
      ],
    },
    pro: {
      title: 'Pro, optional subscription',
      items: [
        'Unlimited AI scans (fair use)',
        'Unlimited stack',
        'Outcome tracking with confounders',
        'Cost analysis',
        'Lab values over time',
        'Intake cycles',
      ],
    },
    why: {
      title: 'Why charge at all',
      body: 'Every photo analysis costs us around 25 cents in AI fees. The subscription pays for that and for maintaining the substance database. No affiliate links, no ads, no brand partnerships. If you prefer not to subscribe, scan packs are available individually. Prices follow with the store launch.',
    },
  },
  faq: {
    eyebrow: 'Questions',
    title: 'What people ask us.',
    items: [
      {
        q: 'How does the app make money if it sells nothing?',
        a: 'Through the Pro subscription. It funds the AI analysis of scans and the upkeep of the database. Both are real running costs.',
      },
      {
        q: 'Why does the app not tell me what to take?',
        a: 'Because it can neither assess your findings nor your medication history, and it is not allowed to. It organises and documents. The assessment belongs to your doctor or pharmacist, and that is what the report is for.',
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
    eyebrow: 'Beta',
    title: 'The beta starts on iPhone.',
    body: 'Sign up. As soon as it begins, the TestFlight invitation arrives by email. One email, not a series.',
    label: 'Email address',
    placeholder: 'you@example.com',
    cta: 'Join the beta',
    consent:
      'We use the address only for the beta invitation, stored in the EU. Remove yourself any time by emailing us. Details in the privacy policy.',
    pending: 'Sign-up opens shortly. Until then you can reach us by email.',
    sending: 'Sending',
    success: 'Signed up. The invitation arrives by email as soon as the beta starts.',
    error: 'That did not work. Please try again in a moment or send us an email.',
    noscript: 'The form needs JavaScript to sign you up. Send us an email instead.',
  },
  footer: {
    madeBy: 'MySuplea is a product of indoo home LLC.',
    privacy: 'Privacy',
    imprint: 'Imprint',
    terms: 'Terms of use',
    contact: 'Contact',
    odbl: 'Some product data from Open Food Facts, licensed under ODbL.',
  },
} as const satisfies Dictionary;
