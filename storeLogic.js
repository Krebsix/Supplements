/**
 * storeLogic.js
 * ─────────────────────────────────────────────────────────────
 * Reine Teile des Haupt-Stores (useStore.js): Normalisierung,
 * Ausgangszustand und die Abschluss-Aktion des Onboardings. Ausgezogen,
 * weil useStore.js native Module importiert (secureStorage, zustand/
 * middleware ueber Expo) und deshalb in den Node-Tests nicht gebuendelt
 * werden kann. Dieses Modul bleibt frei davon, damit tests/*.test.mjs es
 * direkt importieren koennen.
 *
 * useStore.js importiert von hier und re-exportiert INITIAL_USER_STATE /
 * EMPTY_PROFILE, damit bestehende Importe aus './useStore' gueltig
 * bleiben.
 */

import { GENDERS } from './LifeStageResolver';
import { EMPTY_ENTITLEMENT } from './Entitlements';

/**
 * Persoenliches Profil. Bewusst grobkoernig bei den Gesundheitsangaben: Es
 * werden Medikamenten-GRUPPEN erfasst, keine Praeparatenamen -- die App
 * vergleicht ohnehin nur gegen belegte Hinweise auf Gruppenebene (siehe
 * data/medicationClasses.js), und je weniger Gesundheitsdaten auf dem
 * Geraet liegen, desto besser.
 *
 * displayName, gender und birthYear kommen aus dem gefuehrten Onboarding
 * (LifeStageResolver.js leitet daraus die Referenzgruppe ab); sie bleiben
 * wie der Rest des Profils lokal auf dem Geraet.
 */
export function normalizeProfile(profile = {}) {
  const list = (value) =>
    Array.isArray(value) ? value.filter((item) => typeof item === 'string' && item) : [];

  return {
    medicationClasses: list(profile?.medicationClasses),
    conditions: list(profile?.conditions),
    allergies: list(profile?.allergies),
    dietaryPattern: typeof profile?.dietaryPattern === 'string' ? profile.dietaryPattern : '',
    goals: list(profile?.goals),
    displayName: typeof profile?.displayName === 'string' ? profile.displayName.trim().slice(0, 40) : '',
    gender: GENDERS.includes(profile?.gender) ? profile.gender : '',
    birthYear: (() => {
      const y = Number(profile?.birthYear);
      return Number.isInteger(y) && y >= 1900 && y <= 2100 ? y : null;
    })(),
  };
}

export const EMPTY_PROFILE = normalizeProfile({});

/**
 * Ausgangszustand aller Nutzerdaten. Einmal definiert, zweimal verwendet:
 * als Startwert beim ersten Oeffnen und als Ziel von resetAllData() --
 * so kann der Loeschweg (Art. 17 DSGVO) kein Feld vergessen, das spaeter
 * dazukommt.
 */
export const INITIAL_USER_STATE = {
  userSupplements: [],
  intakeLogs: [],
  stockBySupplementId: {},
  scanResults: [],
  pendingScanResult: null,
  activeProfileId: 'adult',
  // Lebensphase fuer den Referenzwert-Abgleich (siehe data/referenceValues.js).
  // Der Wert ist nur ein technischer Platzhalter: Bis zum Abschluss des
  // Onboardings ist die App gate't (app/_layout.jsx), es gibt also keine
  // Referenzwert-Aussage ohne aktive Wahl.
  activeLifeStageId: 'adult-woman',
  // Persoenliches Profil (Name, Geschlecht, Geburtsjahr, Medikamenten-
  // gruppen, Erkrankungen, Ziele). Bleibt wie alles andere lokal auf dem
  // Geraet.
  profile: EMPTY_PROFILE,
  // Wirkungskontrolle: laufende und abgeschlossene Beobachtungen samt
  // der einzelnen Bewertungen (siehe OutcomeTracker.js).
  trials: [],
  trialRatings: [],
  // Laborwerte: bleiben wie alles andere lokal. Die App bewertet sie
  // nicht, sie dokumentiert und stellt den Verlauf dar.
  labValues: [],
  absorptionBlockedAt: null,
  settings: {},
  // Erststart und Einwilligungen. scanUpload haelt den Zeitpunkt der
  // Einwilligung zur Foto-Uebertragung an die KI-Auswertung fest,
  // privacyVersion den Stand der zur Kenntnis genommenen
  // Datenschutzerklaerung, termsVersion den Stand der akzeptierten
  // Nutzungsbedingungen.
  onboardingCompletedAt: null,
  consents: { scanUpload: null, privacyVersion: null, termsVersion: null },
  // Onboarding-Flags: bewusst Geraetezustand, nicht Nutzerdatum -- landen
  // deshalb NICHT im JSON-Backup (siehe BackupManager.js/BACKUP_DATA_FIELDS).
  // accountOffered haelt fest, ob der Konto-Schritt ueberhaupt angezeigt
  // wurde (unter 16 sieht ihn nicht), firstAction, wofuer sich die
  // Nutzerin im Abschluss-Schritt entschieden hat.
  onboarding: { accountOffered: false, firstAction: null },
  // Tier, Scan-Kontingente und Credits (Entitlements.js). Wird von
  // resetAllData mit zurueckgesetzt; gekaufte Rechte kommen nach einer
  // Loeschung ueber den Store-Restore (IAP) zurueck, nicht aus dem Backup.
  entitlement: EMPTY_ENTITLEMENT,
};

/**
 * Abschluss des Onboardings: reine Zustands-Ueberfuehrung, damit sie ohne
 * den Store selbst testbar ist. Der Store ruft sie nur noch auf
 * (completeOnboarding in useStore.js).
 */
export function applyOnboardingCompletion(state, input = {}, now = new Date()) {
  const firstAction = ['scan', 'search', 'later'].includes(input.firstAction)
    ? input.firstAction
    : 'later';

  return {
    activeLifeStageId: input.lifeStageId || state.activeLifeStageId,
    onboardingCompletedAt: now.toISOString(),
    consents: {
      ...state.consents,
      privacyVersion: input.privacyVersion || null,
      termsVersion: input.termsVersion || null,
    },
    profile: input.profile ? normalizeProfile({ ...state.profile, ...input.profile }) : state.profile,
    onboarding: { accountOffered: Boolean(input.accountOffered), firstAction },
  };
}
