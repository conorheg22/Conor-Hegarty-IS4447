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
    </Stack>
  );
}
