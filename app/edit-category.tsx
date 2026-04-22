import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { eq } from 'drizzle-orm';
import { db } from '../db/db';
import { categories } from '../db/schema';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/Colors';

const PRESET_COLORS = [
  '#FF6B6B',
  '#FFB347',
  '#06D6A0',
  '#4DA8FF',
  '#8B5CF6',
  '#FFD93D',
  '#2E8B57',
  '#FF4757',
];

export default function EditCategoryScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const categoryId = Number(params.id);
  const scheme = useColorScheme() ?? 'light';
  const theme = Colors[scheme];

  const [isLoading, setIsLoading] = useState(true);
  const [name, setName] = useState('');
  const [color, setColor] = useState('');

  useEffect(() => {
    async function loadCategory() {
      if (!categoryId) {
        Alert.alert('Invalid category', 'Unable to load this category.');
        router.back();
        return;
      }

      try {
        const row = await db.select().from(categories).where(eq(categories.id, categoryId)).limit(1);
        const category = row[0];
        if (!category) {
          Alert.alert('Not found', 'Category no longer exists.');
          router.back();
          return;
        }
        setName(category.name);
        setColor(category.color);
      } finally {
        setIsLoading(false);
      }
    }

    void loadCategory();
  }, [categoryId, router]);

  async function handleSave() {
    if (!categoryId || !name.trim() || !color.trim()) {
      Alert.alert('Invalid input', 'Please enter both name and color.');
      return;
    }

    await db
      .update(categories)
      .set({
        name: name.trim(),
        color: color.trim(),
      })
      .where(eq(categories.id, categoryId));

    router.back();
  }

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, styles.loadingWrap, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={[styles.loadingText, { color: theme.subtext }]}>Loading category...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.form, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Text style={[styles.label, { color: theme.subtext }]}>Name</Text>
        <TextInput
          style={[styles.input, { borderColor: theme.primary, backgroundColor: theme.inputBg, color: theme.text }]}
          value={name}
          onChangeText={setName}
          placeholder="Category name"
          placeholderTextColor={theme.subtext}
        />

        <Text style={[styles.label, { color: theme.subtext }]}>Color</Text>
        <TextInput
          style={[styles.input, { borderColor: theme.primary, backgroundColor: theme.inputBg, color: theme.text }]}
          value={color}
          onChangeText={setColor}
          placeholder="#FF6B6B"
          placeholderTextColor={theme.subtext}
          autoCapitalize="none"
        />

        <View style={styles.swatchRow}>
          {PRESET_COLORS.map((preset) => (
            <Pressable
              key={preset}
              style={({ pressed }) => [
                styles.swatch,
                { backgroundColor: preset, opacity: pressed ? 0.85 : 1 },
                color.trim().toLowerCase() === preset.toLowerCase() && {
                  borderColor: theme.text,
                  borderWidth: 2,
                },
              ]}
              onPress={() => setColor(preset)}
            />
          ))}
        </View>

        <View style={styles.actionsRow}>
          <Pressable
            style={({ pressed }) => [
              styles.actionButton,
              { backgroundColor: theme.primary, opacity: pressed ? 0.85 : 1 },
            ]}
            onPress={() => void handleSave()}
          >
            <Text style={styles.actionText}>Save</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              styles.actionButton,
              { backgroundColor: theme.subtext, opacity: pressed ? 0.85 : 1 },
            ]}
            onPress={() => router.back()}
          >
            <Text style={styles.actionText}>Cancel</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  loadingWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 15,
    fontWeight: '600',
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
  swatchRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 4,
    marginBottom: 8,
  },
  swatch: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  actionsRow: {
    marginTop: 8,
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    color: '#fff',
    fontWeight: '700',
  },
});
