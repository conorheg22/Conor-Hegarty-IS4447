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
import { trips } from '../db/schema';

type Trip = typeof trips.$inferSelect;

export default function TripsScreen() {
  const router = useRouter();
  const [tripList, setTripList] = useState<Trip[]>([]);

  const loadTrips = useCallback(async () => {
    const rows = await db.select().from(trips).orderBy(trips.startDate);
    setTripList(rows);
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadTrips();
    }, [loadTrips])
  );

  async function handleDeleteTrip(id: number) {
    await db.delete(trips).where(eq(trips.id, id));
    await loadTrips();
  }

  return (
    <SafeAreaView style={styles.container}>
      <Pressable style={styles.addButton} onPress={() => router.push('/add-trip')}>
        <Text style={styles.addButtonText}>Add Trip</Text>
      </Pressable>

      <FlatList
        data={tripList}
        keyExtractor={(item) => String(item.id)}
        ListEmptyComponent={<Text style={styles.emptyText}>No trips yet.</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.date}>Start: {item.startDate}</Text>
            <Text style={styles.date}>End: {item.endDate}</Text>

            <View style={styles.actions}>
              <Pressable
                style={[styles.actionButton, styles.editButton]}
                onPress={() => router.push(`/edit-trip?id=${item.id}`)}
              >
                <Text style={styles.actionText}>Edit</Text>
              </Pressable>
              <Pressable
                style={[styles.actionButton, styles.deleteButton]}
                onPress={() => void handleDeleteTrip(item.id)}
              >
                <Text style={styles.actionText}>Delete</Text>
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
    marginBottom: 6,
  },
  date: {
    color: '#374151',
    marginBottom: 2,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  editButton: {
    backgroundColor: '#4B5563',
  },
  deleteButton: {
    backgroundColor: '#DC2626',
  },
  actionText: {
    color: '#fff',
    fontWeight: '600',
  },
});
