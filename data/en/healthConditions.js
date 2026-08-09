/**
 * data/en/healthConditions.js
 * ─────────────────────────────────────────────────────────────
 * English overlay for data/healthConditions.js — same rule as
 * data/en/medicationClasses.js: every quote below is a literal,
 * verbatim substring of the reviewed English cautionNote overlay in
 * data/en/substances.js (programmatically extracted, never a fresh
 * translation). tests/health-conditions.test.mjs enforces this.
 */

export const HEALTH_CONDITIONS_EN = {
  'hypertension': { label: 'High blood pressure' },
  'heart-disease': { label: 'Heart disease' },
  'kidney-disease': { label: 'Kidney disease' },
  'liver-disease': { label: 'Liver disease' },
  'gallbladder-disease': { label: 'Gallbladder disease / gallstones' },
  'salicylate-intolerance': { label: 'Salicylate intolerance / ASA allergy' },
  'asthma-analgesics': { label: 'Asthma (triggered by pain relievers)' },
  'stomach-ulcer': { label: 'Gastrointestinal ulcers' },
};

export const CONDITION_QUOTES_EN = {
  'hypertension': {
    'licorice-root':
      'With regularly high intake, glycyrrhizin can raise blood pressure and lower potassium levels.',
    'sodium':
      'Anyone advised to restrict sodium because of high blood pressure, heart or kidney disease discusses electrolyte products with a doctor.',
  },
  'kidney-disease': {
    'licorice-root':
      'Not with high blood pressure, kidney or liver disease, and not in pregnancy.',
    'sodium':
      'Anyone advised to restrict sodium because of high blood pressure, heart or kidney disease discusses electrolyte products with a doctor.',
    'goldenrod':
      'Do not use if fluid intake is restricted because of heart or kidney disease.',
    'birch-leaf':
      'Do not use if fluid intake is restricted because of heart or kidney disease.',
    'horsetail':
      'Drink enough fluid when flushing; not with restricted fluid intake due to heart or kidney disease.',
    'lovage-root':
      'Drink enough fluid when flushing; not with restricted fluid intake due to heart or kidney disease.',
    'nettle-leaf':
      'Drink enough fluid when flushing; not with restricted fluid intake due to heart or kidney disease.',
    'horse-chestnut':
      'Clarify use with a doctor in pregnancy, breastfeeding and with kidney or liver disease.',
  },
  'liver-disease': {
    'licorice-root':
      'Not with high blood pressure, kidney or liver disease, and not in pregnancy.',
    'peppermint-oil':
      'Not with bile duct obstruction, gallbladder inflammation or severe liver damage.',
    'cinnamon':
      'Cassia cinnamon contains coumarin, which can strain the liver in regularly high amounts (BfR assessment); for regular intake, prefer Ceylon cinnamon.',
    'horse-chestnut':
      'Clarify use with a doctor in pregnancy, breastfeeding and with kidney or liver disease.',
  },
  'heart-disease': {
    'hawthorn':
      'Heart complaints always belong in medical evaluation; hawthorn is no substitute for heart medication.',
    'motherwort':
      'Heart complaints always belong in medical evaluation.',
    'sodium':
      'Anyone advised to restrict sodium because of high blood pressure, heart or kidney disease discusses electrolyte products with a doctor.',
  },
  'salicylate-intolerance': {
    'willow-bark':
      'Not with salicylate intolerance or asthma triggered by pain relievers (ASA).',
    'meadowsweet':
      'Contains salicylates: not with salicylate intolerance or ASA allergy, not for children and adolescents with feverish infections.',
  },
  'gallbladder-disease': {
    'ginger':
      'With gallstones, clarify use with a doctor first.',
    'artichoke':
      'Not with bile duct obstruction; with gallstones only after consulting a doctor.',
    'peppermint-oil':
      'Not with bile duct obstruction, gallbladder inflammation or severe liver damage.',
    'dandelion':
      'Not with bile duct obstruction or active gallstones; with biliary disease, clarify use with a doctor.',
    'wormwood':
      'Not with bile duct obstruction or gastrointestinal ulcers.',
  },
  'asthma-analgesics': {
    'willow-bark':
      'Not with salicylate intolerance or asthma triggered by pain relievers (ASA).',
  },
  'stomach-ulcer': {
    'wormwood':
      'Not with bile duct obstruction or gastrointestinal ulcers.',
  },
};
