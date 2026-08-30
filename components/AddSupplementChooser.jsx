import React from 'react';
import { StyleSheet, View } from 'react-native';

import { space } from '../theme';
import { useTranslation } from '../i18n';
import ChoiceCard from './onboarding/ChoiceCard';

/**
 * AddSupplementChooser
 * ─────────────────────────────────────────────────────────────
 * Ein einziger Einstiegspunkt fuer alle drei Wege, ein Praeparat zu
 * erfassen: scannen, im Katalog suchen oder manuell eintragen. Bisher
 * fuehrte jeder Leerzustand direkt zum Formular (AddSupplement.jsx) und
 * verbarg Scanner und Suche dahinter — dabei ist der Scan der schnellere
 * Weg fuer die meisten Praeparate.
 *
 * Reine Darstellung: Welche Route ein Antippen ausloest, entscheiden die
 * Aufrufer (Dashboard, Bestand, AddSupplementSheet), nicht diese
 * Komponente.
 */
export default function AddSupplementChooser({ onScan, onSearch, onManual, compact = false }) {
  const { t } = useTranslation();

  return (
    <View style={compact ? styles.containerCompact : styles.container}>
      <ChoiceCard
        title={t('add.scan')}
        subtitle={t('add.scanSub')}
        icon="camera"
        onPress={onScan}
      />
      <ChoiceCard
        title={t('add.search')}
        subtitle={t('add.searchSub')}
        icon="search"
        onPress={onSearch}
      />
      <ChoiceCard
        title={t('add.manual')}
        subtitle={t('add.manualSub')}
        icon="edit-3"
        onPress={onManual}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: space.md },
  // compact: fuer den Einsatz im Bottom-Sheet, wo der Kopfbereich schon
  // Platz beansprucht — weniger Abstand nach oben statt engerer Karten.
  containerCompact: { marginTop: space.xs },
});
