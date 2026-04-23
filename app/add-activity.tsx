import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
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

      if (tripRows.length > 0) setTripId(tripRows[0].id);
      if (categoryRows.length > 0) setCategoryId(categoryRows[0].id);
    }

    loadOptions();
  }, []);

  async function handleSubmit() {
    const durationValue = Number(duration);

    if (
      tripId === null ||
      categoryId === null ||
      !date.trim() ||
      !Number.isFinite(durationValue) ||
      durationValue <= 0
    ) {
      Alert.alert('Error', 'Please fill all fields correctly');
      return;
    }

    try {
      await db.insert(activitiesTable).values({
        tripId,
        categoryId,
        date: date.trim(),
        duration: durationValue,
        notes: notes.trim() || null,
      });

      Alert.alert('Success', 'Activity saved');
      router.back();
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to save activity');
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container}>

          <Text style={styles.label}>Trip</Text>
          <View style={styles.row}>
            {trips.map((trip) => (
              <Pressable
                key={trip.id}
                style={[
                  styles.option,
                  tripId === trip.id && styles.selectedDefault,
                ]}
                onPress={() => setTripId(trip.id)}
              >
                <Text style={tripId === trip.id ? styles.selectedText : undefined}>
                  {trip.name}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.label}>Category</Text>
          <View style={styles.row}>
            {categories.map((cat) => {
              const isSelected = categoryId === cat.id;

              return (
                <Pressable
                  key={cat.id}
                  style={[
                    styles.option,
                    {
                      borderColor: cat.color,
                      backgroundColor: isSelected ? cat.color : '#fff',
                    },
                  ]}
                  onPress={() => setCategoryId(cat.id)}
                >
                  <Text
                    style={{
                      color: isSelected ? '#fff' : '#000',
                      fontWeight: isSelected ? '700' : '500',
                    }}
                  >
                    {cat.name}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={styles.label}>Date</Text>
          <TextInput
            style={styles.input}
            placeholder="2026-06-11"
            value={date}
            onChangeText={setDate}
          />

          <Text style={styles.label}>Duration (minutes)</Text>
          <TextInput
            style={styles.input}
            placeholder="60"
            value={duration}
            onChangeText={setDuration}
            keyboardType="number-pad"
          />

          <Text style={styles.label}>Notes</Text>
          <TextInput
            style={styles.input}
            placeholder="Optional"
            value={notes}
            onChangeText={setNotes}
          />

          <Pressable style={styles.button} onPress={handleSubmit}>
            <Text style={styles.buttonText}>Save Activity</Text>
          </Pressable>

        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 10,
  },

  label: {
    fontWeight: '600',
  },

  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  option: {
    borderWidth: 1,
    padding: 8,
    borderRadius: 6,
  },

  selectedDefault: {
    backgroundColor: '#e5e7eb',
    borderColor: '#999',
  },

  selectedText: {
    fontWeight: '700',
  },

  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 6,
  },

  button: {
    marginTop: 20,
    backgroundColor: '#FF4757',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },

  buttonText: {
    color: '#fff',
    fontWeight: '700',
  },
});