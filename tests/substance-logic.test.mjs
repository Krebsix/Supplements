import { matchIngredient } from '../SubstanceMatcher.js';
import { buildSubstanceProfile, checkAgainstReference } from '../ReferenceCheck.js';
import { substances } from '../data/substances.js';
import { referenceValues, LIFE_STAGE_IDS } from '../data/referenceValues.js';

let failed = 0;
function check(name, cond, extra = '') {
  if (cond) { console.log(`  ok   ${name}`); }
  else { console.log(`  FAIL ${name} ${extra}`); failed++; }
}

console.log('\n— Matching —');
const m1 = matchIngredient({ name: 'Magnesiumbisglycinat', amount: '200', unit: 'mg' });
check('Magnesiumbisglycinat → magnesium', m1.substanceId === 'magnesium', JSON.stringify(m1.substanceId));
check('Form Bisglycinat erkannt', m1.form?.name === 'Bisglycinat', m1.form?.name);

const m2 = matchIngredient('Magnesium (Citrat) – 400 mg');
check('Freitext → magnesium', m2.substanceId === 'magnesium');
check('Form Citrat aus Freitext', m2.form?.name === 'Citrat', m2.form?.name);

const m3 = matchIngredient({ name: 'Vitamin D3', amount: '25', unit: 'mcg' });
check('mcg → µg normalisiert', m3.unit === 'µg', m3.unit);

const m4 = matchIngredient({ name: 'Irgendein Kräuterblend', amount: '', unit: '' });
check('Unbekanntes bleibt unmatched', m4.matched === false);

const m5 = matchIngredient({ name: 'MK-7', amount: '100', unit: 'µg' });
check('MK-7 → vitamin-k2', m5.substanceId === 'vitamin-k2', m5.substanceId);

console.log('\n— Referenzwert-Abgleich —');
const c1 = checkAgainstReference(m1, 'adult-woman');
check('200mg Mg Frau → below (Ref 300)', c1.status === 'below', c1.status);

const c2 = checkAgainstReference(m2, 'adult-woman');
check('400mg Mg → above_limit (UL 250)', c2.status === 'above_limit', c2.status);

// Vitamin D Einheitenumrechnung: 25 µg = 1000 IE, Referenz 800 IE, UL 4000
const c3 = checkAgainstReference(m3, 'adult-woman');
check('25µg VitD → 1000 IE umgerechnet', Math.round(c3.amount) === 1000, c3.amount);
check('1000 IE → above_reference', c3.status === 'above_reference', c3.status);

// Kind: engere Grenzen
const c4 = checkAgainstReference(m3, 'child-4-10');
check('1000 IE bei Kind → above_reference (UL 2000)', c4.status === 'above_reference', c4.status);

const mZinc = matchIngredient({ name: 'Zink', amount: '15', unit: 'mg' });
check('15mg Zink Kind → above_limit (UL 10)', checkAgainstReference(mZinc, 'child-4-10').status === 'above_limit');
check('15mg Zink Frau → above_reference (Ref 8, UL 25)', checkAgainstReference(mZinc, 'adult-woman').status === 'above_reference');

// Ohne Menge: kein Absturz, Status unknown
const mNoAmount = matchIngredient({ name: 'Selen' });
check('Ohne Menge → unknown', checkAgainstReference(mNoAmount, 'adult-woman').status === 'unknown');

console.log('\n— Profil —');
const p = buildSubstanceProfile(m1, 'menopause');
check('Profil hat Anwendungsgebiete', p.useCases.length > 0);
check('Krämpfe als Anwendungsgebiet', p.useCases.some(u => u.topic.toLowerCase().includes('krämpfe')));

console.log('\n— Falsch-Treffer-Schutz —');
for (const junk of ['Irgendein Kräuterblend', 'Kokosöl', 'Reismehl', 'Kieselerde', 'Inulin']) {
  const r = matchIngredient({ name: junk });
  check(`"${junk}" nicht falsch zugeordnet`, r.matched === false, r.substanceId ?? '');
}
const zinkMg = matchIngredient('Zink 10 mg');
check('"Zink 10 mg" → zinc, nicht magnesium', zinkMg.substanceId === 'zinc', zinkMg.substanceId);
check('"Zink 10 mg" Menge geparst', zinkMg.amount === 10 && zinkMg.unit === 'mg');
check('allForms für Vergleich vorhanden', p.allForms.length >= 5, p.allForms.length);

