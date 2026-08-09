/**
 * ExportBuilder.js
 * ─────────────────────────────────────────────────────────────
 * Erzeugt einen strukturierten Bericht fuer Arztpraxis, Apotheke oder die
 * eigene Ablage.
 *
 * WOZU DAS DA IST:
 * Die Frage "was nehmen Sie denn alles?" beantwortet kaum jemand
 * vollstaendig aus dem Kopf — schon gar nicht mit Dosierungen und
 * Einnahmezeiten. Der Bericht macht aus den ohnehin erfassten Daten eine
 * Seite, die man vorlegen kann.
 *
 * WAS DER BERICHT NICHT IST:
 * Keine Bewertung, keine Empfehlung, keine Diagnose. Er stellt zusammen,
 * was die Nutzerin eingetragen hat, plus die Rechenergebnisse der App
 * (Tagessummen, Referenzwertabgleich) mit Angabe der Quelle. Die
 * Einordnung macht die Fachperson, die ihn liest.
 *
 * DATENSPARSAMKEIT:
 * Der Aufrufer entscheidet ueber `sections`, was hineinkommt. Wer nur die
 * Praeparateliste zeigen will, gibt Laborwerte und Profil nicht mit —
 * Gesundheitsdaten sollen nicht versehentlich mitwandern, nur weil sie in
 * der App liegen.
 *
 * Ausgabeformat ist Markdown: lesbar als reiner Text, kopierbar, ohne
 * Abhaengigkeit von einer PDF-Bibliothek.
 */

import { APP_NAME } from './appInfo';
import { analyzeStack } from './StackAnalyzer';
import { checkProfileAgainstStack } from './ProfileCheck';
import { evaluateTrial, TRIAL_STATUS } from './OutcomeTracker';
import { getGroupedValues } from './LabValues';
import { getMedicationClass } from './data/medicationClasses';
import { getOutcomeMetric } from './data/outcomeMetrics';
import { getLabMarker } from './data/labMarkers';
import { getLifeStage } from './data/referenceValues';
import { tr } from './i18n/runtime';

export const EXPORT_SECTIONS = {
  SUPPLEMENTS: 'supplements',
  TOTALS: 'totals',
  PROFILE: 'profile',
  LAB: 'lab',
  OUTCOMES: 'outcomes',
  ADHERENCE: 'adherence',
};

export const ALL_SECTIONS = Object.values(EXPORT_SECTIONS);

function line(parts) {
  return parts.filter(Boolean).join(' · ');
}

function formatDosage(dosage) {
  const amount = dosage?.amount ?? '';
  const unit = dosage?.unit ?? '';
  if (!amount && !unit) return '';
  return `${amount} ${unit}`.trim();
}

/**
 * buildReport(data, options)
 *
 * data: { supplements, stockById, intakeLogs, trials, trialRatings,
 *         labValues, profile, lifeStageId }
 * options: { sections, now }
 */
