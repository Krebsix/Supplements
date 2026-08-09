import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { useTranslation } from '../i18n';
import { space, surfaces, type } from '../theme';

/**
 * LegalSections
 * Darstellung eines Rechtstexts (Datenschutz, Impressum) aus
 * data/legalContent.js. Eine Komponente fuer beide Screens, damit die
 * Texte konsistent gesetzt sind.
 */
export default function LegalSections({ sections, footer = null }) {
  const { language } = useTranslation();
  const items = sections[language] || sections.de;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      {items.map((section) => (
        <View key={section.heading} style={styles.card}>
          <Text style={styles.heading}>{section.heading}</Text>
          <Text style={styles.body}>{section.body}</Text>
        </View>
      ))}
      {footer}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: surfaces.screen,
  content: surfaces.content,
  card: surfaces.card,
  heading: { ...type.heading, marginBottom: space.sm },
  body: type.body,
});