console.log('\n— Datenintegrität —');
const ids = substances.map(s => s.id);
check('Substanz-IDs eindeutig', new Set(ids).size === ids.length);
check('Alle Substanzen haben useCases', substances.every(s => s.useCases?.length > 0));
check('Alle Substanzen haben forms', substances.every(s => s.forms?.length > 0));
check('Alle Substanzen haben what', substances.every(s => s.what?.length > 20));

// Substanzen, bei denen fehlende Lebensphasen ABSICHTLICH sind, weil keine
// Behoerde (EFSA/DGE/BfR) fuer diese Gruppe einen Wert veroeffentlicht hat.
// Lieber Luecke als erfundener Wert (siehe CLAUDE.md "Keine erfundenen Werte").
const INTENTIONAL_COVERAGE_GAPS = {
  manganese: ['child-4-10', 'teen-11-17'],
  copper: ['child-4-10', 'teen-11-17'],
  betaine: ['child-4-10', 'teen-11-17'],
  astaxanthin: ['child-4-10', 'teen-11-17'],
  resveratrol: ['child-4-10', 'teen-11-17', 'pregnancy', 'breastfeeding', 'menopause', 'senior'],
  pqq: ['child-4-10', 'teen-11-17', 'pregnancy', 'breastfeeding', 'menopause', 'senior'],
  spermidine: ['child-4-10', 'teen-11-17', 'pregnancy', 'breastfeeding', 'menopause', 'senior'],
  'green-tea-extract-egcg': ['child-4-10', 'teen-11-17', 'pregnancy', 'breastfeeding', 'menopause', 'senior'],
  caffeine: ['child-4-10', 'teen-11-17', 'menopause', 'senior'],
  'nicotinamide-riboside': ['child-4-10', 'teen-11-17', 'menopause', 'senior'],
};

for (const [sid, entry] of Object.entries(referenceValues)) {
  if (!ids.includes(sid)) { console.log(`  FAIL Referenzwert für unbekannte Substanz: ${sid}`); failed++; }
  const allowedGaps = INTENTIONAL_COVERAGE_GAPS[sid] ?? [];
  const missing = LIFE_STAGE_IDS.filter(ls => !entry.values[ls] && !allowedGaps.includes(ls));
  if (missing.length) { console.log(`  FAIL ${sid} fehlen unerwartet Lebensphasen: ${missing}`); failed++; }
}
check('Referenzwerte vollständig über alle Lebensphasen (außer dokumentierten Lücken)', true);

// Referenzwert-Einheit muss zur Substanz-Einheit passen
for (const [sid, entry] of Object.entries(referenceValues)) {
  const sub = substances.find(s => s.id === sid);
  if (sub && sub.unit !== entry.unit) {
    console.log(`  FAIL Einheiten-Mismatch ${sid}: Substanz ${sub.unit} vs Referenz ${entry.unit}`);
    failed++;
  }
}
check('Einheiten konsistent zwischen Substanz und Referenzwert', true);

console.log('\n— Lebensphasen-Hinweise (Phase 3) —');
const pregVitA = buildSubstanceProfile(matchIngredient({ name: 'Retinol', amount: '800', unit: 'µg' }), 'pregnancy');
check('Vitamin A → Retinol erkannt', pregVitA.substanceId === 'vitamin-a', pregVitA.substanceId);
check('Retinol in Schwangerschaft → contraindicated',
  pregVitA.advisories.some(a => a.severity === 'contraindicated'), JSON.stringify(pregVitA.advisories.map(a=>a.severity)));
check('Schwerster Hinweis steht zuerst', pregVitA.advisories[0]?.severity === 'contraindicated');

const manVitA = buildSubstanceProfile(matchIngredient({ name: 'Retinol', amount: '800', unit: 'µg' }), 'adult-man');
check('Retinol bei Mann → keine Kontraindikation',
  !manVitA.advisories.some(a => a.severity === 'contraindicated'));

const childAshwa = buildSubstanceProfile(matchIngredient({ name: 'Ashwagandha' }), 'child-4-10');
check('Ashwagandha bei Kind → contraindicated',
  childAshwa.advisories.some(a => a.severity === 'contraindicated'));

