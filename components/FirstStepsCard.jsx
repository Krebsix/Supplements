import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { ACCOUNT_STATUS } from '../AccountStore';
import { buildFirstSteps, FIRST_STEP_IDS, STEP_STATE } from '../FirstSteps';
import { useTranslation } from '../i18n';
import { colors, radius, space, surfaces, type } from '../theme';
import useAccountStore from '../useAccountStore';
import useCloudBackupStore from '../useCloudBackupStore';
import useNotificationStore from '../useNotificationStore';
import useStore from '../useStore';
import AddSupplementChooser from './AddSupplementChooser';

/**
 * Ersteinrichtung auf dem Tagesplan, solange kein Praeparat im Bestand
 * liegt. Nummerierte Schritte, erledigte abgehakt, der naechste
 * hervorgehoben. Welche Schritte wie stehen, entscheidet FirstSteps.js;
 * hier wird nur gerendert und navigiert.
 */
export default function FirstStepsCard() {
  const { t } = useTranslation();
  const router = useRouter();

  const onboardingCompletedAt = useStore((state) => state.onboardingCompletedAt);
  const onboarding = useStore((state) => state.onboarding);
  const supplementCount = useStore((state) => state.getActiveSupplements().length);
  const accountStatus = useAccountStore((state) => state.status);
  const notificationsEnabled = useNotificationStore((state) => state.notificationsEnabled);
  const permissionGranted = useNotificationStore((state) => state.permissionGranted);
  const autoBackup = useCloudBackupStore((state) => state.autoBackup);

  const steps = buildFirstSteps({
    profileComplete: Boolean(onboardingCompletedAt),
    accountOffered: Boolean(onboarding?.accountOffered),
    accountSignedIn: accountStatus === ACCOUNT_STATUS.SIGNED_IN,
    accountEmailPending: onboarding?.accountEmailPending ?? null,
    supplementCount,
    notificationsEnabled: Boolean(notificationsEnabled && permissionGranted),
  });

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{t('dashboard.firstSteps.title')}</Text>
      <Text style={styles.intro}>{t('dashboard.firstSteps.intro')}</Text>

      {steps.map((step, index) => (
        <StepRow
          key={step.id}
          index={index + 1}
          step={step}
          isLast={index === steps.length - 1}
          t={t}
          router={router}
          autoBackup={autoBackup}
        />
      ))}
    </View>
  );
}

function StepRow({ index, step, isLast, t, router, autoBackup }) {
  const done = step.state === STEP_STATE.DONE;
  const current = step.state === STEP_STATE.CURRENT;
  const detail = detailFor(step, t, autoBackup);

  return (
    <View style={[styles.row, isLast && styles.rowLast, current && styles.rowCurrent]}>
      <View style={[styles.badge, done && styles.badgeDone, current && styles.badgeCurrent]}>
        {done ? (
          <Feather name="check" size={14} color={colors.surface} />
        ) : (
          <Text style={[styles.badgeText, current && styles.badgeTextCurrent]}>{index}</Text>
        )}
      </View>

      <View style={styles.body}>
        <Text style={[styles.stepTitle, current && styles.stepTitleCurrent]}>
          {t(`dashboard.firstSteps.${step.id}.title`)}
        </Text>
        {detail ? <Text style={styles.stepDetail}>{detail}</Text> : null}

        {current && step.id === FIRST_STEP_IDS.SUPPLEMENT ? (
          <View style={styles.chooser}>
            <AddSupplementChooser
              compact
              onScan={() => router.push('/scanner')}
              onSearch={() => router.push('/search')}
              onManual={() => router.push('/AddSupplement')}
            />
          </View>
        ) : null}

        {step.id === FIRST_STEP_IDS.ACCOUNT && step.state === STEP_STATE.SKIPPED ? (
          <QuietLink label={t('dashboard.firstSteps.account.action')} onPress={() => router.push('/account')} />
        ) : null}

        {step.id === FIRST_STEP_IDS.REMINDERS && !done ? (
          <QuietLink
            label={t('dashboard.firstSteps.reminders.action')}
            onPress={() => router.push('/notifications')}
          />
        ) : null}

        {current && step.id === FIRST_STEP_IDS.PROFILE ? (
          <QuietLink label={t('dashboard.firstSteps.profile.title')} onPress={() => router.push('/profile')} />
        ) : null}
      </View>
    </View>
  );
}

