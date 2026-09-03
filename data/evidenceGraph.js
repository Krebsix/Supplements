/**
 * data/evidenceGraph.js
 * ─────────────────────────────────────────────────────────────
 * Roadmap-Baustein "Evidence Graph" (launch/roadmap-intelligence.md,
 * Abschnitt 5), Pilot: Magnesium. Wirkstoff x Anwendungsgebiet x
 * Evidenzsicherheit, mit woertlich uebernommener Kernaussage aus
 * systematischen Reviews (Cochrane bevorzugt) statt Einzelstudien.
 *
 * KEINE LLM-GENERIERTEN ZUSAMMENFASSUNGEN ALS QUELLE (Roadmap-Vorgabe):
 * jede `summary` fasst zusammen, was der Review selbst als Kernaussage
 * berichtet (Fallzahl, Sicherheitsgrad, Richtung des Effekts), nicht was
 * plausibel klingt. `certainty` uebernimmt die GRADE-Sicherheitsstufe,
 * wie der jeweilige Review sie selbst verwendet (Cochrane arbeitet
 * durchgehend mit GRADE) -- keine eigene Skala erfunden.
 *
 * evidenceDirection: 'benefit' (Review berichtet einen Effekt in die
 * erwartete Richtung) | 'no-benefit' (Review findet keinen belegbaren
 * Nutzen) | 'inconsistent' (Studienlage widerspruechlich). Deskriptiv,
 * keine Wertung des Praeparats.
 */

export const EVIDENCE_CERTAINTY = {
  HIGH: 'high',
  MODERATE: 'moderate',
  LOW: 'low',
  VERY_LOW: 'very-low',
};

export const evidenceGraph = {
  magnesium: [
    {
      outcome: 'muscle-cramps',
      population: 'Vorwiegend ältere Erwachsene mit idiopathischen Wadenkrämpfen',
      evidenceDirection: 'no-benefit',
      certainty: EVIDENCE_CERTAINTY.MODERATE,
      summary:
        'Der Cochrane-Review (Garrison 2020, 11 Studien, 735 Teilnehmende) findet für idiopathische Wadenkrämpfe bei keiner der untersuchten Dosierungen einen klinisch bedeutsamen Nutzen gegenüber Placebo. Für Wadenkrämpfe in der Schwangerschaft ist die Studienlage von geringerer Sicherheit, widersprüchlich und unklar.',
      sources: [
        {
          label: 'Cochrane: Magnesium for skeletal muscle cramps (Garrison 2020)',
          url: 'https://www.cochranelibrary.com/cdsr/doi/10.1002/14651858.CD009402.pub3/full',
        },
      ],
    },
    {
      outcome: 'migraine',
      population: 'Erwachsene mit Migräne, vorbeugende Einnahme',
      evidenceDirection: 'benefit',
      certainty: EVIDENCE_CERTAINTY.LOW,
      summary:
        'Ein Cochrane-Review (Rodriguez 2025) berichtet eine Verringerung von Häufigkeit und Schwere der Migräne, bei niedriger bis moderater Sicherheit der Evidenz und dem Hinweis auf weitere, groß angelegte Studien. Eine frühere systematische Übersichtsarbeit (von Luckner 2018, 2018;38(2)) stuft die Evidenz als Grad C ein (möglicherweise wirksam).',
      sources: [
        {
          label: 'Cochrane: Magnesium supplementation for migraine prophylaxis (Rodriguez 2025)',
          url: 'https://www.cochranelibrary.com/cdsr/doi/10.1002/14651858.CD016307/full',
        },
        {
          label: 'von Luckner & Riederer 2018, Headache 58(2): Magnesium in Migraine Prophylaxis',
          url: 'https://pubmed.ncbi.nlm.nih.gov/29131326/',
        },
      ],
    },
    {
      outcome: 'sleep',
      population: 'Erwachsene mit selbstberichtet schlechtem Schlaf',
      evidenceDirection: 'inconsistent',
      certainty: EVIDENCE_CERTAINTY.LOW,
      summary:
        'Einzelne randomisierte, placebokontrollierte Studien berichten Verbesserungen (z. B. Magnesiumbisglycinat 250 mg/Tag über 4 Wochen, kleiner Effekt, Insomnie-Index blieb im Sub-Schwellenbereich; Magnesium-L-Threonat 1 g/Tag über 21 Tage mit objektiv gemessener Verbesserung). Eine systematische Übersicht bei älteren Erwachsenen findet insgesamt nur begrenzte Evidenz für den Einsatz als frei verkäufliches Schlafmittel; die Studienlage gilt als uneinheitlich.',
      sources: [
        {
          label: 'BMC Complementary Medicine and Therapies 2021: Oral magnesium supplementation for insomnia in older adults',
          url: 'https://link.springer.com/article/10.1186/s12906-021-03297-z',
        },
        {
          label: 'Nature and Science of Sleep 2025: Magnesium Bisglycinate Supplementation in Healthy Adults Reporting Poor Sleep',
          url: 'https://pubmed.ncbi.nlm.nih.gov/40918053/',
        },
      ],
    },
  ],
};

/**
 * getEvidenceForSubstance(substanceId) => Array
 * Leerer Array statt null, damit Aufrufer immer ueber ein Array mappen
 * koennen (Konsistenz mit substance.useCases).
 */
export function getEvidenceForSubstance(substanceId) {
  return evidenceGraph[substanceId] ?? [];
}
