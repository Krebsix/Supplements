/**
 * data/localize.js
 * ─────────────────────────────────────────────────────────────
 * Bruecke zwischen den deutschen Katalogdaten und den englischen
 * Text-Overlays unter data/en/.
 *
 * Prinzip: Deutsch bleibt die kanonische Quelle. Ist die aktive Sprache
 * Englisch UND existiert ein Overlay-Text, wird er eingeblendet; sonst
 * bleibt der deutsche Text stehen (derselbe Fallback wie im UI-i18n).
 * Die Datendateien selbst bleiben sprachfrei — nur diese Schicht kennt
 * beide Welten.
 *
 * Die Sprach-Abfrage laeuft ueber i18n/runtime (kein Hook, kein Store):
 * dieselbe Konvention wie in den Fachlogik-Modulen.
 */

import { getActiveLanguage } from '../i18n/runtime';

import substancesEN from './en/substances';
import {
  getAdvisoryTextEN,
  severityLabels as severityLabelsEN,
} from './en/lifeStageAdvisories';
import { LIFE_STAGES_EN } from './en/referenceValues';
import {
  CERTIFICATIONS_EN,
  kindLabels as certificationKindLabelsEN,
} from './en/certifications';
import { COMPLAINTS_EN } from './en/complaints';
import {
  MEDICATION_CLASSES_EN,
  getQuoteEN,
} from './en/medicationClasses';

const isEnglish = () => getActiveLanguage() === 'en';

/**
 * Wirkstoff-Freitexte (what, cautionNote, useCases, forms-Notizen).
 * Liefert eine ueberlagerte Kopie, niemals das Original mutiert.
 */
export function localizeSubstanceTexts(substance) {
  if (!isEnglish() || !substance) return substance;
  const en = substancesEN[substance.id];
  if (!en) return substance;

  return {
    ...substance,
    what: en.what ?? substance.what,
    cautionNote: en.cautionNote ?? substance.cautionNote,
    useCases: Array.isArray(substance.useCases)
      ? substance.useCases.map((useCase, index) => ({
          ...useCase,
          ...(en.useCases?.[index] ?? {}),
        }))
      : substance.useCases,
    forms: Array.isArray(substance.forms)
      ? substance.forms.map((form) =>
          en.forms?.[form.name]
            ? { ...form, note: en.forms[form.name] }
            : form
        )
      : substance.forms,
  };
}

/**
 * Lebensphasen-Hinweis aus getAdvisories(): text und meta.label.
 * Braucht entry.lifeStages fuer den Overlay-Schluessel — getAdvisories
 * reicht das Feld seit der Anbindung mit durch.
 */
export function localizeAdvisory(substanceId, advisory) {
  if (!isEnglish() || !advisory) return advisory;

  const enText =
    advisory.lifeStages !== undefined
      ? getAdvisoryTextEN(substanceId, advisory.lifeStages, advisory.severity)
      : null;
  const enLabel = severityLabelsEN[advisory.severity];

  return {
    ...advisory,
    text: enText ?? advisory.text,
    meta: advisory.meta
      ? { ...advisory.meta, label: enLabel ?? advisory.meta.label }
      : advisory.meta,
  };
}

/** Lebensphase (short/note) fuer den Picker. */
export function localizeLifeStage(stage) {
  if (!isEnglish() || !stage) return stage;
  const en = LIFE_STAGES_EN[stage.id];
  if (!en) return stage;
  return { ...stage, short: en.short ?? stage.short, note: en.note ?? stage.note };
}

/** Zertifizierung (what/scope). */
export function localizeCertification(cert) {
  if (!isEnglish() || !cert) return cert;
  const en = CERTIFICATIONS_EN[cert.id];
  if (!en) return cert;
  return { ...cert, what: en.what ?? cert.what, scope: en.scope ?? cert.scope };
}

/** Kategorie-Badge einer Zertifizierung (Reinheit, Herstellung, ...). */
export function localizeCertificationKind(kind, germanLabel) {
  if (!isEnglish()) return germanLabel;
  return certificationKindLabelsEN[kind] ?? germanLabel;
}

/** Medikamentengruppe (label/examples) fuer Profil-Auswahl und Treffer. */
export function localizeMedicationClass(medicationClass) {
  if (!isEnglish() || !medicationClass) return medicationClass;
  const en = MEDICATION_CLASSES_EN[medicationClass.id];
  if (!en) return medicationClass;
  return {
    ...medicationClass,
    label: en.label ?? medicationClass.label,
    examples: en.examples ?? medicationClass.examples,
  };
}

/**
 * Woertliches Zitat eines belegten Bezugs. Auf Englisch kommt der Satz
 * wortwoertlich aus den EN-Overlays (per Test abgesichert), nie aus einer
 * freien Uebersetzung — sonst waere die Aussage nicht mehr gegenpruefbar.
 */
export function localizeInteractionQuote(medicationClassId, substanceId, germanQuote) {
  if (!isEnglish()) return germanQuote;
  return getQuoteEN(medicationClassId, substanceId) ?? germanQuote;
}

/**
 * Beschwerdebild fuer die Beschwerdesuche. relatedNutrients werden per
 * substanceId zugeordnet, nicht per Index — robust gegen Umsortierung.
 */
export function localizeComplaint(complaint) {
  if (!isEnglish() || !complaint) return complaint;
  const en = COMPLAINTS_EN[complaint.id];
  if (!en) return complaint;

  const enNutrientById = new Map(
    (en.relatedNutrients ?? []).map((entry) => [entry.substanceId, entry])
  );

  return {
    ...complaint,
    label: en.label ?? complaint.label,
    intro: en.intro ?? complaint.intro,
    contextAreas: en.contextAreas ?? complaint.contextAreas,
    redFlags: en.redFlags ?? complaint.redFlags,
    questionsForProfessional:
      en.questionsForProfessional ?? complaint.questionsForProfessional,
    relatedNutrients: Array.isArray(complaint.relatedNutrients)
      ? complaint.relatedNutrients.map((entry) => {
          const enEntry = enNutrientById.get(entry.substanceId);
          return enEntry ? { ...entry, note: enEntry.note ?? entry.note } : entry;
        })
      : complaint.relatedNutrients,
  };
}