const k2 = buildSubstanceProfile(matchIngredient({ name: 'MK-7' }), 'adult-man');
check('Vitamin K2 → "all"-Hinweis greift in jeder Phase',
  k2.advisories.some(a => a.severity === 'medical'));

const manIron = buildSubstanceProfile(matchIngredient({ name: 'Eisen', amount: '20', unit: 'mg' }), 'adult-man');
check('Eisen bei Mann → attention-Hinweis', manIron.advisories.some(a => a.severity === 'attention'));

// Advisories duerfen nur bekannte Substanzen und Lebensphasen referenzieren
const { advisories: advMap } = await import('../data/lifeStageAdvisories.js');
for (const [sid, list] of Object.entries(advMap)) {
  if (!ids.includes(sid)) { console.log(`  FAIL Advisory fuer unbekannte Substanz: ${sid}`); failed++; }
  for (const entry of list) {
    if (entry.lifeStages !== 'all') {
      const bad = entry.lifeStages.filter(ls => !LIFE_STAGE_IDS.includes(ls));
      if (bad.length) { console.log(`  FAIL ${sid} unbekannte Lebensphase: ${bad}`); failed++; }
    }
    if (!entry.text || entry.text.length < 20) { console.log(`  FAIL ${sid} Advisory-Text zu kurz`); failed++; }
  }
}
check('Advisories referenzieren nur bekannte IDs', true);

console.log('\n— Zertifizierungen (Phase 4) —');
const { matchCertifications, certifications } = await import('../data/certifications.js');
const certRes = matchCertifications(['Kölner Liste', 'USP Verified', 'Premium Qualität']);
check('Kölner Liste erkannt', certRes.matched.some(c => c.id === 'koelner-liste'));
check('USP Verified erkannt', certRes.matched.some(c => c.id === 'usp-verified'));
check('Werbeaussage bleibt unknown', certRes.unknown.includes('Premium Qualität'));
check('Alle Siegel haben scope-Feld', certifications.every(c => c.scope?.length > 20));
check('Leere Eingabe → leeres Ergebnis', matchCertifications([]).matched.length === 0);
check('Keine Herstellernamen in der Siegel-DB',
  !certifications.some(c => /sunday|natural|now foods|doppelherz|orthomol/i.test(c.name)));

console.log('\n— Erweiterung Juli 2026: neue Substanzen —');
check('Substanz-Datenbank hat 150 Einträge', substances.length === 150, substances.length);

const biotinMatch = matchIngredient({ name: 'Biotin', amount: '50', unit: 'µg' });
check('Biotin erkannt', biotinMatch.substanceId === 'biotin', biotinMatch.substanceId);
check('Biotin 50µg Frau → above_reference (Ref 40)',
  checkAgainstReference(biotinMatch, 'adult-woman').status === 'above_reference');

const ginkgoMatch = matchIngredient({ name: 'Ginkgo Biloba' });
const ginkgoPreg = buildSubstanceProfile(ginkgoMatch, 'pregnancy');
check('Ginkgo in Schwangerschaft → contraindicated',
  ginkgoPreg.advisories.some(a => a.severity === 'contraindicated'));

const nacMatch = matchIngredient({ name: 'N-Acetylcystein' });
check('NAC erkannt', nacMatch.substanceId === 'n-acetylcysteine', nacMatch.substanceId);
check('NAC hat regulatorischen Hinweis in cautionNote',
  /regulatorisch/i.test(nacMatch.substance.cautionNote));

console.log('\n— SAFE_LEVEL-Status (Substanzen ohne Referenzwert, nur Obergrenze) —');
const betaineLow = matchIngredient({ name: 'Betain', amount: '200', unit: 'mg' });
const betaineLowCheck = checkAgainstReference(betaineLow, 'adult-woman');
check('Betain 200mg → safe_level (kein Referenzwert, unter UL 400)',
  betaineLowCheck.status === 'safe_level', betaineLowCheck.status);
check('safe_level-Text nennt "kein eigener Tages-Referenzwert"',
  /kein eigener Tages-Referenzwert/.test(betaineLowCheck.summary), betaineLowCheck.summary);

const betaineHigh = matchIngredient({ name: 'Betain', amount: '600', unit: 'mg' });
const betaineHighCheck = checkAgainstReference(betaineHigh, 'adult-woman');
check('Betain 600mg → above_limit (über UL 400)',
  betaineHighCheck.status === 'above_limit', betaineHighCheck.status);

