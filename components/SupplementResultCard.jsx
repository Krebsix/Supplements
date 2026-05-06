import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import StatusBadge from './StatusBadge';

export default function SupplementResultCard({ result }) {
  return (
    <View style={styles.card}>
      <Text style={styles.product}>{result.productName}</Text>
      <Text style={styles.brand}>{result.brand}</Text>

      <View style={styles.confidenceWrap}>
        <Text style={styles.confidenceLabel}>Erkennungssicherheit</Text>
        <Text style={styles.confidenceValue}>{result.confidence}%</Text>
      </View>

      <Text style={styles.sectionTitle}>Erkannte Wirkstoffe</Text>
      <View style={styles.badgeWrap}>
        {result.detectedIngredients.map((item) => (
          <StatusBadge key={item} label={item} tone="good" />
        ))}
      </View>

      <Text style={styles.sectionTitle}>Hinweise</Text>
      {result.warnings.map((warning, index) => (
        <Text key={index} style={styles.warning}>⚠️ {warning}</Text>
      ))}

      <View style={styles.noteBox}>
        <Text style={styles.noteTitle}>Timing-Vorschlag</Text>
        <Text style={styles.noteText}>{result.timingSuggestion}</Text>
      </View>

      <Text style={styles.uncertainty}>{result.uncertaintyNote}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#111827',
    borderColor: '#1f2937',
    borderWidth: 1,
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
  },
  product: {
    color: '#f8fafc',
    fontSize: 22,
    fontWeight: '800',
  },
  brand: {
    color: '#94a3b8',
    fontSize: 14,
    marginTop: 4,
  },
  confidenceWrap: {
    marginTop: 18,
    backgroundColor: '#0f766e',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  confidenceLabel: {
    color: '#ccfbf1',
    fontSize: 13,
    fontWeight: '700',
  },
  confidenceValue: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '900',
  },
  sectionTitle: {
    color: '#e2e8f0',
    fontSize: 15,
    fontWeight: '800',
    marginTop: 18,
    marginBottom: 10,
  },
  badgeWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  warning: {
    color: '#fbbf24',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 6,
  },
  noteBox: {
    marginTop: 16,
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 14,
  },
  noteTitle: {
    color: '#f8fafc',
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 4,
  },
  noteText: {
    color: '#cbd5e1',
    fontSize: 14,
    lineHeight: 20,
  },
  uncertainty: {
    color: '#94a3b8',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 14,
  },
});
