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

export default function AddCategoryScreen() {
  const router = useRouter();
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
    <SafeAreaView style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.label}>Name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Sightseeing"
        />

        <Text style={styles.label}>Color</Text>
        <TextInput
          style={styles.input}
          value={color}
          onChangeText={setColor}
          placeholder="#3B82F6"
        />

        <Pressable style={styles.submitButton} onPress={() => void handleSubmit()}>
          <Text style={styles.submitText}>Save Category</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  form: {
    gap: 10,
  },
  label: {
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  submitButton: {
    marginTop: 8,
    backgroundColor: '#2563EB',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  submitText: {
    color: '#fff',
    fontWeight: '700',
  },
});
