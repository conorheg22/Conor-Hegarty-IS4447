import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useFocusEffect } from '@react-navigation/native';
import { eq } from 'drizzle-orm';
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
import { NavDrawer } from '../components/NavDrawer';
import { db } from '../db/db';
import { categories } from '../db/schema';

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
    <View style={{ flex: 1 }}>
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        
        {/* ADD BUTTON (MATCHES TRIPS) */}
        <Pressable
          style={({ pressed }) => [
            styles.addButton,
            { opacity: pressed ? 0.9 : 1 },
          ]}
          onPress={() => router.push('/add-category')}
        >
          <Text style={styles.buttonText}>+ Add Category</Text>
        </Pressable>

        <FlatList
          data={categoryList}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.listContent}
          keyExtractor={(item) => String(item.id)}

          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📂</Text>
              <Text style={[styles.emptyTitle, { color: theme.text }]}>
                No categories yet
              </Text>
              <Text style={[styles.emptySubtitle, { color: theme.subtext }]}>
                Tap + Add Category to get started
              </Text>
            </View>
          }

          renderItem={({ item }) => {
            const emoji = item.emoji ?? '📌';

            return (
              <View
                style={[
                  styles.card,
                  {
                    backgroundColor: `${item.color}22`,
                    borderColor: item.color,
                  },
                ]}
              >
                <Text style={styles.emoji}>{emoji}</Text>

                <Text style={[styles.name, { color: theme.text }]}>
                  {item.name}
                </Text>

                <View style={styles.actions}>
                  <Pressable
                    style={({ pressed }) => [
                      styles.editButton,
                      { opacity: pressed ? 0.85 : 1 },
                    ]}
                    onPress={() => router.push(`/edit-category?id=${item.id}`)}
                  >
                    <Text style={styles.buttonText}>Edit</Text>
                  </Pressable>

                  <Pressable
                    style={({ pressed }) => [
                      styles.deleteButton,
                      { opacity: pressed ? 0.85 : 1 },
                    ]}
                    onPress={() => void handleDeleteCategory(item.id)}
                  >
                    <Text style={styles.buttonText}>Delete</Text>
                  </Pressable>
                </View>
              </View>
            );
          }}
        />
      </SafeAreaView>

      <NavDrawer />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 10,
  },

  addButton: {
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 12,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: '#FFB347',
    elevation: 4,
  },

  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },

  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },

  row: {
    justifyContent: 'space-between',
    marginBottom: 14,
  },

  card: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    width: '48%',
    alignItems: 'center',
  },

  emoji: {
    fontSize: 32,
    marginBottom: 10,
  },

  name: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },

  actions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },

  editButton: {
    flex: 1,
    backgroundColor: '#06D6A0',
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
  },

  deleteButton: {
    flex: 1,
    backgroundColor: '#FF4757',
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
  },

  emptyContainer: {
    alignItems: 'center',
    marginTop: 60,
  },

  emptyIcon: {
    fontSize: 40,
    marginBottom: 10,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },

  emptySubtitle: {
    fontSize: 14,
  },
});