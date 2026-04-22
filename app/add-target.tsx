import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { db } from '../db/db';
import { categories, targets } from '../db/schema';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/Colors';

type Category = typeof categories.$inferSelect;
type TargetType = 'weekly' | 'monthly';

export default function AddTargetScreen() {
  const router = useRouter();
  const scheme = useColorScheme() ?? 'light';
  const theme = Colors[scheme];
  const [categoryList, setCategoryList] = useState<Category[]>([]);
  const [type, setType] = useState<TargetType>('weekly');
  const [value, setValue] = useState('');
  const [categoryId, setCategoryId] = useState<number | null>(null);

  useEffect(() => {
    async function loadCategories() {
      const rows = await db.select().from(categories).orderBy(categories.name);
      setCategoryList(rows);
    }

    void loadCategories();
  }, []);

  async function handleSubmit() {
    const numericValue = Number(value);
    if (!Number.isFinite(numericValue) || numericValue <= 0) {
      return;
    }

    await db.insert(targets).values({
      type,
      value: numericValue,
      categoryId,
    });

    router.back();
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.form, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Text style={[styles.label, { color: theme.subtext }]}>Type</Text>
        <View style={styles.optionsRow}>
          {(['weekly', 'monthly'] as const).map((item) => (
            <Pressable
              key={item}
              style={[
                styles.optionButton,
                { borderColor: theme.border, backgroundColor: theme.inputBg },
                type === item && styles.optionButtonSelected,
              ]}
              onPress={() => setType(item)}
            >
              <Text
                style={[
                  styles.optionText,
                  type === item && styles.optionTextSelected,
                  { color: type === item ? theme.primary : theme.text },
                ]}
              >
                {item}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={[styles.label, { color: theme.subtext }]}>Value</Text>
        <TextInput
          style={[styles.input, { borderColor: theme.primary, backgroundColor: theme.inputBg, color: theme.text }]}
          value={value}
          onChangeText={setValue}
          keyboardType="number-pad"
          placeholder="5"
          placeholderTextColor={theme.subtext}
        />

        <Text style={[styles.label, { color: theme.subtext }]}>Category (optional)</Text>
        <View style={styles.optionsRow}>
          <Pressable
            style={[
              styles.optionButton,
              { borderColor: theme.border, backgroundColor: theme.inputBg },
              categoryId === null && styles.optionButtonSelected,
            ]}
            onPress={() => setCategoryId(null)}
          >
            <Text
              style={[
                styles.optionText,
                categoryId === null && styles.optionTextSelected,
                { color: categoryId === null ? theme.primary : theme.text },
              ]}
            >
              All
            </Text>
          </Pressable>

          {categoryList.map((category) => (
            <Pressable
              key={category.id}
              style={[
                styles.optionButton,
                { borderColor: theme.border, backgroundColor: theme.inputBg },
                categoryId === category.id && styles.optionButtonSelected,
              ]}
              onPress={() => setCategoryId(category.id)}
            >
              <Text
                style={[
                  styles.optionText,
                  categoryId === category.id && styles.optionTextSelected,
                  { color: categoryId === category.id ? theme.primary : theme.text },
                ]}
              >
                {category.name}
              </Text>
            </Pressable>
          ))}
        </View>

        <Pressable style={({ pressed }) => [styles.submitButton, { backgroundColor: theme.primary, opacity: pressed ? 0.85 : 1 }]} onPress={() => void handleSubmit()}>
          <Text style={styles.submitText}>Save Target</Text>
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
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  optionButtonSelected: {
    borderColor: '#FF6B6B',
    backgroundColor: '#FFE3DF',
  },
  optionText: {
    color: '#1F2937',
    textTransform: 'capitalize',
  },
  optionTextSelected: {
    color: '#FF6B6B',
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