const astaxanthinMatch = matchIngredient({ name: 'Astaxanthin', amount: '4', unit: 'mg' });
check('Astaxanthin 4mg → safe_level',
  checkAgainstReference(astaxanthinMatch, 'adult-man').status === 'safe_level');

// Resveratrol hat bewusst keine Lebensphasen-Werte fuer Kinder -> kein Absturz
const resveratrolChild = matchIngredient({ name: 'Resveratrol', amount: '50', unit: 'mg' });
check('Resveratrol bei Kind ohne Referenzwert → kein Crash, referenceCheck null',
  buildSubstanceProfile(resveratrolChild, 'child-4-10').referenceCheck === null);

// Kupfer: Kinder bewusst ohne Wert (BfR-Ausnahme) -- kein Absturz
const copperChild = matchIngredient({ name: 'Kupfer', amount: '1', unit: 'mg' });
check('Kupfer bei Kind ohne Referenzwert → kein Crash, referenceCheck null',
  buildSubstanceProfile(copperChild, 'child-4-10').referenceCheck === null);
const copperWoman = matchIngredient({ name: 'Kupfer', amount: '6', unit: 'mg' });
check('Kupfer 6mg Frau → above_limit (UL 5)',
  checkAgainstReference(copperWoman, 'adult-woman').status === 'above_limit');

console.log('\n— Erweiterung Juli 2026, zweite Runde: Eigenbestand + Marktklassiker —');

// Eigenbestand-Substanzen (inventory.json IDs 1, 2/8, 73, 69) muessen jetzt
// eine Wirkstoff-Karte haben, wo vorher keine existierte.
const nmnMatch = matchIngredient({ name: 'NMN' });
check('NMN erkannt', nmnMatch.substanceId === 'nmn', nmnMatch.substanceId);

const nattoMatch = matchIngredient({ name: 'Nattokinase' });
check('Nattokinase erkannt', nattoMatch.substanceId === 'nattokinase', nattoMatch.substanceId);
const nattoProfile = buildSubstanceProfile(nattoMatch, 'pregnancy');
check('Nattokinase in Schwangerschaft → medical-Hinweis',
  nattoProfile.advisories.some(a => a.severity === 'medical'));

const lionsManeMatch = matchIngredient({ name: "Lion's Mane" });
check("Lion's Mane erkannt", lionsManeMatch.substanceId === 'lions-mane', lionsManeMatch.substanceId);

const methyleneMatch = matchIngredient({ name: 'Methylenblau' });
check('Methylenblau erkannt', methyleneMatch.substanceId === 'methylene-blue', methyleneMatch.substanceId);
const methyleneProfile = buildSubstanceProfile(methyleneMatch, 'adult-man');
check('Methylenblau → contraindicated-Hinweis unabhaengig von Lebensphase (G6PD/Serotonin)',
  methyleneProfile.advisories.some(a => a.severity === 'contraindicated'));

// Regulatorisch komplexe Faelle: kein Referenzwert, aber klare Kontext-Info
const berberineMatch = matchIngredient({ name: 'Berberin' });
check('Berberin: kein Referenzwert (laufende EFSA-Konsultation)',
  buildSubstanceProfile(berberineMatch, 'adult-woman').referenceCheck === null);
const berberinePreg = buildSubstanceProfile(berberineMatch, 'pregnancy');
check('Berberin in Schwangerschaft → contraindicated',
  berberinePreg.advisories.some(a => a.severity === 'contraindicated'));

// Neue SAFE_LEVEL-Faelle: PQQ, Spermidin, EGCG haben nur EU-Zulassungsgrenzen
const pqqLow = matchIngredient({ name: 'PQQ', amount: '10', unit: 'mg' });
check('PQQ 10mg → safe_level (EU-Grenze 20mg)',
  checkAgainstReference(pqqLow, 'adult-woman').status === 'safe_level');
const pqqHigh = matchIngredient({ name: 'PQQ', amount: '25', unit: 'mg' });
check('PQQ 25mg → above_limit (über EU-Grenze 20mg)',
  checkAgainstReference(pqqHigh, 'adult-man').status === 'above_limit');

const egcgHigh = matchIngredient({ name: 'EGCG', amount: '900', unit: 'mg' });
check('EGCG 900mg → above_limit (über 800mg Lebertoxizitaets-Schwelle)',
  checkAgainstReference(egcgHigh, 'adult-woman').status === 'above_limit');

