// Integrationstest fuer data/localize.js: Die englischen Overlays muessen
// bei aktiver Sprache EN tatsaechlich in den gebauten Profilen ankommen,
// und auf DE darf sich exakt nichts aendern (No-op-Garantie).

import { setActiveLanguage } from '../i18n/runtime';
import { substanceById } from '../data/substances';
import substancesEN from '../data/en/substances';
import { buildSubstanceProfile } from '../ReferenceCheck';
import { buildComplaintView } from '../ComplaintSearch';
import { checkProfileAgainstStack } from '../ProfileCheck';
import { COMPLAINTS } from '../data/complaints';
import { localizeLifeStage } from '../data/localize';
import { LIFE_STAGES } from '../data/referenceValues';

let failures = 0;

function check(name, condition, extra = '') {
  if (condition) {
    console.log(`  ok   ${name}`);
  } else {
    failures += 1;
    console.error(`  FAIL ${name} ${extra}`);
  }
}

const magnesium = substanceById.get('magnesium') || [...substanceById.values()][0];
const makeMatch = () => ({ matched: true, substance: magnesium, form: null });

console.log('— Deutsch: Overlay ist ein No-op —');
setActiveLanguage('de');
const profileDE = buildSubstanceProfile(makeMatch(), 'adult-woman');
check('DE-Profil traegt den deutschen what-Text', profileDE.what === magnesium.what);
check('DE-Profil: cautionNote unveraendert', profileDE.cautionNote === (magnesium.cautionNote ?? ''));

console.log('— Englisch: Overlay greift —');
setActiveLanguage('en');
const profileEN = buildSubstanceProfile(makeMatch(), 'adult-woman');
const overlay = substancesEN[magnesium.id];
check('EN-Overlay fuer die Testsubstanz existiert', Boolean(overlay?.what));
check('EN-Profil traegt den englischen what-Text', profileEN.what === overlay.what, profileEN.what);
check(
  'EN-Profil: useCases uebersetzt, Laenge unveraendert',
  profileEN.useCases.length === (magnesium.useCases ?? []).length &&
    (profileEN.useCases[0]?.note === overlay.useCases?.[0]?.note)
);
check(
  'EN-Profil: Formen behalten Namen (Fachbegriff), Note uebersetzt wo vorhanden',
  profileEN.allForms.every((form, i) => form.name === magnesium.forms[i].name)
);

const complaintEN = buildComplaintView(COMPLAINTS[0], []);
check('EN-Beschwerdebild: intro ist nicht der deutsche Text', complaintEN.intro !== COMPLAINTS[0].intro);
check(
  'EN-Beschwerdebild: Naehrstoff-Verknuepfung bleibt vollstaendig',
  complaintEN.nutrients.length === (COMPLAINTS[0].relatedNutrients ?? []).length
);

const hintsEN = checkProfileAgainstStack(
  { medicationClasses: ['anticoagulants'] },
  [{ name: 'Omega-3 Kapseln', ingredientDetails: [{ name: 'Omega-3' }] }]
);
check(
  'EN-Profilabgleich: Zitat kommt aus dem EN-Overlay, Label uebersetzt',
  hintsEN.length > 0 &&
    hintsEN.every(
      (hint) => !/[äöüß]/.test(hint.quote) && !/[äöüß]/.test(hint.medicationClassLabel)
    ),
  JSON.stringify(hintsEN[0] ?? null)
);

const stageEN = localizeLifeStage(LIFE_STAGES[0]);
check('EN-Lebensphase: note uebersetzt', stageEN.note !== LIFE_STAGES[0].note);
check('EN-Lebensphase: id unveraendert', stageEN.id === LIFE_STAGES[0].id);

console.log('— Zurueckschalten —');
setActiveLanguage('de');
const profileBack = buildSubstanceProfile(makeMatch(), 'adult-woman');
check('Nach Rueckschalten wieder deutscher Text', profileBack.what === magnesium.what);
check('Quelldaten wurden nie mutiert', magnesium.what === profileBack.what && substanceById.get(magnesium.id) === magnesium);

if (failures > 0) {
  console.error(`\n${failures} TEST(S) FEHLGESCHLAGEN`);
  process.exit(1);
}
console.log('\nALLE TESTS BESTANDEN');
