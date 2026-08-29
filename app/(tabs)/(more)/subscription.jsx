import React from 'react';
import { Alert, Linking, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { PURCHASE_STATUS } from '../../../PurchaseLogic';
import {
  MANAGE_URL_ANDROID,
  MANAGE_URL_IOS,
  REFUND_URL_ANDROID,
  REFUND_URL_IOS,
} from '../../../purchaseConfig';
import { evaluateVisionScan, isPro } from '../../../Entitlements';
import usePurchaseStore from '../../../usePurchaseStore';
import useStore from '../../../useStore';
import { useTranslation } from '../../../i18n';
import { colors, radius, space, surfaces, type } from '../../../theme';

/**
 * app/(tabs)/(more)/subscription.jsx
 * Abo-Status, Scan-Guthaben und die drei Store-Wege (verwalten,
 * wiederherstellen, Rueckerstattung). Reine Anzeige: Preise und Fristen
 * kommen aus dem Store, keine eigene Fachlogik ausser der Statuswahl.
 */
export default function SubscriptionScreen() {
  const { t } = useTranslation();
  const router = useRouter();

  const available = usePurchaseStore((state) => state.available);
  const status = usePurchaseStore((state) => state.status);
  const expiresAt = usePurchaseStore((state) => state.expiresAt);
  const platform = usePurchaseStore((state) => state.platform);
  const restore = usePurchaseStore((state) => state.restore);

  const entitlement = useStore((state) => state.entitlement);
  const proTier = isPro(entitlement);
  const scanQuota = evaluateVisionScan(entitlement);

  const date = expiresAt ? new Date(expiresAt).toLocaleDateString() : '';
  const statusText = t(`subscription.status.${status}`, { date });
  const showBuyButton = status === PURCHASE_STATUS.FREE || status === PURCHASE_STATUS.EXPIRED;

  const handleManage = () => {
    Linking.openURL(Platform.OS === 'ios' ? MANAGE_URL_IOS : MANAGE_URL_ANDROID);
  };

  const handleRefund = () => {
    Linking.openURL(Platform.OS === 'ios' ? REFUND_URL_IOS : REFUND_URL_ANDROID);
  };

  const handleRestore = async () => {
    try {
      const mapped = await restore();
      Alert.alert(
        t('subscription.restore'),
        t(mapped ? 'subscription.restore.done' : 'subscription.restore.none')
      );
    } catch (error) {
      Alert.alert(t('paywall.error.title'), error?.message ?? '');
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.kicker}>{t('subscription.kicker')}</Text>
      <Text style={styles.title}>{t('subscription.title')}</Text>

      <View style={styles.statusCard}>
        <Text style={styles.statusText}>{statusText}</Text>
        {platform === 'ios' || platform === 'android' ? (
          <Text style={styles.platformText}>{t(`subscription.platform.${platform}`)}</Text>
        ) : null}
      </View>

      {!available ? (
        <View style={styles.noticeCard}>
          <Text style={styles.noticeText}>{t('subscription.unavailable')}</Text>
        </View>
      ) : null}

      <View style={styles.card}>
        <Text style={styles.cardLabel}>{t('subscription.quota.title')}</Text>

        <View style={styles.statusGrid}>
          <View style={styles.statusItem}>
            <Text style={styles.statusValue}>{scanQuota.remainingFree}</Text>
            <Text style={styles.statusLabel}>{t('subscription.quota.free')}</Text>
          </View>

          <View style={styles.statusDivider} />

          <View style={styles.statusItem}>
            <Text style={styles.statusValue}>{proTier ? scanQuota.remainingFairUse : 0}</Text>
            <Text style={styles.statusLabel}>{t('subscription.quota.fairUse')}</Text>
          </View>

          <View style={styles.statusDivider} />

          <View style={styles.statusItem}>
            <Text style={styles.statusValue}>{scanQuota.credits}</Text>
            <Text style={styles.statusLabel}>{t('subscription.quota.credits')}</Text>
          </View>
        </View>
      </View>

      {showBuyButton ? (
        <Pressable
          onPress={() => router.push('/paywall')}
          style={({ pressed }) => [styles.buyButton, pressed ? styles.pressed : null]}
          accessibilityRole="button"
        >
          <Text style={styles.buyButtonText}>{t('subscription.buy')}</Text>
        </Pressable>
      ) : null}

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t('subscription.manage')}</Text>
        <Text style={styles.cardText}>{t('subscription.manageText')}</Text>
        <Pressable
          onPress={handleManage}
          style={({ pressed }) => [styles.quietButton, pressed ? styles.pressed : null]}
          accessibilityRole="button"
        >
          <Text style={styles.quietButtonText}>{t('subscription.manage')}</Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t('subscription.restore')}</Text>
        <Text style={styles.cardText}>{t('subscription.restoreText')}</Text>
        <Pressable
          onPress={handleRestore}
          style={({ pressed }) => [styles.quietButton, pressed ? styles.pressed : null]}
          accessibilityRole="button"
        >
          <Text style={styles.quietButtonText}>{t('subscription.restore')}</Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t('subscription.refund')}</Text>
        <Text style={styles.cardText}>{t('subscription.refundText')}</Text>
        <Pressable
          onPress={handleRefund}
          style={({ pressed }) => [styles.quietButton, pressed ? styles.pressed : null]}
          accessibilityRole="button"
        >
          <Text style={styles.quietButtonText}>{t('subscription.refund')}</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { ...surfaces.screen },
  content: { ...surfaces.content },
  kicker: { ...type.eyebrow, marginBottom: space.sm },
  title: { ...type.display, marginBottom: space.lg },
  statusCard: { ...surfaces.card, borderColor: colors.ruleStrong },
  statusText: { ...type.bodyStrong },
  platformText: { ...type.small, marginTop: space.xs },
  noticeCard: {
    backgroundColor: colors.surfaceSunken,
    borderRadius: radius.lg,
    padding: space.md + 2,
    marginBottom: space.md,
  },
  noticeText: { ...type.body },
  card: { ...surfaces.card },
  cardLabel: { ...type.label, color: colors.accent, marginBottom: space.sm },
  cardTitle: { ...type.heading, marginBottom: space.sm },
  cardText: { ...type.body, marginBottom: space.md },
  statusGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSunken,
    borderRadius: radius.lg,
    paddingVertical: space.md + 2,
    marginTop: space.sm,
  },
  statusItem: { flex: 1, alignItems: 'center', paddingHorizontal: space.sm - 2 },
  statusValue: { ...type.numeral, fontSize: 22 },
  statusLabel: { ...type.small, fontWeight: '700', textAlign: 'center', marginTop: space.xs },
  statusDivider: { width: 1, height: 32, backgroundColor: colors.rule },
  buyButton: { ...surfaces.buttonPrimary, marginBottom: space.md },
  buyButtonText: { ...surfaces.buttonPrimaryText },
  quietButton: { ...surfaces.buttonQuiet },
  quietButtonText: { ...surfaces.buttonQuietText },
  pressed: { opacity: 0.72 },
});
