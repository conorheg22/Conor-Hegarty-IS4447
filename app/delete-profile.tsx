import { useRouter } from 'expo-router';
import {
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { eq } from 'drizzle-orm';
import { db } from '../db/db';
import { users } from '../db/schema';
import { useAuth } from '../context/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/Colors';

export default function DeleteProfileScreen() {
  const router = useRouter();
  const { userId, logout } = useAuth();
  const scheme = useColorScheme() ?? 'light';
  const theme = Colors[scheme];

  async function handleDelete() {
    if (userId) {
      await db.delete(users).where(eq(users.id, userId));
    }
    await logout();
    router.replace('/register');
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.inner}>
        <Text style={[styles.title, { color: theme.text }]}>Delete Account</Text>
        <Text style={[styles.body, { color: theme.subtext }]}>
          Are you sure you want to delete your account? This cannot be undone.
        </Text>
        <Pressable
          style={({ pressed }) => [styles.button, { backgroundColor: '#EF4444', opacity: pressed ? 0.85 : 1 }]}
          onPress={() => void handleDelete()}
        >
          <Text style={styles.buttonText}>Yes, Delete My Account</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.cancelButton, { borderColor: theme.border, opacity: pressed ? 0.85 : 1 }]}
          onPress={() => router.back()}
        >
          <Text style={[styles.cancelText, { color: theme.text }]}>Cancel</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: { flex: 1, padding: 24, justifyContent: 'center' },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 14 },
  body: { fontSize: 15, lineHeight: 22, marginBottom: 32 },
  button: {
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  cancelButton: {
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelText: { fontWeight: '600', fontSize: 16 },
});