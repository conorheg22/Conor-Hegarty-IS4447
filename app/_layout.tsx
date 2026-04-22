import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { initializeDatabase } from '../db/db';

export default function RootLayout() {
  useEffect(() => {
    initializeDatabase();
  }, []);

  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Trip Planner' }} />
      <Stack.Screen name="trips" options={{ title: 'Trips' }} />
      <Stack.Screen name="add-trip" options={{ title: 'Add Trip' }} />
      <Stack.Screen name="edit-trip" options={{ title: 'Edit Trip' }} />
      <Stack.Screen name="categories" options={{ title: 'Categories' }} />
      <Stack.Screen name="add-category" options={{ title: 'Add Category' }} />
      <Stack.Screen name="activities" options={{ title: 'Activities' }} />
      <Stack.Screen name="add-activity" options={{ title: 'Add Activity' }} />
    </Stack>
  );
}
