/**
 * data/en/certifications.js
 * ─────────────────────────────────────────────────────────────
 * English text overlay for data/certifications.js. German stays
 * canonical; this file supplies English text for the certification
 * catalog.
 *
 * STRUCTURE
 *   CERTIFICATIONS_EN[cert.id] = { what: string, scope: string }
 *   kindLabels[kindValue] = string   // overlay of KIND_LABELS
 *
 * SCOPE DECISIONS:
 * - `what` and `scope` are overlaid for every certification: they are
 *   genuine descriptive prose, and `scope` is the field the source
 *   task calls out explicitly ("insbesondere scope-Beschreibungen").
 * - `name` is NOT overlaid. Certification names are treated as
 *   official/proper names of real-world seals (e.g. "Kölner Liste",
 *   "USP Verified", "GMP") and are kept as-is, the way "TÜV" or "CE"
 *   would be — translating them would make the app describe a seal
 *   under a name that does not match what a shopper actually sees on
 *   the product. The English synonym for "Kölner Liste" ("cologne
 *   list") already exists in `synonyms` in the DE source for matching
 *   purposes.
 * - `issuer` is NOT overlaid for the same reason: it names real
 *   organisations (e.g. "Olympiastützpunkt Rheinland / Zentrum für
 *   Präventive Dopingforschung, Köln"), and those names are not
 *   translated in international use.
 * - `kindLabels` overlays `KIND_LABELS` (the shared 4-value lookup for
 *   CERTIFICATION_KIND) as a bonus, for the same reason
 *   `severityLabels` was added for lifeStageAdvisories: it is short,
 *   genuinely German UI text, and leaving it out would mean the
 *   English UI still shows "Reinheit"/"Herstellung"/"Deklaration"/
 *   "Herkunft" badges next to translated certification text.
 *
 * WORDING RULES (compliance-critical, see project CLAUDE.md):
 * - Descriptive only: what a certification checks, and explicitly
 *   what it does NOT cover. No claim that a certified product is
 *   "better" or "recommended".
 * - No em dash ("—") in any of these strings.
 */

export const CERTIFICATIONS_EN = {
  'amg-arzneimittel': {
    what: 'Manufactured under an official manufacturing licence per Section 13 of the German Medicinal Products Act (AMG), with GMP supervision by the state authority.',
    scope: 'Legal status of the product class, not a product-specific laboratory test. Says nothing about suitability or dosage in the individual case; the package leaflet applies.',
  },
  'koelner-liste': {
    what:
      'Testing for doping substances (anabolic agents, stimulants) by an accredited laboratory. Batch-specific and publicly viewable.',
    scope:
      'Says nothing about effectiveness, dosage or the rest of the composition. Testing covers doping relevance only.',
  },
  'informed-sport': {
    what:
      'Batch-by-batch laboratory testing for substances prohibited under the WADA list. Each batch receives its own verifiable number.',
    scope: 'Doping control only. No statement about effectiveness or nutrient content.',
  },
  'nsf-sport': {
    what:
      'Tests for over 280 prohibited substances, and additionally checks that the label matches the contents and inspects the production site.',
    scope:
      'Covers doping and label accuracy, but makes no statement about whether an ingredient is useful for the user.',
  },
  'usp-verified': {
    what:
      'Checks whether the declared active substances are present in the stated amount, whether the capsule dissolves in the body, and whether contaminant limits are met.',
    scope:
      'The most informative label for "what is on the label is what is inside". It does not assess whether the product is sensibly formulated.',
  },
  gmp: {
    what:
      'Good Manufacturing Practice: documented standards for the manufacturing process, hygiene and traceability.',
    scope:
      'Concerns the manufacturing process only. A GMP reference says nothing about the contents of the product.',
  },
  ifos: {
    what:
      'Specific to omega-3 products: checks EPA/DHA content, oxidation level (rancidity), and heavy metal and dioxin contamination.',
    scope:
      'Relevant only for fish and algae oils. The oxidation value is really the figure of interest here.',
  },
  'eu-bio': {
    what: 'Confirms organic production of the raw materials under the EU Organic Regulation.',
    scope:
      'A statement about cultivation, not about the purity of the finished product, active substance content or bioavailability.',
  },
  'vegan-label': {
    what:
      'Confirms that no animal-derived ingredients are contained, relevant for example with gelatine capsules, vitamin D3 and omega-3.',
    scope: 'A statement about the origin of the ingredients, not about quality or effectiveness.',
  },
};

export const kindLabels = {
  purity: 'Purity',
  manufacturing: 'Manufacturing',
  content: 'Declaration',
  origin: 'Origin',
};

export function getCertificationOverlay(id) {
  return CERTIFICATIONS_EN[id] ?? null;
}
