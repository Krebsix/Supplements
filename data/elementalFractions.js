/**
 * data/elementalFractions.js
 * ─────────────────────────────────────────────────────────────
 * Massenanteil des Wirkstoff-Elements in einer chemischen Verbindung.
 *
 * WARUM DAS NOETIG IST:
 * 500 mg Magnesiumcitrat sind NICHT 500 mg Magnesium. Das Citrat-Molekuel
 * macht den Grossteil der Masse aus — enthalten sind rund 81 mg elementares
 * Magnesium. Referenzwerte und Obergrenzen (data/referenceValues.js) beziehen
 * sich immer auf die ELEMENTARE Menge. Ohne Umrechnung vergleicht die App
 * Verbindungsmasse gegen Elementgrenzwert und warnt falsch.
 *
 * WANN DIE APP UMRECHNEN DARF — die entscheidende Abgrenzung:
 * Nach Richtlinie 2002/46/EG und LMIV (VO (EU) 1169/2011) MUSS die
 * Naehrwerttabelle eines Nahrungsergaenzungsmittels die elementare Menge
 * ausweisen ("Magnesium 300 mg"); die Verbindung steht daneben in der
 * Zutatenliste. Eine korrekt gelesene Tabellenzeile darf deshalb NICHT
 * umgerechnet werden — das wuerde den Wert faelschlich verkleinern.
 *
 * Umgerechnet wird nur, wenn die Mengenangabe erkennbar an der VERBINDUNG
 * haengt ("Magnesiumcitrat 1500 mg") — typisch fuer Marketingaufdrucke auf
 * der Packungsvorderseite und fuer manuell eingetippte Angaben.
 * Die Entscheidung darueber trifft DoseNormalizer.js, nicht diese Datei.
 *
 * GRUNDSATZ (wie ueberall in dieser App): keine erfundenen Werte.
 * Verbindungen ohne feste Stoechiometrie — etwa proprietaere Chelate mit
 * variablem Metall-zu-Aminosaeure-Verhaeltnis — stehen hier bewusst NICHT
 * drin. Fehlt ein Eintrag, rechnet die App nicht, sondern weist die Angabe
 * als klaerungsbeduerftig aus.
 *
 * Alle Werte sind Stoechiometrie: Elementmasse geteilt durch Molmasse,
 * berechnet mit den IUPAC/CIAAW-Standardatomgewichten und gegen PubChem
 * geprueft. `note` haelt fest, auf welchen Hydratzustand sich der Wert
 * bezieht — das ist der haeufigste Grund fuer Abweichungen.
 */

/**
 * fraction: Massenanteil des Elements (0–1)
 * note:     worauf sich der Wert bezieht / warum er schwanken kann
 * varies:   true = Handelsware weicht regelmaessig ab, Wert ist ein Richtwert
 */
