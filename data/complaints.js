/**
 * data/complaints.js
 * ─────────────────────────────────────────────────────────────
 * Beschwerdebilder als Einstieg in die Suche.
 *
 * DER ZWECK IST DIE ENTWARNUNG, NICHT DIE ZUORDNUNG.
 * Wer "ich bin staendig muede" eingibt, bekommt in den meisten Apps eine
 * Produktempfehlung. Hier bekommt er zuerst den Satz, dass Muedigkeit
 * unspezifisch ist und aus ihr kein Mangel folgt — und danach die Breite
 * der moeglichen Ursachen, von denen die wenigsten mit Naehrstoffen zu tun
 * haben.
 *
 * `contextAreas` steht deshalb VOR `relatedNutrients`. Schlaf, Stress und
 * Medikamente sind bei den meisten dieser Beschwerden die naeherliegenden
 * Erklaerungen; eine App, die direkt bei Eisen anfaengt, verzerrt das Bild.
 *
 * `redFlags` ist der sicherheitsrelevante Teil. Eine App, die bei
 * anhaltender Muedigkeit nicht auf ungewollten Gewichtsverlust hinweist,
 * waere fahrlaessig. Die Formulierung bleibt beobachtend ("kommt gemeinsam
 * vor mit"), nie deutend ("deutet hin auf") — der Unterschied zwischen
 * Hinweis und Diagnose.
 *
 * `questionsForProfessional` ist die eigentliche Leistung: Die App
 * diagnostiziert nicht, sie bereitet das Gespraech vor.
 *
 * Alle Angaben aus oeffentlichen Quellen (NHS, IQWiG, NCCIH, MSD,
 * Cleveland Clinic). Wo die Studienlage duenn ist, steht das dabei — bei
 * Magnesium und Kraempfen etwa ist die oeffentliche Wahrnehmung deutlich
 * staerker als die zitierbare Evidenz.
 */

