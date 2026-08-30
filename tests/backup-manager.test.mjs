// Tests fuer BackupManager.js: Voll-Export/-Import als JSON.
// Prueft vor allem die Ablehnpfade — ein still falsch eingespieltes
// Backup waere Datenverlust.

import {
  BACKUP_DATA_FIELDS,
  BACKUP_SCHEMA,
  BACKUP_VERSION,
  backupFileName,
  buildBackupPayload,
  parseBackupPayload,
} from '../BackupManager';

let failures = 0;

function check(name, condition) {
  if (condition) {
    console.log(`  ok   ${name}`);
  } else {
    failures += 1;
    console.error(`  FAIL ${name}`);
  }
}

console.log('— BackupManager: Export —');

const exampleState = {
  userSupplements: [{ id: 'user-1' }],
  intakeLogs: [{ id: 'log-1' }],
  stockBySupplementId: { 'user-1': { currentUnits: 30 } },
  scanResults: [],
  pendingScanResult: null,
  activeProfileId: 'adult',
  activeLifeStageId: 'adult-man',
  profile: { medicationClasses: ['anticoagulants'], displayName: 'Nadine', gender: 'female', birthYear: 1990 },
  trials: [],
  trialRatings: [],
  labValues: [{ id: 'lab-1', marker: 'ferritin' }],
  absorptionBlockedAt: null,
  settings: {},
  onboardingCompletedAt: '2026-08-01T08:00:00.000Z',
  consents: { scanUpload: null, privacyVersion: '2026-08-09' },
  language: 'de',
  // Felder, die NICHT ins Backup gehoeren:
  librarySupplements: [{ id: 1 }],
  someFunction: () => {},
};

const payload = buildBackupPayload(exampleState, new Date('2026-08-09T04:00:00Z'));

check('Schema und Version gesetzt', payload.schema === BACKUP_SCHEMA && payload.version === BACKUP_VERSION);
check('exportedAt als ISO-String', payload.exportedAt === '2026-08-09T04:00:00.000Z');
check('alle Backup-Felder vorhanden', BACKUP_DATA_FIELDS.every((field) => field in payload.data));
check('Laborwerte enthalten', payload.data.labValues[0].marker === 'ferritin');
check('Profil enthalten', payload.data.profile.medicationClasses[0] === 'anticoagulants');
check('Profil traegt displayName/gender/birthYear', payload.data.profile.displayName === 'Nadine' && payload.data.profile.gender === 'female' && payload.data.profile.birthYear === 1990);
check('Katalogdaten NICHT im Backup', !('librarySupplements' in payload.data));
check('Funktionen NICHT im Backup', !('someFunction' in payload.data));
check('fehlende Felder werden null, nicht undefined', buildBackupPayload({}).data.labValues === null);

console.log('— BackupManager: Dateiname —');
check('Dateiname traegt das Datum', backupFileName('2026-08-09T04:00:00.000Z') === 'supplement-os-backup-2026-08-09.json');
check('Dateiname ohne Datum faellt sauber zurueck', backupFileName(null) === 'supplement-os-backup-export.json');

console.log('— BackupManager: Import —');

const roundtrip = parseBackupPayload(JSON.stringify(payload));
check('Roundtrip: ok', roundtrip.ok === true);
check('Roundtrip: Daten identisch', roundtrip.data.labValues[0].marker === 'ferritin');
check('Roundtrip: exportedAt durchgereicht', roundtrip.exportedAt === '2026-08-09T04:00:00.000Z');

check('kaputtes JSON abgelehnt', parseBackupPayload('{nope').error === 'invalidJson');
check('fremdes Schema abgelehnt', parseBackupPayload(JSON.stringify({ schema: 'other-app', version: 1, data: {} })).error === 'wrongSchema');
check('leeres Objekt abgelehnt', parseBackupPayload('{}').error === 'wrongSchema');
check('neuere Version abgelehnt', parseBackupPayload(JSON.stringify({ schema: BACKUP_SCHEMA, version: BACKUP_VERSION + 1, data: {} })).error === 'newerVersion');
check('fehlende Daten abgelehnt', parseBackupPayload(JSON.stringify({ schema: BACKUP_SCHEMA, version: BACKUP_VERSION })).error === 'missingData');

const foreignFields = parseBackupPayload(JSON.stringify({
  schema: BACKUP_SCHEMA,
  version: BACKUP_VERSION,
  data: { labValues: [], injectedField: 'boese' },
}));
check('unbekannte Felder werden verworfen', foreignFields.ok && !('injectedField' in foreignFields.data));

if (failures > 0) {
  console.error(`\n${failures} TEST(S) FEHLGESCHLAGEN`);
  process.exit(1);
}
console.log('\nALLE TESTS BESTANDEN');
