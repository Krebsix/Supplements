/**
 * AccountCrypto.js
 * ─────────────────────────────────────────────────────────────
 * Kryptografische Grundlage fuer das Konto: Aus dem Passwort wird ein
 * Schluessel abgeleitet, der einen zufaelligen Datenschluessel umwickelt.
 * Ein zweiter Umschlag mit einem Recovery-Key erlaubt den Zugriff nach
 * Passwortverlust. Der Server (Supabase) bekommt nur die Umschlaege.
 *
 * WARUM SO:
 * Teilprojekt 2 (Sync) wird Gesundheitsdaten nach Art. 9 DSGVO
 * hochladen. Die Nutzerin soll sich darauf verlassen koennen, dass
 * weder wir noch Supabase sie lesen koennen. Deshalb entsteht der
 * Schluessel hier, auf dem Geraet, und verlaesst es nie.
 *
 * WAHL DER VERFAHREN:
 * - scrypt statt Argon2id: beides waere gleichwertig, die noble-
 *   Implementierung fuer scrypt ist laenger im Einsatz. Parameter im
 *   Record, damit sie sich spaeter erhoehen lassen.
 * - AES-256-GCM statt CTR (wie secureStorage.js): Ein Server-Datensatz
 *   braucht Integritaetsschutz, ein manipulierter Umschlag muss auffallen.
 * - Reines JavaScript (@noble/*): laeuft in Expo Go und im Store-Build
 *   identisch, kein Native-Modul, kein Dev-Build noetig.
 *
 * randomBytes wird injiziert: In der App expo-crypto, im Test Node.
 */

import { gcm } from '@noble/ciphers/aes.js';
import { scryptAsync } from '@noble/hashes/scrypt.js';
import { bytesToHex, hexToBytes, utf8ToBytes } from '@noble/hashes/utils.js';

// bytesToUtf8 fehlt in der installierten @noble/hashes-Version (Stand
// 2026-08-30), deshalb Standard-Web-API als Ersatz.
function bytesToUtf8(bytes) {
  return new TextDecoder().decode(bytes);
}

export const KDF_PARAMS = { name: 'scrypt', N: 32768, r: 8, p: 1, dkLen: 32 };

/**
 * Anmelde-Ableitung (Bitwarden-Muster, Spec Entscheidung 5): Supabase Auth
 * bekommt nie das Klartext-Passwort, sondern scrypt(passwort, AUTH_SALT)
 * als Hex. Das Salz ist app-weit fest und NICHT aus der E-Mail abgeleitet:
 * Ein E-Mail-Salz wuerde beim E-Mail-Wechsel ein Passwort-Update vor der
 * Bestaetigung erzwingen (Supabase "secure email change").
 * Der Umschlag-Schluessel (deriveKeyFromPassword mit kdf_salt) bleibt
 * davon getrennt; beide Werte sind aus dem jeweils anderen nicht ableitbar.
 */
export const AUTH_SALT = utf8ToBytes('mysuplea-auth-v1');
export const AUTH_SCHEME = 'scrypt-v1';

export async function deriveAuthPassword(password) {
  const key = await deriveKeyFromPassword(password, AUTH_SALT);
  return bytesToHex(key);
}

const SALT_LENGTH = 16;
const NONCE_LENGTH = 12;
const KEY_LENGTH = 32;
const RECOVERY_LENGTH = 32;

// RFC 4648 Base32 ohne Padding: nur Grossbuchstaben und Ziffern 2 bis 7,
// keine 0/O- oder 1/I-Verwechslung beim Abtippen.
const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

export async function deriveKeyFromPassword(password, salt, params = KDF_PARAMS) {
  if (typeof password !== 'string' || password.length === 0) {
    throw new Error('AccountCrypto: leeres Passwort');
  }
  if (!(salt instanceof Uint8Array) || salt.length < SALT_LENGTH) {
    throw new Error('AccountCrypto: Salt fehlt oder zu kurz');
  }
  // NFKC: dasselbe Wort, auf zwei Tastaturen verschieden kodiert, muss
  // denselben Schluessel ergeben.
  return scryptAsync(utf8ToBytes(password.normalize('NFKC')), salt, {
    N: params.N,
    r: params.r,
    p: params.p,
    dkLen: params.dkLen,
  });
}

