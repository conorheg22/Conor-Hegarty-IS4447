import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useFocusEffect } from '@react-navigation/native';
import { eq } from 'drizzle-orm';
import { LinearGradient } from 'expo-linear-gradient';
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
        <LinearGradient
          colors={['#FF6B6B', '#FFB347']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={styles.banner}
        >
          <Text style={styles.bannerTitle}>Aloha, Traveler 🌺</Text>
          <Text style={styles.bannerSubtitle}>Where to next? 🏖️</Text>
          <Text style={styles.bannerCount}>{tripList.length} trip{tripList.length !== 1 ? 's' : ''} planned</Text>
        </LinearGradient>

        <Pressable
          style={({ pressed }) => [styles.addButton, { opacity: pressed ? 0.9 : 1 }]}
          onPress={() => router.push('/add-trip')}
        >
          <LinearGradient colors={['#FF6B6B', '#FF4757']} style={styles.addButtonGradient}>
            <Text style={styles.addButtonText}>+ Add Trip</Text>
          </LinearGradient>
        </Pressable>

        <FlatList
          data={tripList}
          contentContainerStyle={styles.listContent}
          keyExtractor={(item) => String(item.id)}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🗺️</Text>
              <Text style={[styles.emptyTitle, { color: theme.text }]}>No trips yet</Text>
              <Text style={[styles.emptySubtitle, { color: theme.subtext }]}>Tap + Add Trip to get started</Text>
            </View>
          }
          renderItem={({ item, index }) => (
            <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <View style={[styles.leftAccent, { backgroundColor: index % 2 === 0 ? '#FF6B6B' : '#06D6A0' }]} />
              <View style={styles.cardHeader}>
                <Text style={[styles.name, { color: theme.text }]}>📍 {item.name}</Text>
              </View>
              <View style={styles.dateRow}>
                <View style={[styles.dateBadge, { backgroundColor: theme.inputBg }]}>
                  <Text style={[styles.dateLabel, { color: theme.subtext }]}>FROM</Text>
                  <Text style={[styles.dateValue, { color: theme.text }]}>{item.startDate}</Text>
                </View>
                <Text style={[styles.dateSep, { color: theme.subtext }]}>→</Text>
                <View style={[styles.dateBadge, { backgroundColor: theme.inputBg }]}>
                  <Text style={[styles.dateLabel, { color: theme.subtext }]}>TO</Text>
                  <Text style={[styles.dateValue, { color: theme.text }]}>{item.endDate}</Text>
                </View>
              </View>
              <View style={styles.actions}>
                <Pressable
                  style={({ pressed }) => [styles.editButton, { opacity: pressed ? 0.85 : 1 }]}
                  onPress={() => router.push(`/edit-trip?id=${item.id}`)}
                >
                  <Text style={styles.editButtonText}>Edit</Text>
                </Pressable>
                <Pressable
                  style={({ pressed }) => [styles.deleteButton, { opacity: pressed ? 0.85 : 1 }]}
                  onPress={() => void handleDeleteTrip(item.id)}
                >
                  <Text style={styles.deleteButtonText}>Delete</Text>
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
  container: { flex: 1 },
  banner: {
    margin: 16,
    borderRadius: 20,
    padding: 22,
    minHeight: 120,
    justifyContent: 'center',
  },
  bannerTitle: { fontSize: 26, fontWeight: '800', color: '#fff' },
  bannerSubtitle: { color: 'rgba(255,255,255,0.85)', fontSize: 14, marginTop: 4 },
  bannerCount: { color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 8, fontWeight: '600' },
  addButton: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#FF4757',
    shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 5,
  },
  addButtonGradient: {
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 14,
  },
  addButtonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  listContent: { paddingHorizontal: 16, paddingBottom: 30 },
  emptyContainer: { alignItems: 'center', marginTop: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 20, fontWeight: '700', marginBottom: 6 },
  emptySubtitle: { fontSize: 14 },
  card: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    paddingLeft: 24,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 3,
    overflow: 'hidden',
  },
  leftAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 6,
  },
  cardHeader: { marginBottom: 10 },
  name: { fontSize: 20, fontWeight: '800' },
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
  dateLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 0.8, marginBottom: 2 },
  dateValue: { fontSize: 13, fontWeight: '600' },
  dateSep: { fontSize: 18, fontWeight: '300' },
  actions: { flexDirection: 'row', gap: 10 },
  editButton: {
    flex: 1,
    backgroundColor: '#06D6A0',
    paddingVertical: 11,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#06D6A0',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 3,
  },
  editButtonText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  deleteButton: {
    flex: 1,
    backgroundColor: '#FF4757',
    paddingVertical: 11,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#FF4757',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 3,
  },
  deleteButtonText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});