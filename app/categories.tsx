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

type Category = typeof categories.$inferSelect;

export default function CategoriesScreen() {
  const router = useRouter();
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
    <SafeAreaView style={styles.container}>
      <Pressable
        style={styles.addButton}
        onPress={() => router.push('/add-category')}
      >
        <Text style={styles.addButtonText}>Add Category</Text>
      </Pressable>

      <FlatList
        data={categoryList}
        keyExtractor={(item) => String(item.id)}
        ListEmptyComponent={<Text style={styles.emptyText}>No categories yet.</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.color}>Color: {item.color}</Text>

            <Pressable
              style={styles.deleteButton}
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
    backgroundColor: '#fff',
    padding: 16,
  },
  addButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#2563EB',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 14,
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
    borderColor: '#E5E7EB',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  color: {
    color: '#374151',
    marginBottom: 10,
  },
  deleteButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#DC2626',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  deleteText: {
    color: '#fff',
    fontWeight: '600',
  },
});
