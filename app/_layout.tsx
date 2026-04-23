import * as Notifications from 'expo-notifications';
import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  Text,
  View,
} from 'react-native';

import { AuthProvider, useAuth } from '../context/AuthContext';
import { ThemeProvider } from '../context/ThemeContext';
import { initializeDatabase } from '../db/db';
import { seedDatabase } from '../db/seed';

/* 🔥 OPTIONAL: ensures notifications behave properly */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

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
    } else if (
      userId &&
      (segments[0] === 'login' ||
        segments[0] === 'register' ||
        segments[0] === 'index')
    ) {
      router.replace('/trips');
    }
  }, [userId, isLoading, segments]);

  async function handleLogout() {
    await logout();
    router.replace('/login');
  }

  function BackToTripsButton() {
    return (
      <Pressable
        onPress={() => router.replace('/trips')}
        hitSlop={10}
        style={({ pressed }) => ({
          marginLeft: 10,
          paddingHorizontal: 12,
          paddingVertical: 6,
          borderRadius: 8,
          opacity: pressed ? 0.7 : 1,
        })}
      >
        <Text style={{ color: '#FFF9F0', fontWeight: '600' }}>
          ← Trips
        </Text>
      </Pressable>
    );
  }

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#0D1B2A',
        }}
      >
        <ActivityIndicator size="large" color="#FF6B6B" />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#0D1B2A' },
        headerTintColor: '#FFF9F0',
        headerTitleStyle: { fontWeight: '700', fontSize: 18 },

        headerBackVisible: false,
        gestureEnabled: false,

        headerLeft: () => {
          if (
            segments[0] === 'trips' ||
            segments[0] === 'login' ||
            segments[0] === 'register'
          ) {
            return null;
          }

          return <BackToTripsButton />;
        },

        headerRight: () =>
          userId ? (
            <Pressable
              onPress={() => void handleLogout()}
              hitSlop={10}
              style={({ pressed }) => ({
                backgroundColor: '#FF4757',
                paddingHorizontal: 14,
                paddingVertical: 7,
                borderRadius: 10,
                marginRight: 10,
                opacity: pressed ? 0.85 : 1,
              })}
            >
              <Text
                style={{
                  color: '#FFFFFF',
                  fontWeight: '700',
                  fontSize: 13,
                }}
              >
                Logout
              </Text>
            </Pressable>
          ) : null,
      }}
    >
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="register" options={{ headerShown: false }} />

      <Stack.Screen name="trips" options={{ title: 'Trip Planner' }} />
      <Stack.Screen name="activities" options={{ title: 'Activities' }} />
      <Stack.Screen name="categories" options={{ title: 'Categories' }} />
      <Stack.Screen name="targets" options={{ title: 'Targets' }} />
      <Stack.Screen name="insights" options={{ title: 'Insights' }} />
      <Stack.Screen name="settings" options={{ title: 'Settings' }} />

      <Stack.Screen name="add-trip" options={{ title: 'Add Trip' }} />
      <Stack.Screen name="edit-trip" options={{ title: 'Edit Trip' }} />
      <Stack.Screen name="add-activity" options={{ title: 'Add Activity' }} />
      <Stack.Screen name="edit-activity" options={{ title: 'Edit Activity' }} />
      <Stack.Screen name="add-category" options={{ title: 'Add Category' }} />
      <Stack.Screen name="edit-category" options={{ title: 'Edit Category' }} />
      <Stack.Screen name="add-target" options={{ title: 'Add Target' }} />

      <Stack.Screen
        name="delete-profile"
        options={{ title: 'Delete Account' }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
    const setupDatabase = async () => {
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

  /* 🔥 NOTIFICATIONS SETUP */
  useEffect(() => {
    async function setupNotifications() {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        console.log('Notification permission not granted');
      }
    }

    setupNotifications();
  }, []);

  if (!dbReady) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#0D1B2A',
        }}
      >
        <ActivityIndicator size="large" color="#FF6B6B" />
        <Text style={{ color: '#FFF9F0', marginTop: 12 }}>
          Loading Trip Planner...
        </Text>
      </View>
    );
  }

  return (
    <ThemeProvider>
      <AuthProvider>
        <RootLayoutNav />
      </AuthProvider>
    </ThemeProvider>
  );
}