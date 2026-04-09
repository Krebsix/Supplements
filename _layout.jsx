import React from 'react';
import { Stack } from 'expo-router';
import { TouchableOpacity, Text } from 'react-native';
import { useRouter } from 'expo-router';

export default function Layout() {
  const router = useRouter();

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#121212' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      {/* Das Haupt-Dashboard */}
      <Stack.Screen
        name="Dashboard"
        options={{
          title: 'Supplement OS',
          headerRight: () => (
            <TouchableOpacity 
              onPress={() => router.push('/AddSupplement')}
              style={{ marginRight: 10, backgroundColor: '#007AFF', padding: 8, borderRadius: 8 }}
            >
              <Text style={{ color: '#fff', fontWeight: 'bold' }}>+ Neu</Text>
            </TouchableOpacity>
          ),
        }}
      />

      {/* Der Hinzufügen-Screen */}
      <Stack.Screen
        name="AddSupplement"
        options={{
          title: 'Neues Supplement',
          presentation: 'modal', // Öffnet sich als schickes Modal
        }}
      />
    </Stack>
  );
}
