// Tests fuer CloudBackup.js: Rundtrip, Zaehler, Login-Entscheidung.
import { webcrypto } from 'node:crypto';
import {
  countsOf,
  decideOnLogin,
  decryptBackup,
  encryptBackup,
  formatBackupTime,
  hasLocalData,
  REMOTE_COLUMNS,
} from '../CloudBackup';
import { BACKUP_VERSION } from '../BackupManager';

let failures = 0;
function check(name, condition, extra = '') {
  if (condition) console.log(`  ok   ${name}`);
  else { failures += 1; console.error(`  FAIL ${name} ${extra}`); }
}
const randomBytes = async (n) => webcrypto.getRandomValues(new Uint8Array(n));

const state = {
  userSupplements: [
    { id: 'user-1', name: 'Magnesium', status: 'active' },
    { id: 'user-2', name: 'Alt', status: 'archived' },
  ],
  intakeLogs: [{ id: 'log-1' }],
  labValues: [{ id: 'lab-1', name: 'Ferritin', value: '35' }],
  profile: { displayName: 'Nadine' },
  language: 'de',
  // Kein Feld aus BACKUP_DATA_FIELDS: prueft, dass parseBackupPayload es
  // beim Rundtrip verwirft.
  nichtImBackup: 'sollte verschwinden',
};

console.log('— hasLocalData / countsOf —');
check('leer → false', hasLocalData({}) === false);
check('nur Logs → true', hasLocalData({ intakeLogs: [{}] }) === true);
check('Praeparate → true', hasLocalData(state) === true);
const counts = countsOf(state);
check('zaehlt aktive Praeparate', counts.supplements === 1);
check('zaehlt Laborwerte', counts.labValues === 1);
check('zaehlt Logs', counts.intakeLogs === 1);
check('countsOf(undefined) → Nullen', countsOf(undefined).supplements === 0);

console.log('— encryptBackup / decryptBackup —');
{
  const key = await randomBytes(32);
  const sealed = await encryptBackup(state, key, randomBytes, new Date('2026-08-30T12:00:00.000Z'));
  check('exportedAt uebernommen', sealed.exportedAt === '2026-08-30T12:00:00.000Z');
  check('payloadVersion = BACKUP_VERSION', sealed.payloadVersion === BACKUP_VERSION);
  check('Ciphertext enthaelt keinen Klartext', !sealed.ciphertext.includes('Ferritin') && !sealed.ciphertext.includes('Nadine'));
  const opened = decryptBackup(sealed.ciphertext, key);
  check('Rundtrip: Laborwert zurueck', opened.data.labValues[0].name === 'Ferritin');
  check('Rundtrip: exportedAt', opened.exportedAt === '2026-08-30T12:00:00.000Z');
  check('Felder ausserhalb BACKUP_DATA_FIELDS fallen weg', !('nichtImBackup' in opened.data));
  const other = await randomBytes(32);
  let code = null;
  try { decryptBackup(sealed.ciphertext, other); } catch (error) { code = error.code; }
  check('falscher Schluessel → code wrongKey', code === 'wrongKey');
  check('REMOTE_COLUMNS ohne Klartext-Zaehler', !REMOTE_COLUMNS.includes('count'));
}

console.log('— decideOnLogin —');
const remote = { exported_at: '2026-08-30T12:00:00.000Z' };
check('nichts da → none', decideOnLogin({ remote: null, localHasData: false, lastUploadedAt: null }) === 'none');
check('nur lokal → upload', decideOnLogin({ remote: null, localHasData: true, lastUploadedAt: null }) === 'upload');
check('nur remote → restore', decideOnLogin({ remote, localHasData: false, lastUploadedAt: null }) === 'restore');
check('beides, remote von uns → upload', decideOnLogin({ remote, localHasData: true, lastUploadedAt: '2026-08-30T12:00:00.000Z' }) === 'upload');
check('beides, remote fremd → ask', decideOnLogin({ remote, localHasData: true, lastUploadedAt: '2026-08-29T08:00:00.000Z' }) === 'ask');
check('beides, nie hochgeladen → ask', decideOnLogin({ remote, localHasData: true, lastUploadedAt: null }) === 'ask');

console.log('— formatBackupTime —');
check(
  'DE: enthaelt Tag.Monat.',
  formatBackupTime('2026-08-30T12:00:00.000Z', 'de').includes('30.08.')
);

if (failures > 0) { console.error(`\n${failures} Test(s) fehlgeschlagen`); process.exit(1); }
console.log('\nCloudBackup: alle Tests bestanden');
