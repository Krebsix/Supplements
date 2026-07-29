import React from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import LanguagePicker from '../components/LanguagePicker';
import LifeStagePicker from '../components/LifeStagePicker';
import { useTranslation } from '../i18n';
import useStore from '../useStore';
import {
  formatSupplementDosage as getSupplementDosage,
  formatSupplementName as getSupplementName,
  formatSupplementPurpose as getSupplementPurpose,
} from '../utils/supplementFormatting';

const EMPTY_SUPPLEMENTS = [];
const EMPTY_LOGS = [];

export default function SettingsScreen() {
  const { t } = useTranslation();
  const userSupplements =
    useStore((state) => state.userSupplements) ?? EMPTY_SUPPLEMENTS;
  const intakeLogs = useStore((state) => state.intakeLogs) ?? EMPTY_LOGS;
  const updateUserSupplement = useStore(
    (state) => state.updateUserSupplement
  );
  const clearIntakeLogs = useStore((state) => state.clearIntakeLogs);
  const activeLifeStageId = useStore((state) => state.activeLifeStageId);
  const setActiveLifeStage = useStore((state) => state.setActiveLifeStage);

  const archivedSupplements = userSupplements.filter(
    (supplement) => supplement.status === 'archived'
  );
  const activeSupplements = userSupplements.filter(
    (supplement) => supplement.status !== 'archived'
  ).length;
  const activeIntakeLogs = intakeLogs.filter((log) => !log.undoneAt).length;
  const undoneIntakeLogs = intakeLogs.filter((log) => log.undoneAt).length;

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

      <View style={styles.noticeCard}>
        <Text style={styles.noticeLabel}>{t('settings.generalNoticeLabel')}</Text>
        <Text style={styles.noticeTitle}>{t('settings.generalNoticeTitle')}</Text>
        <Text style={styles.noticeText}>{t('settings.generalNoticeText')}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 44,
  },
  kicker: {
    color: '#0f766e',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  title: {
    color: '#0f172a',
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '800',
  },
  subtitle: {
    color: '#475569',
    fontSize: 15,
    lineHeight: 23,
    marginTop: 10,
    marginBottom: 20,
  },
  lifeStageWrapper: {
    marginTop: 14,
    marginHorizontal: -4,
  },
  lifeStageNote: {
    color: '#64748b',
    fontSize: 11,
    lineHeight: 17,
  },
  statusCard: {
    backgroundColor: '#ffffff',
    borderColor: '#cbd5e1',
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#ffffff',
    borderColor: '#e2e8f0',
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
  },
  cardLabel: {
    color: '#0f766e',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  cardTitle: {
    color: '#0f172a',
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 8,
  },
  cardText: {
    color: '#64748b',
    fontSize: 14,
    lineHeight: 21,
  },
  statusGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    paddingVertical: 14,
    marginTop: 16,
  },
  statusItem: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  statusValue: {
    color: '#0f172a',
    fontSize: 22,
    fontWeight: '900',
  },
  statusLabel: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4,
  },
  statusDivider: {
    width: 1,
    height: 32,
    backgroundColor: '#e2e8f0',
  },
  trustNotice: {
    backgroundColor: '#f0fdfa',
    borderColor: '#ccfbf1',
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    marginTop: 14,
  },
  trustNoticeTitle: {
    color: '#115e59',
    fontSize: 13,
    fontWeight: '900',
    marginBottom: 5,
  },
  trustNoticeText: {
    color: '#475569',
    fontSize: 13,
    lineHeight: 20,
  },
  historyStats: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    paddingVertical: 14,
    marginTop: 16,
    marginBottom: 14,
  },
  historyStat: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  historyStatValue: {
    color: '#0f172a',
    fontSize: 20,
    fontWeight: '900',
  },
  historyStatLabel: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4,
  },
  scopeBox: {
    backgroundColor: '#fff7ed',
    borderColor: '#fed7aa',
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    marginBottom: 14,
  },
  scopeRow: {
    gap: 4,
  },
  scopeLabel: {
    color: '#9a3412',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.7,
    textTransform: 'uppercase',
  },
  scopeText: {
    color: '#475569',
    fontSize: 13,
    lineHeight: 19,
  },
  scopeSeparator: {
    height: 1,
    backgroundColor: '#fed7aa',
    marginVertical: 10,
  },
  dangerButton: {
    backgroundColor: '#fff1f2',
    borderColor: '#fecdd3',
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: 'center',
  },
  dangerButtonPressed: {
    opacity: 0.72,
  },
  dangerButtonText: {
    color: '#be123c',
    fontSize: 14,
    fontWeight: '900',
  },
  archiveSection: {
    marginTop: 14,
  },
  sectionLabel: {
    color: '#0f766e',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  sectionTitle: {
    color: '#0f172a',
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '800',
  },
  sectionText: {
    color: '#64748b',
    fontSize: 14,
    lineHeight: 21,
    marginTop: 8,
    marginBottom: 14,
  },
  emptyArchiveCard: {
    backgroundColor: '#ffffff',
    borderColor: '#e2e8f0',
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
  },
  emptyArchiveTitle: {
    color: '#0f172a',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 6,
  },
  emptyArchiveText: {
    color: '#64748b',
    fontSize: 14,
    lineHeight: 21,
  },
  archiveCard: {
    backgroundColor: '#ffffff',
    borderColor: '#ccfbf1',
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
  },
  archiveHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 14,
  },
  archiveTitleGroup: {
    flex: 1,
  },
  archiveName: {
    color: '#0f172a',
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 5,
  },
  archiveMeta: {
    color: '#64748b',
    fontSize: 14,
    lineHeight: 20,
  },
  archiveBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#f1f5f9',
    borderColor: '#e2e8f0',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  archiveBadgeText: {
    color: '#475569',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  archiveDetail: {
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
  },
  archiveDetailLabel: {
    color: '#0f766e',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.9,
    textTransform: 'uppercase',
    marginBottom: 5,
  },
  archiveDetailText: {
    color: '#475569',
    fontSize: 14,
    lineHeight: 21,
  },
  archiveTrustRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 14,
  },
  archiveTrustLabel: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '700',
  },
  archiveTrustText: {
    flex: 1,
    color: '#0f766e',
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'right',
  },
  restoreButton: {
    backgroundColor: '#0f766e',
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: 'center',
  },
  restoreButtonPressed: {
    opacity: 0.82,
  },
  restoreButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '900',
  },
  noticeCard: {
    backgroundColor: '#f1f5f9',
    borderColor: '#e2e8f0',
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    marginTop: 16,
  },
  noticeLabel: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.9,
    textTransform: 'uppercase',
    marginBottom: 7,
  },
  noticeTitle: {
    color: '#0f172a',
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 6,
  },
  noticeText: {
    color: '#64748b',
    fontSize: 13,
    lineHeight: 20,
  },
});
