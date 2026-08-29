// Tests fuer AccountCrypto.js: Schluesselableitung, Wrapping, Recovery-Key.
// Alles reine Kryptografie ohne Supabase, deshalb vollstaendig in Node
// pruefbar. randomBytes wird injiziert (in der App: expo-crypto).

import { webcrypto } from 'node:crypto';
import {
  KDF_PARAMS,
  createKeyBundle,
  deriveKeyFromPassword,
  formatRecoveryKey,
  parseRecoveryKey,
  rewrapWithPassword,
  unlockWithPassword,
  unlockWithRecoveryKey,
  unwrapKey,
  wrapKey,
} from '../AccountCrypto';

let failures = 0;
function check(name, condition, extra = '') {
  if (condition) console.log(`  ok   ${name}`);
  else { failures += 1; console.error(`  FAIL ${name} ${extra}`); }
}
async function throws(fn) {
  try { await fn(); return false; } catch { return true; }
}
const randomBytes = async (n) => webcrypto.getRandomValues(new Uint8Array(n));
const same = (a, b) => a.length === b.length && a.every((v, i) => v === b[i]);

console.log('— Schluesselableitung —');
const salt = await randomBytes(16);
const k1 = await deriveKeyFromPassword('korrekt-pferd-batterie', salt);
const k2 = await deriveKeyFromPassword('korrekt-pferd-batterie', salt);
const k3 = await deriveKeyFromPassword('korrekt-pferd-batterie', await randomBytes(16));
const k4 = await deriveKeyFromPassword('anderes-passwort', salt);
check('32 Byte Schluessel', k1.length === 32 && k1.length === KDF_PARAMS.dkLen);
check('gleiche Eingabe, gleicher Schluessel', same(k1, k2));
check('anderes Salt, anderer Schluessel', !same(k1, k3));
check('anderes Passwort, anderer Schluessel', !same(k1, k4));
check('leeres Passwort wird abgelehnt', await throws(() => deriveKeyFromPassword('', salt)));
check('NFKC: zusammengesetztes und vorkomponiertes \u00fc sind gleich',
  same(await deriveKeyFromPassword('gr\u00fcn', salt), await deriveKeyFromPassword('gru\u0308n', salt)));

console.log('— Wrap / Unwrap —');
const dataKey = await randomBytes(32);
const wrapped = await wrapKey(dataKey, k1, randomBytes);
check('Format nonceHex:sealedHex', /^[0-9a-f]{24}:[0-9a-f]+$/.test(wrapped));
check('Rundtrip liefert Datenschluessel', same(unwrapKey(wrapped, k1), dataKey));
check('falscher Schluessel wird abgelehnt', await throws(() => unwrapKey(wrapped, k4)));
const [nonceHex, sealedHex] = wrapped.split(':');
const flipped = sealedHex.slice(0, -1) + (sealedHex.endsWith('0') ? '1' : '0');
check('manipulierter Chiffretext wird abgelehnt (GCM)', await throws(() => unwrapKey(`${nonceHex}:${flipped}`, k1)));
check('zwei Wraps desselben Schluessels unterscheiden sich (Nonce)',
  (await wrapKey(dataKey, k1, randomBytes)) !== wrapped);

console.log('— Recovery-Key Darstellung —');
const rk = await randomBytes(32);
const text = formatRecoveryKey(rk);
check('13 Vierergruppen', /^([A-Z2-7]{4}-){12}[A-Z2-7]{4}$/.test(text), text);
check('Parse-Rundtrip', same(parseRecoveryKey(text), rk));
check('Kleinschreibung und Leerzeichen werden toleriert',
  same(parseRecoveryKey(text.toLowerCase().replace(/-/g, ' ')), rk));
check('zu kurzer Key wird abgelehnt', await throws(() => parseRecoveryKey('ABCD-EFGH')));

console.log('— Bundle —');
const bundle = await createKeyBundle('korrekt-pferd-batterie', randomBytes);
check('Record traegt genau die vier Serverfelder',
  JSON.stringify(Object.keys(bundle.record).sort()) ===
    JSON.stringify(['kdf', 'kdf_salt', 'wrapped_key_pw', 'wrapped_key_recovery']));
check('kdf im Record entspricht KDF_PARAMS', bundle.record.kdf.N === KDF_PARAMS.N && bundle.record.kdf.name === 'scrypt');
check('Record enthaelt keinen Klartext-Schluessel',
  !JSON.stringify(bundle.record).includes(Buffer.from(bundle.dataKey).toString('hex')));
check('Passwort entsperrt', same(await unlockWithPassword(bundle.record, 'korrekt-pferd-batterie'), bundle.dataKey));
check('Recovery-Key entsperrt', same(unlockWithRecoveryKey(bundle.record, bundle.recoveryKeyText), bundle.dataKey));
check('falsches Passwort scheitert', await throws(() => unlockWithPassword(bundle.record, 'falsch')));

console.log('— Rewrap nach Passwort-Reset —');
const rewrapped = await rewrapWithPassword(bundle.record, bundle.dataKey, 'neues-passwort-2026', randomBytes);
check('neues Passwort entsperrt', same(await unlockWithPassword(rewrapped, 'neues-passwort-2026'), bundle.dataKey));
check('altes Passwort scheitert', await throws(() => unlockWithPassword(rewrapped, 'korrekt-pferd-batterie')));
check('Recovery-Key bleibt gueltig', same(unlockWithRecoveryKey(rewrapped, bundle.recoveryKeyText), bundle.dataKey));
check('Salt wurde erneuert', rewrapped.kdf_salt !== bundle.record.kdf_salt);

if (failures > 0) { console.error(`\n${failures} Fehler`); process.exit(1); }
console.log('\nAlle AccountCrypto-Tests bestanden.');
