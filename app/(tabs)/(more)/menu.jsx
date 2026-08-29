import React from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';


import LanguagePicker from '../../../components/LanguagePicker';
import { useTranslation } from '../../../i18n';
import { colors, radius, space, surfaces, type } from '../../../theme';

export default function Home() {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <View style={styles.screenWrap}>
      <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      {/* Kleines Markenzeichen neben der Ueberschrift. Das Hauptmenue ist
          der einzige Screen ohne eigene Aufgabe, hier stoert es nicht. */}
      <View style={styles.brandRow}>
        <Image
          source={require('../../../assets/logo.png')}
          style={styles.brandLogo}
          accessibilityRole="image"
          accessibilityLabel={t('onboarding.logoAlt')}
        />
        <View style={styles.brandTextWrap}>
          <Text style={styles.kicker}>{t('home.kicker')}</Text>
          <Text style={styles.title}>{t('home.title')}</Text>
        </View>
      </View>

      <Text style={styles.subtitle}>{t('home.subtitle')}</Text>

      {/* Sprachumschaltung im Hauptmenue, nicht nur in den Einstellungen:
          Wer die App auf Englisch braucht, soll sie nicht erst auf Deutsch
          durchsuchen muessen. */}
      <LanguagePicker />

      <View style={styles.trustCard}>
        <Text style={styles.trustLabel}>{t('home.trust.label')}</Text>

        <TrustItem
          title={t('home.trust.quality.title')}
          text={t('home.trust.quality.text')}
        />

        <TrustItem
          title={t('home.trust.archive.title')}
          text={t('home.trust.archive.text')}
        />

        <TrustItem
          title={t('home.trust.advice.title')}
          text={t('home.trust.advice.text')}
        />
      </View>

      {/* Gruppierte Liste statt nummerierter Karten. Die Nummern 01 bis 09
          suggerierten eine Reihenfolge, die es nie gab: Ein Menue ist eine
          Liste von Orten, kein Ablauf. Die Gruppierung nach Zweck sagt
          stattdessen etwas Wahres ueber den Inhalt. */}
      <Text style={styles.sectionTitle}>{t('home.section.workflow')}</Text>
      <View style={styles.group}>
        <MenuRow
          title={t('home.nav.inventory.title')}
          subtitle={t('home.nav.inventory.subtitle')}
          onPress={() => router.push('/inventory')}
        />
        <MenuRow
          title={t('home.nav.add.title')}
          subtitle={t('home.nav.add.subtitle')}
          onPress={() => router.push('/AddSupplement')}
        />
        <MenuRow
          title={t('home.nav.history.title')}
          subtitle={t('home.nav.history.subtitle')}
          onPress={() => router.push('/history')}
          last
        />
      </View>

      <Text style={styles.sectionTitle}>{t('home.section.insight')}</Text>
      <View style={styles.group}>
        <MenuRow
          title={t('home.nav.outcome.title')}
          subtitle={t('home.nav.outcome.subtitle')}
          onPress={() => router.push('/outcome')}
        />
        <MenuRow
          title={t('home.nav.profile.title')}
          subtitle={t('home.nav.profile.subtitle')}
          onPress={() => router.push('/profile')}
        />
        <MenuRow
          title={t('home.nav.lab.title')}
          subtitle={t('home.nav.lab.subtitle')}
          onPress={() => router.push('/lab')}
        />
        <MenuRow
          title={t('home.nav.export.title')}
          subtitle={t('home.nav.export.subtitle')}
          onPress={() => router.push('/export')}
          last
        />
      </View>

      <Text style={styles.sectionTitle}>{t('home.section.app')}</Text>
      <View style={styles.group}>
        <MenuRow
          title={t('home.nav.account.title')}
          subtitle={t('home.nav.account.subtitle')}
          onPress={() => router.push('/account')}
        />
        <MenuRow
          title={t('nav.notifications')}
          subtitle={t('notifications.subtitle')}
          onPress={() => router.push('/notifications')}
        />
        <MenuRow
          title={t('home.nav.settings.title')}
          subtitle={t('home.nav.settings.subtitle')}
          onPress={() => router.push('/settings')}
          last
        />
      </View>

      {/* Impressum und Datenschutz muessen ohne Umwege erreichbar sein,
          nicht erst hinter den Einstellungen. */}
      <View style={styles.legalRow}>
        <TouchableOpacity
          onPress={() => router.push('/privacy')}
          accessibilityRole="link"
        >
          <Text style={styles.legalRowText}>{t('nav.privacy')}</Text>
        </TouchableOpacity>
        <Text style={styles.legalRowDivider}>·</Text>
        <TouchableOpacity
          onPress={() => router.push('/imprint')}
          accessibilityRole="link"
        >
          <Text style={styles.legalRowText}>{t('nav.imprint')}</Text>
        </TouchableOpacity>
        <Text style={styles.legalRowDivider}>·</Text>
        <TouchableOpacity
          onPress={() => router.push('/terms')}
          accessibilityRole="link"
        >
          <Text style={styles.legalRowText}>{t('nav.terms')}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
    </View>
  );
}