function detailFor(step, t, autoBackup) {
  switch (step.id) {
    case FIRST_STEP_IDS.PROFILE:
      return t(step.state === STEP_STATE.DONE ? 'dashboard.firstSteps.profile.done' : 'dashboard.firstSteps.profile.open');
    case FIRST_STEP_IDS.ACCOUNT:
      if (step.state === STEP_STATE.DONE) {
        return `${t('dashboard.firstSteps.account.done')} ${t(autoBackup ? 'dashboard.firstSteps.account.doneCloudOn' : 'dashboard.firstSteps.account.doneCloudOff')}`;
      }
      if (step.state === STEP_STATE.PENDING) return t('dashboard.firstSteps.account.pending', { email: step.email });
      return `${t('dashboard.firstSteps.account.skipped')} ${t('dashboard.firstSteps.account.skippedCloud')}`;
    case FIRST_STEP_IDS.SUPPLEMENT:
      return t(step.state === STEP_STATE.CURRENT ? 'dashboard.firstSteps.supplement.current' : 'dashboard.firstSteps.supplement.open');
    case FIRST_STEP_IDS.REMINDERS:
      return t(step.state === STEP_STATE.DONE ? 'dashboard.firstSteps.reminders.done' : 'dashboard.firstSteps.reminders.open');
    default:
      return '';
  }
}

function QuietLink({ label, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={styles.link}
      accessibilityRole="button"
      // Tippflaeche 44 pt (CLAUDE.md Bedienregeln): hitSlop=8 reichte bei
      // ~20 pt Inhalt nicht aus.
      hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }}
    >
      <Text style={styles.linkText}>{label}</Text>
      <Feather name="chevron-right" size={16} color={colors.accent} />
    </Pressable>
  );
}

const BADGE = 26;

const styles = StyleSheet.create({
  card: {
    ...surfaces.card,
    padding: space.lg,
  },
  title: {
    ...type.subheading,
  },
  intro: {
    ...type.body,
    marginTop: space.xs,
    marginBottom: space.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: space.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.rule,
  },
  rowLast: {
    borderBottomWidth: 0,
    paddingBottom: 0,
  },
  rowCurrent: {
    backgroundColor: colors.accentSoft,
    marginHorizontal: -space.lg,
    paddingHorizontal: space.lg,
    borderRadius: radius.md,
    borderBottomWidth: 0,
  },
  badge: {
    // Dynamic Type: minWidth/minHeight statt fester Groesse, damit der
    // Kreis bei grosser Systemschrift mit der Ziffer mitwaechst statt sie
    // abzuschneiden.
    minWidth: BADGE,
    minHeight: BADGE,
    borderRadius: BADGE / 2,
    borderWidth: 1,
    borderColor: colors.ruleStrong,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: space.md,
    marginTop: 1,
  },
  badgeDone: {
    backgroundColor: colors.affirm,
    borderColor: colors.affirm,
  },
  badgeCurrent: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  badgeText: {
    ...type.small,
    color: colors.inkMuted,
  },
  badgeTextCurrent: {
    color: colors.surface,
  },
  body: {
    flex: 1,
  },
  stepTitle: {
    ...type.bodyStrong,
  },
  stepTitleCurrent: {
    color: colors.accentInk,
  },
  stepDetail: {
    ...type.small,
    marginTop: 2,
  },
  chooser: {
    marginTop: space.md,
  },
  link: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: space.sm,
  },
  linkText: {
    ...type.small,
    color: colors.accent,
  },
});
