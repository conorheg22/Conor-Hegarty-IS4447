import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { db } from '../db/db';
import { categories } from '../db/schema';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/Colors';

export default function AddCategoryScreen() {
  const router = useRouter();
  const scheme = useColorScheme() ?? 'light';
  const theme = Colors[scheme];
  const [name, setName] = useState('');
  const [color, setColor] = useState('');

  async function handleSubmit() {
    if (!name.trim() || !color.trim()) {
      return;
    }

    await db.insert(categories).values({
      name: name.trim(),
      color: color.trim(),
    });

    router.back();
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.form, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Text style={[styles.label, { color: theme.subtext }]}>Name</Text>
        <TextInput
          style={[styles.input, { borderColor: theme.primary, backgroundColor: theme.inputBg, color: theme.text }]}
          value={name}
          onChangeText={setName}
          placeholder="Sightseeing"
          placeholderTextColor={theme.subtext}
        />

        <Text style={[styles.label, { color: theme.subtext }]}>Color</Text>
        <TextInput
          style={[styles.input, { borderColor: theme.primary, backgroundColor: theme.inputBg, color: theme.text }]}
          value={color}
          onChangeText={setColor}
          placeholder="#3B82F6"
          placeholderTextColor={theme.subtext}
        />

        <Pressable style={({ pressed }) => [styles.submitButton, { backgroundColor: theme.primary, opacity: pressed ? 0.85 : 1 }]} onPress={() => void handleSubmit()}>
          <Text style={styles.submitText}>Save Category</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  form: {
    gap: 10,
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
  },
  label: {
    fontWeight: '600',
  },
  input: {
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  submitButton: {
    marginTop: 8,
    borderRadius: 14,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitText: {
    color: '#fff',
    fontWeight: '700',
  },
});