export const COMPLAINTS = [
  {
    id: 'fatigue',
    label: 'Anhaltende Müdigkeit',
    // "antriebslos" steht bewusst nur bei der niedergeschlagenen Stimmung:
    // Der Begriff beschreibt eher fehlenden Antrieb als koerperliche
    // Erschoepfung, und dort ist die Einordnung die wichtigere.
    synonyms: ['müde', 'müde', 'immer müde', 'schlapp', 'keine energie', 'kaputt', 'ausgelaugt', 'erschöpft', 'erschoepft', 'energielos', 'abgeschlagen', 'tired', 'tiredness', 'fatigue', 'exhausted', 'no energy', 'worn out'],
    intro:
      'Müdigkeit ist eines der unspezifischsten Symptome überhaupt. Von Alltagsfaktoren bis zu behandlungsbedürftigen Erkrankungen kommt vieles in Frage. Aus der Müdigkeit allein lässt sich keine Ursache und kein Nährstoffmangel ableiten.',
    contextAreas: [
      'Schlafqualität und Schlafdauer',
      'Psychische Belastung: Stress, Trauer, gedrückte Stimmung',
      'Hormonelle Veränderungen, etwa Schwangerschaft oder Wechseljahre',
      'Akute oder überstandene Infekte',
      'Nebenwirkungen von Medikamenten',
      'Schilddrüsenfunktion',
      'Bewegung und Ernährung im Alltag',
    ],
    redFlags: [
      'Kommt gemeinsam mit ungewolltem Gewichtsverlust vor',
      'Hält ohne erkennbaren Grund über mehrere Wochen an',
      'Tritt zusammen mit auffälligen Stimmungsveränderungen auf',
      'Geht mit Schnarchen oder Atemaussetzern im Schlaf einher',
      'Kommt zusammen mit Kurzatmigkeit, Herzklopfen oder auffälliger Blässe vor',
    ],
    relatedNutrients: [
      { substanceId: 'iron', note: 'Wird bei Müdigkeit mit Kurzatmigkeit oder Blässe im Zusammenhang mit Eisenmangelanämie untersucht. Nachweisbar nur über das Blutbild, nicht über das Symptom.' },
      { substanceId: 'vitamin-b12', note: 'Ein Mangel wird als Ursache ausgeprägter Müdigkeit genannt, betrifft vor allem ältere und vegan lebende Menschen.' },
      { substanceId: 'folate', note: 'Wird gemeinsam mit Vitamin B12 im Zusammenhang mit Blutbildveränderungen untersucht.' },
      { substanceId: 'vitamin-d3', note: 'Häufig diskutiert, die Datenlage zum ursächlichen Zusammenhang ist uneinheitlich.' },
    ],
    labMarkers: ['ferritin', 'hemoglobin', 'vitamin-b12', 'folate', 'vitamin-d-25oh', 'tsh', 'hba1c', 'crp'],
    questionsForProfessional: [
      'Welche Blutwerte werden bei anhaltender Müdigkeit üblicherweise zuerst bestimmt?',
      'Kann die Müdigkeit mit einem Medikament zusammenhängen, das ich nehme?',
      'Ab wann wäre eine Schlafuntersuchung sinnvoll?',
    ],
    sources: [
      { label: 'NHS – Tiredness and fatigue', url: 'https://www.nhs.uk/conditions/tiredness-and-fatigue/' },
      { label: 'NHS – Iron deficiency anaemia', url: 'https://www.nhs.uk/conditions/iron-deficiency-anaemia/' },
    ],
  },

  {
    id: 'sleep-problems',
    label: 'Ein- und Durchschlafprobleme',
    synonyms: ['schlaf', 'schlafen', 'kann nicht einschlafen', 'wache nachts auf', 'schlafe schlecht', 'schlaflos', 'grübele nachts', 'unruhiger schlaf', 'komme nicht zur ruhe', 'sleep', 'insomnia', 'cannot sleep', 'sleepless', 'waking up at night'],
    intro:
      'Schlafprobleme reichen von vorübergehendem Stress bis zu behandelbaren Grunderkrankungen. Das Symptom allein sagt nichts über die Ursache.',
    contextAreas: [
      'Psychische Belastung und Gedankenkreisen',
      'Koffein, Alkohol und Nikotin, auch Stunden vor dem Zubettgehen',
      'Körperliche Beschwerden: Schmerzen, nächtlicher Harndrang, Hitzewallungen',
      'Schlafbezogene Störungen wie Schlafapnoe oder Restless-Legs',
      'Umgebung: Lärm, Temperatur, Schichtarbeit, Zeitverschiebung',
      'Nebenwirkungen von Medikamenten',
    ],
    redFlags: [
      'Besteht seit Monaten, obwohl die Schlafgewohnheiten verändert wurden',
      'Geht mit Atemaussetzern, lautem Schnarchen oder Luftnot einher',
      'Kommt mit unwillkürlichen Beinbewegungen vor',
      'Beeinträchtigt den Alltag spürbar',
    ],
    relatedNutrients: [
      { substanceId: 'melatonin', note: 'Bei chronischer Schlaflosigkeit sieht NCCIH keine ausreichend belastbare Evidenz. Kognitive Verhaltenstherapie für Insomnie ist deutlich besser abgesichert.' },
      { substanceId: 'magnesium', note: 'Häufig in diesem Zusammenhang genannt, wird in den Übersichten von NHS und IQWiG zu Schlafstörungen aber nicht als eigenständiger Faktor geführt.' },
    ],
    labMarkers: ['tsh', 'ferritin', 'magnesium'],
    questionsForProfessional: [
      'Kommt eines meiner Medikamente als Ursache in Frage?',
      'Sollte eine Schlafapnoe oder ein Restless-Legs-Syndrom abgeklärt werden?',
      'Wäre eine Verhaltenstherapie für Schlafstörungen für mich sinnvoll?',
    ],
    sources: [
      { label: 'NHS – Insomnia', url: 'https://www.nhs.uk/conditions/insomnia/' },
      { label: 'NCCIH – Melatonin: What You Need To Know', url: 'https://www.nccih.nih.gov/health/melatonin-what-you-need-to-know' },
    ],
  },

  {
    id: 'muscle-cramps',
    label: 'Muskelkrämpfe',
    synonyms: ['krämpfe', 'kraempfe', 'wadenkrämpfe', 'wadenkrampf', 'krampf im bein', 'nächtliche krämpfe', 'muskel verkrampft', 'zieht im bein', 'cramp', 'cramps', 'muscle cramp', 'calf cramp', 'leg cramp'],
    intro:
      'Nächtliche Wadenkrämpfe sind häufig und meist harmlos, kommen aber bei sehr unterschiedlichen Auslösern vor.',
    contextAreas: [
      'Trainingsbelastung und Hitze',
      'Flüssigkeitshaushalt',
      'Bestimmte Medikamente, etwa Entwässerungsmittel oder Statine',
      'Schwangerschaft',
      'Altersbedingte Veränderungen der Muskulatur',
      'Nervenbedingte Ursachen wie Restless-Legs oder Nervenschädigungen',
    ],
    redFlags: [
      'Tritt zusammen mit Taubheitsgefühl oder Schwellung im Bein auf',
      'Ein Krampf hält länger als zehn Minuten an',
      'Ein Bein ist einseitig geschwollen, gerötet, warm oder schmerzt pochend',
      'Tritt neu auf, nachdem ein Medikament begonnen wurde',
    ],
    relatedNutrients: [
      { substanceId: 'magnesium', note: 'Wird traditionell mit Krämpfen verbunden. In den Übersichten von NHS und Mayo Clinic zu Wadenkrämpfen taucht Magnesiummangel als Ursache nicht auf, die Studienlage ist uneinheitlich. Die öffentliche Wahrnehmung ist hier deutlich stärker als die belegbare Evidenz.' },
      { substanceId: 'potassium', note: 'Im Zusammenhang mit Muskelfunktion diskutiert, besonders bei Einnahme entwässernder Medikamente.' },
      { substanceId: 'calcium', note: 'Im Zusammenhang mit Muskelfunktion genannt.' },
    ],
    labMarkers: ['magnesium', 'calcium', 'creatinine', 'tsh'],
    questionsForProfessional: [
      'Kann ein Medikament wie ein Entwässerungsmittel oder Statin mit den Krämpfen zusammenhängen?',
      'Sollten Elektrolyte und Nierenwerte kontrolliert werden?',
      'Woran erkenne ich, dass ein Beinschmerz kein harmloser Krampf mehr ist?',
    ],
    sources: [
      { label: 'NHS – Leg cramps', url: 'https://www.nhs.uk/conditions/leg-cramps/' },
      { label: 'NHS – Deep vein thrombosis', url: 'https://www.nhs.uk/conditions/deep-vein-thrombosis-dvt/' },
    ],
  },

  {
    id: 'brain-fog',
    label: 'Konzentrationsprobleme',
    synonyms: ['konzentration', 'brain fog', 'gehirnnebel', 'vernebelt', 'kann mich nicht konzentrieren', 'wie durch watte', 'vergesslich', 'unkonzentriert', 'brain fog', 'cannot focus', 'concentration', 'forgetful', 'foggy'],
    intro:
      'Der Begriff beschreibt ein Sammelgefühl, keine eigenständige Diagnose. Die Ursachen reichen von Schlafmangel bis zu chronischen Erkrankungen.',
    contextAreas: [
      'Schlafqualität und Schlafmenge',
      'Psychische Belastung',
      'Akute oder zurückliegende Infektionen',
      'Hormonelle Umstellungen, etwa Schilddrüse oder Wechseljahre',
      'Medikamente und Behandlungen',
      'Blutzuckerschwankungen',
    ],
    redFlags: [
      'Kommt gemeinsam mit plötzlicher Sprach-, Seh- oder Bewegungsstörung vor. Das gehört sofort abgeklärt',
      'Tritt mit unerklärlichem Gewichtsverlust oder Fieber auf',
      'Nimmt über Wochen zu und beeinträchtigt Alltag oder Verkehrssicherheit',
      'Kommt mit starker Tagesmüdigkeit und nächtlichen Atemaussetzern vor',
    ],
    relatedNutrients: [
      { substanceId: 'vitamin-b12', note: 'Ein Mangel wird mit neurologischen Symptomen einschließlich Konzentrationsproblemen in Verbindung gebracht.' },
      { substanceId: 'iron', note: 'Eisenmangelanämie wird mit verminderter geistiger Leistungsfähigkeit in Verbindung gebracht.' },
      { substanceId: 'vitamin-d3', note: 'Wird diskutiert, die Studienlage zur Supplementierung ist uneinheitlich.' },
    ],
    labMarkers: ['vitamin-b12', 'holo-tc', 'ferritin', 'hemoglobin', 'vitamin-d-25oh', 'tsh', 'hba1c', 'crp'],
    questionsForProfessional: [
      'Könnten Medikamente, die ich nehme, dafür verantwortlich sein?',
      'Welche Blutwerte sind hier sinnvoll, etwa Schilddrüse, Blutbild oder Vitamin B12?',
      'Ab wann wäre eine neurologische Abklärung angezeigt?',
    ],
    sources: [
      { label: 'Cleveland Clinic – Brain Fog', url: 'https://my.clevelandclinic.org/health/symptoms/brain-fog' },
    ],
  },

  {
    id: 'frequent-infections',
    label: 'Häufige Infekte',
    synonyms: ['infekte', 'ständig erkältet', 'staendig erkaeltet', 'immer krank', 'erkältung', 'erkaeltung', 'immunsystem', 'infektanfällig', 'abwehr', 'infections', 'always sick', 'immune system', 'frequent colds', 'catching colds'],
    intro:
      'Häufigere Infekte als üblich sind unspezifisch. Die Bandbreite reicht von normalen Schwankungen bis zu behandelbaren Grunderkrankungen.',
    contextAreas: [
      'Schlafmangel und Schichtarbeit',
      'Anhaltender Stress',
      'Ernährung und Versorgung mit Mikronährstoffen',
      'Alkohol und übermäßiges Training',
      'Bestehende Erkrankungen wie Diabetes',
      'Medikamente, etwa Kortison oder Immunsuppressiva',
    ],
    redFlags: [
      'Infektionen beginnen bereits im Kindesalter und wiederholen sich ungewöhnlich häufig',
      'Ungewöhnliche Erreger oder Orte, etwa wiederholte Abszesse oder hartnäckige Pilzinfektionen',
      'Infekte sprechen schlecht auf die übliche Behandlung an',
      'Kommen mit Gewichtsverlust, Fieberschüben oder Lymphknotenschwellung vor',
    ],
    relatedNutrients: [
      { substanceId: 'zinc', note: 'Wird im Zusammenhang mit der Immunfunktion untersucht.' },
      { substanceId: 'vitamin-d3', note: 'Der Zusammenhang mit Atemwegsinfekten wird diskutiert, die Evidenz zur Supplementierung ist uneinheitlich.' },
      { substanceId: 'iron', note: 'Sowohl ein Mangel als auch ein Überschuss werden mit veränderter Immunfunktion in Verbindung gebracht.' },
      { substanceId: 'selenium', note: 'Wird genannt, bei bereits ausreichender Versorgung ist ein zusätzlicher Nutzen begrenzt.' },
    ],
    labMarkers: ['zinc', 'vitamin-d-25oh', 'ferritin', 'selenium', 'crp', 'hemoglobin'],
    questionsForProfessional: [
      'Ist die Häufigkeit für mein Alter überhaupt ungewöhnlich?',
      'Sollte ein Blutbild oder eine Immunglobulin-Bestimmung gemacht werden?',
      'Könnten Medikamente die Anfälligkeit erklären?',
    ],
    sources: [
      { label: 'MSD Manuals – Überblick über Immundefekterkrankungen', url: 'https://www.msdmanuals.com/de/heim/immunst%C3%B6rungen/immundefekterkrankungen/%C3%BCberblick-%C3%BCber-immundefekterkrankungen' },
    ],
  },

  {
    id: 'hair-loss',
    label: 'Haarausfall',
    synonyms: ['haarausfall', 'haare', 'haare gehen aus', 'dünnes haar', 'duennes haar', 'haare werden weniger', 'kahle stellen', 'hair loss', 'losing hair', 'thinning hair', 'shedding'],
    intro:
      'Haarausfall hat viele mögliche Ursachen und ist für sich genommen kein Nachweis für einen bestimmten Nährstoffmangel.',
    contextAreas: [
      'Erbliche Veranlagung',
      'Schilddrüsenfunktion',
      'Vorausgegangene starke Belastung: Fieber, Operation, Geburt, Gewichtsverlust',
      'Medikamente, etwa Betablocker oder Gerinnungshemmer',
      'Psychischer Stress',
      'Erkrankungen der Kopfhaut',
    ],
    redFlags: [
      'Kommt mit Vernarbung, Rötung oder starker Schuppung der Kopfhaut vor',
      'Tritt in scharf begrenzten kahlen Stellen statt gleichmäßig verteilt auf',
      'Kommt mit Anzeichen einer Schilddrüsenstörung vor',
      'Geht mit Fieber, Lymphknotenschwellung oder starkem Gewichtsverlust einher',
    ],
    relatedNutrients: [
      { substanceId: 'iron', note: 'Niedrige Ferritinwerte auch ohne Anämie werden im Zusammenhang mit diffusem Haarausfall diskutiert, die Studienlage ist nicht einheitlich.' },
      { substanceId: 'zinc', note: 'Ein Mangel wird mit Haarausfall verbunden, betrifft in Mitteleuropa aber nur wenige Menschen.' },
      { substanceId: 'biotin', note: 'Ein Mangel ist bei ausgewogener Ernährung selten. Ohne nachgewiesenen Mangel ist die Evidenz für eine Wirkung schwach.' },
      { substanceId: 'vitamin-d3', note: 'Wird im Zusammenhang mit Wachstumszyklen untersucht, ein Nutzen der Supplementierung ist nicht belegt.' },
    ],
    labMarkers: ['ferritin', 'hemoglobin', 'tsh', 'zinc', 'vitamin-d-25oh'],
    questionsForProfessional: [
      'Ist das Muster diffus, kreisrund oder vernarbend, und was heißt das für die Abklärung?',
      'Sollten Schilddrüsenwerte und Ferritin bestimmt werden?',
      'Könnte ein Medikament ursächlich sein?',
    ],
    sources: [
      { label: 'NHS – Hair loss', url: 'https://www.nhs.uk/conditions/hair-loss/' },
    ],
  },

  {
    id: 'brittle-nails',
    label: 'Brüchige Nägel',
    synonyms: ['nägel', 'naegel', 'brüchige nägel', 'bruechige naegel', 'splitternde nägel', 'nägel brechen', 'rissige nägel', 'brittle nails', 'nails', 'splitting nails', 'weak nails'],
    intro:
      'Brüchige Nägel sind unspezifisch. Von mechanischer Beanspruchung bis zu seltenen inneren Ursachen ist vieles möglich, die Nagelform allein erlaubt keinen Rückschluss.',
    contextAreas: [
      'Mechanische Belastung durch Wasser, Reinigungsmittel oder Nagellackentferner',
      'Nagelpflege und Nägelkauen',
      'Altersbedingte Veränderungen',
      'Hauterkrankungen wie Schuppenflechte',
      'Pilzinfektionen',
      'Schilddrüsen-, Leber- oder Nierenerkrankungen',
    ],
    redFlags: [
      'Nägel wölben sich löffelförmig nach innen. Das kommt im Zusammenhang mit Eisenmangelanämie vor',
      'Ein Nagel verändert Form oder Farbe oder löst sich ohne erkennbaren Grund',
      'Die Haut um den Nagel ist gerötet, geschwollen, warm oder schmerzhaft',
    ],
    relatedNutrients: [
      { substanceId: 'iron', note: 'Wird im Zusammenhang mit löffelförmigen Nägeln genannt. Von brüchigen Nägeln allein lässt sich nicht auf Eisenmangel schließen.' },
      { substanceId: 'biotin', note: 'Bei normalen Blutspiegeln ist die Studienlage schwach.' },
      { substanceId: 'zinc', note: 'Wird im Zusammenhang mit Haut und Nägeln untersucht, die Datenlage ist dünn.' },
    ],
    labMarkers: ['ferritin', 'hemoglobin', 'zinc'],
    questionsForProfessional: [
      'Könnten die Veränderungen mit einer Hauterkrankung oder Pilzinfektion zusammenhängen?',
      'Wäre eine Bestimmung des Eisenstatus sinnvoll?',
    ],
    sources: [
      { label: 'NHS – Nail problems', url: 'https://www.nhs.uk/conditions/nail-problems/' },
    ],
  },

  {
    id: 'digestive-issues',
    label: 'Verdauungsbeschwerden',
    synonyms: ['verdauung', 'blähbauch', 'blaehbauch', 'blähungen', 'blaehungen', 'völlegefühl', 'voellegefuehl', 'verstopfung', 'durchfall', 'bauchkrämpfe', 'reizdarm', 'darm', 'bloating', 'digestion', 'gut', 'constipation', 'diarrhoea', 'diarrhea', 'ibs'],
    intro:
      'Blähungen und unregelmäßiger Stuhlgang sind sehr häufig und meist harmlos, kommen aber auch bei ernsteren Erkrankungen vor.',
    contextAreas: [
      'Ernährung, Essgeschwindigkeit und Luftschlucken',
      'Unverträglichkeiten wie Laktose, Fruktose oder Zöliakie',
      'Reizdarmsyndrom',
      'Vorangegangene Darminfektion oder Antibiotikaeinnahme',
      'Psychische Belastung',
      'Chronisch-entzündliche Darmerkrankungen',
    ],
    redFlags: [
      'Kommt mit deutlichem, ungewolltem Gewichtsverlust vor',
      'Blut im Stuhl',
      'Fieber oder auffällige Blässe begleiten die Beschwerden',
      'Plötzlich auftretende, starke Bauchschmerzen',
      'Beschwerden lassen trotz Ernährungsanpassung nicht nach',
    ],
    relatedNutrients: [
      { substanceId: 'magnesium', note: 'Wird im Zusammenhang mit der Stuhlregulation genannt. Eine zu hohe Zufuhr kann selbst Durchfall auslösen, der Zusammenhang geht also in beide Richtungen.' },
      { substanceId: 'psyllium', note: 'Ballaststoffe werden im Zusammenhang mit der Stuhlregelmäßigkeit diskutiert.' },
      { substanceId: 'saccharomyces-boulardii', note: 'Bei antibiotikaassoziiertem Durchfall gibt es Cochrane-Evidenz, für andere Beschwerdebilder ist die Lage schwächer.' },
    ],
    labMarkers: ['magnesium', 'tsh', 'crp'],
    questionsForProfessional: [
      'Könnten die Symptome auf eine Unverträglichkeit hindeuten, und wie ließe sich das abklären?',
      'Sollten Entzündungswerte oder Schilddrüsenwerte bestimmt werden?',
      'Gibt es Anzeichen, die eine Darmspiegelung nahelegen?',
    ],
    sources: [
      { label: 'NHS – Bloating', url: 'https://www.nhs.uk/conditions/bloating/' },
      { label: 'IQWiG – Reizdarmsyndrom', url: 'https://www.gesundheitsinformation.de/reizdarmsyndrom.html' },
    ],
  },

  {
    id: 'joint-pain',
    label: 'Gelenkbeschwerden',
    synonyms: ['gelenke', 'gelenkschmerzen', 'steife gelenke', 'knie', 'morgensteifigkeit', 'arthrose', 'rheuma', 'joint pain', 'joints', 'stiff joints', 'arthritis', 'knee pain'],
    intro:
      'Gelenkbeschwerden haben ein breites Ursachenspektrum, von vorübergehender Überlastung bis zu entzündlichen Erkrankungen. Aus der Beschwerde allein lässt sich keine Ursache ableiten.',
    contextAreas: [
      'Überlastung oder Verletzung durch Sport',
      'Verschleiß',
      'Entzündliche Erkrankungen wie rheumatoide Arthritis oder Gicht',
      'Infektion eines Gelenks',
      'Hormonelle Veränderungen',
    ],
    redFlags: [
      'Das Gelenk ist geschwollen, überwärmt und die Haut gerötet',
      'Die Beschwerden treten mit allgemeinem Krankheitsgefühl oder erhöhter Temperatur auf',
      'Morgensteifigkeit über 30 Minuten, mehrere Gelenke symmetrisch betroffen',
      'Starke Schmerzen nach einem Sturz, das Gelenk ist nicht belastbar',
    ],
    relatedNutrients: [
      { substanceId: 'omega-3', note: 'Bei rheumatoider Arthritis untersucht, NCCIH bewertet die Evidenz als von niedriger Qualität.' },
      { substanceId: 'vitamin-d3', note: 'Mit Knochen- und Muskelgesundheit verbunden. Ein Mangel wird eher mit Knochenschmerzen als direkt mit Gelenkschmerzen in Verbindung gebracht.' },
      { substanceId: 'glucosamine', note: 'Häufig diskutiert, die Studienlage ist uneinheitlich.' },
      { substanceId: 'chondroitin', note: 'Wie Glucosamin diskutiert, ebenfalls uneinheitliche Datenlage.' },
    ],
    labMarkers: ['crp', 'vitamin-d-25oh', 'calcium'],
    questionsForProfessional: [
      'Deuten Schwellung, Wärme oder Rötung auf eine entzündliche Ursache hin, die abgeklärt werden sollte?',
      'Wäre eine Blutuntersuchung sinnvoll?',
      'Wie lange sollte ich abwarten, bevor ich mich erneut vorstelle?',
    ],
    sources: [
      { label: 'NHS – Joint pain', url: 'https://www.nhs.uk/conditions/joint-pain/' },
      { label: 'NCCIH – Omega-3 Supplements', url: 'https://www.nccih.nih.gov/health/omega3-supplements-in-depth' },
    ],
  },

  {
    id: 'low-mood',
    label: 'Niedergeschlagene Stimmung',
    synonyms: ['stimmung', 'antriebslos', 'keine motivation', 'traurig', 'lustlos', 'ausgebrannt', 'innerlich leer', 'niedergeschlagen', 'depressiv', 'low mood', 'no motivation', 'sad', 'burnt out', 'listless', 'down'],
    intro:
      'Niedergeschlagene Stimmung und Antriebslosigkeit sind unspezifisch. Die Spanne reicht von vorübergehender Erschöpfung über psychische bis zu körperlichen Erkrankungen.',
    contextAreas: [
      'Schlafqualität und Schlafdauer',
      'Psychische Belastung: Stress, Trauer, Depression',
      'Schilddrüsenfunktion',
      'Medikamente, etwa Betablocker oder Hormonpräparate',
      'Veränderte Lebensumstände und Isolation',
      'Chronische Erkrankungen',
    ],
    redFlags: [
      'Die Beschwerden bestehen an den meisten Tagen über mehr als zwei Wochen durchgehend',
      'Es treten Gedanken an Selbstverletzung auf oder daran, nicht mehr leben zu wollen. Dafür gibt es jederzeit erreichbare Hilfe, etwa die Telefonseelsorge unter 0800 111 0 111 oder 0800 111 0 222',
      'Deutlicher ungewollter Gewichtsverlust oder deutliche Gewichtszunahme kommt hinzu',
      'Ausgeprägte körperliche Erschöpfung, Kälteempfindlichkeit und Konzentrationsprobleme treten gleichzeitig auf',
    ],
    relatedNutrients: [
      { substanceId: 'vitamin-d3', note: 'Wird diskutiert, die Studienlage ist uneinheitlich. NCCIH führt es nicht als etablierte Maßnahme bei Depression.' },
      { substanceId: 'vitamin-b12', note: 'Ein Mangel wird mit neurologischen und psychischen Symptomen verbunden, ein ursächlicher Zusammenhang mit der Stimmung ist nicht durchgängig belegt.' },
      { substanceId: 'omega-3', note: 'Untersucht mit gemischten Ergebnissen.' },
    ],
    labMarkers: ['tsh', 'ferritin', 'vitamin-d-25oh', 'vitamin-b12', 'folate', 'hemoglobin'],
    questionsForProfessional: [
      'Könnte die Schilddrüsenfunktion eine Rolle spielen?',
      'Welche Laborwerte sind hier sinnvoll und welche eher nicht?',
      'An wen kann ich mich wenden, wenn sich die Stimmung verschlechtert?',
    ],
    sources: [
      { label: 'NHS – Clinical depression', url: 'https://www.nhs.uk/mental-health/conditions/clinical-depression/symptoms/' },
      { label: 'NCCIH – Depression and Complementary Health Approaches', url: 'https://www.nccih.nih.gov/health/depression-and-complementary-health-approaches-what-the-science-says' },
    ],
  },

  {
    id: 'headache',
    label: 'Kopfschmerzen',
    synonyms: ['kopfschmerzen', 'kopfweh', 'migräne', 'migraene', 'druck im kopf', 'spannungskopfschmerz', 'headache', 'head ache', 'migraine', 'head pain'],
    intro:
      'Kopfschmerzen gehören zu den häufigsten und unspezifischsten Beschwerden. Die Auslöser reichen von harmlos bis abklärungsbedürftig.',
    contextAreas: [
      'Flüssigkeitshaushalt und ausgelassene Mahlzeiten',
      'Stress und Fehlhaltung',
      'Schlafmangel',
      'Häufige Einnahme von Schmerzmitteln, die selbst Kopfschmerzen auslösen kann',
      'Alkohol und Infekte',
      'Hormonelle Faktoren',
    ],
    redFlags: [
      'Beginnt plötzlich und außergewöhnlich stark',
      'Taubheit, Schwäche, Sprach-, Gleichgewichts- oder Gedächtnisprobleme kommen hinzu',
      'Tritt nach einer Kopfverletzung der letzten drei Monate auf',
      'Schläfrigkeit, Verwirrtheit oder ein Krampfanfall treten gleichzeitig auf',
      'Hohes Fieber, Nackensteifigkeit oder ein nicht wegdrückbarer Hautausschlag kommen dazu',
    ],
    relatedNutrients: [
      { substanceId: 'magnesium', note: 'Bei Migräne diskutiert, eine vorbeugende Wirkung ist nicht eindeutig gesichert.' },
      { substanceId: 'riboflavin', note: 'In der Migräneforschung genannt. Die in dieser Recherche erreichbaren Quellen reichen für eine belastbare Aussage nicht aus.' },
      { substanceId: 'coq10', note: 'In der Migräneforschung genannt, mit derselben Einschränkung zur Belegbarkeit.' },
    ],
    labMarkers: ['ferritin', 'crp', 'tsh'],
    questionsForProfessional: [
      'Handelt es sich um Spannungskopfschmerzen oder sollte das weiter abgeklärt werden?',
      'Könnte die regelmäßige Einnahme von Schmerzmitteln selbst eine Rolle spielen?',
      'Bei welchen Begleitsymptomen sollte ich sofort und nicht erst später kommen?',
    ],
    sources: [
      { label: 'NHS – Headaches', url: 'https://www.nhs.uk/conditions/headaches/' },
    ],
  },

  {
    id: 'recovery',
    label: 'Regeneration nach Sport',
    synonyms: ['regeneration', 'muskelkater', 'erholung', 'nach dem training', 'schlechte regeneration', 'übertraining', 'übertraining', 'recovery', 'sore muscles', 'doms', 'after training', 'overtraining'],
    intro:
      'Verzögerte Erholung und Krämpfe beim Sport haben viele mögliche Erklärungen und sind für sich genommen kein Beleg für einen Nährstoffmangel.',
    contextAreas: [
      'Trainingsbelastung, Hitze und Luftfeuchtigkeit',
      'Flüssigkeitshaushalt',
      'Schlafmenge und Schlafqualität',
      'Bestimmte Medikamente wie Statine oder Entwässerungsmittel',
      'Gesamte Energiezufuhr im Verhältnis zur Belastung',
    ],
    redFlags: [
      'Krämpfe stören regelmäßig den Schlaf',
      'Zusätzlich treten Taubheitsgefühle oder Schwellungen im Bein auf',
      'Ein Krampf hält länger als zehn Minuten an',
    ],
    relatedNutrients: [
      { substanceId: 'magnesium', note: 'Traditionell mit der Muskelfunktion verbunden. Krämpfe werden vom NHS nicht ausdrücklich als Mangelsymptom geführt.' },
      { substanceId: 'potassium', note: 'Im Zusammenhang mit Flüssigkeits- und Elektrolytverlust bei starkem Schwitzen diskutiert.' },
      { substanceId: 'creatine', note: 'Im Sportkontext gut untersucht, allerdings bezogen auf Kraftleistung, nicht auf Krämpfe.' },
    ],
    labMarkers: ['magnesium', 'calcium', 'creatinine', 'ferritin'],
    questionsForProfessional: [
      'Könnte ein Medikament die Krämpfe begünstigen?',
      'Wäre eine Bestimmung von Elektrolyten und Nierenwerten sinnvoll?',
      'Ab wann ist das kein reines Trainingsthema mehr?',
    ],
    sources: [
      { label: 'NHS – Leg cramps', url: 'https://www.nhs.uk/conditions/leg-cramps/' },
    ],
  },
];

export function getComplaint(id) {
  return COMPLAINTS.find((entry) => entry.id === id) ?? null;
}
