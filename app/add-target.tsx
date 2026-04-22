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

type Category = typeof categories.$inferSelect;
type TargetType = 'weekly' | 'monthly';

export default function AddTargetScreen() {
  const router = useRouter();
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
    <SafeAreaView style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.label}>Type</Text>
        <View style={styles.optionsRow}>
          {(['weekly', 'monthly'] as const).map((item) => (
            <Pressable
              key={item}
              style={[
                styles.optionButton,
                type === item && styles.optionButtonSelected,
              ]}
              onPress={() => setType(item)}
            >
              <Text
                style={[
                  styles.optionText,
                  type === item && styles.optionTextSelected,
                ]}
              >
                {item}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.label}>Value</Text>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={setValue}
          keyboardType="number-pad"
          placeholder="5"
        />

        <Text style={styles.label}>Category (optional)</Text>
        <View style={styles.optionsRow}>
          <Pressable
            style={[
              styles.optionButton,
              categoryId === null && styles.optionButtonSelected,
            ]}
            onPress={() => setCategoryId(null)}
          >
            <Text
              style={[
                styles.optionText,
                categoryId === null && styles.optionTextSelected,
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
                categoryId === category.id && styles.optionButtonSelected,
              ]}
              onPress={() => setCategoryId(category.id)}
            >
              <Text
                style={[
                  styles.optionText,
                  categoryId === category.id && styles.optionTextSelected,
                ]}
              >
                {category.name}
              </Text>
            </Pressable>
          ))}
        </View>

        <Pressable style={styles.submitButton} onPress={() => void handleSubmit()}>
          <Text style={styles.submitText}>Save Target</Text>
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
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  optionButtonSelected: {
    borderColor: '#2563EB',
    backgroundColor: '#DBEAFE',
  },
  optionText: {
    color: '#1F2937',
    textTransform: 'capitalize',
  },
  optionTextSelected: {
    color: '#1D4ED8',
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
