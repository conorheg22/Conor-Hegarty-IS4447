import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect, useState } from 'react';
import { Platform, Pressable, Text, View, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeDatabase } from '../db/db';
import { seedDatabase } from '../db/seed';
import { AuthProvider, useAuth } from '../context/AuthContext';

function RootLayoutNav() {
  const { userId, isLoading, logout } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (isLoading) return;
    const inAuthGroup =
      segments[0] === 'login' ||
      segments[0] === 'register' ||
      segments[0] === 'delete-profile';
    if (!userId && !inAuthGroup) {
      router.replace('/login');
    } else if (userId && (segments[0] === 'login' || segments[0] === 'register')) {
      router.replace('/trips');
    }
  }, [userId, isLoading, segments]);

  async function handleLogout() {
    await logout();
    router.replace('/login');
  }

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerRight: () =>
          userId ? (
            <Pressable onPress={() => void handleLogout()} style={{ marginRight: 16 }}>
              <Text style={{ color: '#EF4444', fontWeight: '600' }}>Logout</Text>
            </Pressable>
          ) : null,
      }}
    >
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="register" options={{ headerShown: false }} />
      <Stack.Screen name="index" options={{ title: 'Home' }} />
      <Stack.Screen name="trips" options={{ title: 'Trips' }} />
      <Stack.Screen name="activities" options={{ title: 'Activities' }} />
      <Stack.Screen name="categories" options={{ title: 'Categories' }} />
      <Stack.Screen name="targets" options={{ title: 'Targets' }} />
      <Stack.Screen name="insights" options={{ title: 'Insights' }} />
      <Stack.Screen name="add-trip" options={{ title: 'Add Trip' }} />
      <Stack.Screen name="edit-trip" options={{ title: 'Edit Trip' }} />
      <Stack.Screen name="add-activity" options={{ title: 'Add Activity' }} />
      <Stack.Screen name="edit-activity" options={{ title: 'Edit Activity' }} />
      <Stack.Screen name="add-category" options={{ title: 'Add Category' }} />
      <Stack.Screen name="edit-category" options={{ title: 'Edit Category' }} />
      <Stack.Screen name="add-target" options={{ title: 'Add Target' }} />
      <Stack.Screen name="delete-profile" options={{ title: 'Delete Account' }} />
    </Stack>
  );
}

export default function RootLayout() {
  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
    const setupDatabase = async () => {
      try {
        await AsyncStorage.clear();
      } catch {
        // no storage yet, that's fine
      }
      if (Platform.OS !== 'web') {
        try {
          await initializeDatabase();
          await seedDatabase();
        } catch (error) {
          console.log('Database setup error:', error);
        }
      }
      setDbReady(true);
    };
    void setupDatabase();
  }, []);

  if (!dbReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}