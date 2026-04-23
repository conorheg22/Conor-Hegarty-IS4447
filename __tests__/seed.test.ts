import AsyncStorage from '@react-native-async-storage/async-storage';
import { db } from '../db/db';
import { activities, categories, targets, trips } from '../db/schema';
import { seedDatabase } from '../db/seed';

describe('Seed Database', () => {
  beforeEach(async () => {
    await AsyncStorage.clear(); // reset seed flag
  });

  it('inserts data into all core tables', async () => {
    await seedDatabase();

    const tripRows = await db.select().from(trips);
    const categoryRows = await db.select().from(categories);
    const activityRows = await db.select().from(activities);
    const targetRows = await db.select().from(targets);

    expect(tripRows.length).toBeGreaterThan(0);
    expect(categoryRows.length).toBeGreaterThan(0);
    expect(activityRows.length).toBeGreaterThan(0);
    expect(targetRows.length).toBeGreaterThan(0);
  });

  it('does not insert duplicates when run twice', async () => {
    await seedDatabase();
    await seedDatabase(); // run again

    const tripRows = await db.select().from(trips);

    // you seeded 2 trips, so expect max 2
    expect(tripRows.length).toBeLessThanOrEqual(2);
  });
});