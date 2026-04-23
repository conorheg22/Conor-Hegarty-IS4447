import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { eq } from 'drizzle-orm';
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
import { db } from '../db/db';
import { categories } from '../db/schema';

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

const EMOJIS = [
  '🏖️', '🍔', '🏃', '🛍️', '🍻', '🎉', '📸',
  '🚴', '🏊', '🍕', '✈️', '🏕️', '🎮', '📍'
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
  const [emoji, setEmoji] = useState('🏖️');

  useEffect(() => {
    async function loadCategory() {
      if (!categoryId) {
        Alert.alert('Invalid category');
        router.back();
        return;
      }

      try {
        const row = await db
          .select()
          .from(categories)
          .where(eq(categories.id, categoryId))
          .limit(1);

        const category = row[0];

        if (!category) {
          Alert.alert('Not found');
          router.back();
          return;
        }

        setName(category.name);
        setColor(category.color);
        setEmoji(category.emoji || '🏖️'); // fallback
      } finally {
        setIsLoading(false);
      }
    }

    void loadCategory();
  }, [categoryId]);

  async function handleSave() {
    if (!categoryId || !name.trim()) {
      Alert.alert('Please enter a name');
      return;
    }

    await db
      .update(categories)
      .set({
        name: name.trim(),
        color,
        emoji,
      })
      .where(eq(categories.id, categoryId));

    router.back();
  }

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, styles.loadingWrap, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={[styles.loadingText, { color: theme.subtext }]}>
          Loading category...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.form, { backgroundColor: theme.card, borderColor: theme.border }]}>

        {/* NAME */}
        <Text style={[styles.label, { color: theme.subtext }]}>Name</Text>
        <TextInput
          style={[styles.input, { borderColor: theme.primary, backgroundColor: theme.inputBg, color: theme.text }]}
          value={name}
          onChangeText={setName}
          placeholder="Category name"
          placeholderTextColor={theme.subtext}
        />

        {/* EMOJI PICKER */}
        <Text style={[styles.label, { color: theme.subtext }]}>Emoji</Text>
        <View style={styles.emojiRow}>
          {EMOJIS.map((e) => (
            <Pressable
              key={e}
              style={[
                styles.emojiItem,
                emoji === e && { borderColor: theme.text, borderWidth: 2 },
              ]}
              onPress={() => setEmoji(e)}
            >
              <Text style={styles.emoji}>{e}</Text>
            </Pressable>
          ))}
        </View>

        {/* COLOR PICKER */}
        <Text style={[styles.label, { color: theme.subtext }]}>Colour</Text>
        <View style={styles.swatchRow}>
          {PRESET_COLORS.map((preset) => (
            <Pressable
              key={preset}
              style={[
                styles.swatch,
                { backgroundColor: preset },
                color === preset && {
                  borderColor: theme.text,
                  borderWidth: 2,
                },
              ]}
              onPress={() => setColor(preset)}
            />
          ))}
        </View>

        {/* ACTIONS */}
        <View style={styles.actionsRow}>
          <Pressable
            style={({ pressed }) => [
              styles.actionButton,
              { backgroundColor: '#06D6A0', opacity: pressed ? 0.85 : 1 },
            ]}
            onPress={() => void handleSave()}
          >
            <Text style={styles.actionText}>Save</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.actionButton,
              { backgroundColor: '#FF4757', opacity: pressed ? 0.85 : 1 },
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

  emojiRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },

  emojiItem: {
    padding: 6,
    borderRadius: 8,
  },

  emoji: {
    fontSize: 26,
  },

  swatchRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 8,
  },

  swatch: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },

  actionsRow: {
    marginTop: 10,
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