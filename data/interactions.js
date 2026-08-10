/**
 * data/interactions.js
 * Wechselwirkungen und Einnahme-Hinweise auf Ebene der KANONISCHEN
 * Wirkstoffe (data/substances.js), nicht des Beispiel-Inventars.
 *
 * Zwei Datensaetze:
 *   PAIR_RULES        Substanz-Paare, die sich bei gleichzeitiger
 *                     Einnahme messbar beeinflussen (Hemmung ODER
 *                     Foerderung der Aufnahme). Jede Regel nennt den
 *                     Mechanismus und ihre Quelle.
 *   INTAKE_GUIDANCE   Einnahme-Hinweise je Substanz (nuechtern, zur
 *                     Mahlzeit, viel trinken, Tageszeit), ebenfalls
 *                     mit Quelle.
 *
 * Formulierungs-Regeln (CLAUDE.md): deskriptiv, nie praeskriptiv.
 * "Die Aufnahme sinkt bei gleichzeitiger Einnahme" ist erlaubt;
 * "nimm X morgens" nicht. Ein zeitlicher Abstand wird als dokumentierte
 * Praxis benannt ("wird zeitlich getrennt eingenommen"), nicht als
 * Anweisung. Severity-Stufen wie in StackAnalyzer: 'critical' | 'notice'
 * | 'info'; 'synergy' fuer foerderliche Kombinationen.
 */

export const PAIR_RULES = [
  {
    a: 'iron',
    b: 'calcium',
    severity: 'notice',
    note: 'Calcium hemmt die Aufnahme von Eisen bei gleichzeitiger Einnahme. Die beiden werden üblicherweise zeitlich getrennt eingenommen (mehrere Stunden Abstand).',
    sources: [
      { label: 'NIH ODS: Iron Fact Sheet for Health Professionals', url: 'https://ods.od.nih.gov/factsheets/Iron-HealthProfessional/' },
    ],
  },
  {
    a: 'iron',
    b: 'zinc',
    severity: 'notice',
    note: 'Hochdosiertes Eisen und Zink konkurrieren um dieselben Aufnahmewege. Bei Supplement-Dosen beider Stoffe ist eine zeitlich getrennte Einnahme dokumentierte Praxis.',
    sources: [
      { label: 'NIH ODS: Zinc Fact Sheet for Health Professionals', url: 'https://ods.od.nih.gov/factsheets/Zinc-HealthProfessional/' },
    ],
  },
  {
    a: 'zinc',
    b: 'copper',
    severity: 'notice',
    note: 'Längerfristig hohe Zinkzufuhr senkt die Kupferaufnahme und kann einen Kupfermangel begünstigen. Kombipräparate berücksichtigen das häufig über ein festes Verhältnis.',
    sources: [
      { label: 'NIH ODS: Zinc Fact Sheet for Health Professionals', url: 'https://ods.od.nih.gov/factsheets/Zinc-HealthProfessional/' },
    ],
  },
  {
    a: 'calcium',
    b: 'magnesium',
    severity: 'info',
    note: 'Sehr hohe Dosen von Calcium und Magnesium können sich in der Aufnahme gegenseitig behindern. Bei üblichen Dosen ist der Effekt gering; hochdosierte Einzelpräparate werden häufig zeitlich getrennt.',
    sources: [
      { label: 'NIH ODS: Magnesium Fact Sheet for Health Professionals', url: 'https://ods.od.nih.gov/factsheets/Magnesium-HealthProfessional/' },
    ],
  },
  {
    a: 'calcium',
    b: 'zinc',
    severity: 'info',
    note: 'Hohe Calciumdosen können die Zinkaufnahme reduzieren. Der Effekt ist bei üblicher Ernährung klein, bei hochdosierten Präparaten wird zeitliche Trennung dokumentiert.',
    sources: [
      { label: 'NIH ODS: Zinc Fact Sheet for Health Professionals', url: 'https://ods.od.nih.gov/factsheets/Zinc-HealthProfessional/' },
    ],
  },
  {
    a: 'green-tea-extract-egcg',
    b: 'iron',
    severity: 'notice',
    note: 'Grüntee-Polyphenole (EGCG) binden Nicht-Häm-Eisen und senken dessen Aufnahme deutlich. Eisenpräparate und Grüntee-Extrakt werden zeitlich getrennt eingenommen.',
    sources: [
      { label: 'NIH ODS: Iron Fact Sheet for Health Professionals', url: 'https://ods.od.nih.gov/factsheets/Iron-HealthProfessional/' },
    ],
  },
  {
    a: 'iron',
    b: 'vitamin-c',
    severity: 'synergy',
    note: 'Vitamin C verbessert die Aufnahme von Nicht-Häm-Eisen bei gleichzeitiger Einnahme. Diese Kombination wird gezielt genutzt.',
    sources: [
      { label: 'NIH ODS: Iron Fact Sheet for Health Professionals', url: 'https://ods.od.nih.gov/factsheets/Iron-HealthProfessional/' },
    ],
  },
];

