/**
 * BackupManager.js
 * Voll-Export und Import aller Nutzerdaten als JSON.
 *
 * WARUM:
 * Alle Daten liegen ausschliesslich lokal (siehe CLAUDE.md, Datenhaltung).
 * Ohne Backup bedeutet Geraetewechsel oder App-Loeschung Totalverlust —
 * bei monatelanger Einnahme-Historie und erfassten Laborwerten ist das
 * kein hinnehmbarer Zustand. Der Export ist zugleich die Antwort auf das
 * Auskunfts- und Uebertragbarkeitsrecht (Art. 15/20 DSGVO): ein
 * vollstaendiger, maschinenlesbarer Abzug der Rohdaten.
 *
 * BEWUSST KEINE CLOUD: Die Datei geht ueber das System-Share-Sheet dorthin,
 * wohin die Nutzerin sie legt. Die App selbst laedt nichts hoch.
 *
 * Dieses Modul bleibt frei von React-Native- und Expo-Importen, damit die
 * Kernlogik in Node testbar ist. Datei-IO und Share-Sheet passieren im
 * aufrufenden Screen.
 */

export const BACKUP_SCHEMA = 'supplement-os-backup';
export const BACKUP_VERSION = 1;

/**
 * Welche Felder ein Backup umfasst. Muss die Nutzerdaten-Felder des Stores
 * abdecken (INITIAL_USER_STATE in useStore.js plus die Sprachwahl).
 * Wer dort ein Feld ergaenzt, ergaenzt es auch hier — der Test
 * backup-manager.test.mjs prueft die Liste gegen ein Beispielobjekt.
 */
export const BACKUP_DATA_FIELDS = [
  'userSupplements',
  'intakeLogs',
  'stockBySupplementId',
  'scanResults',
  'pendingScanResult',
  'activeProfileId',
  'activeLifeStageId',
  'profile',
  'trials',
  'trialRatings',
  'labValues',
  'absorptionBlockedAt',
  'settings',
  'onboardingCompletedAt',
  'consents',
  'language',
];

export function buildBackupPayload(state, exportedAt = new Date()) {
  const data = {};
  for (const field of BACKUP_DATA_FIELDS) {
    data[field] = state?.[field] ?? null;
  }

  return {
    schema: BACKUP_SCHEMA,
    version: BACKUP_VERSION,
    exportedAt:
      exportedAt instanceof Date ? exportedAt.toISOString() : String(exportedAt),
    data,
  };
}

/**
 * Prueft einen eingelesenen Backup-Text.
 * Liefert { ok: true, data } oder { ok: false, error } mit einem
 * Fehlercode, den die Oberflaeche uebersetzt: 'invalidJson',
 * 'wrongSchema', 'newerVersion', 'missingData'.
 */
export function parseBackupPayload(text) {
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch (error) {
    return { ok: false, error: 'invalidJson' };
  }

  if (!parsed || typeof parsed !== 'object' || parsed.schema !== BACKUP_SCHEMA) {
    return { ok: false, error: 'wrongSchema' };
  }

  if (Number(parsed.version) > BACKUP_VERSION) {
    // Ein Backup aus einer neueren App-Version koennte Felder enthalten,
    // die diese Version falsch interpretieren wuerde: lieber ablehnen als
    // still Daten verlieren.
    return { ok: false, error: 'newerVersion' };
  }

  if (!parsed.data || typeof parsed.data !== 'object') {
    return { ok: false, error: 'missingData' };
  }

  const data = {};
  for (const field of BACKUP_DATA_FIELDS) {
    if (field in parsed.data) data[field] = parsed.data[field];
  }

  return { ok: true, data, exportedAt: parsed.exportedAt || null };
}

export function backupFileName(exportedAtIso) {
  const day = String(exportedAtIso || '').slice(0, 10) || 'export';
  return `supplement-os-backup-${day}.json`;
}
