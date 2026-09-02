/**
 * data/lifeStageAdvisories.js
 * ─────────────────────────────────────────────────────────────
 * Hinweise, die nur fuer bestimmte Lebensphasen gelten.
 *
 * Der Mengenabgleich aus ReferenceCheck.js beantwortet "wie viel".
 * Diese Datei beantwortet "was gilt in dieser Lebensphase besonders" —
 * etwa dass Retinol in der Schwangerschaft kritisch ist oder dass
 * Ashwagandha kein Wirkstoff fuer Kinder ist.
 *
 * FORMULIERUNGSREGEL (wie ueberall in dieser App):
 * Deskriptiv, nicht praeskriptiv. "Gilt als kontraindiziert" oder
 * "wird ueblicherweise aerztlich begleitet" — nicht "nimm das nicht".
 * Die App gibt Fakten wieder, sie verordnet nicht.
 *
 * Severity:
 *   contraindicated  In dieser Lebensphase allgemein nicht vorgesehen
 *   medical          Gehoert in aerztliche Begleitung
 *   attention        Besonderheit, die man kennen sollte
 *   increased        Erhoehter Bedarf in dieser Phase
 */

export const ADVISORY_SEVERITY = {
  CONTRAINDICATED: 'contraindicated',
  MEDICAL: 'medical',
  ATTENTION: 'attention',
  INCREASED: 'increased',
};

export const SEVERITY_META = {
  [ADVISORY_SEVERITY.CONTRAINDICATED]: {
    label: 'Nicht vorgesehen',
    rank: 4,
  },
  [ADVISORY_SEVERITY.MEDICAL]: {
    label: 'Ärztlich abklären',
    rank: 3,
  },
  [ADVISORY_SEVERITY.ATTENTION]: {
    label: 'Besonderheit',
    rank: 2,
  },
  [ADVISORY_SEVERITY.INCREASED]: {
    label: 'Erhöhter Bedarf',
    rank: 1,
  },
};

/**
 * advisories[substanceId] = [{ lifeStages: [...], severity, text }]
 * lifeStages: 'all' oder eine Liste von Lebensphasen-IDs.
 */
