import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
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

export default function AddActivityScreen() {
  const router = useRouter();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [tripId, setTripId] = useState<number | null>(null);
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [date, setDate] = useState('');
  const [duration, setDuration] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    async function loadOptions() {
      const [tripRows, categoryRows] = await Promise.all([
        db.select().from(tripsTable).orderBy(tripsTable.name),
        db.select().from(categoriesTable).orderBy(categoriesTable.name),
      ]);

      setTrips(tripRows);
      setCategories(categoryRows);

      if (tripRows[0]) {
        setTripId(tripRows[0].id);
      }
      if (categoryRows[0]) {
        setCategoryId(categoryRows[0].id);
      }
    }

    void loadOptions();
  }, []);

  async function handleSubmit() {
    console.log('[add-activity] submit pressed');
    const durationValue = Number(duration);
    if (
      !tripId ||
      !categoryId ||
      !date.trim() ||
      !Number.isFinite(durationValue) ||
      durationValue <= 0
    ) {
      console.log('[add-activity] invalid form values');
      Alert.alert('Invalid input', 'Please complete all required fields.');
      return;
    }

    await db.insert(activitiesTable).values({
      tripId,
      categoryId,
      date: date.trim(),
      duration: durationValue,
      notes: notes.trim() || null,
    });

    router.back();
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.form}>
        <Text style={styles.label}>Trip</Text>
        <View style={styles.optionsRow}>
          {trips.map((trip) => (
            <Pressable
              key={trip.id}
              style={[
                styles.optionButton,
                tripId === trip.id && styles.optionButtonSelected,
              ]}
              onPress={() => {
                console.log('[add-activity] trip selected', trip.id);
                setTripId(trip.id);
              }}
            >
              <Text
                style={[
                  styles.optionText,
                  tripId === trip.id && styles.optionTextSelected,
                ]}
              >
                {trip.name}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.label}>Category</Text>
        <View style={styles.optionsRow}>
          {categories.map((category) => (
            <Pressable
              key={category.id}
              style={[
                styles.optionButton,
                categoryId === category.id && styles.optionButtonSelected,
              ]}
              onPress={() => {
                console.log('[add-activity] category selected', category.id);
                setCategoryId(category.id);
              }}
            >
              <Text
                style={[
                  styles.optionText,
                  categoryId === category.id && styles.optionTextSelected,
                ]}
              >
                {category.name}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.label}>Date</Text>
        <TextInput
          style={styles.input}
          value={date}
          onChangeText={setDate}
          placeholder="2026-06-11"
        />

        <Text style={styles.label}>Duration (minutes)</Text>
        <TextInput
          style={styles.input}
          value={duration}
          onChangeText={setDuration}
          placeholder="120"
          keyboardType="number-pad"
        />

        <Text style={styles.label}>Notes</Text>
        <TextInput
          style={styles.input}
          value={notes}
          onChangeText={setNotes}
          placeholder="Optional notes"
        />

        <Pressable
          style={styles.submitButton}
          onPress={() => void handleSubmit()}
        >
          <Text style={styles.submitText}>Save Activity</Text>
        </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 16,
  },
  form: {
    gap: 10,
  },
  label: {
    fontWeight: '600',
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  optionButtonSelected: {
    borderColor: '#2563EB',
    backgroundColor: '#DBEAFE',
  },
  optionText: {
    color: '#1F2937',
  },
  optionTextSelected: {
    color: '#1D4ED8',
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  submitButton: {
    marginTop: 8,
    backgroundColor: '#2563EB',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  submitText: {
    color: '#fff',
    fontWeight: '700',
  },
});
