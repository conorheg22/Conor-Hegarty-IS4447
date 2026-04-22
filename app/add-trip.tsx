import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { db } from '../db/db';
import { trips } from '../db/schema';
import { LinearGradient } from 'expo-linear-gradient';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/Colors';

export default function AddTripScreen() {
  const router = useRouter();
  const scheme = useColorScheme() ?? 'light';
  const theme = Colors[scheme];
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  async function handleSubmit() {
    if (!name.trim() || !startDate.trim() || !endDate.trim()) {
      return;
    }

    await db.insert(trips).values({
      name: name.trim(),
      startDate: startDate.trim(),
      endDate: endDate.trim(),
    });

    router.back();
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <LinearGradient colors={['#FF6B6B', '#FFB347']} style={styles.banner}>
          <Text style={styles.bannerTitle}>Add New Trip ✈️</Text>
          <Text style={styles.bannerSub}>Sunset plans start here</Text>
        </LinearGradient>

        <View style={[styles.formCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.form}>
            <Text style={[styles.label, { color: theme.subtext }]}>Trip Name</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.text }]}
              value={name}
              onChangeText={setName}
              placeholder="Paris Trip"
              placeholderTextColor={theme.subtext}
            />

            <Text style={[styles.label, { color: theme.subtext }]}>Start Date</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.text }]}
              value={startDate}
              onChangeText={setStartDate}
              placeholder="2026-06-10"
              placeholderTextColor={theme.subtext}
            />

            <Text style={[styles.label, { color: theme.subtext }]}>End Date</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.text }]}
              value={endDate}
              onChangeText={setEndDate}
              placeholder="2026-06-17"
              placeholderTextColor={theme.subtext}
            />

            <Pressable style={({ pressed }) => [styles.submitButton, { backgroundColor: theme.primary, opacity: pressed ? 0.85 : 1 }]} onPress={() => void handleSubmit()}>
              <Text style={styles.submitText}>Create Trip</Text>
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
    backgroundColor: '#FAF9F6',
  },
  content: {
    padding: 16,
    paddingBottom: 28,
  },
  banner: {
    height: 170,
    borderRadius: 16,
    marginBottom: 16,
    padding: 18,
    justifyContent: 'flex-end',
  },
  bannerTitle: {
    color: '#FFF9F0',
    fontSize: 28,
    fontWeight: '800',
  },
  bannerSub: {
    marginTop: 6,
    color: '#FFF9F0',
  },
  formCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#1F2937',
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 3,
  },
  form: {
    gap: 12,
  },
  label: {
    fontWeight: '700',
    fontSize: 15,
  },
  input: {
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  submitButton: {
    marginTop: 10,
    borderRadius: 14,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1F2937',
    shadowOpacity: 0.14,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 3,
  },
  submitText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 17,
  },
});
