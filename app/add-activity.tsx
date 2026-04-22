import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  ImageBackground,
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
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/Colors';

type Trip = typeof tripsTable.$inferSelect;
type Category = typeof categoriesTable.$inferSelect;

export default function AddActivityScreen() {
  const router = useRouter();
  const scheme = useColorScheme() ?? 'light';
  const theme = Colors[scheme];
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
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <ImageBackground
          source={{
            uri: 'https://images.unsplash.com/photo-1473116763249-2faaef81ccda?auto=format&fit=crop&w=1200&q=80',
          }}
          style={styles.banner}
          imageStyle={styles.bannerImage}
        >
          <View style={styles.bannerOverlay}>
            <Text style={styles.bannerTitle}>Add Activity</Text>
            <Text style={styles.bannerSubtitle}>Fill your trip with great moments</Text>
          </View>
        </ImageBackground>

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
                  onPress={() => {
                    console.log('[add-activity] trip selected', trip.id);
                    setTripId(trip.id);
                  }}
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
                  onPress={() => {
                    console.log('[add-activity] category selected', category.id);
                    setCategoryId(category.id);
                  }}
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
              style={[styles.input, { borderColor: theme.primary, backgroundColor: theme.inputBg, color: theme.text }]}
              value={date}
              onChangeText={setDate}
              placeholder="2026-06-11"
              placeholderTextColor={theme.subtext}
            />

            <Text style={[styles.sectionTitle, { color: theme.subtext }]}>Duration (minutes)</Text>
            <TextInput
              style={[styles.input, { borderColor: theme.primary, backgroundColor: theme.inputBg, color: theme.text }]}
              value={duration}
              onChangeText={setDuration}
              placeholder="120"
              placeholderTextColor={theme.subtext}
              keyboardType="number-pad"
            />

            <Text style={[styles.sectionTitle, { color: theme.subtext }]}>Notes</Text>
            <TextInput
              style={[styles.input, { borderColor: theme.primary, backgroundColor: theme.inputBg, color: theme.text }]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Optional notes"
              placeholderTextColor={theme.subtext}
            />

            <Pressable
              style={({ pressed }) => [styles.submitButton, { backgroundColor: theme.primary, opacity: pressed ? 0.85 : 1 }]}
              onPress={() => void handleSubmit()}
            >
              <Text style={styles.submitText}>Save Activity</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF9F0',
  },
  content: {
    padding: 16,
    paddingBottom: 24,
  },
  banner: {
    height: 150,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  bannerImage: {
    borderRadius: 16,
  },
  bannerOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    padding: 14,
  },
  bannerTitle: {
    fontSize: 27,
    fontWeight: '700',
    color: '#fff',
  },
  bannerSubtitle: {
    color: '#F5E6CA',
    marginTop: 4,
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
    color: '#1F2937',
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
  submitButton: {
    marginTop: 10,
    borderRadius: 14,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1F2937',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 3,
  },
  submitText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});
