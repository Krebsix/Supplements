import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';

import TabBar from '../components/TabBar';

import LanguagePicker from '../components/LanguagePicker';
import { useTranslation } from '../i18n';
import { colors, radius, space, surfaces, type } from '../theme';

export default function Home() {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <View style={styles.screenWrap}>
      <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.kicker}>{t('home.kicker')}</Text>
      <Text style={styles.title}>{t('home.title')}</Text>
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

      <Text style={styles.sectionTitle}>{t('home.section.workflow')}</Text>

      <NavCard
        index="01"
        title={t('home.nav.add.title')}
        subtitle={t('home.nav.add.subtitle')}
        onPress={() => router.push('/AddSupplement')}
      />

      <NavCard
        index="02"
        title={t('home.nav.history.title')}
        subtitle={t('home.nav.history.subtitle')}
        onPress={() => router.push('/history')}
      />

      <NavCard
        index="03"
        title={t('home.nav.outcome.title')}
        subtitle={t('home.nav.outcome.subtitle')}
        onPress={() => router.push('/outcome')}
      />

      <NavCard
        index="04"
        title={t('home.nav.profile.title')}
        subtitle={t('home.nav.profile.subtitle')}
        onPress={() => router.push('/profile')}
      />

      <NavCard
        index="05"
        title={t('home.nav.lab.title')}
        subtitle={t('home.nav.lab.subtitle')}
        onPress={() => router.push('/lab')}
      />

      <NavCard
        index="06"
        title={t('home.nav.export.title')}
        subtitle={t('home.nav.export.subtitle')}
        onPress={() => router.push('/export')}
      />

      <NavCard
        index="07"
        title={t('home.nav.settings.title')}
        subtitle={t('home.nav.settings.subtitle')}
        onPress={() => router.push('/settings')}
      />
    </ScrollView>
      <TabBar active="more" />
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

function NavCard({ index, title, subtitle, onPress }) {
  return (
    <TouchableOpacity style={styles.navCard} onPress={onPress}>
      <View style={styles.navIndexWrap}>
        <Text style={styles.navIndex}>{index}</Text>
      </View>
      <View style={styles.navTextWrap}>
        <Text style={styles.navTitle}>{title}</Text>
        <Text style={styles.navSubtitle}>{subtitle}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  screenWrap: { ...surfaces.screen },
  screen: { ...surfaces.screen },
  // Baustein aus dem Theme statt eigener Zahlen — deckt sich fast exakt
  // mit den vorherigen Werten (20/28/44 -> 22/30/48).
  content: { ...surfaces.content },
  kicker: {
    ...type.eyebrow,
    marginBottom: space.sm,
  },
  title: {
    ...type.display,
    fontSize: 30,
    lineHeight: 36,
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
  // Rubriktitel ueber den NavCards: subheading traegt die Serife, das
  // Unterscheidungsmerkmal der neuen Richtung.
  sectionTitle: {
    ...type.subheading,
    marginBottom: space.md,
  },
  navCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    ...surfaces.card,
  },
  // Nummern-Kaestchen der NavCard: Akzentfarbe statt Systemgruen, Radius
  // aus dem Theme statt eigenem Wert.
  navIndexWrap: {
    width: 44,
    height: 44,
    borderRadius: radius.lg,
    backgroundColor: colors.accentSoft,
    borderColor: colors.accentSoft,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: space.md,
  },
  // Serifenziffer in Akzentfarbe — das gewuenschte Detail der Startseite.
  navIndex: {
    ...type.numeral,
    color: colors.accent,
  },
  navTextWrap: {
    flex: 1,
  },
  navTitle: {
    ...type.subheading,
  },
  navSubtitle: {
    ...type.small,
    fontSize: 13,
    lineHeight: 19,
    marginTop: space.xs,
  },
});
