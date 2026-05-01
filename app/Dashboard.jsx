import React from 'react';
import { View, Text } from 'react-native';

import inventory from '../inventory.json';

export default function Dashboard() {
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
      <Text style={{ color: '#fff', fontSize: 28, fontWeight: '700' }}>
        Supplement OS
      </Text>
      <Text style={{ color: '#a1a1aa', fontSize: 16 }}>
        Core routing is restored for local startup.
      </Text>
      <Text style={{ color: '#fff', fontSize: 18, fontWeight: '600' }}>
        Supplements loaded: {inventory.length}
      </Text>
    </View>
  );
}
