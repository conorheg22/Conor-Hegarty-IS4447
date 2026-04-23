import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
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
      Alert.alert('Invalid input', 'Please enter a valid target value.');
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

        {/* TYPE */}
        <Text style={[styles.label, { color: theme.subtext }]}>Type</Text>
        <View style={styles.optionsRow}>
          {(['weekly', 'monthly'] as const).map((item) => (
            <Pressable
              key={item}
              style={[
                styles.optionButton,
                { borderColor: theme.border },
                type === item && {
                  backgroundColor: theme.primary,
                  borderColor: theme.primary,
                },
              ]}
              onPress={() => setType(item)}
            >
              <Text
                style={[
                  styles.optionText,
                  {
                    color: type === item ? '#fff' : theme.text,
                  },
                ]}
              >
                {item}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* VALUE */}
        <Text style={[styles.label, { color: theme.subtext }]}>Target Value</Text>
        <TextInput
          style={[
            styles.input,
            {
              borderColor: theme.primary,
              backgroundColor: theme.inputBg,
              color: theme.text,
            },
          ]}
          value={value}
          onChangeText={setValue}
          keyboardType="number-pad"
          placeholder="5"
          placeholderTextColor={theme.subtext}
        />

        {/* CATEGORY */}
        <Text style={[styles.label, { color: theme.subtext }]}>
          Category (optional)
        </Text>

        <View style={styles.optionsRow}>
          {/* ALL OPTION */}
          <Pressable
            style={[
              styles.optionButton,
              {
                borderColor: theme.border,
                backgroundColor:
                  categoryId === null ? theme.primary : theme.inputBg,
              },
            ]}
            onPress={() => setCategoryId(null)}
          >
            <Text
              style={{
                color: categoryId === null ? '#fff' : theme.text,
                fontWeight: '600',
              }}
            >
              All
            </Text>
          </Pressable>

          {/* CATEGORY OPTIONS */}
          {categoryList.map((category) => {
            const isSelected = categoryId === category.id;

            return (
              <Pressable
                key={category.id}
                style={[
                  styles.optionButton,
                  {
                    borderColor: category.color,
                    backgroundColor: isSelected
                      ? category.color
                      : `${category.color}22`,
                  },
                ]}
                onPress={() => setCategoryId(category.id)}
              >
                <Text
                  style={{
                    color: isSelected ? '#fff' : theme.text,
                    fontWeight: '600',
                  }}
                >
                  {category.name}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* SAVE */}
        <Pressable
          style={({ pressed }) => [
            styles.submitButton,
            {
              backgroundColor: theme.primary,
              opacity: pressed ? 0.85 : 1,
            },
          ]}
          onPress={() => void handleSubmit()}
        >
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
    gap: 12,
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
    paddingHorizontal: 12,
    paddingVertical: 8,
  },

  optionText: {
    textTransform: 'capitalize',
  },

  input: {
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },

  submitButton: {
    marginTop: 12,
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