function TrustItem({ title, text }) {
  return (
    <View style={styles.trustItem}>
      <Text style={styles.trustItemTitle}>{title}</Text>
      <Text style={styles.trustItemText}>{text}</Text>
    </View>
  );
}

function MenuRow({ title, subtitle, onPress, last = false }) {
  return (
    <>
      <TouchableOpacity
        style={styles.row}
        onPress={onPress}
        activeOpacity={0.6}
        accessibilityRole="button"
        accessibilityLabel={title}
      >
        <View style={styles.rowTextWrap}>
          <Text style={styles.rowTitle}>{title}</Text>
          <Text style={styles.rowSubtitle}>{subtitle}</Text>
        </View>
        <Text style={styles.chevron}>›</Text>
      </TouchableOpacity>
      {last ? null : <View style={styles.divider} />}
    </>
  );
}

const styles = StyleSheet.create({
  screenWrap: { ...surfaces.screen },
  screen: { ...surfaces.screen },
  // Baustein aus dem Theme statt eigener Zahlen — deckt sich fast exakt
  // mit den vorherigen Werten (20/28/44 -> 22/30/48).
  content: { ...surfaces.content },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandLogo: {
    width: 44,
    height: 44,
    borderRadius: radius.lg,
    marginRight: space.md,
  },
  brandTextWrap: { flex: 1 },
  kicker: {
    ...type.eyebrow,
    marginBottom: space.sm,
  },
  title: {
    ...type.display,
    fontWeight: '800',
  },
  subtitle: {
    ...type.body,
    fontSize: 15,
    lineHeight: 23,
    marginTop: space.sm,
    marginBottom: space.lg,
  },
  // surfaces.card statt eigener Kartendefinition — bringt Radius, Rahmen
  // und Innenabstand aus dem Theme mit.
  trustCard: {
    ...surfaces.card,
    marginBottom: space.xl,
  },
  trustLabel: {
    ...type.label,
    marginBottom: space.sm,
  },
  trustItem: {
    borderTopWidth: 1,
    borderTopColor: colors.rule,
    paddingTop: space.md,
    marginTop: space.md,
  },
  trustItemTitle: {
    ...type.bodyStrong,
    fontWeight: '800',
    lineHeight: 19,
  },
  trustItemText: {
    ...type.small,
    fontSize: 13,
    lineHeight: 19,
    marginTop: space.xs,
  },
  // Gruppenueberschrift wie in den iOS-Einstellungen: klein, gesperrt,
  // grau, leicht eingerueckt — sie ordnet, ohne sich vorzudraengen.
  sectionTitle: {
    ...type.eyebrow,
    marginLeft: space.lg,
    marginBottom: space.sm,
    marginTop: space.md,
  },
  group: {
    ...surfaces.listGroup,
  },
  row: {
    ...surfaces.listRow,
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowTextWrap: { flex: 1 },
  rowTitle: {
    fontSize: 17,
    lineHeight: 22,
    color: colors.ink,
  },
  rowSubtitle: {
    ...type.tiny,
    marginTop: 2,
  },
  chevron: {
    fontSize: 20,
    color: colors.inkFaint,
    marginLeft: space.md,
  },
  divider: {
    ...surfaces.listDivider,
  },
  legalRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: space.md,
    marginTop: space.lg,
  },
  legalRowText: {
    ...type.small,
    color: colors.accent,
    textDecorationLine: 'underline',
    paddingVertical: space.sm,
  },
  legalRowDivider: {
    ...type.small,
    color: colors.inkFaint,
  },
});
