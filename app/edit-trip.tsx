import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { eq } from 'drizzle-orm';
import { db } from '../db/db';
import { trips } from '../db/schema';

export default function EditTripScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const tripId = Number(params.id);

  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    async function loadTrip() {
      if (!tripId) {
        return;
      }

      const row = await db.select().from(trips).where(eq(trips.id, tripId)).limit(1);
      if (row[0]) {
        setName(row[0].name);
        setStartDate(row[0].startDate);
        setEndDate(row[0].endDate);
      }
    }

    void loadTrip();
  }, [tripId]);

  async function handleSave() {
    if (!tripId || !name.trim() || !startDate.trim() || !endDate.trim()) {
      return;
    }

    await db
      .update(trips)
      .set({
        name: name.trim(),
        startDate: startDate.trim(),
        endDate: endDate.trim(),
      })
      .where(eq(trips.id, tripId));

    router.back();
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.label}>Name</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} />

        <Text style={styles.label}>Start Date</Text>
        <TextInput style={styles.input} value={startDate} onChangeText={setStartDate} />

        <Text style={styles.label}>End Date</Text>
        <TextInput style={styles.input} value={endDate} onChangeText={setEndDate} />

        <Pressable style={styles.submitButton} onPress={() => void handleSave()}>
          <Text style={styles.submitText}>Update Trip</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  form: {
    gap: 10,
  },
  label: {
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
