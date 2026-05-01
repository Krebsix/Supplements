import React from 'react';
import { View, Text } from 'react-native';

export default function AddSupplement() {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: '#121212',
        paddingHorizontal: 20,
        paddingVertical: 24,
        gap: 12,
      }}
    >
      <Text style={{ color: '#fff', fontSize: 24, fontWeight: '700' }}>
        Neues Supplement
      </Text>
      <Text style={{ color: '#a1a1aa', fontSize: 16 }}>
        Minimal route restored so Expo Router can start and navigate locally.
      </Text>
    </View>
  );
}
