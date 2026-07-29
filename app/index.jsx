import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';

import TabBar from '../components/TabBar';

import LanguagePicker from '../components/LanguagePicker';
import { useTranslation } from '../i18n';

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
  screenWrap: { flex: 1, backgroundColor: '#f8fafc' },
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
  trustCard: {
    backgroundColor: '#ffffff',
    borderColor: '#e2e8f0',
    borderWidth: 1,
    borderRadius: 22,
    padding: 16,
    marginBottom: 24,
  },
  trustLabel: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  trustItem: {
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 12,
    marginTop: 12,
  },
  trustItemTitle: {
    color: '#0f172a',
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 19,
  },
  trustItemText: {
    color: '#64748b',
    fontSize: 13,
    lineHeight: 19,
    marginTop: 4,
  },
  sectionTitle: {
    color: '#0f172a',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 12,
  },
  navCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#ffffff',
    borderColor: '#e2e8f0',
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
  },
  navIndexWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#ecfdf5',
    borderColor: '#ccfbf1',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  navIndex: {
    color: '#0f766e',
    fontSize: 13,
    fontWeight: '900',
  },
  navTextWrap: {
    flex: 1,
  },
  navTitle: {
    color: '#0f172a',
    fontSize: 16,
    fontWeight: '800',
  },
  navSubtitle: {
    color: '#64748b',
    fontSize: 13,
    lineHeight: 19,
    marginTop: 4,
  },
});
