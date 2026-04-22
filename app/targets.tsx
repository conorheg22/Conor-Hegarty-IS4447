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
import { useFocusEffect } from '@react-navigation/native';
import { eq } from 'drizzle-orm';
import { db } from '../db/db';
import { categories, targets } from '../db/schema';

type TargetRow = {
  id: number;
  type: string;
  value: number;
  categoryName: string | null;
};

export default function TargetsScreen() {
  const router = useRouter();
  const [targetList, setTargetList] = useState<TargetRow[]>([]);

  const loadTargets = useCallback(async () => {
    const rows = await db
      .select({
        id: targets.id,
        type: targets.type,
        value: targets.value,
        categoryName: categories.name,
      })
      .from(targets)
      .leftJoin(categories, eq(targets.categoryId, categories.id))
      .orderBy(targets.id);

    setTargetList(rows);
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadTargets();
    }, [loadTargets])
  );

  return (
    <SafeAreaView style={styles.container}>
      <Pressable style={styles.addButton} onPress={() => router.push('/add-target')}>
        <Text style={styles.addButtonText}>Add Target</Text>
      </Pressable>

      <FlatList
        data={targetList}
        keyExtractor={(item) => String(item.id)}
        ListEmptyComponent={<Text style={styles.emptyText}>No targets yet.</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.title}>{item.type}</Text>
            <Text style={styles.meta}>Value: {item.value}</Text>
            <Text style={styles.meta}>Category: {item.categoryName ?? 'All'}</Text>
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
  title: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 4,
    textTransform: 'capitalize',
  },
  meta: {
    color: '#374151',
    marginBottom: 2,
  },
});
