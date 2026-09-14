/**
 * CloudBackup.js
 * Verschluesselter Stand je Konto (Spec 2026-08-30-cloud-backup-design):
 * Rundtrip zwischen Haupt-Store-Zustand und Ciphertext, Zaehler fuer den
 * Dialog, und die Entscheidung beim Login. Rein, ohne Store und Netz.
 *
 * Der Server sieht nur Ciphertext, Geraetename und Zeitstempel. Zaehler
 * (Praeparate, Laborwerte) werden hier aus dem ENTSCHLUESSELTEN Stand
 * gebildet, nie in Klartext-Spalten abgelegt.
 */

import { decryptText, encryptText } from './AccountCrypto';
import { BACKUP_DATA_FIELDS, BACKUP_VERSION, buildBackupPayload, parseBackupPayload } from './BackupManager';
import { INITIAL_USER_STATE } from './storeLogic';

const lengthOf = (list) => (Array.isArray(list) ? list.length : 0);

export const REMOTE_COLUMNS = 'ciphertext,payload_version,device_label,exported_at,updated_at';

// Fehlende Felder und unveraenderte Standardwerte sind kein eigener Stand.
// Objekt-Schluesselreihenfolge darf keinen Konflikt ausloesen.
function differsFromDefault(value, baseline) {
  if (value === undefined || value === null) return false;
  if (Array.isArray(value)) {
    return !Array.isArray(baseline) || value.length !== baseline.length ||
      value.some((item, index) => differsFromDefault(item, baseline[index]));
  }
  if (typeof value === 'object') {
    return Object.keys(value).some((key) => differsFromDefault(value[key], baseline?.[key]));
  }
  return value !== baseline;
}

/** Alle gesicherten Nutzerdaten zaehlen, auch ein Profil ohne Praeparate. */
export function hasLocalData(state = {}) {
  return BACKUP_DATA_FIELDS.some((field) =>
    differsFromDefault(state?.[field], field === 'language' ? 'de' : INITIAL_USER_STATE[field])
  );
}

/** Zaehler fuer Hinweis und Dialog, aus dem Klartext. */
export function countsOf(data = {}) {
  const supplements = Array.isArray(data?.userSupplements)
    ? data.userSupplements.filter((item) => item?.status !== 'archived').length
    : 0;
  return {
    supplements,
    labValues: lengthOf(data?.labValues),
    intakeLogs: lengthOf(data?.intakeLogs),
  };
}

export async function encryptBackup(state, dataKey, randomBytes, exportedAt = new Date()) {
  const payload = buildBackupPayload(state, exportedAt);
  const ciphertext = await encryptText(JSON.stringify(payload), dataKey, randomBytes);
  return { ciphertext, payloadVersion: BACKUP_VERSION, exportedAt: payload.exportedAt };
}

export function decryptBackup(ciphertext, dataKey) {
  let text;
  try {
    text = decryptText(ciphertext, dataKey);
  } catch (cause) {
    const error = new Error('CloudBackup: Stand nicht lesbar (Schluessel passt nicht)');
    error.code = 'wrongKey';
    error.cause = cause;
    throw error;
  }
  const parsed = parseBackupPayload(text);
  if (!parsed.ok) {
    const error = new Error(`CloudBackup: ${parsed.error}`);
    error.code = parsed.error;
    throw error;
  }
  return { data: parsed.data, exportedAt: parsed.exportedAt };
}

/**
 * Entscheidung beim Login (Spec Entscheidung 2):
 *   kein Server-Stand, lokal leer          → none
 *   kein Server-Stand, lokal Daten         → upload
 *   Server-Stand, lokal leer               → restore
 *   beides, Server-Stand ist unser letzter → upload (nur wir haben geschrieben)
 *   beides, Server-Stand fremd oder unklar → ask
 */
export function decideOnLogin({ remote, localHasData, lastUploadedAt }) {
  if (!remote) return localHasData ? 'upload' : 'none';
  if (!localHasData) return 'restore';
  if (lastUploadedAt && remote.exported_at === lastUploadedAt) return 'upload';
  return 'ask';
}

/** Anzeigeformat fuer einen Zeitstempel im Konto- und Wiederherstellungs-Hinweis. */
export function formatBackupTime(iso, language) {
  return new Date(iso).toLocaleString(language === 'en' ? 'en-GB' : 'de-DE', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}
