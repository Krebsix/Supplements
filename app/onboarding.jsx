import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';

import OnboardingShell from '../components/onboarding/OnboardingShell';
import ScreenStart from '../components/onboarding/ScreenStart';
import ScreenRoutine from '../components/onboarding/ScreenRoutine';
import { resolveLifeStage } from '../LifeStageResolver';
import { STEP_IDS, buildSteps, canAdvance } from '../OnboardingSteps';
import useNotificationStore from '../useNotificationStore';
import { useStore } from '../useStore';
import { PRIVACY_VERSION, TERMS_VERSION } from '../data/legalContent';
import { useTranslation } from '../i18n';
import { space, surfaces } from '../theme';

const DEFAULT_BIRTH_YEAR = 1990;

function PrimaryButton({ label, onPress, disabled }) {
  return (
    <TouchableOpacity
      style={[styles.primaryButton, disabled && styles.buttonDisabled]}
      onPress={disabled ? undefined : onPress}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      accessibilityLabel={label}
    >
      <Text style={surfaces.buttonPrimaryText}>{label}</Text>
    </TouchableOpacity>
  );
}

function QuietButton({ label, onPress, disabled }) {
  return (
    <TouchableOpacity
      style={[styles.quietButton, disabled && styles.buttonDisabled]}
      onPress={disabled ? undefined : onPress}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      accessibilityLabel={label}
    >
      <Text style={surfaces.buttonQuietText}>{label}</Text>
    </TouchableOpacity>
  );
}

/**
 * OnboardingScreen
 * ─────────────────────────────────────────────────────────────
 * Zwei Bildschirme vom Logo zum ersten Tagesplan (Spec 2026-09-04,
 * Redesign IA und Marke: die fruehere Neun-Schritt-Folge ist auf
 * ScreenStart (Anrede, Geschlecht, Geburtsjahr, Zusatzfrage, Rechtstext)
 * und ScreenRoutine (Einnahmezeiten, erstes Praeparat) gebuendelt.
 * Traegt selbst keine Fachlogik: Die Referenzgruppe kommt aus
 * LifeStageResolver.js, welche Schritte es gibt und wann "Weiter" frei
 * ist aus OnboardingSteps.js, das Speichern aus completeOnboarding()
 * (useStore.js). Dieser Screen verwaltet nur die Antworten im
 * Screen-Zustand und die Schrittfolge.
 *
 * Antworten leben bewusst NICHT im Store: Bricht die Nutzerin das
 * Onboarding mitten drin ab, beginnt es beim naechsten Start von vorn,
 * es gibt keinen Teilzustand, der widerspruechlich mit einem spaeter
 * doch abgeschlossenen Onboarding kollidieren koennte.
 *
 * Das Konto-Angebot ist kein eigener Pflichtschritt mehr: ScreenRoutine
 * traegt in der Fusszeile einen zweiten, leiseren Knopf ("Konto
 * anlegen"), der denselben Abschluss ausloest wie der Primaerknopf, nur
 * mit dem Ziel /account statt der firstAction-abhaengigen Zielseite (siehe
 * renderFooter, STEP_IDS.ROUTINE: /scanner bei "scan", /search bei
 * "search", sonst /Dashboard -- unveraendert aus der fruehreren
 * Schrittfolge uebernommen). `accountOffered` (Onboarding-Flag, siehe
 * CLAUDE.md Datenhaltung-Abschnitt) wird unveraendert bei jedem Abschluss
 * anhand des Alters gesetzt (`!resolved.underage`), ganz gleich welcher
 * der beiden Knoepfe gedrueckt wurde.
 */
