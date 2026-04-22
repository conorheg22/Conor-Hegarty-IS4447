import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
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
import {
  activities as activitiesTable,
  categories as categoriesTable,
  trips as tripsTable,
} from '../db/schema';

type ActivityRow = {
  id: number;
  tripName: string;
  categoryName: string;
  date: string;
  duration: number;
  notes: string | null;
};

export default function ActivitiesScreen() {
  const router = useRouter();
  const [activityList, setActivityList] = useState<ActivityRow[]>([]);

  const loadActivities = useCallback(async () => {
    const rows = await db
      .select({
        id: activitiesTable.id,
        tripName: tripsTable.name,
        categoryName: categoriesTable.name,
        date: activitiesTable.date,
        duration: activitiesTable.duration,
        notes: activitiesTable.notes,
      })
      .from(activitiesTable)
      .innerJoin(tripsTable, eq(activitiesTable.tripId, tripsTable.id))
      .innerJoin(categoriesTable, eq(activitiesTable.categoryId, categoriesTable.id))
      .orderBy(activitiesTable.date);

    setActivityList(rows);
  }, []);

  useEffect(() => {
    void loadActivities();
  }, [loadActivities]);

  useFocusEffect(
    useCallback(() => {
      void loadActivities();
    }, [loadActivities])
  );

  async function handleDeleteActivity(id: number) {
    await db.delete(activitiesTable).where(eq(activitiesTable.id, id));
    await loadActivities();
  }

  return (
    <SafeAreaView style={styles.container}>
      <Pressable
        style={styles.addButton}
        onPress={() => router.push('/add-activity')}
      >
        <Text style={styles.addButtonText}>Add Activity</Text>
      </Pressable>

      <FlatList
        data={activityList}
        keyExtractor={(item) => String(item.id)}
        ListEmptyComponent={<Text style={styles.emptyText}>No activities yet.</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.title}>{item.tripName}</Text>
            <Text style={styles.meta}>Category: {item.categoryName}</Text>
            <Text style={styles.meta}>Date: {item.date}</Text>
            <Text style={styles.meta}>Duration: {item.duration} mins</Text>
            <Text style={styles.meta}>Notes: {item.notes || '-'}</Text>

            <Pressable
              style={styles.deleteButton}
              onPress={() => void handleDeleteActivity(item.id)}
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
  title: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 4,
  },
  meta: {
    color: '#374151',
    marginBottom: 2,
  },
  deleteButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#DC2626',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 10,
  },
  deleteText: {
    color: '#fff',
    fontWeight: '600',
  },
});
