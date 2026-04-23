import AsyncStorage from '@react-native-async-storage/async-storage';
import { db } from './db';
import { activities, categories, targets, trips } from './schema';

export async function seedDatabase() {
  try {
    const seeded = await AsyncStorage.getItem('dbSeeded');
    if (seeded === 'true') return;
  } catch {
    return;
  }

  await db.insert(trips).values([
    { id: 1, name: 'Paris Trip', startDate: '2026-06-10', endDate: '2026-06-17' },
    { id: 2, name: 'Bali Trip', startDate: '2026-08-05', endDate: '2026-08-14' },
  ]).onConflictDoNothing();

  await db.insert(categories).values([
    { id: 1, name: 'Sightseeing', color: '#3B82F6' },
    { id: 2, name: 'Food', color: '#EF4444' },
    { id: 3, name: 'Outdoor', color: '#10B981' },
  ]).onConflictDoNothing();

  await db.insert(activities).values([
    { id: 1, tripId: 1, categoryId: 1, date: '2026-06-11', duration: 180, notes: 'Visit Eiffel Tower and Trocadero' },
    { id: 2, tripId: 1, categoryId: 2, date: '2026-06-12', duration: 90, notes: 'Dinner at a local bistro in Le Marais' },
    { id: 3, tripId: 1, categoryId: 1, date: '2026-06-14', duration: 240, notes: 'Louvre Museum half-day visit' },
    { id: 4, tripId: 2, categoryId: 3, date: '2026-08-06', duration: 120, notes: 'Sunrise hike at Mount Batur' },
    { id: 5, tripId: 2, categoryId: 2, date: '2026-08-08', duration: 75, notes: 'Seafood dinner in Jimbaran' },
    { id: 6, tripId: 2, categoryId: 1, date: '2026-08-10', duration: 150, notes: 'Explore Ubud Monkey Forest' },
  ]).onConflictDoNothing();

  await db.insert(targets).values([
    { id: 1, type: 'weekly', value: 5, categoryId: null },
  ]).onConflictDoNothing();

  try {
    await AsyncStorage.setItem('dbSeeded', 'true');
  } catch {}
}