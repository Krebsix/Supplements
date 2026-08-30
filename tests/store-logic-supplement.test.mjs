// Tests fuer normalizeUserSupplement (storeLogic.js): stellt sicher, dass
// strukturierte Zutatenlisten (ingredientDetails) beim Anlegen/Bearbeiten
// eines Bestandseintrags erhalten bleiben. Ohne sie sehen
// StackAnalyzer.extractPositions und ScheduleGuidance.buildEntryGuidance
// nur eine aus dem Produktnamen geratene Position -- siehe Review zu
// Task 1 (2026-08-30-suche-bestand-tagesplan).
import { normalizeUserSupplement } from '../storeLogic';

let failures = 0;

function check(name, condition) {
  if (condition) {
    console.log(`  ok   ${name}`);
  } else {
    failures += 1;
    console.error(`  FAIL ${name}`);
  }
}

console.log('— normalizeUserSupplement: ingredientDetails —');

const withDetails = normalizeUserSupplement({
  name: 'Magnesium Komplex',
  ingredientDetails: [{ name: 'Magnesium', form: 'citrat', amount: '300', unit: 'mg' }],
});
check(
  'Entwurf mit ingredientDetails behaelt sie',
  Array.isArray(withDetails.ingredientDetails) &&
    withDetails.ingredientDetails.length === 1 &&
    withDetails.ingredientDetails[0].name === 'Magnesium'
);

const withoutDetails = normalizeUserSupplement({ name: 'Vitamin D' });
check(
  'Entwurf ohne ingredientDetails wird zu leerem Array',
  Array.isArray(withoutDetails.ingredientDetails) && withoutDetails.ingredientDetails.length === 0
);

const withNonArrayDetails = normalizeUserSupplement({ name: 'Zink', ingredientDetails: 'kaputt' });
check(
  'nicht-Array ingredientDetails wird zu leerem Array',
  Array.isArray(withNonArrayDetails.ingredientDetails) && withNonArrayDetails.ingredientDetails.length === 0
);

console.log('— normalizeUserSupplement: id —');

const keptId = normalizeUserSupplement({ id: 'user-existing-123', name: 'Eisen' });
check('bestehende user-ID bleibt erhalten', keptId.id === 'user-existing-123');

const generatedId = normalizeUserSupplement({ name: 'Eisen' });
check('fehlende ID wird generiert', typeof generatedId.id === 'string' && generatedId.id.startsWith('user-'));

const replacedLibraryId = normalizeUserSupplement({ id: 42, name: 'Eisen' });
check(
  'numerische ID (Katalog) wird ersetzt, libraryId bleibt',
  typeof replacedLibraryId.id === 'string' &&
    replacedLibraryId.id.startsWith('user-') &&
    replacedLibraryId.libraryId === 42
);

console.log('— normalizeUserSupplement: unveraendertes Verhalten —');

const dosage = normalizeUserSupplement({ name: 'Omega 3', dosage: { amount: ' 500 ', unit: ' mg ' } });
check('Dosierung wird getrimmt', dosage.dosage.amount === '500' && dosage.dosage.unit === 'mg');

const statusDefault = normalizeUserSupplement({ name: 'Omega 3' });
check('Status faellt auf active zurueck', statusDefault.status === 'active');

if (failures > 0) {
  console.error(`\n${failures} TEST(S) FEHLGESCHLAGEN`);
  process.exit(1);
}
console.log('\nALLE TESTS BESTANDEN');