// Bor: vollstaendige Lebensphasen-Abdeckung mit reference:null (nur EFSA-UL)
const boronChild = matchIngredient({ name: 'Bor', amount: '3', unit: 'mg' });
check('Bor 3mg Kind → safe_level (UL 5)',
  checkAgainstReference(boronChild, 'child-4-10').status === 'safe_level');
const boronChildHigh = matchIngredient({ name: 'Bor', amount: '6', unit: 'mg' });
check('Bor 6mg Kind → above_limit (UL 5, niedriger als Erwachsene)',
  checkAgainstReference(boronChildHigh, 'child-4-10').status === 'above_limit');

// Falsch-Treffer-Schutz auch fuer die neue Runde: kurze/generische Begriffe
// duerfen nicht querschiessen (z. B. "Protease" ist Teil von Verdauungsenzyme-
// Synonymen, sollte aber nicht faelschlich andere Eintraege treffen)
const enzymeMatch = matchIngredient({ name: 'Protease' });
check('"Protease" → digestive-enzymes, kein Fehltreffer',
  enzymeMatch.substanceId === 'digestive-enzymes', enzymeMatch.substanceId);

console.log('\n— Erweiterung Juli 2026, dritte Runde: Marktklassiker + kontroverse Stoffe —');

// Koffein: einzige Substanz dieser Runde mit vollstaendigem EFSA-Referenzwert
const caffeineHigh = matchIngredient({ name: 'Koffein', amount: '500', unit: 'mg' });
check('Koffein 500mg → above_limit (über EFSA-Grenze 400mg)',
  checkAgainstReference(caffeineHigh, 'adult-woman').status === 'above_limit');
const caffeinePregnancyLimit = matchIngredient({ name: 'Koffein', amount: '250', unit: 'mg' });
check('Koffein 250mg in Schwangerschaft → above_limit (niedrigere Grenze 200mg)',
  checkAgainstReference(caffeinePregnancyLimit, 'pregnancy').status === 'above_limit');
const caffeineMatch = matchIngredient({ name: 'Coffeinum' });
check('Koffein-Synonym "Coffeinum" erkannt', caffeineMatch.substanceId === 'caffeine');

// Kontroverse/risikoreiche Substanzen: Advisories muessen unabhaengig von der
// Lebensphase greifen (severity 'all'), da es sich um generelle Sicherheits-
// bzw. Regulierungsfragen handelt, nicht um Lebensphasen-Besonderheiten.
const silverProfile = buildSubstanceProfile(matchIngredient({ name: 'Kolloidales Silber' }), 'adult-woman');
check('Kolloidales Silber → contraindicated-Hinweis (Argyrie-Risiko)',
  silverProfile.advisories.some(a => a.severity === 'contraindicated'));

const amygdalinProfile = buildSubstanceProfile(matchIngredient({ name: 'Amygdalin' }), 'child-4-10');
check('Amygdalin bei Kind → contraindicated (Cyanidrisiko + Arzneimittelstatus)',
  amygdalinProfile.advisories.filter(a => a.severity === 'contraindicated').length >= 2);

const dheaProfile = buildSubstanceProfile(matchIngredient({ name: 'DHEA' }), 'adult-woman');
check('DHEA → contraindicated (in Deutschland kein zulaessiges NEM)',
  dheaProfile.advisories.some(a => a.severity === 'contraindicated'));

const garciniaProfile = buildSubstanceProfile(matchIngredient({ name: 'Garcinia Cambogia' }), 'pregnancy');
check('Garcinia Cambogia in Schwangerschaft → contraindicated (ANSES)',
  garciniaProfile.advisories.some(a => a.severity === 'contraindicated'));

// Bienenprodukte: Allergie-Warnungen muessen vorhanden sein
const royalJellyProfile = buildSubstanceProfile(matchIngredient({ name: 'Gelée Royale' }), 'adult-man');
check('Gelée Royale → contraindicated (Anaphylaxie-Risiko bei Bienenallergie)',
  royalJellyProfile.advisories.some(a => a.severity === 'contraindicated'));

// Grapefruitkernextrakt: Kontamination/CYP3A4 muss im cautionNote stehen
const gseMatch = matchIngredient({ name: 'Grapefruitkernextrakt' });
check('Grapefruitkernextrakt: cautionNote nennt Konservierungsstoff-Kontamination',
  /Benzethoniumchlorid/.test(gseMatch.substance?.cautionNote ?? ''));

