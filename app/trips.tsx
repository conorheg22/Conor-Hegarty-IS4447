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
import { LinearGradient } from 'expo-linear-gradient';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/Colors';

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
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <LinearGradient colors={['#FF6B6B', '#FFB347']} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={styles.banner}>
        <Text style={styles.bannerTitle}>Aloha, Traveler 🌺</Text>
        <Text style={styles.bannerSubtitle}>Where to next? 🏖️</Text>
        <Text style={styles.bannerDecoration}>🌊 🌴 🍹</Text>
      </LinearGradient>

      <Pressable style={({ pressed }) => [styles.addButton, { backgroundColor: theme.primary, opacity: pressed ? 0.85 : 1 }]} onPress={() => router.push('/add-trip')}>
        <Text style={styles.addButtonText}>＋</Text>
      </Pressable>

      <FlatList
        data={tripList}
        contentContainerStyle={styles.listContent}
        keyExtractor={(item) => String(item.id)}
        ListEmptyComponent={<Text style={styles.emptyText}>No trips yet.</Text>}
        renderItem={({ item, index }) => (
          <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={[styles.leftAccent, { backgroundColor: index % 2 === 0 ? theme.accent : theme.secondary }]} />
            <Text style={[styles.name, { color: theme.text }]}>📍 {item.name}</Text>
            <Text style={[styles.date, { color: theme.subtext }]}>Start: {item.startDate}</Text>
            <Text style={[styles.date, { color: theme.subtext }]}>End: {item.endDate}</Text>

            <View style={styles.actions}>
              <Pressable
                style={({ pressed }) => [
                  styles.actionButton,
                  { backgroundColor: theme.accent, opacity: pressed ? 0.85 : 1 },
                ]}
                onPress={() => router.push(`/edit-trip?id=${item.id}`)}
              >
                <Text style={styles.actionText}>Edit</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  styles.actionButton,
                  { backgroundColor: theme.danger, opacity: pressed ? 0.85 : 1 },
                ]}
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
    padding: 16,
  },
  banner: {
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    minHeight: 130,
    justifyContent: 'center',
  },
  bannerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
  },
  bannerSubtitle: {
    color: '#fff',
    fontSize: 14,
    marginTop: 4,
  },
  bannerDecoration: {
    marginTop: 8,
    color: '#fff',
    fontSize: 16,
  },
  addButton: {
    position: 'absolute',
    right: 20,
    top: 110,
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1F2937',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 3,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 28,
    lineHeight: 30,
  },
  listContent: {
    paddingBottom: 20,
  },
  emptyText: {
    marginTop: 20,
    color: '#1F2937',
  },
  card: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    paddingLeft: 22,
    shadowColor: '#1F2937',
    shadowOpacity: 0.1,
  leftAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 3,
  },
  name: {
    fontSize: 21,
    fontWeight: '700',
    marginBottom: 6,
    color: '#1F2937',
  },
  date: {
    color: '#2E8B57',
    marginBottom: 2,
    fontSize: 15,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  actionButton: {
    paddingHorizontal: 14,
    height: 40,
    borderRadius: 14,
    justifyContent: 'center',
  },
  actionText: {
    color: '#fff',
    fontWeight: '700',
  },
});
