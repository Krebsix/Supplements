import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { surfaces } from '../theme';

export default function ScreenContainer({ children, scroll = true }) {
  if (!scroll) {
    return <View style={styles.screen}>{children}</View>;
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: surfaces.screen,
  content: surfaces.content,
});