// Saccharomyces boulardii: Fungaemie-Risiko dokumentiert
const boulardiiProfile = buildSubstanceProfile(matchIngredient({ name: 'Saccharomyces boulardii' }), 'senior');
check('Saccharomyces boulardii → contraindicated (Fungämie-Risiko bei Katheter/Immunsuppression)',
  boulardiiProfile.advisories.some(a => a.severity === 'contraindicated'));

// Kein Referenzwert erfunden, wo keiner existiert (MCT-Oel, L-Citrullin, D-Mannose)
check('MCT-Öl: kein Referenzwert erfunden', !referenceValues['mct-oil']);
check('L-Citrullin: kein Referenzwert erfunden', !referenceValues['l-citrulline']);
check('D-Mannose: kein Referenzwert erfunden', !referenceValues['d-mannose']);

console.log('\n— Erweiterung Juli 2026, vierte Runde: Sport-Aminosäuren, Beruhigungspflanzen, Heilpilze, Longevity —');

const bccaMatch = matchIngredient({ name: 'Leucin' });
check('BCAA-Synonym "Leucin" erkannt', bccaMatch.substanceId === 'bcaa', bccaMatch.substanceId);

const johanniskrautProfile = buildSubstanceProfile(matchIngredient({ name: 'Johanniskraut' }), 'adult-woman');
check('Johanniskraut → contraindicated (CYP3A4-Interaktion) unabhaengig von Lebensphase',
  johanniskrautProfile.advisories.some(a => a.severity === 'contraindicated'));
check('Johanniskraut: cautionNote nennt Verschreibungspflicht',
  /verschreibungspflichtig/.test(johanniskrautProfile.cautionNote));

const valerianProfile = buildSubstanceProfile(matchIngredient({ name: 'Baldrian' }), 'pregnancy');
check('Baldrian in Schwangerschaft → contraindicated',
  valerianProfile.advisories.some(a => a.severity === 'contraindicated'));

const echinaceaMatch = matchIngredient({ name: 'Sonnenhut' });
check('Echinacea-Synonym "Sonnenhut" erkannt', echinaceaMatch.substanceId === 'echinacea');

// Heilpilze: Novel-Food-Unterscheidung Fruchtkoerper vs. Myzel muss im cautionNote stehen
const reishiMatch = matchIngredient({ name: 'Reishi' });
check('Reishi: cautionNote nennt Fallberichte zur Lebertoxizität',
  /Leberschädigung/.test(reishiMatch.substance?.cautionNote ?? ''));
const agaricusMatch = matchIngredient({ name: 'Agaricus blazei' });
check('Agaricus blazei: cautionNote unterscheidet Fruchtkörper (kein Novel Food) von Myzel (Novel Food)',
  /Novel Food eingestuft/.test(agaricusMatch.substance?.cautionNote ?? ''));
const shiitakeMatch = matchIngredient({ name: 'Lentinan' });
check('Shiitake-Synonym "Lentinan" erkannt', shiitakeMatch.substanceId === 'shiitake');

// NR: einzige neue Substanz mit EU-Novel-Food-Referenzwert dieser Runde
const nrHigh = matchIngredient({ name: 'Nicotinamid-Ribosid', amount: '350', unit: 'mg' });
check('NR 350mg → above_limit (über EU-Zulassungsgrenze 300mg)',
  checkAgainstReference(nrHigh, 'adult-woman').status === 'above_limit');
const nrPregnancy = matchIngredient({ name: 'Nicotinamid-Ribosid', amount: '250', unit: 'mg' });
check('NR 250mg in Schwangerschaft → above_limit (niedrigere Grenze 230mg)',
  checkAgainstReference(nrPregnancy, 'pregnancy').status === 'above_limit');

// Urolithin A/AKG: bewusst kein Referenzwert erfunden trotz "Longevity"-Trendthema
check('Urolithin A: kein Referenzwert erfunden', !referenceValues['urolithin-a']);
check('Alpha-Ketoglutarat: kein Referenzwert erfunden', !referenceValues['alpha-ketoglutarate']);

console.log(`\n${failed === 0 ? 'ALLE TESTS BESTANDEN' : failed + ' FEHLER'}\n`);
process.exit(failed === 0 ? 0 : 1);
