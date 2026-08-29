import React, { useEffect } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { creditsForProduct } from '../PurchaseLogic';
import usePurchaseStore from '../usePurchaseStore';
import { useTranslation } from '../i18n';
import { colors, radius, space, surfaces, type } from '../theme';

// Reihenfolge der Feature-Zeilen entspricht der Reihenfolge der
// Pro-Features in Entitlements.js (canUseProFeature) plus Scans/Bestand.
const FEATURE_KEYS = [
  'paywall.feature.scans',
  'paywall.feature.inventory',
  'paywall.feature.outcome',
  'paywall.feature.cost',
  'paywall.feature.lab',
  'paywall.feature.cycles',
];

/**
 * app/paywall.jsx
 * Modal-Kaufscreen. Zeigt Jahres-/Monatsabo und Scan-Pakete aus dem
 * aktuellen RevenueCat-Offering. Reine Darstellung: Preise kommen nur aus
 * pkg.product.priceString, keine Fachlogik ausser der Statuswahl unten.
 */
export default function PaywallScreen() {
  const { t } = useTranslation();
  const router = useRouter();

  const available = usePurchaseStore((state) => state.available);
  const busy = usePurchaseStore((state) => state.busy);
  const offerings = usePurchaseStore((state) => state.offerings);
  const lastError = usePurchaseStore((state) => state.lastError);
  const loadOfferings = usePurchaseStore((state) => state.loadOfferings);
  const buy = usePurchaseStore((state) => state.buy);
  const restore = usePurchaseStore((state) => state.restore);

  useEffect(() => {
    if (available) loadOfferings();
    // loadOfferings kommt aus dem Store und aendert sich nicht zwischen
    // Renders; nur beim Oeffnen des Screens einmal laden.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [available]);

  const handleBuy = async (pkg, isCredit) => {
    try {
      const result = await buy(pkg);
      if (result.cancelled) return;
      // Credits sind kein Abo: eigener Titel, sonst suggeriert "Willkommen
      // bei Pro" einen Tarifwechsel, den ein Scan-Paket nicht ausloest.
      if (isCredit) {
        Alert.alert(
          t('paywall.credits.title'),
          t('paywall.success.credits', {
            count: creditsForProduct(pkg.product.identifier),
          })
        );
      } else {
        Alert.alert(t('paywall.success.title'));
      }
      router.back();
    } catch (error) {
      Alert.alert(t('paywall.error.title'), error?.message ?? '');
    }
  };

  const handleRestore = async () => {
    try {
      const mapped = await restore();
      Alert.alert(
        t('paywall.restore'),
        t(mapped ? 'subscription.restore.done' : 'subscription.restore.none')
      );
    } catch (error) {
      Alert.alert(t('paywall.error.title'), error?.message ?? '');
    }
  };

  if (!available) {
    return (
      <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
        <Text style={styles.kicker}>{t('paywall.kicker')}</Text>
        <Text style={styles.title}>{t('paywall.title')}</Text>
        <Text style={styles.body}>{t('paywall.unavailable')}</Text>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.kicker}>{t('paywall.kicker')}</Text>
      <Text style={styles.title}>{t('paywall.title')}</Text>
      <Text style={styles.intro}>{t('paywall.intro')}</Text>

      <View style={styles.featureList}>
        {FEATURE_KEYS.map((key) => (
          <View key={key} style={styles.featureRow}>
            <Feather name="check" size={18} color={colors.accent} />
            <Text style={styles.featureText}>{t(key)}</Text>
          </View>
        ))}
      </View>

      {busy ? (
        <ActivityIndicator color={colors.accent} style={styles.spinner} />
      ) : lastError && !offerings ? (
        <View style={styles.card}>
          <Text style={styles.body}>{t('paywall.loadError')}</Text>
          <Pressable
            onPress={loadOfferings}
            style={({ pressed }) => [styles.quietButton, pressed ? styles.pressed : null]}
            accessibilityRole="button"
          >
            <Text style={styles.quietButtonText}>{t('paywall.retry')}</Text>
          </Pressable>
        </View>
      ) : offerings ? (
        <>
          {offerings.yearly ? (
            <PlanCard
              t={t}
              pkg={offerings.yearly}
              name={t('paywall.yearly')}
              priceLabel={t('paywall.perYear', { price: offerings.yearly.product.priceString })}
              onBuy={() => handleBuy(offerings.yearly, false)}
            />
          ) : null}

          {offerings.monthly ? (
            <PlanCard
              t={t}
              pkg={offerings.monthly}
              name={t('paywall.monthly')}
              priceLabel={t('paywall.perMonth', { price: offerings.monthly.product.priceString })}
              onBuy={() => handleBuy(offerings.monthly, false)}
            />
          ) : null}

          {offerings.credits.length > 0 ? (
            <View style={styles.creditsSection}>
              <Text style={styles.sectionTitle}>{t('paywall.credits.title')}</Text>
              {offerings.credits.map((pkg) => (
                <View key={pkg.identifier} style={styles.creditRow}>
                  <Text style={styles.creditText}>
                    {t('paywall.credits.item', {
                      count: creditsForProduct(pkg.product.identifier),
                      price: pkg.product.priceString,
                    })}
                  </Text>
                  <Pressable
                    onPress={() => handleBuy(pkg, true)}
                    style={({ pressed }) => [styles.buyButtonSmall, pressed ? styles.pressed : null]}
                    accessibilityRole="button"
                  >
                    <Text style={styles.buyButtonSmallText}>{t('paywall.buy')}</Text>
                  </Pressable>
                </View>
              ))}
            </View>
          ) : null}
        </>
      ) : null}

      <Text style={styles.legal}>{t('paywall.legal')}</Text>

      <Pressable
        onPress={handleRestore}
        disabled={busy}
        style={({ pressed }) => [styles.quietButton, pressed || busy ? styles.pressed : null]}
        accessibilityRole="button"
      >
        <Text style={styles.quietButtonText}>{t('paywall.restore')}</Text>
      </Pressable>

      <Pressable
        onPress={() => router.push('/terms')}
        style={({ pressed }) => [styles.link, pressed ? styles.pressed : null]}
        accessibilityRole="link"
      >
        <Text style={styles.linkText}>{t('nav.terms')}</Text>
      </Pressable>

      <Pressable
        onPress={() => router.push('/privacy')}
        style={({ pressed }) => [styles.link, pressed ? styles.pressed : null]}
        accessibilityRole="link"
      >
        <Text style={styles.linkText}>{t('nav.privacy')}</Text>
      </Pressable>
    </ScrollView>
  );
}

// Eine Abo-Karte (Jahr oder Monat). Zeigt die Trial-Zeile nur, wenn das
// SDK ein introPrice-Objekt mitliefert.
function PlanCard({ t, pkg, name, priceLabel, onBuy }) {
  const trialLabel = pkg.product.introPrice
    ? t('paywall.trial', { price: pkg.product.priceString })
    : null;

  return (
    <View style={styles.card}>
      <Text style={styles.planName}>{name}</Text>
      <Text style={styles.planPrice}>{priceLabel}</Text>
      {trialLabel ? <Text style={styles.planTrial}>{trialLabel}</Text> : null}
      <Pressable
        onPress={onBuy}
        style={({ pressed }) => [styles.buyButton, pressed ? styles.pressed : null]}
        accessibilityRole="button"
      >
        <Text style={styles.buyButtonText}>{t('paywall.buy')}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { ...surfaces.screen },
  content: { ...surfaces.content },
  kicker: { ...type.eyebrow, marginBottom: space.sm },
  title: { ...type.display, marginBottom: space.sm },
  intro: { ...type.body, marginBottom: space.lg },
  body: { ...type.body },
  featureList: { marginBottom: space.lg },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    marginBottom: space.sm,
  },
  featureText: { ...type.body, flex: 1 },
  spinner: { marginVertical: space.xl },
  card: { ...surfaces.card },
  planName: { ...type.subheading, marginBottom: space.xs },
  planPrice: { ...type.bodyStrong, marginBottom: space.xs },
  planTrial: { ...type.small, marginBottom: space.sm },
  buyButton: { ...surfaces.buttonPrimary, marginTop: space.sm },
  buyButtonText: { ...surfaces.buttonPrimaryText },
  creditsSection: { marginTop: space.sm, marginBottom: space.lg },
  sectionTitle: { ...type.heading, marginBottom: space.md },
  creditRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: space.md,
    marginBottom: space.sm,
  },
  creditText: { ...type.body, flex: 1, marginRight: space.md },
  buyButtonSmall: {
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    paddingHorizontal: space.lg,
    paddingVertical: space.sm,
  },
  buyButtonSmallText: { fontWeight: '600', color: colors.surface, fontSize: 15 },
  legal: { ...type.tiny, marginTop: space.md, marginBottom: space.lg },
  quietButton: { ...surfaces.buttonQuiet, marginBottom: space.sm },
  quietButtonText: { ...surfaces.buttonQuietText },
  link: { paddingVertical: space.sm, alignItems: 'center' },
  linkText: { ...type.small, color: colors.accent },
  pressed: { opacity: 0.72 },
});
