import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { initializeDatabase } from '../db/db';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/Colors';

export default function RootLayout() {
  const scheme = useColorScheme() ?? 'light';
  const theme = Colors[scheme];

  useEffect(() => {
    initializeDatabase();
  }, []);

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: theme.card },
        headerTintColor: theme.text,
        headerTitleStyle: { fontWeight: '800' },
        contentStyle: { backgroundColor: theme.background },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Trip Planner' }} />
      <Stack.Screen name="trips" options={{ title: 'Trips' }} />
      <Stack.Screen name="add-trip" options={{ title: 'Add Trip' }} />
      <Stack.Screen name="edit-trip" options={{ title: 'Edit Trip' }} />
      <Stack.Screen name="categories" options={{ title: 'Categories' }} />
      <Stack.Screen name="add-category" options={{ title: 'Add Category' }} />
      <Stack.Screen name="edit-category" options={{ title: 'Edit Category' }} />
      <Stack.Screen name="activities" options={{ title: 'Activities' }} />
      <Stack.Screen name="add-activity" options={{ title: 'Add Activity' }} />
      <Stack.Screen name="edit-activity" options={{ title: 'Edit Activity' }} />
      <Stack.Screen name="targets" options={{ title: 'Targets' }} />
      <Stack.Screen name="add-target" options={{ title: 'Add Target' }} />
      <Stack.Screen name="insights" options={{ title: 'Insights' }} />
    </Stack>
  );
}
