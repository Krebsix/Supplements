import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';

import OnboardingShell from '../components/onboarding/OnboardingShell';
import StepWelcome from '../components/onboarding/StepWelcome';
import StepLegal from '../components/onboarding/StepLegal';
import StepName from '../components/onboarding/StepName';
import StepGender from '../components/onboarding/StepGender';
import StepBirthYear from '../components/onboarding/StepBirthYear';
import StepExtra from '../components/onboarding/StepExtra';
import StepRoutineTimes from '../components/onboarding/StepRoutineTimes';
import StepRoutineFirst from '../components/onboarding/StepRoutineFirst';
import StepAccount from '../components/onboarding/StepAccount';
import StepDone from '../components/onboarding/StepDone';
import { resolveLifeStage } from '../LifeStageResolver';
import { buildSteps, canAdvance } from '../OnboardingSteps';
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

function QuietButton({ label, onPress }) {
  return (
    <TouchableOpacity
      style={styles.quietButton}
      onPress={onPress}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Text style={surfaces.buttonQuietText}>{label}</Text>
    </TouchableOpacity>
  );
}

/**
 * OnboardingScreen
 * ─────────────────────────────────────────────────────────────
 * Neun bis zehn Schritte vom Logo zum ersten Tagesplan (siehe
 * docs/superpowers/specs/2026-08-30-onboarding-gefuehrt-design.md,
 * Abschnitt "Ablauf"). Traegt selbst keine Fachlogik: Die Referenzgruppe
 * kommt aus LifeStageResolver.js, das Speichern aus completeOnboarding()
 * (useStore.js). Dieser Screen verwaltet nur die Antworten im
 * Screen-Zustand und die Schrittfolge, die daraus abgeleitete Liste
 * entscheidet, was als Naechstes kommt.
 *
 * Antworten leben bewusst NICHT im Store: Bricht die Nutzerin das
 * Onboarding mitten drin ab, beginnt es beim naechsten Start von vorn,
 * es gibt keinen Teilzustand, der widerspruechlich mit einem spaeter
 * doch abgeschlossenen Onboarding kollidieren koennte.
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
    accountChoice: null,
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

  // Die Schrittliste haengt bewusst NICHT an `resolved.needsExtra`: Das
  // wird null, sobald die Zusatzfrage beantwortet ist, und wuerde den
  // gerade beantworteten Schritt im selben Render aus der Liste werfen.
  // buildSteps() (OnboardingSteps.js) fragt stattdessen ueber
  // extraQuestionFor(), ob die Frage fuer diese Person grundsaetzlich
  // gilt, unabhaengig vom Beantwortet-Status.
  const steps = useMemo(
    () => buildSteps({ gender: answers.gender, birthYear: answers.birthYear }),
    [answers.gender, answers.birthYear]
  );
  // Die Liste kann kuerzer werden als der zuletzt gesetzte Index (z. B.
  // Zusatzfrage faellt weg, weil die Nutzerin eine Etage weiter oben das
  // Geschlecht gewechselt hat): nie ausserhalb der aktuellen Liste zeigen.
  const safeStepIndex = Math.min(stepIndex, steps.length - 1);
  const stepId = steps[safeStepIndex];

  const patchAnswers = (patch) => setAnswers((current) => ({ ...current, ...patch }));

  const goTo = (nextIndex, dir) => {
    setDirection(dir);
    setStepIndex(nextIndex);
  };

  // Schritt 1 (Willkommen) und Schritt 2 (Rechtliches) haben keinen
  // Zurueck-Pfeil: Rechtliches laesst sich nicht ueberspringen, Willkommen
  // ist der Einstieg selbst.
  const canGoBack = safeStepIndex >= 2;
  const goBack = () => {
    if (!canGoBack) return;
    goTo(safeStepIndex - 1, 'back');
  };

  const finish = () => {
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
    const target =
      answers.accountChoice === 'create'
        ? '/account'
        : answers.firstAction === 'scan'
        ? '/scanner'
        : answers.firstAction === 'search'
        ? '/search'
        : '/Dashboard';
    // Der zustand-Set oben ist synchron, aber die (tabs)-Screens hinter
    // dem Stack.Protected-Gate (app/_layout.jsx) sind erst nach dem
    // naechsten Render gemountet. Direktes replace() faende sie noch
    // nicht, ein Tick Verzoegerung reicht.
    setTimeout(() => router.replace(target), 0);
  };

  const goNext = async () => {
    if (stepId === 'routineTimes' && useNotificationStore.getState().notificationsEnabled) {
      // Die Systemerlaubnis wird bewusst erst hier abgefragt, nicht schon
      // beim Umlegen des Schalters: Der Weiter-Tipp ist der Moment, in dem
      // die Nutzerin die Wahl bestaetigt. Ein abgelehntes Promise (native
      // Anfrage schlaegt fehl) darf "Weiter" nicht stumm blockieren, deshalb
      // wird wie eine verweigerte Erlaubnis behandelt und trotzdem
      // weitergegangen.
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
      }
    }

    if (stepId === 'done') {
      finish();
      return;
    }

    goTo(safeStepIndex + 1, 'forward');
  };

  const handleSkipName = () => {
    patchAnswers({ displayName: '' });
    goTo(safeStepIndex + 1, 'forward');
  };

  const handleAccountChoice = (choice) => {
    patchAnswers({ accountChoice: choice });
    goTo(safeStepIndex + 1, 'forward');
  };

  const renderStep = () => {
    switch (stepId) {
      case 'welcome':
        return <StepWelcome t={t} />;
      case 'legal':
        return (
          <StepLegal
            t={t}
            onOpenTerms={() => router.push('/terms')}
            onOpenPrivacy={() => router.push('/privacy')}
          />
        );
      case 'name':
        return (
          <StepName
            t={t}
            value={answers.displayName}
            onChange={(displayName) => patchAnswers({ displayName })}
          />
        );
      case 'gender':
        return (
          <StepGender
            t={t}
            value={answers.gender}
            onChange={(gender) => patchAnswers({ gender })}
          />
        );
      case 'birthYear':
        return (
          <StepBirthYear
            t={t}
            value={answers.birthYear}
            onChange={(birthYear) => patchAnswers({ birthYear })}
            resolved={resolved}
          />
        );
      case 'extra':
        return (
          <StepExtra
            t={t}
            value={{ extra: answers.extra, referenceOverride: answers.referenceOverride }}
            onChange={(patch) => patchAnswers(patch)}
            resolved={resolved}
          />
        );
      case 'routineTimes':
        return <StepRoutineTimes t={t} value={permissionDenied} />;
      case 'routineFirst':
        return (
          <StepRoutineFirst
            t={t}
            value={answers.firstAction}
            onChange={(firstAction) => patchAnswers({ firstAction })}
          />
        );
      case 'account':
        return <StepAccount t={t} />;
      case 'done':
        return <StepDone t={t} value={answers.displayName} />;
      default:
        return null;
    }
  };

  const renderFooter = () => {
    switch (stepId) {
      case 'welcome':
        return <PrimaryButton label={t('onboarding.welcome.start')} onPress={goNext} />;
      case 'legal':
        return <PrimaryButton label={t('onboarding.legal.accept')} onPress={goNext} />;
      case 'name':
        return (
          <View>
            <PrimaryButton label={t('onboarding.next')} onPress={goNext} />
            <QuietButton label={t('onboarding.skip')} onPress={handleSkipName} />
          </View>
        );
      case 'gender':
      case 'birthYear':
      case 'extra':
      case 'routineTimes':
      case 'routineFirst':
        return (
          <PrimaryButton
            label={t('onboarding.next')}
            onPress={goNext}
            disabled={!canAdvance(stepId, answers, resolved)}
          />
        );
      case 'account':
        // "Spaeter ohne Konto" ist der Primaerknopf: Die App verlangt kein
        // Konto, ein Konto ist ein Angebot, keine Voraussetzung.
        return (
          <View>
            <PrimaryButton
              label={t('onboarding.account.later')}
              onPress={() => handleAccountChoice('later')}
            />
            <QuietButton
              label={t('onboarding.account.create')}
              onPress={() => handleAccountChoice('create')}
            />
          </View>
        );
      case 'done':
        return <PrimaryButton label={t('onboarding.done.go')} onPress={goNext} />;
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