export const advisories = {
  // ── HMPC-Durchgang 2026-09-02 (Baustein 5): Lebensphasen-Aussagen aus
  // den belegten cautionNotes der Kraeuter (EMA/HMPC-Monographien, Quellen
  // an der Substanz) als strukturierte Advisories, damit der Profil-Check
  // sie der richtigen Lebensphase zeigt. Keine neuen Behauptungen.
  ginger: [
    {
      lifeStages: ['pregnancy'],
      severity: ADVISORY_SEVERITY.MEDICAL,
      text: 'Die Sicherheit hoher Ingwer-Dosen in der Schwangerschaft ist nicht abschließend geklärt; die Anwendung bei Schwangerschaftsübelkeit gehört in ärztliche Begleitung.',
    },
  ],
  clove: [
    {
      lifeStages: ['child-4-10', 'teen-11-17'],
      severity: ADVISORY_SEVERITY.CONTRAINDICATED,
      text: 'Das ätherische Nelkenöl ist nicht für Kinder vorgesehen.',
    },
    {
      lifeStages: ['pregnancy', 'breastfeeding'],
      severity: ADVISORY_SEVERITY.CONTRAINDICATED,
      text: 'Für Schwangerschaft und Stillzeit fehlen Daten jenseits der Gewürzmenge; eine hochdosierte Anwendung ist nicht vorgesehen.',
    },
  ],
  chamomile: [
    {
      lifeStages: ['pregnancy', 'breastfeeding'],
      severity: ADVISORY_SEVERITY.CONTRAINDICATED,
      text: 'Für hochkonzentrierte Kamillen-Zubereitungen fehlen in Schwangerschaft und Stillzeit ausreichende Daten.',
    },
  ],
  'lemon-balm': [
    {
      lifeStages: ['pregnancy', 'breastfeeding'],
      severity: ADVISORY_SEVERITY.CONTRAINDICATED,
      text: 'Keine ausreichenden Daten für Schwangerschaft und Stillzeit.',
    },
    {
      lifeStages: ['child-4-10'],
      severity: ADVISORY_SEVERITY.CONTRAINDICATED,
      text: 'Keine ausreichenden Daten für Kinder unter 12 Jahren.',
    },
  ],
  hawthorn: [
    {
      lifeStages: ['pregnancy', 'breastfeeding'],
      severity: ADVISORY_SEVERITY.CONTRAINDICATED,
      text: 'Für Schwangerschaft und Stillzeit fehlen ausreichende Daten.',
    },
  ],
  elderflower: [
    {
      lifeStages: ['pregnancy', 'breastfeeding'],
      severity: ADVISORY_SEVERITY.CONTRAINDICATED,
      text: 'Für Schwangerschaft und Stillzeit fehlen ausreichende Daten.',
    },
  ],
  'licorice-root': [
    {
      lifeStages: ['pregnancy'],
      severity: ADVISORY_SEVERITY.CONTRAINDICATED,
      text: 'Süßholzwurzel ist in der Schwangerschaft nicht vorgesehen (Glycyrrhizin).',
    },
  ],
  'lavender-oil': [
    {
      lifeStages: ['pregnancy', 'breastfeeding'],
      severity: ADVISORY_SEVERITY.CONTRAINDICATED,
      text: 'Keine ausreichenden Daten für Schwangerschaft und Stillzeit.',
    },
    {
      lifeStages: ['child-4-10'],
      severity: ADVISORY_SEVERITY.CONTRAINDICATED,
      text: 'Keine ausreichenden Daten für Kinder unter 12 Jahren.',
    },
  ],
  yarrow: [
    {
      lifeStages: ['pregnancy', 'breastfeeding'],
      severity: ADVISORY_SEVERITY.CONTRAINDICATED,
      text: 'Für Schwangerschaft und Stillzeit fehlen ausreichende Daten.',
    },
  ],
  hops: [
    {
      lifeStages: ['pregnancy', 'breastfeeding'],
      severity: ADVISORY_SEVERITY.CONTRAINDICATED,
      text: 'Keine ausreichenden Daten für Schwangerschaft und Stillzeit.',
    },
    {
      lifeStages: ['child-4-10'],
      severity: ADVISORY_SEVERITY.CONTRAINDICATED,
      text: 'Keine ausreichenden Daten für Kinder unter 12 Jahren.',
    },
  ],
  rosemary: [
    {
      lifeStages: ['pregnancy', 'breastfeeding'],
      severity: ADVISORY_SEVERITY.CONTRAINDICATED,
      text: 'Für arzneiliche Rosmarin-Dosierungen fehlen in Schwangerschaft und Stillzeit ausreichende Daten; Gewürzmengen sind davon nicht betroffen.',
    },
  ],
  feverfew: [
    {
      lifeStages: ['pregnancy', 'breastfeeding'],
      severity: ADVISORY_SEVERITY.CONTRAINDICATED,
      text: 'Mutterkraut ist in Schwangerschaft und Stillzeit nicht vorgesehen.',
    },
  ],
  'uva-ursi': [
    {
      lifeStages: ['child-4-10', 'teen-11-17'],
      severity: ADVISORY_SEVERITY.CONTRAINDICATED,
      text: 'Bärentraube ist nicht für Kinder vorgesehen.',
    },
    {
      lifeStages: ['pregnancy', 'breastfeeding'],
      severity: ADVISORY_SEVERITY.CONTRAINDICATED,
      text: 'Bärentraube ist in Schwangerschaft und Stillzeit nicht vorgesehen.',
    },
  ],
  'willow-bark': [
    {
      lifeStages: ['pregnancy'],
      severity: ADVISORY_SEVERITY.CONTRAINDICATED,
      text: 'Weidenrinde ist im letzten Schwangerschaftsdrittel nicht vorgesehen (Salicylate).',
    },
    {
      lifeStages: ['child-4-10', 'teen-11-17'],
      severity: ADVISORY_SEVERITY.MEDICAL,
      text: 'Nicht für Kinder und Jugendliche mit fieberhaften Infekten (Salicylate); die Anwendung gehört in ärztliche Abklärung.',
    },
  ],
  mullein: [
    {
      lifeStages: ['pregnancy', 'breastfeeding'],
      severity: ADVISORY_SEVERITY.CONTRAINDICATED,
      text: 'Für Schwangerschaft und Stillzeit fehlen ausreichende Daten.',
    },
  ],
  motherwort: [
    {
      lifeStages: ['pregnancy', 'breastfeeding'],
      severity: ADVISORY_SEVERITY.CONTRAINDICATED,
      text: 'Herzgespann ist in Schwangerschaft und Stillzeit nicht vorgesehen.',
    },
    {
      lifeStages: ['child-4-10'],
      severity: ADVISORY_SEVERITY.CONTRAINDICATED,
      text: 'Für Kinder unter 12 Jahren fehlen Daten.',
    },
  ],
  meadowsweet: [
    {
      lifeStages: ['pregnancy', 'breastfeeding'],
      severity: ADVISORY_SEVERITY.CONTRAINDICATED,
      text: 'Für Schwangerschaft und Stillzeit fehlen ausreichende Daten (Salicylate).',
    },
    {
      lifeStages: ['child-4-10', 'teen-11-17'],
      severity: ADVISORY_SEVERITY.MEDICAL,
      text: 'Nicht für Kinder und Jugendliche mit fieberhaften Infekten (Salicylate).',
    },
  ],
  'horse-chestnut': [
    {
      lifeStages: ['pregnancy', 'breastfeeding'],
      severity: ADVISORY_SEVERITY.MEDICAL,
      text: 'Die Anwendung in Schwangerschaft und Stillzeit gehört in ärztliche Abklärung.',
    },
  ],
  wormwood: [
    {
      lifeStages: ['pregnancy', 'breastfeeding'],
      severity: ADVISORY_SEVERITY.CONTRAINDICATED,
      text: 'Wermut ist in Schwangerschaft und Stillzeit nicht vorgesehen (Thujon).',
    },
  ],
  'burdock-root': [
    {
      lifeStages: ['pregnancy', 'breastfeeding'],
      severity: ADVISORY_SEVERITY.CONTRAINDICATED,
      text: 'Für Schwangerschaft und Stillzeit fehlen ausreichende Daten.',
    },
  ],
  'lovage-root': [
    {
      lifeStages: ['pregnancy', 'breastfeeding'],
      severity: ADVISORY_SEVERITY.CONTRAINDICATED,
      text: 'Für Schwangerschaft und Stillzeit fehlen ausreichende Daten.',
    },
  ],
  'nettle-leaf': [
    {
      lifeStages: ['pregnancy', 'breastfeeding'],
      severity: ADVISORY_SEVERITY.CONTRAINDICATED,
      text: 'Für Schwangerschaft und Stillzeit fehlen ausreichende Daten.',
    },
  ],
  sage: [
    {
      lifeStages: ['pregnancy', 'breastfeeding'],
      severity: ADVISORY_SEVERITY.CONTRAINDICATED,
      text: 'Die EMA-Monographie sieht Salbei-Präparate in Schwangerschaft und Stillzeit nicht vor (Thujon). In der Stillzeit kommt hinzu: Salbei kann die Milchbildung reduzieren; dieser Effekt wird gezielt beim Abstillen genutzt.',
    },
  ],
  'peppermint-oil': [
    {
      lifeStages: ['breastfeeding'],
      severity: ADVISORY_SEVERITY.ATTENTION,
      text: 'Pfefferminze wird traditionell zum Abstillen verwendet; eine milchreduzierende Wirkung ist klinisch nicht belegt (LactMed). Größere Mengen gelten in der Stillzeit als Beobachtungspunkt.',
    },
  ],
  'vitamin-a': [
    {
      lifeStages: ['pregnancy'],
      severity: ADVISORY_SEVERITY.CONTRAINDICATED,
      text: 'Vorgeformtes Vitamin A (Retinol, Retinylacetat, Retinylpalmitat) gilt in der Schwangerschaft in höheren Mengen als fruchtschädigend. Präparate für die Schwangerschaft setzen stattdessen auf Beta-Carotin.',
    },
    {
      lifeStages: ['child-4-10', 'teen-11-17'],
      severity: ADVISORY_SEVERITY.MEDICAL,
      text: 'Die Obergrenze liegt bei Kindern deutlich niedriger als bei Erwachsenen. Eine Ergänzung wird üblicherweise ärztlich begleitet.',
    },
    {
      lifeStages: ['breastfeeding'],
      severity: ADVISORY_SEVERITY.INCREASED,
      text: 'In der Stillzeit ist der Bedarf deutlich erhöht, weil Vitamin A über die Muttermilch abgegeben wird.',
    },
  ],
  ashwagandha: [
    {
      lifeStages: ['pregnancy', 'breastfeeding'],
      severity: ADVISORY_SEVERITY.CONTRAINDICATED,
      text: 'Ashwagandha gilt in Schwangerschaft und Stillzeit als kontraindiziert; es liegen keine ausreichenden Sicherheitsdaten vor.',
    },
    {
      lifeStages: ['child-4-10', 'teen-11-17'],
      severity: ADVISORY_SEVERITY.CONTRAINDICATED,
      text: 'Für Kinder und Jugendliche gibt es keine etablierte Datenbasis. Adaptogene Pflanzenextrakte sind für diese Altersgruppen nicht vorgesehen.',
    },
    {
      lifeStages: ['senior', 'menopause'],
      severity: ADVISORY_SEVERITY.ATTENTION,
      text: 'Bei Schilddrüsenerkrankungen und bei Einnahme von Schilddrüsen- oder Beruhigungsmedikamenten ist eine ärztliche Abklärung üblich.',
    },
  ],
  iron: [
    {
      lifeStages: ['pregnancy'],
      severity: ADVISORY_SEVERITY.INCREASED,
      text: 'Der Bedarf ist in der Schwangerschaft etwa doppelt so hoch. Die Versorgung wird im Rahmen der Vorsorge über Blutwerte kontrolliert.',
    },
    {
      lifeStages: ['adult-man', 'menopause', 'senior'],
      severity: ADVISORY_SEVERITY.ATTENTION,
      text: 'Ohne nachgewiesenen Mangel ist eine Eisenergänzung in dieser Gruppe unüblich: überschüssiges Eisen wird gespeichert und nicht aktiv ausgeschieden.',
    },
    {
      lifeStages: ['adult-woman', 'teen-11-17'],
      severity: ADVISORY_SEVERITY.ATTENTION,
      text: 'Durch die Menstruation ist der Bedarf erhöht. Vor einer Ergänzung ist eine Bestimmung des Ferritinwerts üblich.',
    },
    {
      lifeStages: ['child-4-10'],
      severity: ADVISORY_SEVERITY.MEDICAL,
      text: 'Eisenpräparate für Kinder gehören in ärztliche Hand. Versehentliche Überdosierung ist bei Kindern ein relevantes Vergiftungsrisiko.',
    },
  ],
  iodine: [
    {
      lifeStages: ['pregnancy', 'breastfeeding'],
      severity: ADVISORY_SEVERITY.INCREASED,
      text: 'Deutlich erhöhter Bedarf für die kindliche Gehirn- und Schilddrüsenentwicklung. Eine Ergänzung ist in diesen Phasen üblich und wird ärztlich begleitet.',
    },
    {
      lifeStages: 'all',
      severity: ADVISORY_SEVERITY.ATTENTION,
      text: 'Bei bestehenden Schilddrüsenerkrankungen, insbesondere Schilddrüsenüberfunktion und Autonomie, ist die Jodzufuhr ärztlich abzuklären.',
    },
  ],
  folate: [
    {
      lifeStages: ['pregnancy'],
      severity: ADVISORY_SEVERITY.INCREASED,
      text: 'Wichtigste Phase überhaupt: Eine ausreichende Zufuhr ab dem Kinderwunsch und in den ersten Schwangerschaftswochen senkt das Risiko für Neuralrohrdefekte. Der Bedarf ist deutlich erhöht.',
    },
    {
      lifeStages: ['adult-woman'],
      severity: ADVISORY_SEVERITY.ATTENTION,
      text: 'Bei bestehendem Kinderwunsch wird eine Ergänzung bereits vor der Schwangerschaft begonnen, da sich das Neuralrohr sehr früh schließt.',
    },
  ],
  'vitamin-b12': [
    {
      lifeStages: ['senior'],
      severity: ADVISORY_SEVERITY.ATTENTION,
      text: 'Die Aufnahmefähigkeit im Magen nimmt mit dem Alter ab. Ein Mangel kann trotz ausreichender Zufuhr über die Nahrung entstehen.',
    },
    {
      lifeStages: ['pregnancy', 'breastfeeding'],
      severity: ADVISORY_SEVERITY.INCREASED,
      text: 'Erhöhter Bedarf. Bei veganer Ernährung ist eine Ergänzung in diesen Phasen besonders relevant.',
    },
  ],
  'vitamin-d3': [
    {
      lifeStages: ['menopause', 'senior'],
      severity: ADVISORY_SEVERITY.ATTENTION,
      text: 'Nach der Menopause und im höheren Alter gewinnt Vitamin D für den Knochenerhalt an Bedeutung, während die Eigenbildung in der Haut nachlässt.',
    },
    {
      lifeStages: ['child-4-10'],
      severity: ADVISORY_SEVERITY.MEDICAL,
      text: 'Die Obergrenze liegt bei Kindern bei 2000 IE pro Tag und damit deutlich unter der für Erwachsene. Hochdosierte Erwachsenenpräparate sind für Kinder nicht geeignet.',
    },
  ],
  calcium: [
    {
      lifeStages: ['menopause'],
      severity: ADVISORY_SEVERITY.ATTENTION,
      text: 'Nach der Menopause beschleunigt sich der Knochenabbau durch den sinkenden Östrogenspiegel. Calcium und Vitamin D werden in diesem Zusammenhang gemeinsam betrachtet.',
    },
    {
      lifeStages: ['teen-11-17'],
      severity: ADVISORY_SEVERITY.INCREASED,
      text: 'In der Wachstumsphase wird die maximale Knochendichte aufgebaut: der Bedarf ist in dieser Zeit am höchsten.',
    },
  ],
  'omega-3': [
    {
      lifeStages: ['pregnancy', 'breastfeeding'],
      severity: ADVISORY_SEVERITY.INCREASED,
      text: 'DHA ist Strukturbestandteil von kindlichem Gehirn und Netzhaut; der Bedarf ist in diesen Phasen erhöht.',
    },
    {
      lifeStages: 'all',
      severity: ADVISORY_SEVERITY.ATTENTION,
      text: 'Bei Einnahme von Gerinnungshemmern und vor geplanten Operationen ist die Dosierung ärztlich abzuklären.',
    },
  ],
  'vitamin-k2': [
    {
      lifeStages: 'all',
      severity: ADVISORY_SEVERITY.MEDICAL,
      text: 'Bei Einnahme von Vitamin-K-Antagonisten (Cumarine wie Marcumar/Warfarin) beeinflusst Vitamin K direkt die Wirkung des Medikaments. Nur nach ärztlicher Absprache.',
    },
  ],
  'l-tryptophan': [
    {
      lifeStages: 'all',
      severity: ADVISORY_SEVERITY.MEDICAL,
      text: 'Nicht mit serotonerg wirkenden Medikamenten (SSRI, SNRI, MAO-Hemmer) kombinieren: Risiko eines Serotonin-Syndroms.',
    },
    {
      lifeStages: ['child-4-10', 'teen-11-17', 'pregnancy', 'breastfeeding'],
      severity: ADVISORY_SEVERITY.CONTRAINDICATED,
      text: 'Für Kinder, Jugendliche sowie in Schwangerschaft und Stillzeit ist eine Ergänzung nicht vorgesehen.',
    },
  ],
  '5-htp': [
    {
      lifeStages: 'all',
      severity: ADVISORY_SEVERITY.MEDICAL,
      text: 'Nicht mit serotonerg wirkenden Medikamenten (SSRI, SNRI, MAO-Hemmer, Methylenblau) kombinieren: Risiko eines Serotonin-Syndroms.',
    },
    {
      lifeStages: ['child-4-10', 'teen-11-17', 'pregnancy', 'breastfeeding'],
      severity: ADVISORY_SEVERITY.CONTRAINDICATED,
      text: 'Für Kinder, Jugendliche sowie in Schwangerschaft und Stillzeit ist eine Ergänzung nicht vorgesehen.',
    },
  ],
  zinc: [
    {
      lifeStages: ['child-4-10'],
      severity: ADVISORY_SEVERITY.ATTENTION,
      text: 'Die Obergrenze liegt bei Kindern dieser Altersgruppe bei 10 mg pro Tag: viele Erwachsenenpräparate überschreiten das mit einer einzigen Kapsel.',
    },
    {
      lifeStages: ['breastfeeding'],
      severity: ADVISORY_SEVERITY.INCREASED,
      text: 'In der Stillzeit ist der Bedarf erhöht.',
    },
  ],
  selenium: [
    {
      lifeStages: ['child-4-10'],
      severity: ADVISORY_SEVERITY.ATTENTION,
      text: 'Die Obergrenze liegt bei Kindern bei 130 µg pro Tag. Bei Selen liegen Bedarf und Obergrenze generell nah beieinander.',
    },
  ],
  'vitamin-b6': [
    {
      lifeStages: 'all',
      severity: ADVISORY_SEVERITY.ATTENTION,
      text: 'Die EFSA hat die Obergrenze 2023 auf 12 mg pro Tag gesenkt. Dauerhaft höhere Zufuhr kann Nervenschäden verursachen, viele B-Komplex-Präparate liegen darüber.',
    },
    {
      lifeStages: ['child-4-10'],
      severity: ADVISORY_SEVERITY.ATTENTION,
      text: 'Für Kinder dieser Altersgruppe liegt die Obergrenze bei 7 mg pro Tag.',
    },
  ],
  curcumin: [
    {
      lifeStages: ['pregnancy', 'breastfeeding'],
      severity: ADVISORY_SEVERITY.MEDICAL,
      text: 'Hochdosierte Curcumin-Extrakte sind in Schwangerschaft und Stillzeit nicht ausreichend untersucht. Kurkuma als Gewürz ist davon nicht betroffen.',
    },
    {
      lifeStages: 'all',
      severity: ADVISORY_SEVERITY.ATTENTION,
      text: 'Piperin-haltige Präparate steigern nicht nur die Curcumin-Aufnahme, sondern können auch die Aufnahme von Medikamenten beeinflussen.',
    },
  ],
  creatine: [
    {
      lifeStages: ['child-4-10', 'teen-11-17'],
      severity: ADVISORY_SEVERITY.MEDICAL,
      text: 'Für Kinder und Jugendliche liegen kaum Langzeitdaten vor; eine Ergänzung ist in diesen Altersgruppen unüblich.',
    },
    {
      lifeStages: ['senior', 'menopause'],
      severity: ADVISORY_SEVERITY.ATTENTION,
      text: 'Wird in dieser Lebensphase im Zusammenhang mit Muskelerhalt untersucht, in Kombination mit Krafttraining.',
    },
  ],
  psyllium: [
    {
      lifeStages: 'all',
      severity: ADVISORY_SEVERITY.ATTENTION,
      text: 'Blockiert die Aufnahme von Wirkstoffen und Medikamenten. Mindestens 2 Stunden Abstand und reichlich Flüssigkeit sind erforderlich.',
    },
  ],
  potassium: [
    {
      lifeStages: 'all',
      severity: ADVISORY_SEVERITY.MEDICAL,
      text: 'Bei eingeschränkter Nierenfunktion und bei bestimmten Blutdruckmedikamenten (ACE-Hemmer, Sartane, kaliumsparende Diuretika) ist eine Kaliumergänzung ärztlich abzuklären.',
    },
  ],
  probiotics: [
    {
      lifeStages: 'all',
      severity: ADVISORY_SEVERITY.MEDICAL,
      text: 'Bei stark geschwächtem Immunsystem sind lebende Kulturen ärztlich abzuklären.',
    },
  ],
  'l-arginine': [
    {
      lifeStages: ['child-4-10', 'teen-11-17', 'pregnancy', 'breastfeeding'],
      severity: ADVISORY_SEVERITY.MEDICAL,
      text: 'In diesen Lebensphasen nicht ausreichend untersucht.',
    },
  ],
  'l-tyrosine': [
    {
      lifeStages: 'all',
      severity: ADVISORY_SEVERITY.ATTENTION,
      text: 'Bei Schilddrüsenüberfunktion und bei Einnahme von Schilddrüsenhormonen oder MAO-Hemmern ärztlich abklären.',
    },
    {
      lifeStages: ['child-4-10', 'teen-11-17', 'pregnancy', 'breastfeeding'],
      severity: ADVISORY_SEVERITY.MEDICAL,
      text: 'In diesen Lebensphasen nicht ausreichend untersucht.',
    },
  ],
  coq10: [
    {
      lifeStages: 'all',
      severity: ADVISORY_SEVERITY.ATTENTION,
      text: 'Kann die Wirkung von Vitamin-K-Antagonisten beeinflussen. Häufiges Anwendungsgebiet ist die Begleitung einer Statin-Therapie.',
    },
  ],
  // ── Erweiterung Juli 2026 ──────────────────────────────────
  'panax-ginseng': [
    {
      lifeStages: ['pregnancy', 'breastfeeding'],
      severity: ADVISORY_SEVERITY.CONTRAINDICATED,
      text: 'HMPC: Sicherheit in Schwangerschaft und Stillzeit nicht belegt, Anwendung bei unzureichender Datenlage nicht empfohlen. Ein Inhaltsstoff hat im Tierversuch Fehlbildungen ausgelöst.',
    },
    {
      lifeStages: ['child-4-10', 'teen-11-17'],
      severity: ADVISORY_SEVERITY.CONTRAINDICATED,
      text: 'Anwendung bei Kindern und Jugendlichen unter 18 Jahren mangels Daten nicht empfohlen (HMPC).',
    },
  ],
  'ginkgo-biloba': [
    {
      lifeStages: ['pregnancy'],
      severity: ADVISORY_SEVERITY.CONTRAINDICATED,
      text: 'Offizielle HMPC-Kontraindikation (nicht nur Warnhinweis): kann die Thrombozytenaggregation beeinträchtigen und die Blutungsneigung erhöhen.',
    },
    {
      lifeStages: ['breastfeeding'],
      severity: ADVISORY_SEVERITY.CONTRAINDICATED,
      text: 'Unklar, ob Metaboliten in die Muttermilch übergehen; Anwendung laut HMPC nicht empfohlen.',
    },
  ],
  'rhodiola-rosea': [
    {
      lifeStages: ['pregnancy', 'breastfeeding'],
      severity: ADVISORY_SEVERITY.CONTRAINDICATED,
      text: 'HMPC: Sicherheit nicht belegt, Anwendung bei unzureichender Datenlage nicht empfohlen.',
    },
    {
      lifeStages: ['child-4-10', 'teen-11-17'],
      severity: ADVISORY_SEVERITY.CONTRAINDICATED,
      text: 'Anwendung bei Kindern und Jugendlichen unter 18 Jahren mangels Daten nicht empfohlen (HMPC).',
    },
  ],
  'milk-thistle': [
    {
      lifeStages: ['pregnancy', 'breastfeeding'],
      severity: ADVISORY_SEVERITY.CONTRAINDICATED,
      text: 'HMPC: Sicherheit nicht belegt, Anwendung bei unzureichender Datenlage nicht empfohlen.',
    },
    {
      lifeStages: ['child-4-10', 'teen-11-17'],
      severity: ADVISORY_SEVERITY.CONTRAINDICATED,
      text: 'Anwendung bei Kindern und Jugendlichen unter 18 Jahren mangels Daten nicht empfohlen (HMPC).',
    },
  ],
  maca: [
    {
      lifeStages: ['pregnancy', 'breastfeeding'],
      severity: ADVISORY_SEVERITY.ATTENTION,
      text: 'Das BfR stellt ausdrücklich fest, dass aus den vorliegenden Daten keine gesundheitlich unbedenkliche Verzehrsmenge abgeleitet werden kann. Diese Zurückhaltung ist aus der allgemein unzureichenden Datenlage abgeleitet, keine wörtlich zitierbare Behördenaussage speziell zu Schwangerschaft/Stillzeit.',
    },
  ],
  gaba: [
    {
      lifeStages: ['pregnancy', 'breastfeeding'],
      severity: ADVISORY_SEVERITY.ATTENTION,
      text: 'Laut einer USP-Sicherheitsbewertung unzureichende Datenlage, da GABA Neurotransmitter- und Hormonhaushalt beeinflussen kann. Regulatorischer Status in Deutschland uneinheitlich (siehe Hinweis zur Substanz).',
    },
  ],
  'l-theanine': [
    {
      lifeStages: ['child-4-10', 'teen-11-17', 'pregnancy', 'breastfeeding'],
      severity: ADVISORY_SEVERITY.ATTENTION,
      text: 'Im laufenden EU-Zulassungsverfahren für isoliertes L-Theanin als Zielgruppen-Ausschluss vorgeschlagen: keine ausreichende Datenlage für diese Gruppen.',
    },
  ],
  melatonin: [
    {
      lifeStages: ['pregnancy', 'breastfeeding', 'child-4-10'],
      severity: ADVISORY_SEVERITY.MEDICAL,
      text: 'Laut BfR liegt keine gesicherte Unbedenklichkeitsbewertung für isoliertes Melatonin vor; die Einordnung als pharmakologisch wirksamer Stoff gilt dosisunabhängig.',
    },
  ],
  'n-acetylcysteine': [
    {
      lifeStages: 'all',
      severity: ADVISORY_SEVERITY.ATTENTION,
      text: 'Regulatorischer Status als Nahrungsergänzungsmittel in Deutschland ist behördlich umstritten und wurde bereits mehrfach unterschiedlich bewertet.',
    },
  ],
  resveratrol: [
    {
      lifeStages: ['pregnancy', 'breastfeeding', 'child-4-10', 'teen-11-17'],
      severity: ADVISORY_SEVERITY.CONTRAINDICATED,
      text: 'Die EU-Zulassung als Novel Food gilt ausdrücklich nur für die erwachsene Bevölkerung.',
    },
  ],
  glucosamine: [
    {
      lifeStages: ['pregnancy', 'breastfeeding'],
      severity: ADVISORY_SEVERITY.ATTENTION,
      text: 'Laut NCCIH liegen wenig belastbare Daten zur Sicherheit in Schwangerschaft und Stillzeit vor.',
    },
  ],
  niacin: [
    {
      lifeStages: ['pregnancy'],
      severity: ADVISORY_SEVERITY.ATTENTION,
      text: 'Das BfR empfiehlt für Nicotinamid-Zusätze über 16 mg/Tag einen Warnhinweis für Schwangere wegen unzureichender Sicherheitsdaten. Die formspezifische Obergrenze ist außerdem 200-fach unterschiedlich zwischen Nicotinsäure und Nicotinamid, siehe "Formen im Vergleich".',
    },
  ],
  biotin: [
    {
      lifeStages: 'all',
      severity: ADVISORY_SEVERITY.ATTENTION,
      text: 'Vor Labor-Bluttests relevant: Die Einnahme kann bestimmte Testergebnisse (z. B. Schilddrüsen-, Herzmarker) verfälschen.',
    },
  ],

  // ── Erweiterung Juli 2026, zweite Runde ───────────────────
  nattokinase: [
    {
      lifeStages: ['pregnancy', 'breastfeeding'],
      severity: ADVISORY_SEVERITY.MEDICAL,
      text: 'Die EFSA-Sicherheitsbewertung schließt Schwangere und Stillende ausdrücklich aus.',
    },
    {
      lifeStages: 'all',
      severity: ADVISORY_SEVERITY.ATTENTION,
      text: 'Kann die Wirkung von Antikoagulanzien/Thrombozytenaggregationshemmern theoretisch verstärken. Fallberichte beschreiben sowohl Blutungsereignisse als auch thrombotische Komplikationen, wenn Nattokinase eigenmächtig eine Blutverdünner-Therapie ersetzte.',
    },
  ],
  'methylene-blue': [
    {
      lifeStages: 'all',
      severity: ADVISORY_SEVERITY.CONTRAINDICATED,
      text: 'G6PD-Mangel gilt laut Fachinformation als Kontraindikation (Hämolyserisiko). Kombination mit serotonerg wirksamen Substanzen (SSRI, SNRI, MAO-Hemmer, 5-HTP, Tryptophan) birgt laut behördlicher Warnung bei jeder Dosierung ein Serotonin-Syndrom-Risiko.',
    },
    {
      lifeStages: ['pregnancy', 'breastfeeding'],
      severity: ADVISORY_SEVERITY.CONTRAINDICATED,
      text: 'Keine der geprüften Quellen liefert eine Sicherheitsbewertung für Schwangerschaft/Stillzeit im Nahrungsergänzungsmittel-Kontext, es handelt sich ohnehin um kein zugelassenes Nahrungsergänzungsmittel.',
    },
  ],
  'l-carnitine': [
    {
      lifeStages: 'all',
      severity: ADVISORY_SEVERITY.ATTENTION,
      text: 'Bei Anfallsleiden/Epilepsie können hohe Dosen laut NIH ODS das Anfallsrisiko erhöhen. Bei chronischer Nierenerkrankung können hohe Dosen Muskelschwäche begünstigen.',
    },
  ],
  berberine: [
    {
      lifeStages: ['pregnancy'],
      severity: ADVISORY_SEVERITY.CONTRAINDICATED,
      text: 'Berichte zu Bilirubin-Verdrängung mit Kernikterus-Risiko beim Säugling führen dazu, dass Berberin in der Schwangerschaft konsistent als Ausschlusskriterium genannt wird.',
    },
    {
      lifeStages: 'all',
      severity: ADVISORY_SEVERITY.MEDICAL,
      text: 'Pharmakokinetische Wechselwirkungen mit Statinen, Metformin/Antidiabetika und Blutdrucksenkern über CYP-Enzyme sind beschrieben.',
    },
  ],
  'green-tea-extract-egcg': [
    {
      lifeStages: 'all',
      severity: ADVISORY_SEVERITY.ATTENTION,
      text: 'Einnahme auf nüchternen Magen erhöht Bioverfügbarkeit und Lebertoxizitäts-Risiko von EGCG.',
    },
  ],
  boswellia: [
    {
      lifeStages: ['pregnancy', 'breastfeeding'],
      severity: ADVISORY_SEVERITY.ATTENTION,
      text: 'Laut NCCIH nur begrenzte Sicherheitsdaten zur Anwendung während Schwangerschaft und Stillzeit vorhanden.',
    },
  ],
  harpagophytum: [
    {
      lifeStages: ['pregnancy', 'breastfeeding'],
      severity: ADVISORY_SEVERITY.CONTRAINDICATED,
      text: 'HMPC: Sicherheit nicht belegt, Anwendung bei unzureichender Datenlage nicht empfohlen.',
    },
    {
      lifeStages: ['child-4-10', 'teen-11-17'],
      severity: ADVISORY_SEVERITY.CONTRAINDICATED,
      text: 'HMPC: Anwendung bei Kindern/Jugendlichen unter 18 Jahren mangels Daten nicht empfohlen.',
    },
  ],
  bromelain: [
    {
      lifeStages: ['pregnancy', 'breastfeeding'],
      severity: ADVISORY_SEVERITY.ATTENTION,
      text: 'Sicherheit während Schwangerschaft und Stillzeit ist laut NCCIH nicht bekannt.',
    },
  ],
  spirulina: [
    {
      lifeStages: 'all',
      severity: ADVISORY_SEVERITY.CONTRAINDICATED,
      text: 'Enthält Phenylalanin: bei Phenylketonurie (PKU) muss die Zufuhr von Phenylalanin-Quellen strikt kontrolliert werden.',
    },
    {
      lifeStages: ['pregnancy', 'breastfeeding'],
      severity: ADVISORY_SEVERITY.MEDICAL,
      text: 'Für cyanobakterienhaltige Algen-Supplemente wird wegen möglicher Kontamination empfohlen, dass diese für Schwangere/Stillende nicht geeignet sind.',
    },
  ],
  chlorella: [
    {
      lifeStages: 'all',
      severity: ADVISORY_SEVERITY.ATTENTION,
      text: 'Der beschriebene Vitamin-K-Gehalt wird in Sekundärquellen im Zusammenhang mit Gerinnungshemmern genannt.',
    },
  ],
  'black-seed-oil': [
    {
      lifeStages: ['pregnancy'],
      severity: ADVISORY_SEVERITY.CONTRAINDICATED,
      text: 'Mengen oberhalb üblicher Lebensmittelverzehrsmengen gelten in der Schwangerschaft als wahrscheinlich unsicher, da ein Einfluss auf Uteruskontraktionen diskutiert wird.',
    },
  ],
  chasteberry: [
    {
      lifeStages: ['pregnancy', 'breastfeeding'],
      severity: ADVISORY_SEVERITY.CONTRAINDICATED,
      text: 'HMPC beschränkt Anwendung auf erwachsene, nicht schwangere Frauen; NCCIH nennt die Anwendung in Schwangerschaft/Stillzeit als möglicherweise unsicher.',
    },
  ],
  'black-cohosh': [
    {
      lifeStages: ['pregnancy', 'breastfeeding'],
      severity: ADVISORY_SEVERITY.CONTRAINDICATED,
      text: 'NCCIH nennt die Sicherheit in Schwangerschaft/Stillzeit explizit als ungeklärt; HMPC-Indikation ist ohnehin nicht auf Schwangerschaft anwendbar.',
    },
  ],
  pqq: [
    {
      lifeStages: ['pregnancy', 'breastfeeding'],
      severity: ADVISORY_SEVERITY.CONTRAINDICATED,
      text: 'Die EU-Zulassung als Novel Food schließt Schwangere und Stillende ausdrücklich aus.',
    },
  ],
  boron: [
    {
      lifeStages: ['child-4-10', 'teen-11-17'],
      severity: ADVISORY_SEVERITY.ATTENTION,
      text: 'BfR: Bor-haltige Nahrungsergänzungsmittel sind laut Empfehlung nicht für Kinder und Jugendliche geeignet, da der UL aus Hintergrundquellen bereits ausgeschöpft sein kann.',
    },
  ],

  'vitamin-e': [
    {
      lifeStages: 'all',
      severity: ADVISORY_SEVERITY.ATTENTION,
      text: 'Höhere Dosen können die Blutungsneigung erhöhen: relevant bei Gerinnungshemmern und vor Operationen.',
    },
  ],
  caffeine: [
    {
      lifeStages: ['pregnancy', 'breastfeeding'],
      severity: ADVISORY_SEVERITY.ATTENTION,
      text: 'EFSA nennt für diese Gruppe eine niedrigere unbedenkliche Gesamt-Tagesaufnahme (200 mg) als für die übrige erwachsene Bevölkerung.',
    },
    {
      lifeStages: 'all',
      severity: ADVISORY_SEVERITY.CONTRAINDICATED,
      text: 'Hochkonzentrierte/reine Koffeinpulver-Produkte bergen laut BfR ein hohes Risiko versehentlicher Überdosierung bis hin zu Todesfällen, da haushaltsübliche Messmittel die geringe unbedenkliche Einzelmenge (0,2 g) nicht präzise erfassen können.',
    },
  ],
  guarana: [
    {
      lifeStages: ['pregnancy', 'breastfeeding'],
      severity: ADVISORY_SEVERITY.ATTENTION,
      text: 'Die Wirkung beruht auf dem enthaltenen Koffein: für Schwangere und Stillende gilt daher dieselbe niedrigere unbedenkliche Gesamt-Tagesaufnahme wie bei isoliertem Koffein.',
    },
  ],
  'cranberry-extract': [
    {
      lifeStages: ['pregnancy', 'breastfeeding'],
      severity: ADVISORY_SEVERITY.MEDICAL,
      text: 'Sicherheit während Schwangerschaft/Stillzeit laut EMA nicht belegt; Anwendung wird nicht empfohlen.',
    },
    {
      lifeStages: 'all',
      severity: ADVISORY_SEVERITY.ATTENTION,
      text: 'Erhöhter Oxalatgehalt kann bei Nierensteinen in der Vorgeschichte das Risiko erneuter Steinbildung erhöhen.',
    },
    {
      lifeStages: 'all',
      severity: ADVISORY_SEVERITY.CONTRAINDICATED,
      text: 'EMA nennt die gleichzeitige Einnahme von Warfarin oder Tacrolimus als Kontraindikation wegen dokumentierter Wechselwirkungen.',
    },
  ],
  'pumpkin-seed-extract': [
    {
      lifeStages: ['child-4-10', 'teen-11-17'],
      severity: ADVISORY_SEVERITY.ATTENTION,
      text: 'Anwendung bei Kindern/Jugendlichen unter 18 laut EMA nicht empfohlen, da Harnwegsbeschwerden in dieser Gruppe ärztlicher Abklärung bedürfen.',
    },
    {
      lifeStages: ['pregnancy', 'breastfeeding'],
      severity: ADVISORY_SEVERITY.MEDICAL,
      text: 'Für Extrakte laut EMA nicht ausreichend untersucht; reine Lebensmittelmengen (Samen/Öl) gelten als unbedenklich.',
    },
  ],
  'grapefruit-seed-extract': [
    {
      lifeStages: 'all',
      severity: ADVISORY_SEVERITY.MEDICAL,
      text: 'Bei Einnahme CYP3A4-abhängiger Medikamente (z. B. Immunsuppressiva, bestimmte Statine/Calciumkanalblocker) vor Anwendung ärztliche Rücksprache wegen möglicher Wechselwirkung.',
    },
  ],
  'colloidal-silver': [
    {
      lifeStages: 'all',
      severity: ADVISORY_SEVERITY.CONTRAINDICATED,
      text: 'Dauerhafte oder hochdosierte orale Einnahme ohne medizinische Indikation, da die kumulative Silberaufnahme (~1 g+) zu irreversibler Argyrie (Hautverfärbung) und möglicher Organablagerung führen kann. Wirksamkeit gegen innere Erkrankungen ist wissenschaftlich nicht belegt.',
    },
  ],
  'amygdalin-b17': [
    {
      lifeStages: 'all',
      severity: ADVISORY_SEVERITY.CONTRAINDICATED,
      text: 'Als „bedenkliches Arzneimittel" eingestuft (BfArM) und darf in Deutschland nicht in Verkehr gebracht werden; bereits geringe Mengen bergen ein Cyanidvergiftungsrisiko mit dokumentierten Todesfällen.',
    },
    {
      lifeStages: ['child-4-10', 'teen-11-17'],
      severity: ADVISORY_SEVERITY.CONTRAINDICATED,
      text: 'Laut Verbraucherzentrale kann bereits ein einzelner Kern gefährlich sein: vollständiger Verzicht wird empfohlen.',
    },
    {
      lifeStages: 'all',
      severity: ADVISORY_SEVERITY.MEDICAL,
      text: 'Kombination mit hochdosiertem Vitamin C erhöht die Toxizität nachweislich.',
    },
  ],
  dhea: [
    {
      lifeStages: 'all',
      severity: ADVISORY_SEVERITY.CONTRAINDICATED,
      text: 'In Deutschland/EU nicht als Nahrungsergänzungsmittel verkehrsfähig; ab 10 mg/Tag als Arzneimittel eingestuft (Expertenkommission BVL, 02/2025).',
    },
    {
      lifeStages: ['menopause'],
      severity: ADVISORY_SEVERITY.ATTENTION,
      text: 'Bereits ab 25 mg/Tag laut BfR messbare Hormonveränderungen möglich.',
    },
    {
      lifeStages: 'all',
      severity: ADVISORY_SEVERITY.MEDICAL,
      text: 'Bei hormonabhängigen Tumoren (Brust, Prostata) in der Vorgeschichte unklares Risiko durch Beeinflussung des Sexualhormonhaushalts.',
    },
  ],
  'garcinia-cambogia-hca': [
    {
      lifeStages: 'all',
      severity: ADVISORY_SEVERITY.ATTENTION,
      text: 'EFSA-Sicherheitsbewertung (Entwurf 2026) kommt zum Schluss, dass keine sichere Aufnahmemenge festgelegt werden kann; Fälle akuter Leberschädigung sind dokumentiert.',
    },
    {
      lifeStages: ['pregnancy', 'breastfeeding', 'child-4-10', 'teen-11-17'],
      severity: ADVISORY_SEVERITY.CONTRAINDICATED,
      text: 'Die französische Behörde ANSES rät bei Schwangerschaft/Stillzeit sowie bei Kindern/Jugendlichen von der Anwendung ab, ebenso bei psychiatrischen, kardiometabolischen Erkrankungen oder Pankreatitis/Hepatitis in der Vorgeschichte.',
    },
  ],
  propolis: [
    {
      lifeStages: 'all',
      severity: ADVISORY_SEVERITY.ATTENTION,
      text: 'Bei Pollenallergie oder Allergie gegen Bienenprodukte/-stiche sind laut BfR und dermatologischer Fachliteratur allergische Reaktionen bis hin zu schweren Verläufen möglich.',
    },
  ],
  'royal-jelly': [
    {
      lifeStages: 'all',
      severity: ADVISORY_SEVERITY.CONTRAINDICATED,
      text: 'Bei Asthma, Atopie oder bekannter Allergie gegen Bienenprodukte/-stiche sind schwere bis lebensbedrohliche allergische Reaktionen dokumentiert, einschließlich Todesfällen (australische Meldedaten).',
    },
  ],
  'flaxseed-oil': [
    {
      lifeStages: ['pregnancy', 'breastfeeding'],
      severity: ADVISORY_SEVERITY.ATTENTION,
      text: 'Sicherheitsdaten zu Leinöl in Schwangerschaft/Stillzeit sind laut NCCIH begrenzt.',
    },
    {
      lifeStages: 'all',
      severity: ADVISORY_SEVERITY.ATTENTION,
      text: 'Theoretische Wechselwirkung mit Antikoagulantien/Thrombozytenaggregationshemmern laut NCCIH.',
    },
  ],
  'evening-primrose-oil': [
    {
      lifeStages: ['pregnancy'],
      severity: ADVISORY_SEVERITY.ATTENTION,
      text: 'Widersprüchliche Studienlage zur Wirkung auf Wehen am Schwangerschaftsende; Sicherheit nicht abschließend belegt.',
    },
    {
      lifeStages: ['child-4-10', 'teen-11-17'],
      severity: ADVISORY_SEVERITY.ATTENTION,
      text: 'Sicherheit bei Kindern laut NCCIH nicht ausreichend untersucht.',
    },
  ],
  'grape-seed-extract': [
    {
      lifeStages: ['pregnancy', 'breastfeeding'],
      severity: ADVISORY_SEVERITY.ATTENTION,
      text: 'Sicherheit in Schwangerschaft/Stillzeit ist laut NCCIH nicht ausreichend belegt.',
    },
  ],
  'saccharomyces-boulardii': [
    {
      lifeStages: 'all',
      severity: ADVISORY_SEVERITY.CONTRAINDICATED,
      text: 'Bei liegendem zentralvenösem Katheter und/oder schwerer Immunsuppression sind dokumentierte Fungämie-Fälle mit teils schwerem Verlauf beschrieben.',
    },
  ],
  bcaa: [
    {
      lifeStages: 'all',
      severity: ADVISORY_SEVERITY.CONTRAINDICATED,
      text: 'Kontraindiziert bei Ahornsirupkrankheit (angeborener Defekt im BCAA-Abbau).',
    },
    {
      lifeStages: 'all',
      severity: ADVISORY_SEVERITY.MEDICAL,
      text: 'Bei fortgeschrittener Leber- oder Nierenerkrankung sowie bei ALS wird hochdosierte Einnahme in der Literatur kontrovers diskutiert und sollte ärztlich begleitet werden.',
    },
  ],
  'green-lipped-mussel-extract': [
    {
      lifeStages: 'all',
      severity: ADVISORY_SEVERITY.CONTRAINDICATED,
      text: 'Kontraindiziert bei bekannter Muschel-/Schalentierallergie (Kreuzreaktionsrisiko).',
    },
  ],
  valerian: [
    {
      lifeStages: ['pregnancy', 'breastfeeding'],
      severity: ADVISORY_SEVERITY.CONTRAINDICATED,
      text: 'Sicherheit in Schwangerschaft/Stillzeit laut EMA/HMPC nicht belegt, Anwendung nicht empfohlen.',
    },
    {
      lifeStages: ['child-4-10', 'teen-11-17'],
      severity: ADVISORY_SEVERITY.CONTRAINDICATED,
      text: 'Anwendung bei Kindern unter 12 Jahren laut EMA/HMPC nicht empfohlen bzw. mangels Daten nicht belegt.',
    },
  ],
  'st-johns-wort': [
    {
      lifeStages: 'all',
      severity: ADVISORY_SEVERITY.CONTRAINDICATED,
      text: 'Bei Hyperforin-Tagesdosen über 1 mg kontraindiziert mit Cumarin-Antikoagulanzien, Ciclosporin, Tacrolimus, Sirolimus, Everolimus, Proteaseinhibitoren und bestimmten Zytostatika (u. a. Irinotecan, Imatinib), CYP3A4/CYP2B6/CYP2C9/CYP2C19/P-Glykoprotein-Induktion laut EMA/HMPC.',
    },
    {
      lifeStages: ['adult-woman', 'teen-11-17'],
      severity: ADVISORY_SEVERITY.ATTENTION,
      text: 'Kann die Plasmakonzentration hormoneller Kontrazeptiva senken und dadurch die Verhütungssicherheit verringern (vermehrte Zwischenblutungen als Warnzeichen).',
    },
    {
      lifeStages: 'all',
      severity: ADVISORY_SEVERITY.ATTENTION,
      text: 'In Kombination mit Serotonin-Wiederaufnahmehemmern oder anderen serotonergen Wirkstoffen sehr selten Serotonin-Syndrom möglich.',
    },
    {
      lifeStages: ['child-4-10', 'teen-11-17'],
      severity: ADVISORY_SEVERITY.CONTRAINDICATED,
      text: 'Anwendung bei Kindern und Jugendlichen unter 18 Jahren mangels Daten nicht empfohlen (HMPC).',
    },
  ],
  passionflower: [
    {
      lifeStages: ['pregnancy', 'breastfeeding'],
      severity: ADVISORY_SEVERITY.CONTRAINDICATED,
      text: 'Sicherheit in Schwangerschaft/Stillzeit laut EMA/HMPC nicht belegt.',
    },
    {
      lifeStages: ['child-4-10', 'teen-11-17'],
      severity: ADVISORY_SEVERITY.CONTRAINDICATED,
      text: 'Anwendung bei Kindern unter 12 Jahren mangels Daten nicht empfohlen (HMPC).',
    },
  ],
  echinacea: [
    {
      lifeStages: ['child-4-10', 'teen-11-17'],
      severity: ADVISORY_SEVERITY.CONTRAINDICATED,
      text: 'Anwendung bei Kindern unter 12 Jahren mangels Sicherheitsdaten nicht empfohlen (HMPC).',
    },
    {
      lifeStages: ['pregnancy', 'breastfeeding'],
      severity: ADVISORY_SEVERITY.ATTENTION,
      text: 'Begrenzte Daten zeigen laut HMPC keine nachteiligen Effekte auf Schwangerschaft/Fetus; mangels weiterer epidemiologischer Daten wird Anwendung ohne ärztlichen Rat dennoch nicht empfohlen.',
    },
  ],
  reishi: [
    {
      lifeStages: 'all',
      severity: ADVISORY_SEVERITY.ATTENTION,
      text: 'Erhöhtes Blutungsrisiko in Kombination mit Antikoagulanzien/Thrombozytenaggregationshemmern: vor operativen Eingriffen wird in mehreren Quellen ein Pausieren der Einnahme empfohlen.',
    },
  ],
  chaga: [
    {
      lifeStages: 'all',
      severity: ADVISORY_SEVERITY.MEDICAL,
      text: 'Bei Nierenerkrankung oder Oxalat-Nierensteinen in der Vorgeschichte relevant: dokumentierte Fälle von akutem Nierenversagen durch Oxalatablagerung nach hochdosiertem/langfristigem Konsum.',
    },
  ],
  cordyceps: [
    {
      lifeStages: 'all',
      severity: ADVISORY_SEVERITY.ATTENTION,
      text: 'Theoretisch erhöhtes Blutungsrisiko durch Hemmung der Thrombozytenaggregation (relevant mit Antikoagulanzien) sowie additive Effekte mit Antidiabetika/Insulin.',
    },
  ],
  maitake: [
    {
      lifeStages: 'all',
      severity: ADVISORY_SEVERITY.ATTENTION,
      text: 'Dokumentierter INR-Anstieg in Kombination mit Warfarin sowie additive blutzuckersenkende Effekte mit Antidiabetika.',
    },
  ],
  'coriolus-versicolor': [
    {
      lifeStages: ['pregnancy', 'breastfeeding'],
      severity: ADVISORY_SEVERITY.ATTENTION,
      text: 'Keine Anwendung ohne ärztliche Rücksprache mangels Sicherheitsdaten.',
    },
  ],
  'agaricus-blazei': [
    {
      lifeStages: 'all',
      severity: ADVISORY_SEVERITY.ATTENTION,
      text: 'Bei hormonsensiblen Erkrankungen wird wegen möglicher östrogenartiger Aktivität ärztliche Rücksprache empfohlen.',
    },
  ],
  'nicotinamide-riboside': [
    {
      lifeStages: ['pregnancy', 'breastfeeding'],
      severity: ADVISORY_SEVERITY.ATTENTION,
      text: 'EU-Zulassung setzt für diese Gruppe eine reduzierte Höchstmenge an (230 mg/Tag statt 300 mg).',
    },
  ],
};

/**
 * getAdvisories(substanceId, lifeStageId)
 * Gibt die zutreffenden Hinweise zurueck, nach Schweregrad sortiert.
 */
export function getAdvisories(substanceId, lifeStageId) {
  const entries = advisories[substanceId];
  if (!Array.isArray(entries)) return [];

  return entries
    .filter(
      (entry) =>
        entry.lifeStages === 'all' ||
        (Array.isArray(entry.lifeStages) &&
          entry.lifeStages.includes(lifeStageId))
    )
    .map((entry) => ({
      severity: entry.severity,
      text: entry.text,
      // lifeStages mit durchreichen: data/localize.js braucht sie als
      // Schluessel fuer das englische Text-Overlay.
      lifeStages: entry.lifeStages,
      meta: SEVERITY_META[entry.severity],
    }))
    .sort((a, b) => (b.meta?.rank ?? 0) - (a.meta?.rank ?? 0));
}

/**
 * getStrictestSeverity(substanceId, lifeStageId)
 * Fuer Badges und Sortierung in Listen.
 */
export function getStrictestSeverity(substanceId, lifeStageId) {
  const list = getAdvisories(substanceId, lifeStageId);
  return list.length > 0 ? list[0].severity : null;
}
