import React from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import * as Notifications from 'expo-notifications';
// Legacy-API bewusst: stabile String-Schnittstelle fuer eine einzelne
// kleine JSON-Datei, kein Bedarf an der neuen File-Klassen-API.
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import LanguagePicker from '../../../components/LanguagePicker';
import {
  backupFileName,
  buildBackupPayload,
  parseBackupPayload,
} from '../../../BackupManager';
import LifeStagePicker from '../../../components/LifeStagePicker';
import { evaluateVisionScan, isPro } from '../../../Entitlements';
import { useTranslation } from '../../../i18n';
import useStore from '../../../useStore';
import {
  formatSupplementDosage as getSupplementDosage,
  formatSupplementName as getSupplementName,
  formatSupplementPurpose as getSupplementPurpose,
} from '../../../utils/supplementFormatting';
import { colors, radius, space, surfaces, toneFor, type } from '../../../theme';

const EMPTY_SUPPLEMENTS = [];
const EMPTY_LOGS = [];

const cautionTone = toneFor('caution');
const alertTone = toneFor('alert');

export default function SettingsScreen() {
  const router = useRouter();
  const { t, language } = useTranslation();
  const userSupplements =
    useStore((state) => state.userSupplements) ?? EMPTY_SUPPLEMENTS;
  const intakeLogs = useStore((state) => state.intakeLogs) ?? EMPTY_LOGS;
  const updateUserSupplement = useStore(
    (state) => state.updateUserSupplement
  );
  const clearIntakeLogs = useStore((state) => state.clearIntakeLogs);
  const activeLifeStageId = useStore((state) => state.activeLifeStageId);
  const setActiveLifeStage = useStore((state) => state.setActiveLifeStage);
  const scanUploadConsent = useStore((state) => state.consents?.scanUpload);
  const revokeScanConsent = useStore((state) => state.revokeScanConsent);
  const resetAllData = useStore((state) => state.resetAllData);
  const importBackup = useStore((state) => state.importBackup);
  const entitlement = useStore((state) => state.entitlement);

  const archivedSupplements = userSupplements.filter(
    (supplement) => supplement.status === 'archived'
  );
  const activeSupplements = userSupplements.filter(
    (supplement) => supplement.status !== 'archived'
  ).length;
  const activeIntakeLogs = intakeLogs.filter((log) => !log.undoneAt).length;
  const undoneIntakeLogs = intakeLogs.filter((log) => log.undoneAt).length;

  // Tarif und Scan-Kontingente (Entitlements.js): reine Anzeige, die
  // Verbrauchslogik sitzt im Scanner.
  const scanQuota = evaluateVisionScan(entitlement);
  const proTier = isPro(entitlement);

  const handleClearIntakeLogs = () => {
    if (intakeLogs.length === 0) {
      Alert.alert(
        t('settings.clearHistoryEmpty.title'),
        t('settings.clearHistoryEmpty.message')
      );
      return;
    }

    Alert.alert(
      t('settings.clearHistoryConfirm.title'),
      t('settings.clearHistoryConfirm.message', { count: intakeLogs.length }),
      [
        {
          text: t('settings.cancel'),
          style: 'cancel',
        },
        {
          text: t('settings.clearHistoryConfirm.confirmButton'),
          style: 'destructive',
          onPress: clearIntakeLogs,
        },
      ]
    );
  };

  const handleExportBackup = async () => {
    try {
      const payload = buildBackupPayload(useStore.getState());
      const uri =
        FileSystem.cacheDirectory + backupFileName(payload.exportedAt);
      await FileSystem.writeAsStringAsync(
        uri,
        JSON.stringify(payload, null, 2)
      );
      await Sharing.shareAsync(uri, { mimeType: 'application/json' });
    } catch (error) {
      Alert.alert(
        t('settings.backupExportError.title'),
        error?.message || t('settings.backupExportError.message')
      );
    }
  };

  const handleImportBackup = async () => {
    try {
      const picked = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
        copyToCacheDirectory: true,
      });
      if (picked.canceled || !picked.assets?.[0]?.uri) return;

      const text = await FileSystem.readAsStringAsync(picked.assets[0].uri);
      const parsed = parseBackupPayload(text);

      if (!parsed.ok) {
        Alert.alert(
          t('settings.backupImportError.title'),
          t(`settings.backupImportError.${parsed.error}`)
        );
        return;
      }

      Alert.alert(
        t('settings.backupImportConfirm.title'),
        t('settings.backupImportConfirm.message', {
          date: parsed.exportedAt ? parsed.exportedAt.slice(0, 10) : '?',
        }),
        [
          { text: t('settings.cancel'), style: 'cancel' },
          {
            text: t('settings.backupImportConfirm.confirmButton'),
            style: 'destructive',
            onPress: () => {
              importBackup(parsed.data);
              Alert.alert(
                t('settings.backupImportDone.title'),
                t('settings.backupImportDone.message')
              );
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert(
        t('settings.backupImportError.title'),
        error?.message || t('settings.backupImportError.invalidJson')
      );
    }
  };

  const handleRevokeScanConsent = () => {
    revokeScanConsent();
    Alert.alert(
      t('settings.scanConsentRevoked.title'),
      t('settings.scanConsentRevoked.message')
    );
  };

  // Zentraler Loeschweg (Art. 17 DSGVO). Zweistufig bestaetigt, weil es
  // kein Backup gibt: gelöscht ist geloescht. Danach greift das
  // Onboarding-Gate im Root-Layout automatisch wieder.
  const handleDeleteAll = () => {
    Alert.alert(
      t('settings.deleteAllConfirm.title'),
      t('settings.deleteAllConfirm.message'),
      [
        { text: t('settings.cancel'), style: 'cancel' },
        {
          text: t('settings.deleteAllConfirm.confirmButton'),
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              t('settings.deleteAllConfirm2.title'),
              t('settings.deleteAllConfirm2.message'),
              [
                { text: t('settings.cancel'), style: 'cancel' },
                {
                  text: t('settings.deleteAllConfirm2.confirmButton'),
                  style: 'destructive',
                  onPress: () => {
                    // Geplante Erinnerungen zeigen sonst auf Eintraege,
                    // die es nicht mehr gibt.
                    Notifications.cancelAllScheduledNotificationsAsync().catch(
                      () => {}
                    );
                    resetAllData();
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

  const handleRestoreSupplement = (supplement) => {
    const supplementName = getSupplementName(supplement);

    Alert.alert(
      t('settings.restoreConfirm.title'),
      t('settings.restoreConfirm.message', { name: supplementName }),
      [
        {
          text: t('settings.cancel'),
          style: 'cancel',
        },
        {
          text: t('settings.restoreConfirm.confirmButton'),
          onPress: () =>
            updateUserSupplement(supplement.id, { status: 'active' }),
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.kicker}>{t('settings.kicker')}</Text>
      <Text style={styles.title}>{t('settings.title')}</Text>
      <Text style={styles.subtitle}>{t('settings.subtitle')}</Text>

      <View style={styles.statusCard}>
        <Text style={styles.cardLabel}>{t('settings.profileLabel')}</Text>
        <Text style={styles.cardTitle}>{t('settings.lifeStageTitle')}</Text>
        <Text style={styles.cardText}>{t('settings.lifeStageText')}</Text>

        <View style={styles.lifeStageWrapper}>
          <LifeStagePicker
            value={activeLifeStageId}
            onChange={setActiveLifeStage}
          />
        </View>

        <Text style={styles.lifeStageNote}>{t('settings.lifeStageNote')}</Text>

        <View style={styles.lifeStageWrapper}>
          <LanguagePicker />
        </View>
      </View>

      <View style={styles.statusCard}>
        <Text style={styles.cardLabel}>{t('settings.localStatusLabel')}</Text>
        <Text style={styles.cardTitle}>{t('settings.localStatusTitle')}</Text>
        <Text style={styles.cardText}>{t('settings.localStatusText')}</Text>

        <View style={styles.statusGrid}>
          <View style={styles.statusItem}>
            <Text style={styles.statusValue}>{activeSupplements}</Text>
            <Text style={styles.statusLabel}>{t('settings.statusActive')}</Text>
          </View>

          <View style={styles.statusDivider} />

          <View style={styles.statusItem}>
            <Text style={styles.statusValue}>
              {archivedSupplements.length}
            </Text>
            <Text style={styles.statusLabel}>{t('settings.statusArchived')}</Text>
          </View>

          <View style={styles.statusDivider} />

          <View style={styles.statusItem}>
            <Text style={styles.statusValue}>{intakeLogs.length}</Text>
            <Text style={styles.statusLabel}>{t('settings.statusDocumented')}</Text>
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>{t('settings.quotaLabel')}</Text>
        <Text style={styles.cardTitle}>{t('settings.quotaTitle')}</Text>
        <Text style={styles.cardText}>{t('settings.quotaText')}</Text>

        <View style={styles.statusGrid}>
          <View style={styles.statusItem}>
            <Text style={styles.statusValue}>
              {proTier ? t('settings.quotaTierPro') : t('settings.quotaTierFree')}
            </Text>
            <Text style={styles.statusLabel}>{t('settings.quotaTierLabel')}</Text>
          </View>

          <View style={styles.statusDivider} />

          <View style={styles.statusItem}>
            <Text style={styles.statusValue}>
              {proTier ? scanQuota.remainingFairUse : scanQuota.remainingFree}
            </Text>
            <Text style={styles.statusLabel}>
              {proTier
                ? t('settings.quotaFairUseLabel')
                : t('settings.quotaFreeLabel')}
            </Text>
          </View>

          <View style={styles.statusDivider} />

          <View style={styles.statusItem}>
            <Text style={styles.statusValue}>{scanQuota.credits}</Text>
            <Text style={styles.statusLabel}>{t('settings.quotaCreditsLabel')}</Text>
          </View>
        </View>

        <Pressable
          onPress={() => router.push('/subscription')}
          accessibilityRole="button"
          style={({ pressed }) => [
            styles.backupButtonQuiet,
            pressed ? styles.legalLinkPressed : null,
          ]}
        >
          <Text style={styles.backupButtonQuietText}>
            {t('home.nav.subscription.title')}
          </Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>{t('settings.dataManagementLabel')}</Text>
        <Text style={styles.cardTitle}>{t('settings.dataManagementTitle')}</Text>
        <Text style={styles.cardText}>{t('settings.dataManagementText')}</Text>

        <View style={styles.trustNotice}>
          <Text style={styles.trustNoticeTitle}>
            {t('settings.controlledChangesTitle')}
          </Text>
          <Text style={styles.trustNoticeText}>
            {t('settings.controlledChangesText')}
          </Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>{t('settings.dataHygieneLabel')}</Text>
        <Text style={styles.cardTitle}>{t('settings.intakeHistoryTitle')}</Text>
        <Text style={styles.cardText}>{t('settings.intakeHistoryText')}</Text>

        <View style={styles.historyStats}>
          <View style={styles.historyStat}>
            <Text style={styles.historyStatValue}>{activeIntakeLogs}</Text>
            <Text style={styles.historyStatLabel}>
              {t('settings.historyStatIntakes')}
            </Text>
          </View>

          <View style={styles.historyStat}>
            <Text style={styles.historyStatValue}>{undoneIntakeLogs}</Text>
            <Text style={styles.historyStatLabel}>
              {t('settings.historyStatUndone')}
            </Text>
          </View>

          <View style={styles.historyStat}>
            <Text style={styles.historyStatValue}>{intakeLogs.length}</Text>
            <Text style={styles.historyStatLabel}>
              {t('settings.historyStatTotal')}
            </Text>
          </View>
        </View>

        <View style={styles.scopeBox}>
          <View style={styles.scopeRow}>
            <Text style={styles.scopeLabel}>{t('settings.scopeDeletedLabel')}</Text>
            <Text style={styles.scopeText}>
              {t('settings.scopeDeletedText')}
            </Text>
          </View>

          <View style={styles.scopeSeparator} />

          <View style={styles.scopeRow}>
            <Text style={styles.scopeLabel}>{t('settings.scopeKeptLabel')}</Text>
            <Text style={styles.scopeText}>
              {t('settings.scopeKeptText')}
            </Text>
          </View>
        </View>

        <Pressable
          onPress={handleClearIntakeLogs}
          accessibilityRole="button"
          style={({ pressed }) => [
            styles.dangerButton,
            pressed ? styles.dangerButtonPressed : null,
          ]}
        >
          <Text style={styles.dangerButtonText}>
            {t('settings.deleteHistoryButton')}
          </Text>
        </Pressable>
      </View>

      <View style={styles.archiveSection}>
        <Text style={styles.sectionLabel}>{t('settings.archiveLabel')}</Text>
        <Text style={styles.sectionTitle}>{t('settings.archiveTitle')}</Text>
        <Text style={styles.sectionText}>{t('settings.archiveText')}</Text>

        {archivedSupplements.length === 0 ? (
          <View style={styles.emptyArchiveCard}>
            <Text style={styles.emptyArchiveTitle}>
              {t('settings.emptyArchiveTitle')}
            </Text>
            <Text style={styles.emptyArchiveText}>
              {t('settings.emptyArchiveText')}
            </Text>
          </View>
        ) : (
          archivedSupplements.map((supplement) => (
            <View key={supplement.id} style={styles.archiveCard}>
              <View style={styles.archiveHeader}>
                <View style={styles.archiveTitleGroup}>
                  <Text style={styles.archiveName}>
                    {getSupplementName(supplement)}
                  </Text>
                  <Text style={styles.archiveMeta}>
                    {getSupplementDosage(supplement)}
                  </Text>
                </View>

                <View style={styles.archiveBadge}>
                  <Text style={styles.archiveBadgeText}>
                    {t('settings.archivedBadge')}
                  </Text>
                </View>
              </View>

              <View style={styles.archiveDetail}>
                <Text style={styles.archiveDetailLabel}>
                  {t('settings.storedPurposeLabel')}
                </Text>
                <Text style={styles.archiveDetailText}>
                  {getSupplementPurpose(supplement)}
                </Text>
              </View>

              <View style={styles.archiveTrustRow}>
                <Text style={styles.archiveTrustLabel}>
                  {t('settings.dataStatusLabel')}
                </Text>
                <Text style={styles.archiveTrustText}>
                  {t('settings.dataStatusText')}
                </Text>
              </View>

              <Pressable
                onPress={() => handleRestoreSupplement(supplement)}
                accessibilityRole="button"
                style={({ pressed }) => [
                  styles.restoreButton,
                  pressed ? styles.restoreButtonPressed : null,
                ]}
              >
                <Text style={styles.restoreButtonText}>
                  {t('settings.restoreFromArchiveButton')}
                </Text>
              </Pressable>
            </View>
          ))
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>{t('settings.backupLabel')}</Text>
        <Text style={styles.cardTitle}>{t('settings.backupTitle')}</Text>
        <Text style={styles.cardText}>{t('settings.backupText')}</Text>

        <Pressable
          onPress={handleExportBackup}
          accessibilityRole="button"
          style={({ pressed }) => [
            styles.backupButton,
            pressed ? styles.legalLinkPressed : null,
          ]}
        >
          <Text style={styles.backupButtonText}>
            {t('settings.backupExportButton')}
          </Text>
        </Pressable>

        <Pressable
          onPress={handleImportBackup}
          accessibilityRole="button"
          style={({ pressed }) => [
            styles.backupButtonQuiet,
            pressed ? styles.legalLinkPressed : null,
          ]}
        >
          <Text style={styles.backupButtonQuietText}>
            {t('settings.backupImportButton')}
          </Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>{t('settings.legalLabel')}</Text>
        <Text style={styles.cardTitle}>{t('settings.legalTitle')}</Text>
        <Text style={styles.cardText}>{t('settings.legalText')}</Text>

        <Pressable
          onPress={() => router.push('/privacy')}
          accessibilityRole="link"
          style={({ pressed }) => [
            styles.legalLink,
            pressed ? styles.legalLinkPressed : null,
          ]}
        >
          <Text style={styles.legalLinkText}>{t('settings.privacyLink')}</Text>
        </Pressable>

        <Pressable
          onPress={() => router.push('/imprint')}
          accessibilityRole="link"
          style={({ pressed }) => [
            styles.legalLink,
            pressed ? styles.legalLinkPressed : null,
          ]}
        >
          <Text style={styles.legalLinkText}>{t('settings.imprintLink')}</Text>
        </Pressable>

        <View style={styles.consentBox}>
          <Text style={styles.consentTitle}>{t('settings.scanConsentTitle')}</Text>
          <Text style={styles.consentText}>
            {scanUploadConsent
              ? t('settings.scanConsentGiven', {
                  date: new Date(scanUploadConsent).toLocaleDateString(
                    language === 'de' ? 'de-DE' : 'en-GB'
                  ),
                })
              : t('settings.scanConsentNone')}
          </Text>
          {scanUploadConsent ? (
            <Pressable
              onPress={handleRevokeScanConsent}
              accessibilityRole="button"
              style={({ pressed }) => [
                styles.consentRevokeButton,
                pressed ? styles.dangerButtonPressed : null,
              ]}
              hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }}
            >
              <Text style={styles.consentRevokeText}>
                {t('settings.scanConsentRevoke')}
              </Text>
            </Pressable>
          ) : null}
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>{t('settings.deleteAllLabel')}</Text>
        <Text style={styles.cardTitle}>{t('settings.deleteAllTitle')}</Text>
        <Text style={styles.cardText}>{t('settings.deleteAllText')}</Text>

        <Pressable
          onPress={handleDeleteAll}
          accessibilityRole="button"
          style={({ pressed }) => [
            styles.dangerButton,
            styles.deleteAllButton,
            pressed ? styles.dangerButtonPressed : null,
          ]}
        >
          <Text style={styles.dangerButtonText}>
            {t('settings.deleteAllButton')}
          </Text>
        </Pressable>
      </View>

      <View style={styles.noticeCard}>
        <Text style={styles.noticeLabel}>{t('settings.generalNoticeLabel')}</Text>
        <Text style={styles.noticeTitle}>{t('settings.generalNoticeTitle')}</Text>
        <Text style={styles.noticeText}>{t('settings.generalNoticeText')}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: surfaces.screen,
  content: surfaces.content,
  kicker: {
    ...type.eyebrow,
    marginBottom: space.sm,
  },
  title: {
    ...type.display,
  },
  subtitle: {
    ...type.body,
    marginTop: space.sm + 2,
    marginBottom: space.xl - 2,
  },
  lifeStageWrapper: {
    marginTop: space.md + 2,
    marginHorizontal: -4,
  },
  lifeStageNote: {
    ...type.tiny,
  },
  statusCard: {
    ...surfaces.card,
    borderColor: colors.ruleStrong,
  },
  card: {
    ...surfaces.card,
  },
  cardLabel: {
    ...type.label,
    color: colors.accent,
    marginBottom: space.sm,
  },
  cardTitle: {
    ...type.heading,
    marginBottom: space.sm,
  },
  cardText: {
    ...type.body,
  },
  statusGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSunken,
    borderRadius: radius.lg,
    paddingVertical: space.md + 2,
    marginTop: space.lg,
  },
  statusItem: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: space.sm - 2,
  },
  statusValue: {
    ...type.numeral,
    fontSize: 22,
  },
  statusLabel: {
    ...type.small,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: space.xs,
  },
  statusDivider: {
    width: 1,
    height: 32,
    backgroundColor: colors.rule,
  },
  trustNotice: {
    backgroundColor: colors.accentSoft,
    borderRadius: radius.md,
    padding: space.md,
    marginTop: space.md + 2,
  },
  trustNoticeTitle: {
    color: colors.accentInk,
    fontSize: 13,
    fontWeight: '900',
    marginBottom: space.xs + 1,
  },
  trustNoticeText: {
    color: colors.inkMuted,
    fontSize: 13,
    lineHeight: 20,
  },
  historyStats: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceSunken,
    borderRadius: radius.lg,
    paddingVertical: space.md + 2,
    marginTop: space.lg,
    marginBottom: space.md + 2,
  },
  historyStat: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: space.sm - 2,
  },
  historyStatValue: {
    ...type.numeral,
    fontSize: 20,
  },
  historyStatLabel: {
    ...type.small,
    fontWeight: '700',
    marginTop: space.xs,
  },
  scopeBox: {
    backgroundColor: cautionTone.surface,
    borderRadius: radius.md,
    padding: space.md,
    marginBottom: space.md + 2,
  },
  scopeRow: {
    gap: space.xs,
  },
  scopeLabel: {
    ...type.label,
    color: cautionTone.ink,
  },
  scopeText: {
    color: colors.inkMuted,
    fontSize: 13,
    lineHeight: 19,
  },
  scopeSeparator: {
    height: 1,
    backgroundColor: cautionTone.rule,
    marginVertical: space.sm + 2,
  },
  // Tippflaeche 44 pt (CLAUDE.md Bedienregeln).
  dangerButton: {
    backgroundColor: alertTone.surface,
    borderColor: alertTone.rule,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingVertical: space.md + 1,
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center',
  },
  dangerButtonPressed: {
    opacity: 0.72,
  },
  legalLink: {
    borderBottomColor: colors.rule,
    borderBottomWidth: 1,
    paddingVertical: space.md,
  },
  legalLinkText: {
    ...type.bodyStrong,
    color: colors.accent,
  },
  legalLinkPressed: {
    opacity: 0.72,
  },
  consentBox: {
    backgroundColor: colors.surfaceSunken,
    borderRadius: radius.md,
    padding: space.md,
    marginTop: space.md + 2,
  },
  consentTitle: {
    ...type.label,
    marginBottom: space.xs + 1,
  },
  consentText: {
    ...type.small,
  },
  // Tippflaeche 44 pt (CLAUDE.md Bedienregeln): hitSlop allein reichte
  // rechnerisch nicht, die Flaeche selbst traegt jetzt die 44 pt.
  consentRevokeButton: {
    marginTop: space.md,
    alignSelf: 'flex-start',
    minHeight: 44,
    justifyContent: 'center',
  },
  consentRevokeText: {
    color: alertTone.ink,
    fontSize: 13,
    fontWeight: '800',
  },
  deleteAllButton: {
    marginTop: space.md + 2,
  },
  backupButton: {
    ...surfaces.buttonPrimary,
    marginTop: space.md + 2,
  },
  backupButtonText: surfaces.buttonPrimaryText,
  backupButtonQuiet: {
    ...surfaces.buttonQuiet,
    marginTop: space.sm + 2,
  },
  backupButtonQuietText: surfaces.buttonQuietText,
  dangerButtonText: {
    color: alertTone.ink,
    fontSize: 14,
    fontWeight: '900',
  },
  archiveSection: {
    marginTop: space.md + 2,
  },
  sectionLabel: {
    ...type.label,
    color: colors.accent,
    marginBottom: space.sm,
  },
  sectionTitle: {
    ...type.display,
    fontSize: 22,
    lineHeight: 28,
  },
  sectionText: {
    ...type.body,
    marginTop: space.sm,
    marginBottom: space.md + 2,
  },
  emptyArchiveCard: {
    ...surfaces.card,
    marginBottom: 0,
  },
  emptyArchiveTitle: {
    ...type.subheading,
    marginBottom: space.sm - 2,
  },
  emptyArchiveText: {
    ...type.body,
  },
  archiveCard: {
    ...surfaces.card,
    borderColor: colors.ruleStrong,
  },
  archiveHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: space.sm + 2,
    marginBottom: space.md + 2,
  },
  archiveTitleGroup: {
    flex: 1,
  },
  archiveName: {
    ...type.bodyStrong,
    fontSize: 17,
    marginBottom: space.xs + 1,
  },
  archiveMeta: {
    ...type.body,
  },
  archiveBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surfaceSunken,
    borderRadius: radius.md,
    paddingHorizontal: space.sm + 1,
    paddingVertical: space.xs + 1,
  },
  archiveBadgeText: {
    color: colors.inkMuted,
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  archiveDetail: {
    backgroundColor: colors.surfaceSunken,
    borderRadius: radius.md,
    padding: space.md,
    marginBottom: space.sm + 2,
  },
  archiveDetailLabel: {
    ...type.label,
    color: colors.accent,
    marginBottom: space.xs + 1,
  },
  archiveDetailText: {
    color: colors.inkMuted,
    fontSize: 14,
    lineHeight: 21,
  },
  archiveTrustRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: space.sm + 2,
    marginBottom: space.md + 2,
  },
  archiveTrustLabel: {
    color: colors.inkMuted,
    fontSize: 12,
    fontWeight: '700',
  },
  archiveTrustText: {
    flex: 1,
    color: colors.accent,
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'right',
  },
  restoreButton: {
    ...surfaces.buttonPrimary,
    paddingVertical: space.md + 1,
  },
  restoreButtonPressed: {
    opacity: 0.82,
  },
  restoreButtonText: {
    ...surfaces.buttonPrimaryText,
  },
  noticeCard: {
    backgroundColor: colors.surfaceSunken,
    borderRadius: radius.lg,
    padding: space.md + 2,
    marginTop: space.lg,
  },
  noticeLabel: {
    ...type.label,
    marginBottom: space.sm - 1,
  },
  noticeTitle: {
    ...type.subheading,
    marginBottom: space.sm - 2,
  },
  noticeText: {
    ...type.body,
    fontSize: 13,
  },
});
