import React from 'react';
import { Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { colors, radius, space, type } from '../theme';
import { useTranslation } from '../i18n';
import AddSupplementChooser from './AddSupplementChooser';

/**
 * AddSupplementSheet
 * ─────────────────────────────────────────────────────────────
 * Bottom-Sheet ueber dem aktuellen Screen (Bestand, Hauptmenue) mit den
 * drei Wegen, ein Praeparat zu erfassen. Auf iOS als Page-Sheet, auf
 * Android als Vollbild mit Hoch-Animation — presentationStyle kennt
 * Android nicht. Reine Navigation: Das Sheet schliesst sich, bevor die
 * Ziel-Route gepusht wird.
 */
export default function AddSupplementSheet({ visible, onClose }) {
  const router = useRouter();
  const { t } = useTranslation();

  function goTo(path) {
    onClose();
    router.push(path);
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle={Platform.OS === 'ios' ? 'pageSheet' : undefined}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('add.title')}</Text>
          <Pressable
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel={t('common.cancel')}
            style={styles.closeButton}
          >
            <Feather name="x" size={22} color={colors.inkMuted} />
          </Pressable>
        </View>

        <AddSupplementChooser
          compact
          onScan={() => goTo('/scanner')}
          onSearch={() => goTo('/search')}
          onManual={() => goTo('/AddSupplement')}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.canvas,
    paddingHorizontal: space.lg,
    paddingTop: space.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: space.md,
  },
  title: { ...type.heading },
  // Tippflaeche 44 pt (CLAUDE.md Bedienregeln).
  closeButton: {
    padding: space.sm,
    borderRadius: radius.md,
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