export function buildReport(data = {}, options = {}) {
  const {
    supplements = [],
    intakeLogs = [],
    trials = [],
    trialRatings = [],
    labValues = [],
    profile = {},
    lifeStageId = null,
  } = data;

  const sections = options.sections ?? ALL_SECTIONS;
  const now = options.now ?? new Date();
  const dateStr = now.toISOString().slice(0, 10);

  const out = [];

  out.push(`# ${tr('export.title')}`);
  out.push('');
  out.push(tr('export.generatedOn', { date: dateStr }));

  const lifeStage = lifeStageId ? getLifeStage(lifeStageId) : null;
  if (lifeStage) {
    out.push(tr('export.lifeStage', { stage: lifeStage.label }));
  }

  out.push('');
  out.push(`> ${tr('export.disclaimer')}`);
  out.push('');

  // ── Praeparate ───────────────────────────────────────────────
  if (sections.includes(EXPORT_SECTIONS.SUPPLEMENTS)) {
    out.push(`## ${tr('export.section.supplements')}`);
    out.push('');

    if (supplements.length === 0) {
      out.push(tr('export.none'));
    } else {
      for (const supplement of supplements) {
        const dosage = formatDosage(supplement.dosage);
        out.push(
          `- **${supplement.name}**` +
            (dosage ? ` — ${dosage}` : '') +
            (supplement.timingRaw ? ` (${supplement.timingRaw})` : '')
        );
        if (supplement.purpose) {
          out.push(`  ${tr('export.purpose', { purpose: supplement.purpose })}`);
        }
      }
    }
    out.push('');
  }

  // ── Tagessummen ──────────────────────────────────────────────
  if (sections.includes(EXPORT_SECTIONS.TOTALS) && lifeStageId) {
    const stack = analyzeStack(supplements, lifeStageId);

    out.push(`## ${tr('export.section.totals')}`);
    out.push('');
    out.push(tr('export.totalsIntro'));
    out.push('');

    if (stack.totals.length === 0) {
      out.push(tr('export.none'));
    } else {
      for (const entry of stack.totals) {
        const amount =
          entry.totalMin === entry.totalMax
            ? `${entry.totalMax} ${entry.unit}`
            : `${entry.totalMin}–${entry.totalMax} ${entry.unit}`;

        const ref = entry.referenceCheck;
        const status = ref?.status === 'above_limit'
          ? ` — **${tr('export.aboveLimit', { limit: ref.upperLimit, unit: entry.unit })}**`
          : ref?.status === 'above_reference'
            ? ` — ${tr('export.aboveReference', { reference: ref.reference, unit: entry.unit })}`
            : '';

        out.push(
          `- ${entry.name}: ${amount}` +
            ` (${tr(
              entry.sources.length === 1 ? 'export.fromProducts_one' : 'export.fromProducts_other',
              { count: entry.sources.length }
            )})` +
            status
        );
      }

      if (stack.unresolved.length > 0) {
        out.push('');
        out.push(tr('export.unresolved', { count: stack.unresolved.length }));
      }
    }
    out.push('');
  }

  // ── Profil und Medikamentenhinweise ──────────────────────────
  if (sections.includes(EXPORT_SECTIONS.PROFILE)) {
    const classIds = profile?.medicationClasses ?? [];

    out.push(`## ${tr('export.section.profile')}`);
    out.push('');

    if (classIds.length === 0) {
      out.push(tr('export.noMedication'));
    } else {
      out.push(tr('export.medicationGroups'));
      for (const classId of classIds) {
        out.push(`- ${getMedicationClass(classId)?.label ?? classId}`);
      }

      const findings = checkProfileAgainstStack(profile, supplements);
      if (findings.length > 0) {
        out.push('');
        out.push(tr('export.medicationFindings'));
        out.push('');
        for (const finding of findings) {
          out.push(`- **${finding.substanceName}** ↔ ${finding.medicationClassLabel}`);
          out.push(`  > ${finding.quote}`);
        }
      }
    }
    out.push('');
  }

  // ── Laborwerte ───────────────────────────────────────────────
  if (sections.includes(EXPORT_SECTIONS.LAB)) {
    out.push(`## ${tr('export.section.lab')}`);
    out.push('');

    const grouped = getGroupedValues(labValues);
    if (grouped.length === 0) {
      out.push(tr('export.none'));
    } else {
      for (const group of grouped) {
        const marker = getLabMarker(group.markerId);
        const name = group.customName || tr(marker?.labelKey ?? group.markerId);
        out.push(`**${name}**`);

        for (const entry of group.entries) {
          const reference =
            entry.referenceMin !== null || entry.referenceMax !== null
              ? ` (${tr('export.labReference', {
                  min: entry.referenceMin ?? '',
                  max: entry.referenceMax ?? '',
                })})`
              : '';
          out.push(
            `- ${entry.dateKey}: ${entry.value} ${entry.unit}${reference}` +
              (entry.labName ? ` — ${entry.labName}` : '')
          );
        }
        out.push('');
      }
      out.push(tr('export.labNote'));
    }
    out.push('');
  }

  // ── Wirkungskontrolle ────────────────────────────────────────
  if (sections.includes(EXPORT_SECTIONS.OUTCOMES)) {
    out.push(`## ${tr('export.section.outcomes')}`);
    out.push('');

    if (trials.length === 0) {
      out.push(tr('export.none'));
    } else {
      for (const trial of trials) {
        const evaluation = evaluateTrial(trial, trialRatings, {
          intakeLogs,
          allTrials: trials,
          now,
        });
        const metric = getOutcomeMetric(trial.metricId);

        out.push(
          `- **${trial.supplementName}** — ${tr(metric?.labelKey ?? '')}` +
            ` (${trial.status === TRIAL_STATUS.RUNNING
              ? tr('export.trialRunning', { days: evaluation.elapsedDays })
              : tr(`export.trialConcluded.${trial.conclusion ?? 'unclear'}`)})`
        );

        if (evaluation.showComparison) {
          out.push(
            `  ${tr('export.trialChange', {
              baseline: evaluation.baseline,
              current: evaluation.recentAverage,
              count: evaluation.ratingCount,
            })}`
          );
        }

        // Ohne die Einschraenkungen waere die Zahl irrefuehrend — sie
        // gehoert genauso in den Bericht wie das Ergebnis selbst.
        if (evaluation.confounders.length > 0) {
          out.push(`  ${tr('export.trialLimitations', { count: evaluation.confounders.length })}`);
        }
      }
      out.push('');
      out.push(tr('export.outcomesNote'));
    }
    out.push('');
  }

  // ── Einnahmetreue ────────────────────────────────────────────
  if (sections.includes(EXPORT_SECTIONS.ADHERENCE)) {
    out.push(`## ${tr('export.section.adherence')}`);
    out.push('');

    const last30 = new Date(now.getTime() - 30 * 86400000).toISOString().slice(0, 10);
    const recent = intakeLogs.filter(
      (log) => !log?.undoneAt && log?.dateKey && log.dateKey >= last30
    );

    out.push(tr('export.adherenceSummary', { count: recent.length }));
    out.push('');
  }

  out.push('---');
  // Die Fusszeile ist der einzige Ort, an dem die App sich selbst nennt:
  // Jeder Bericht landet bei einer Fachperson, das ist der organische
  // Verbreitungsweg. Dezent halten — der Bericht gehoert der Nutzerin,
  // nicht dem Marketing.
  out.push(tr('export.footer', { app: APP_NAME }));

  return out.join('\n');
}
