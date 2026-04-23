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
import { trips } from '../db/schema';

type Trip = typeof trips.$inferSelect;

export default function TripsScreen() {
  const router = useRouter();
  const scheme = useColorScheme() ?? 'light';
  const theme = Colors[scheme];
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
    <View style={{ flex: 1 }}>
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>

        {/* Add button */}
        <Pressable
          style={({ pressed }) => [
            styles.addButton,
            { opacity: pressed ? 0.9 : 1 },
          ]}
          onPress={() => router.push('/add-trip')}
        >
          <Text style={styles.buttonText}>+ Add Trip</Text>
        </Pressable>

        <FlatList
          data={tripList}
          contentContainerStyle={styles.listContent}
          keyExtractor={(item) => String(item.id)}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🗺️</Text>
              <Text style={[styles.emptyTitle, { color: theme.text }]}>No trips yet</Text>
              <Text style={[styles.emptySubtitle, { color: theme.subtext }]}>
                Tap + Add Trip to get started
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>

              <View style={styles.cardHeader}>
                <Text style={[styles.name, { color: theme.text }]}>
                  {item.name}
                </Text>
              </View>

              <View style={styles.dateRow}>
                <View style={[styles.dateBadge, { backgroundColor: theme.inputBg }]}>
                  <Text style={[styles.dateLabel, { color: theme.subtext }]}>FROM</Text>
                  <Text style={[styles.dateValue, { color: theme.text }]}>
                    {item.startDate}
                  </Text>
                </View>

                <Text style={[styles.dateSep, { color: theme.subtext }]}>→</Text>

                <View style={[styles.dateBadge, { backgroundColor: theme.inputBg }]}>
                  <Text style={[styles.dateLabel, { color: theme.subtext }]}>TO</Text>
                  <Text style={[styles.dateValue, { color: theme.text }]}>
                    {item.endDate}
                  </Text>
                </View>
              </View>

              <View style={styles.actions}>
                <Pressable
                  style={({ pressed }) => [
                    styles.editButton,
                    { opacity: pressed ? 0.85 : 1 },
                  ]}
                  onPress={() => router.push(`/edit-trip?id=${item.id}`)}
                >
                  <Text style={styles.buttonText}>Edit</Text>
                </Pressable>

                <Pressable
                  style={({ pressed }) => [
                    styles.deleteButton,
                    { opacity: pressed ? 0.85 : 1 },
                  ]}
                  onPress={() => void handleDeleteTrip(item.id)}
                >
                  <Text style={styles.buttonText}>Delete</Text>
                </Pressable>
              </View>

            </View>
          )}
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

  emptyContainer: {
    alignItems: 'center',
    marginTop: 60,
  },

  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },

  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 6,
  },

  emptySubtitle: {
    fontSize: 14,
  },

  card: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    elevation: 2,
  },

  cardHeader: {
    marginBottom: 10,
  },

  name: {
    fontSize: 20,
    fontWeight: '800',
  },

  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },

  dateBadge: {
    flex: 1,
    borderRadius: 10,
    padding: 8,
  },

  dateLabel: {
    fontSize: 10,
    fontWeight: '700',
    marginBottom: 2,
  },

  dateValue: {
    fontSize: 13,
    fontWeight: '600',
  },

  dateSep: {
    fontSize: 18,
  },

  actions: {
    flexDirection: 'row',
    gap: 10,
  },

  editButton: {
    flex: 1,
    backgroundColor: '#06D6A0',
    paddingVertical: 11,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 3,
  },

  deleteButton: {
    flex: 1,
    backgroundColor: '#FF4757',
    paddingVertical: 11,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 3,
  },
});