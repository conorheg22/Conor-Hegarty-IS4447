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
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/Colors';

type ActivityRow = {
  id: number;
  tripName: string;
  categoryName: string;
  categoryColor: string;
  date: string;
  duration: number;
  notes: string | null;
};

export default function ActivitiesScreen() {
  const router = useRouter();
  const scheme = useColorScheme() ?? 'light';
  const theme = Colors[scheme];
  const [activityList, setActivityList] = useState<ActivityRow[]>([]);

  const loadActivities = useCallback(async () => {
    const rows = await db
      .select({
        id: activitiesTable.id,
        tripName: tripsTable.name,
        categoryName: categoriesTable.name,
        categoryColor: categoriesTable.color,
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
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <Pressable
        style={({ pressed }) => [styles.addButton, { backgroundColor: theme.primary, opacity: pressed ? 0.85 : 1 }]}
        onPress={() => router.push('/add-activity')}
      >
        <Text style={styles.addButtonText}>Add Activity ✈️</Text>
      </Pressable>

      <FlatList
        data={activityList}
        keyExtractor={(item) => String(item.id)}
        ListEmptyComponent={<Text style={[styles.emptyText, { color: theme.subtext }]}>No activities yet 🌺</Text>}
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.title, { color: theme.text }]}>{item.tripName}</Text>
            <View style={styles.metaRow}>
              <Text style={[styles.meta, { color: theme.subtext }]}>Category:</Text>
              <View style={[styles.colorDot, { backgroundColor: item.categoryColor }]} />
              <Text style={[styles.meta, { color: theme.subtext }]}>{item.categoryName}</Text>
            </View>
            <Text style={[styles.meta, { color: theme.subtext }]}>Date: {item.date}</Text>
            <Text style={[styles.meta, { color: theme.subtext }]}>Duration: {item.duration} mins</Text>
            <Text style={[styles.meta, { color: theme.subtext }]}>Notes: {item.notes || '-'}</Text>
            <View style={styles.cardActions}>
              <Pressable
                style={({ pressed }) => [styles.actionButton, { backgroundColor: theme.primary, opacity: pressed ? 0.85 : 1 }]}
                onPress={() => router.push(`/edit-activity?id=${item.id}`)}
              >
                <Text style={styles.deleteText}>Edit</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [styles.actionButton, { backgroundColor: theme.danger, opacity: pressed ? 0.85 : 1 }]}
                onPress={() => void handleDeleteActivity(item.id)}
              >
                <Text style={styles.deleteText}>Delete</Text>
              </Pressable>
            </View>
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
  addButton: {
    alignSelf: 'flex-start',
    height: 52,
    paddingHorizontal: 14,
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
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  colorDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  cardActions: {
    marginTop: 10,
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    height: 40,
    borderRadius: 14,
    justifyContent: 'center',
    minWidth: 84,
    alignItems: 'center',
  },
  deleteText: {
    color: '#fff',
    fontWeight: '600',
  },
});
