import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  FlatList,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { eq } from 'drizzle-orm';
import { useFocusEffect } from '@react-navigation/native';
import { db } from '../db/db';
import { categories } from '../db/schema';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/Colors';

type Category = typeof categories.$inferSelect;

export default function CategoriesScreen() {
  const router = useRouter();
  const scheme = useColorScheme() ?? 'light';
  const theme = Colors[scheme];
  const [categoryList, setCategoryList] = useState<Category[]>([]);

  const loadCategories = useCallback(async () => {
    const rows = await db.select().from(categories).orderBy(categories.name);
    setCategoryList(rows);
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadCategories();
    }, [loadCategories])
  );

  async function handleDeleteCategory(id: number) {
    await db.delete(categories).where(eq(categories.id, id));
    await loadCategories();
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <Pressable
        style={({ pressed }) => [styles.addButton, { backgroundColor: theme.primary, opacity: pressed ? 0.85 : 1 }]}
        onPress={() => router.push('/add-category')}
      >
        <Text style={styles.addButtonText}>New Category</Text>
      </Pressable>

      <FlatList
        data={categoryList}
        numColumns={2}
        columnWrapperStyle={styles.row}
        keyExtractor={(item) => String(item.id)}
        ListEmptyComponent={<Text style={[styles.emptyText, { color: theme.subtext }]}>No categories yet 🌴</Text>}
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: `${item.color}33`, borderColor: theme.border }]}>
            <Text style={styles.emoji}>🍹</Text>
            <Text style={[styles.name, { color: theme.text }]}>{item.name}</Text>

            <Pressable
              style={({ pressed }) => [styles.deleteButton, { backgroundColor: theme.danger, opacity: pressed ? 0.85 : 1 }]}
              onPress={() => void handleDeleteCategory(item.id)}
            >
              <Text style={styles.deleteText}>Delete</Text>
            </Pressable>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  addButton: {
    alignSelf: 'flex-end',
    paddingHorizontal: 14,
    height: 52,
    borderRadius: 14,
    marginBottom: 14,
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  emptyText: {
    marginTop: 20,
    color: '#6B7280',
  },
  card: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
    width: '48%',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 32,
    marginBottom: 10,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
    textAlign: 'center',
  },
  deleteButton: {
    alignSelf: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    minWidth: 88,
    alignItems: 'center',
  },
  deleteText: {
    color: '#fff',
    fontWeight: '600',
  },
});
