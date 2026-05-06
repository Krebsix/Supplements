import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

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
  screen: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 40,
  },
});