export const INTAKE_GUIDANCE = {
  iron: {
    note: 'Eisen wird nüchtern am besten aufgenommen, reizt dann aber häufiger den Magen. Kaffee und Tee senken die Aufnahme; ein Abstand von 1 bis 2 Stunden ist dokumentierte Praxis.',
    sources: [
      { label: 'NIH ODS: Iron Fact Sheet for Health Professionals', url: 'https://ods.od.nih.gov/factsheets/Iron-HealthProfessional/' },
    ],
  },
  psyllium: {
    note: 'Flohsamenschalen quellen stark: immer mit reichlich Flüssigkeit einnehmen. Zu anderen Präparaten und Medikamenten wird ein Abstand von etwa 2 Stunden eingehalten, weil die Quellstoffe die Aufnahme verzögern.',
    sources: [
      { label: 'NIH ODS: Dietary Supplements for Weight Loss (Fiber)', url: 'https://ods.od.nih.gov/factsheets/WeightLoss-HealthProfessional/' },
    ],
  },
  caffeine: {
    note: 'Koffein hat eine Halbwertszeit von mehreren Stunden; eine Einnahme am späteren Tag kann den Schlaf beeinträchtigen. Die EFSA nennt als unbedenkliche Einzeldosis etwa 3 mg je kg Körpergewicht: bei 60 kg rund 180 mg, bei 80 kg rund 240 mg.',
    sources: [
      { label: 'EFSA: Scientific Opinion on the safety of caffeine', url: 'https://www.efsa.europa.eu/en/efsajournal/pub/4102' },
    ],
  },
  melatonin: {
    note: 'Melatonin wird in Studien üblicherweise kurz vor dem Zubettgehen eingesetzt; eine Einnahme am Tag kann müde machen.',
    sources: [
      { label: 'NCCIH: Melatonin', url: 'https://www.nccih.nih.gov/health/melatonin-what-you-need-to-know' },
    ],
  },
  creatine: {
    note: 'Bei Kreatin ist der Einnahmezeitpunkt für die Wirkung zweitrangig; auf ausreichende Flüssigkeitszufuhr wird in der Anwendung geachtet.',
    sources: [
      { label: 'NIH ODS: Dietary Supplements for Exercise and Athletic Performance', url: 'https://ods.od.nih.gov/factsheets/ExerciseAndAthleticPerformance-HealthProfessional/' },
    ],
  },
};

/**
 * Fettloesliche Stoffe (fatSoluble: true in substances.js) tragen ihren
 * Mahlzeit-Hinweis nicht hier, sondern generisch: Die Aufnahme steigt
 * mit einer fetthaltigen Mahlzeit. Der Text lebt in i18n
 * (logic.fatSoluble), damit er nicht je Substanz dupliziert wird.
 */
