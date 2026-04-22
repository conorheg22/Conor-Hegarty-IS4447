import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { digestStringAsync, CryptoDigestAlgorithm } from 'expo-crypto';
import { eq } from 'drizzle-orm';
import { db } from '../db/db';
import { users } from '../db/schema';
import { useAuth } from '../context/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/Colors';

export default function RegisterScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const scheme = useColorScheme() ?? 'light';
  const theme = Colors[scheme];

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');

  async function handleRegister() {
    setError('');
    if (!username.trim()) { setError('Username is required.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (password !== confirm) { setError('Passwords do not match.'); return; }

    const existing = await db.select().from(users).where(eq(users.username, username.trim()));
    if (existing.length > 0) { setError('Username already taken.'); return; }

    const hash = await digestStringAsync(CryptoDigestAlgorithm.SHA256, password);
    const result = await db.insert(users).values({
      username: username.trim(),
      passwordHash: hash,
      createdAt: new Date().toISOString(),
    }).returning();

    await login(result[0].id);
    router.replace('/trips');
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.inner}>
        <Text style={[styles.title, { color: theme.text }]}>Create Account 🌍</Text>
        <Text style={[styles.subtitle, { color: theme.subtext }]}>Start planning your adventures</Text>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={[styles.inputWrap, { backgroundColor: theme.inputBg, borderColor: theme.border }]}>
          <TextInput
            style={[styles.input, { color: theme.text }]}
            placeholder="Username"
            placeholderTextColor={theme.subtext}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />
        </View>

        <View style={[styles.inputWrap, { backgroundColor: theme.inputBg, borderColor: theme.border }]}>
          <TextInput
            style={[styles.input, { color: theme.text }]}
            placeholder="Password (min 6 characters)"
            placeholderTextColor={theme.subtext}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <View style={[styles.inputWrap, { backgroundColor: theme.inputBg, borderColor: theme.border }]}>
          <TextInput
            style={[styles.input, { color: theme.text }]}
            placeholder="Confirm Password"
            placeholderTextColor={theme.subtext}
            value={confirm}
            onChangeText={setConfirm}
            secureTextEntry
          />
        </View>

        <Pressable
          style={({ pressed }) => [styles.button, { backgroundColor: theme.primary, opacity: pressed ? 0.85 : 1 }]}
          onPress={() => void handleRegister()}
        >
          <Text style={styles.buttonText}>Register</Text>
        </Pressable>

        <Pressable onPress={() => router.replace('/login')} style={styles.linkWrap}>
          <Text style={[styles.link, { color: theme.primary }]}>Already have an account? Log in</Text>
        </Pressable>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: { flex: 1, padding: 24, justifyContent: 'center' },
  title: { fontSize: 32, fontWeight: '700', marginBottom: 6 },
  subtitle: { fontSize: 15, marginBottom: 28 },
  error: { color: '#EF4444', marginBottom: 14, fontSize: 14 },
  inputWrap: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 52,
    justifyContent: 'center',
    marginBottom: 14,
  },
  input: { fontSize: 15 },
  button: {
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6,
  },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  linkWrap: { marginTop: 20, alignItems: 'center' },
  link: { fontSize: 14 },
});