export const elementalFractions = {
  magnesium: {
    Bisglycinat: {
      fraction: 0.141,
      note: 'Mg(C2H4NO2)2, 172,4 g/mol. Dihydrat-Chelate liegen niedriger.',
      varies: true,
    },
    Citrat: {
      fraction: 0.162,
      note: 'Mg3(C6H5O7)2 wasserfrei, 451,1 g/mol. Tetrahydrat rund 14,9 %, Nonahydrat rund 11,9 %.',
      varies: true,
    },
    Malat: {
      fraction: 0.155,
      note: 'MgC4H4O5, 156,4 g/mol.',
    },
    'L-Threonat': {
      fraction: 0.083,
      note: 'Mg(C4H7O5)2, 294,5 g/mol — der niedrigste Elementanteil der gaengigen Magnesiumformen.',
    },
    Oxid: {
      fraction: 0.603,
      note: 'MgO, 40,3 g/mol.',
    },
    Carbonat: {
      fraction: 0.288,
      note: 'MgCO3, 84,3 g/mol. Handelsueblich oft basisches Carbonat/Hydromagnesit mit rund 24–29 %.',
      varies: true,
    },
  },

  calcium: {
    Citrat: {
      fraction: 0.211,
      note: 'Ca3(C6H5O7)2·4H2O, 570,5 g/mol. Wasserfrei rund 24,1 %.',
      varies: true,
    },
    Carbonat: {
      fraction: 0.4,
      note: 'CaCO3, 100,1 g/mol.',
    },
    Gluconat: {
      fraction: 0.089,
      note: 'Ca(C6H11O7)2·H2O, 448,4 g/mol. Wasserfrei rund 9,3 %.',
      varies: true,
    },
  },

  iron: {
    Bisglycinat: {
      fraction: 0.274,
      note: 'FeC4H8N2O4, 204,0 g/mol (reine Stoechiometrie). Kommerzielle Chelate deklarieren wegen Hydratanteil und Reinheitsspezifikation haeufig nur rund 20 % — Herstellerangabe hat Vorrang.',
      varies: true,
    },
    Sulfat: {
      fraction: 0.201,
      note: 'FeSO4·7H2O, 278,0 g/mol. Getrocknetes Eisensulfat (Monohydrat) liegt bei rund 32,9 %.',
      varies: true,
    },
    Fumarat: {
      fraction: 0.329,
      note: 'FeC4H2O4, 169,9 g/mol.',
    },
    Gluconat: {
      fraction: 0.116,
      note: 'Fe(C6H11O7)2·2H2O, 482,2 g/mol. Wasserfrei rund 12,5 %.',
      varies: true,
    },
  },

  zinc: {
    Bisglycinat: {
      fraction: 0.306,
      note: 'ZnC4H8N2O4, 213,5 g/mol. Dihydrat-Chelate liegen bei rund 26 %.',
      varies: true,
    },
    Picolinat: {
      fraction: 0.211,
      note: 'Zn(C6H4NO2)2, 309,6 g/mol.',
    },
    Citrat: {
      fraction: 0.321,
      note: 'Zn3(C6H5O7)2·2H2O, 610,4 g/mol. Wasserfrei rund 34,2 %.',
      varies: true,
    },
    Gluconat: {
      fraction: 0.143,
      note: 'Zn(C6H11O7)2, 455,7 g/mol.',
    },
    Oxid: {
      fraction: 0.803,
      note: 'ZnO, 81,4 g/mol.',
    },
  },

  potassium: {
    Citrat: {
      fraction: 0.362,
      note: 'K3C6H5O7·H2O, 324,4 g/mol. Wasserfrei rund 38,3 %.',
      varies: true,
    },
    Chlorid: {
      fraction: 0.524,
      note: 'KCl, 74,5 g/mol.',
    },
  },

  selenium: {
    'L-Selenomethionin': {
      fraction: 0.403,
      note: 'C5H11NO2Se, 196,1 g/mol.',
    },
    Natriumselenit: {
      fraction: 0.457,
      note: 'Na2SeO3 wasserfrei, 172,9 g/mol. Pentahydrat rund 30 %.',
      varies: true,
    },
  },

  iodine: {
    Kaliumiodid: {
      fraction: 0.764,
      note: 'KI, 166,0 g/mol.',
    },
    // Algenpulver (Kelp) bewusst ohne Wert: Jodgehalt schwankt je nach Art,
    // Erntegebiet und Charge um Groessenordnungen. Hier waere jede Zahl geraten.
  },

  chromium: {
    Chrompicolinat: {
      fraction: 0.124,
      note: 'Cr(C6H4NO2)3, 418,3 g/mol.',
    },
    Chromchlorid: {
      fraction: 0.195,
      note: 'CrCl3·6H2O, 266,4 g/mol.',
    },
    // Chromhefe ohne Wert: biologische Matrix, kein stoechiometrischer Anteil.
  },

  manganese: {
    Manganbisglycinat: {
      fraction: 0.271,
      note: 'MnC4H8N2O4, 203,1 g/mol.',
    },
    Mangansulfat: {
      fraction: 0.325,
      note: 'MnSO4·H2O, 169,0 g/mol.',
    },
    Manganchlorid: {
      fraction: 0.278,
      note: 'MnCl2·4H2O, 197,9 g/mol. Wasserfrei rund 43,7 %.',
      varies: true,
    },
  },

  copper: {
    Kupferbisglycinat: {
      fraction: 0.3,
      note: 'CuC4H8N2O4, 211,7 g/mol.',
    },
    Kupfergluconat: {
      fraction: 0.14,
      note: 'Cu(C6H11O7)2, 453,8 g/mol.',
    },
    Kupfersulfat: {
      fraction: 0.255,
      note: 'CuSO4·5H2O, 249,7 g/mol.',
    },
  },

  molybdenum: {
    Natriummolybdat: {
      fraction: 0.397,
      note: 'Na2MoO4·2H2O, 242,0 g/mol.',
    },
    // Molybdaenglycinat bewusst ohne Wert: proprietaeres Chelat ohne
    // einheitliche Summenformel, das Metall-zu-Glycin-Verhaeltnis ist
    // herstellerabhaengig. Nur das Analysenzertifikat gibt hier Auskunft.
  },

  boron: {
    'Natriumborat/Borax': {
      fraction: 0.113,
      note: 'Na2B4O7·10H2O, 381,4 g/mol.',
    },
    // Bor-Chelat ohne Wert: keine definierte Stoechiometrie.
  },

  silicium: {
    'Siliciumdioxid (SiO2)': {
      fraction: 0.467,
      note: 'SiO2, 60,1 g/mol.',
    },
    // Kieselsaeure/Silicagel, cholin-stabilisierte Orthokieselsaeure und
    // Monomethylsilantriol bewusst ohne Wert: Silicium-Gehalt haengt vom
    // Wassergehalt bzw. der Zubereitung ab (siehe cautionNote der Substanz,
    // die BfR-Hoechstmengen unterscheiden sich um das rund 35-Fache).
  },
};

