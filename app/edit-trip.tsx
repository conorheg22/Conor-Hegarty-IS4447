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
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/Colors';

export default function EditTripScreen() {
  const router = useRouter();
  const scheme = useColorScheme() ?? 'light';
  const theme = Colors[scheme];
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
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.form, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Text style={[styles.label, { color: theme.subtext }]}>Name</Text>
        <TextInput style={[styles.input, { borderColor: theme.primary, backgroundColor: theme.inputBg, color: theme.text }]} value={name} onChangeText={setName} />

        <Text style={[styles.label, { color: theme.subtext }]}>Start Date</Text>
        <TextInput style={[styles.input, { borderColor: theme.primary, backgroundColor: theme.inputBg, color: theme.text }]} value={startDate} onChangeText={setStartDate} />

        <Text style={[styles.label, { color: theme.subtext }]}>End Date</Text>
        <TextInput style={[styles.input, { borderColor: theme.primary, backgroundColor: theme.inputBg, color: theme.text }]} value={endDate} onChangeText={setEndDate} />

        <Pressable style={({ pressed }) => [styles.submitButton, { backgroundColor: theme.primary, opacity: pressed ? 0.85 : 1 }]} onPress={() => void handleSave()}>
          <Text style={styles.submitText}>Update Trip</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  form: {
    gap: 10,
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
  },
  label: {
    fontWeight: '600',
  },
  input: {
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  submitButton: {
    marginTop: 8,
    borderRadius: 14,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitText: {
    color: '#fff',
    fontWeight: '700',
  },
});