export default function OnboardingScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const completeOnboarding = useStore((state) => state.completeOnboarding);
  const setNotificationsEnabled = useNotificationStore((state) => state.setNotificationsEnabled);
  const checkAndRequestPermission = useNotificationStore(
    (state) => state.checkAndRequestPermission
  );

  const [answers, setAnswers] = useState({
    displayName: '',
    gender: null,
    birthYear: DEFAULT_BIRTH_YEAR,
    extra: null,
    referenceOverride: null,
    firstAction: null,
  });
  const [stepIndex, setStepIndex] = useState(0);
  const [direction, setDirection] = useState('forward');
  const [permissionDenied, setPermissionDenied] = useState(false);

  const resolved = useMemo(
    () =>
      resolveLifeStage({
        gender: answers.gender,
        birthYear: answers.birthYear,
        extra: answers.extra,
        referenceOverride: answers.referenceOverride,
      }),
    [answers.gender, answers.birthYear, answers.extra, answers.referenceOverride]
  );

  // buildSteps() liefert immer genau die zwei Schritte start/routine
  // (OnboardingSteps.js), unabhaengig von den Antworten.
  const steps = buildSteps();
  const safeStepIndex = Math.min(stepIndex, steps.length - 1);
  const stepId = steps[safeStepIndex];

  const patchAnswers = (patch) => setAnswers((current) => ({ ...current, ...patch }));

  const goTo = (nextIndex, dir) => {
    setDirection(dir);
    setStepIndex(nextIndex);
  };

  // Schritt 1 (Start) hat keinen Zurueck-Pfeil, er ist der Einstieg
  // selbst.
  const canGoBack = safeStepIndex >= 1;
  const goBack = () => {
    if (!canGoBack) return;
    goTo(safeStepIndex - 1, 'back');
  };

  const goNext = () => {
    goTo(safeStepIndex + 1, 'forward');
  };

  // Die Systemerlaubnis fuer Erinnerungen wird bewusst erst beim
  // Abschluss abgefragt, nicht schon beim Umlegen des Schalters in
  // StepRoutineTimes: Der Abschluss-Tipp ist der Moment, in dem die
  // Nutzerin die Wahl bestaetigt. Ein abgelehntes Promise (native
  // Anfrage schlaegt fehl) darf den Abschluss nicht stumm blockieren,
  // deshalb wird das wie eine verweigerte Erlaubnis behandelt und
  // trotzdem abgeschlossen.
  //
  // Rueckgabewert (true = abgelehnt) wird von finish() genutzt, um die
  // Weiterleitung kurz zu verzoegern: Ohne diese Verzoegerung wuerde
  // setPermissionDenied(true) zwar committen, aber noch im selben Tick
  // durch die Navigation weg von StepRoutineTimes wieder verworfen,
  // die Nutzerin saehe den Hinweis nie (siehe Review-Fund 2026-09-04).
  const requestNotificationPermissionIfNeeded = async () => {
    if (!useNotificationStore.getState().notificationsEnabled) return false;
    let granted = false;
    try {
      granted = await checkAndRequestPermission();
    } catch (error) {
      console.error('[Onboarding] Push-Erlaubnis', error);
      granted = false;
    }
    if (!granted) {
      setNotificationsEnabled(false);
      setPermissionDenied(true);
      return true;
    }
    return false;
  };

  // finish() ersetzt den frueheren StepDone-Zwischenscreen: Abschluss
  // passiert direkt vom letzten Schritt aus. target kommt vom Aufrufer:
  // primaryTarget (renderFooter, STEP_IDS.ROUTINE) fuer den Primaerknopf
  // -- /scanner oder /search bei entsprechender firstAction, sonst
  // /Dashboard -- oder /account fuer den leiseren Konto-Knopf.
  const finish = async (target) => {
    const permissionWasDenied = await requestNotificationPermissionIfNeeded();
    completeOnboarding({
      lifeStageId: resolved.lifeStageId,
      privacyVersion: PRIVACY_VERSION,
      termsVersion: TERMS_VERSION,
      profile: {
        displayName: answers.displayName,
        gender: answers.gender,
        birthYear: answers.birthYear,
      },
      firstAction: answers.firstAction,
      accountOffered: !resolved.underage,
    });
    // Der zustand-Set oben ist synchron, aber die Screens hinter dem
    // Stack.Protected-Gate (app/_layout.jsx) sind erst nach dem
    // naechsten Render gemountet. Direktes replace() faende sie noch
    // nicht, ein Tick Verzoegerung reicht. Wurde die Erinnerungs-Erlaubnis
    // gerade abgelehnt, bleibt die Nutzerin laenger auf StepRoutineTimes:
    // Sonst verschwindet permissionDenied im selben Frame, in dem es
    // gesetzt wurde, und sie erfaehrt nie, warum Erinnerungen wieder aus
    // sind (siehe Kommentar an requestNotificationPermissionIfNeeded).
    const delay = permissionWasDenied ? 2200 : 0;
    setTimeout(() => router.replace(target), delay);
  };

  const renderStep = () => {
    switch (stepId) {
      case STEP_IDS.START:
        return (
          <ScreenStart
            t={t}
            answers={answers}
            onChange={patchAnswers}
            resolved={resolved}
            onOpenTerms={() => router.push('/terms')}
            onOpenPrivacy={() => router.push('/privacy')}
          />
        );
      case STEP_IDS.ROUTINE:
        return (
          <ScreenRoutine
            t={t}
            answers={answers}
            onChange={patchAnswers}
            permissionDenied={permissionDenied}
          />
        );
      default:
        return null;
    }
  };

  const renderFooter = () => {
    switch (stepId) {
      case STEP_IDS.START:
        // "Akzeptieren und weiter" ist bewusst die einzige Bestaetigung
        // der Rechtstexte (siehe StepLegal.jsx): Es gibt keinen eigenen
        // Haken, der Knopf traegt beides, das Profil UND die Zustimmung.
        return (
          <PrimaryButton
            label={t('onboarding.legal.accept')}
            onPress={goNext}
            disabled={!canAdvance(STEP_IDS.START, answers, resolved)}
          />
        );
      case STEP_IDS.ROUTINE: {
        const disabled = !canAdvance(STEP_IDS.ROUTINE, answers, resolved);
        // Wie vor dem Zwei-Screen-Umbau: "Scannen"/"Suchen" als erste
        // Handlung fuehrt direkt dorthin, "Später" (oder gar nichts)
        // landet auf dem Tagesplan. Der Konto-Knopf ueberschreibt das
        // bewusst mit /account, siehe unten.
        const primaryTarget =
          answers.firstAction === 'scan'
            ? '/scanner'
            : answers.firstAction === 'search'
            ? '/search'
            : '/Dashboard';
        return (
          <View>
            <PrimaryButton
              label={t('onboarding.done.go')}
              onPress={() => finish(primaryTarget)}
              disabled={disabled}
            />
            {/* Minderjaehrige bekommen kein Konto-Angebot (frueher: buildSteps()
                liess STEP_IDS.ACCOUNT fuer `underage` ganz aus). */}
            {!resolved.underage ? (
              <QuietButton
                label={t('onboarding.account.create')}
                onPress={() => finish('/account')}
                disabled={disabled}
              />
            ) : null}
          </View>
        );
      }
      default:
        return null;
    }
  };

  return (
    <OnboardingShell
      step={safeStepIndex + 1}
      total={steps.length}
      direction={direction}
      canGoBack={canGoBack}
      onBack={goBack}
      footer={renderFooter()}
    >
      {renderStep()}
    </OnboardingShell>
  );
}

const styles = StyleSheet.create({
  primaryButton: { ...surfaces.buttonPrimary },
  quietButton: { ...surfaces.buttonQuiet, marginTop: space.sm },
  buttonDisabled: { opacity: 0.5 },
});