export async function wrapKey(dataKey, wrappingKey, randomBytes) {
  const nonce = await randomBytes(NONCE_LENGTH);
  const sealed = gcm(wrappingKey, nonce).encrypt(dataKey);
  return `${bytesToHex(nonce)}:${bytesToHex(sealed)}`;
}

export function unwrapKey(wrapped, wrappingKey) {
  const [nonceHex, sealedHex] = String(wrapped ?? '').split(':');
  if (!nonceHex || !sealedHex) throw new Error('AccountCrypto: unlesbares Format');
  // decrypt wirft, wenn Tag oder Schluessel nicht passen.
  return gcm(wrappingKey, hexToBytes(nonceHex)).decrypt(hexToBytes(sealedHex));
}

/**
 * AES-256-GCM ueber beliebigen Text (Cloud-Backup). Gleiches Format wie
 * die Umschlaege: nonce:ciphertext, beides hex, neuer Nonce je Aufruf.
 */
export async function encryptText(text, key, randomBytes) {
  const nonce = await randomBytes(NONCE_LENGTH);
  const sealed = gcm(key, nonce).encrypt(utf8ToBytes(String(text ?? '')));
  return `${bytesToHex(nonce)}:${bytesToHex(sealed)}`;
}

export function decryptText(sealedText, key) {
  const [nonceHex, sealedHex] = String(sealedText ?? '').split(':');
  if (!nonceHex || !sealedHex) throw new Error('AccountCrypto: unlesbares Format');
  // decrypt wirft, wenn Tag oder Schluessel nicht passen.
  const plain = gcm(key, hexToBytes(nonceHex)).decrypt(hexToBytes(sealedHex));
  return bytesToUtf8(plain);
}

export function formatRecoveryKey(bytes) {
  let bits = 0;
  let value = 0;
  let out = '';
  for (const byte of bytes) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      out += BASE32_ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
    value &= (1 << bits) - 1;
  }
  if (bits > 0) out += BASE32_ALPHABET[(value << (5 - bits)) & 31];
  return out.match(/.{1,4}/g).join('-');
}

export function parseRecoveryKey(text) {
  const clean = String(text ?? '').toUpperCase().replace(/[^A-Z2-7]/g, '');
  let bits = 0;
  let value = 0;
  const out = [];
  for (const ch of clean) {
    value = (value << 5) | BASE32_ALPHABET.indexOf(ch);
    bits += 5;
    if (bits >= 8) {
      out.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
    value &= (1 << bits) - 1;
  }
  if (out.length !== RECOVERY_LENGTH) {
    throw new Error('AccountCrypto: Recovery-Key hat nicht die erwartete Laenge');
  }
  return Uint8Array.from(out);
}

export async function createKeyBundle(password, randomBytes) {
  const salt = await randomBytes(SALT_LENGTH);
  const dataKey = await randomBytes(KEY_LENGTH);
  const recoveryKey = await randomBytes(RECOVERY_LENGTH);
  const passwordKey = await deriveKeyFromPassword(password, salt);

  const record = {
    kdf: { ...KDF_PARAMS, auth: AUTH_SCHEME },
    kdf_salt: bytesToHex(salt),
    wrapped_key_pw: await wrapKey(dataKey, passwordKey, randomBytes),
    wrapped_key_recovery: await wrapKey(dataKey, recoveryKey, randomBytes),
  };

  return { dataKey, recoveryKey, recoveryKeyText: formatRecoveryKey(recoveryKey), record };
}

export async function unlockWithPassword(record, password) {
  const key = await deriveKeyFromPassword(password, hexToBytes(record.kdf_salt), record.kdf);
  return unwrapKey(record.wrapped_key_pw, key);
}

export function unlockWithRecoveryKey(record, recoveryKeyText) {
  return unwrapKey(record.wrapped_key_recovery, parseRecoveryKey(recoveryKeyText));
}

export async function rewrapWithPassword(record, dataKey, newPassword, randomBytes) {
  const salt = await randomBytes(SALT_LENGTH);
  const key = await deriveKeyFromPassword(newPassword, salt);
  return {
    ...record,
    kdf: { ...KDF_PARAMS, auth: AUTH_SCHEME },
    kdf_salt: bytesToHex(salt),
    wrapped_key_pw: await wrapKey(dataKey, key, randomBytes),
  };
}
