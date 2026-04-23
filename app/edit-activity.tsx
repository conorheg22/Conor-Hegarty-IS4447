import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { eq } from 'drizzle-orm';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { db } from '../db/db';
import {
  activities as activitiesTable,
  categories as categoriesTable,
  trips as tripsTable,
} from '../db/schema';

type Trip = typeof tripsTable.$inferSelect;
type Category = typeof categoriesTable.$inferSelect;

type LoadedActivity = {
  id: number;
  tripId: number;
  categoryId: number;
  date: string;
  duration: number;
  notes: string | null;
  tripName: string;
  categoryName: string;
};

export default function EditActivityScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const activityId = Number(params.id);
  const scheme = useColorScheme() ?? 'light';
  const theme = Colors[scheme];

  const [isLoading, setIsLoading] = useState(true);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [tripId, setTripId] = useState<number | null>(null);
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [date, setDate] = useState('');
  const [duration, setDuration] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    async function loadData() {
      if (!activityId) {
        Alert.alert('Invalid activity', 'Unable to load this activity.');
        router.back();
        return;
      }

      try {
        const [tripRows, categoryRows, activityRows] = await Promise.all([
          db.select().from(tripsTable).orderBy(tripsTable.name),
          db.select().from(categoriesTable).orderBy(categoriesTable.name),
          db
            .select({
              id: activitiesTable.id,
              tripId: activitiesTable.tripId,
              categoryId: activitiesTable.categoryId,
              date: activitiesTable.date,
              duration: activitiesTable.duration,
              notes: activitiesTable.notes,
              tripName: tripsTable.name,
              categoryName: categoriesTable.name,
            })
            .from(activitiesTable)
            .innerJoin(tripsTable, eq(activitiesTable.tripId, tripsTable.id))
            .innerJoin(categoriesTable, eq(activitiesTable.categoryId, categoriesTable.id))
            .where(eq(activitiesTable.id, activityId))
            .limit(1),
        ]);

        const activity = activityRows[0] as LoadedActivity | undefined;
        if (!activity) {
          Alert.alert('Not found', 'Activity no longer exists.');
          router.back();
          return;
        }

        setTrips(tripRows);
        setCategories(categoryRows);
        setTripId(activity.tripId);
        setCategoryId(activity.categoryId);
        setDate(activity.date);
        setDuration(String(activity.duration));
        setNotes(activity.notes ?? '');
      } finally {
        setIsLoading(false);
      }
    }

    void loadData();
  }, [activityId, router]);

  async function handleSave() {
    const durationValue = Number(duration);
    if (
      !activityId ||
      !tripId ||
      !categoryId ||
      !date.trim() ||
      !Number.isFinite(durationValue) ||
      durationValue <= 0
    ) {
      Alert.alert('Invalid input', 'Please complete all required fields.');
      return;
    }

    await db
      .update(activitiesTable)
      .set({
        tripId,
        categoryId,
        date: date.trim(),
        duration: durationValue,
        notes: notes.trim() || null,
      })
      .where(eq(activitiesTable.id, activityId));

    router.back();
  }

  function handleCancel() {
    router.back();
  }

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, styles.loadingWrap, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={[styles.loadingText, { color: theme.subtext }]}>Loading activity...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={[styles.formCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.form}>
            <Text style={[styles.sectionTitle, { color: theme.subtext }]}>Trip</Text>
            <View style={styles.optionsRow}>
              {trips.map((trip) => (
                <Pressable
                  key={trip.id}
                  style={[
                    styles.optionButton,
                    { borderColor: theme.border, backgroundColor: theme.inputBg },
                    tripId === trip.id && styles.optionButtonSelected,
                  ]}
                  onPress={() => setTripId(trip.id)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      tripId === trip.id && styles.optionTextSelected,
                      { color: tripId === trip.id ? theme.primary : theme.text },
                    ]}
                  >
                    {trip.name}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text style={[styles.sectionTitle, { color: theme.subtext }]}>Category</Text>
            <View style={styles.optionsRow}>
              {categories.map((category) => (
                <Pressable
                  key={category.id}
                  style={[
                    styles.optionButton,
                    { borderColor: theme.border, backgroundColor: theme.inputBg },
                    categoryId === category.id && styles.optionButtonSelected,
                  ]}
                  onPress={() => setCategoryId(category.id)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      categoryId === category.id && styles.optionTextSelected,
                      { color: categoryId === category.id ? theme.primary : theme.text },
                    ]}
                  >
                    {category.name}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text style={[styles.sectionTitle, { color: theme.subtext }]}>Date</Text>
            <TextInput
              style={[
                styles.input,
                { borderColor: theme.primary, backgroundColor: theme.inputBg, color: theme.text },
              ]}
              value={date}
              onChangeText={setDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={theme.subtext}
            />

            <Text style={[styles.sectionTitle, { color: theme.subtext }]}>Duration (minutes)</Text>
            <TextInput
              style={[
                styles.input,
                { borderColor: theme.primary, backgroundColor: theme.inputBg, color: theme.text },
              ]}
              value={duration}
              onChangeText={setDuration}
              placeholder="120"
              placeholderTextColor={theme.subtext}
              keyboardType="number-pad"
            />

            <Text style={[styles.sectionTitle, { color: theme.subtext }]}>Notes</Text>
            <TextInput
              style={[
                styles.input,
                { borderColor: theme.primary, backgroundColor: theme.inputBg, color: theme.text },
              ]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Optional notes"
              placeholderTextColor={theme.subtext}
            />

            <View style={styles.actionsRow}>
              <Pressable
                style={({ pressed }) => [
                  styles.actionButton,
                  { backgroundColor: theme.primary, opacity: pressed ? 0.85 : 1 },
                ]}
                onPress={() => void handleSave()}
              >
                <Text style={styles.actionText}>Save Changes</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  styles.actionButton,
                  { backgroundColor: theme.subtext, opacity: pressed ? 0.85 : 1 },
                ]}
                onPress={handleCancel}
              >
                <Text style={styles.actionText}>Cancel</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 15,
    fontWeight: '600',
  },
  content: {
    padding: 16,
    paddingBottom: 24,
  },
  formCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#1F2937',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 3,
  },
  form: {
    gap: 12,
  },
  sectionTitle: {
    fontWeight: '700',
    fontSize: 15,
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 9,
    backgroundColor: '#FFF3E0',
  },
  optionButtonSelected: {
    borderColor: '#FF6B6B',
    backgroundColor: '#FFE3DF',
  },
  optionText: {
    color: '#1F2937',
  },
  optionTextSelected: {
    color: '#FF6B6B',
    fontWeight: '600',
  },
  input: {
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#FFF3E0',
  },
  actionsRow: {
    marginTop: 10,
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    borderRadius: 14,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});