/**
 * Bezeichnungen, die das REINE ELEMENT meinen — nicht eine Verbindung.
 *
 * Noetig, weil `synonyms` in data/substances.js bewusst beides mischt:
 * "magnesium" (Element) steht dort neben "magnesiumcitrat" (Verbindung),
 * damit der Scanner beide Schreibweisen trifft. Fuer die Mengenfrage ist
 * der Unterschied aber entscheidend, deshalb hier explizit gepflegt statt
 * per Heuristik geraten.
 *
 * Findet DoseNormalizer.js einen dieser Begriffe als eigenstaendiges Wort,
 * gilt die Mengenangabe als elementar — so schreibt es auch das
 * Lebensmittelrecht fuer die Naehrwerttabelle vor.
 *
 * Einheitenkuerzel ("mg") stehen bewusst NICHT drin, sonst wuerde jede
 * Milligramm-Angabe faelschlich als Magnesium-Elementangabe gelesen.
 */
export const elementTerms = {
  magnesium: ['magnesium'],
  calcium: ['calcium', 'kalzium'],
  iron: ['eisen', 'iron', 'ferrum'],
  zinc: ['zink', 'zinc'],
  potassium: ['kalium', 'potassium'],
  selenium: ['selen', 'selenium'],
  iodine: ['jod', 'iod', 'iodine'],
  chromium: ['chrom', 'chromium'],
  manganese: ['mangan', 'manganese'],
  copper: ['kupfer', 'copper', 'cuprum'],
  molybdenum: ['molybdaen', 'molybdän', 'molybdenum'],
  boron: ['bor', 'boron'],
  silicium: ['silicium', 'silizium', 'silicon'],
};

/**
 * getElementalFraction(substanceId, formName)
 * Gibt {fraction, note, varies} zurueck oder null, wenn fuer diese Form
 * kein belastbarer Wert hinterlegt ist.
 */
export function getElementalFraction(substanceId, formName) {
  if (!substanceId || !formName) return null;
  const entry = elementalFractions[substanceId]?.[formName];
  if (!entry || !Number.isFinite(entry.fraction)) return null;
  return {
    fraction: entry.fraction,
    note: entry.note ?? '',
    varies: Boolean(entry.varies),
  };
}

/**
 * hasElementalData(substanceId)
 * True, wenn fuer diese Substanz ueberhaupt Verbindungsformen hinterlegt
 * sind — also die Unterscheidung Verbindung/Element relevant ist.
 * Bei Vitaminen und Pflanzenstoffen ist sie das meist nicht.
 */
export function hasElementalData(substanceId) {
  return Boolean(elementalFractions[substanceId]);
}
