import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { NavDrawer } from '../components/NavDrawer';
import { useTheme } from '../context/ThemeContext';

import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

import { db } from '../db/db';
import {
  activities,
  categories,
  targets,
  trips,
} from '../db/schema';

export default function SettingsScreen() {
  const scheme = useColorScheme();
  const theme = Colors[scheme];
  const { mode, setMode } = useTheme();
  const router = useRouter();

  async function exportCSV() {
    const activityRows = await db.select().from(activities);
    const categoryRows = await db.select().from(categories);
    const tripRows = await db.select().from(trips);
    const targetRows = await db.select().from(targets);

    const buildCSV = (title: string, rows: any[]) => {
      if (rows.length === 0) return `${title}\nNo data\n\n`;

      const headers = Object.keys(rows[0]);
      const values = rows.map((r) =>
        headers.map((h) => String(r[h] ?? '').replace(/,/g, ' '))
      );

      return [
        title,
        headers.join(','),
        ...values.map((v) => v.join(',')),
        '',
      ].join('\n');
    };

    const csv =
      buildCSV('Activities', activityRows) +
      buildCSV('Categories', categoryRows) +
      buildCSV('Trips', tripRows) +
      buildCSV('Targets', targetRows);

    const dir = FileSystem.documentDirectory;

    if (!dir) {
      console.log('No document directory available');
      return;
    }

    const fileUri =
      dir +
      `tripplanner-export-${new Date().toISOString().split('T')[0]}.csv`;

    await FileSystem.writeAsStringAsync(fileUri, csv);

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri);
    } else {
      console.log('Sharing not available');
    }
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={[styles.title, { color: theme.text }]}>
          Settings
        </Text>

        {/* APPEARANCE */}
        <View
          style={[
            styles.card,
            { backgroundColor: theme.card, borderColor: theme.border },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Appearance
          </Text>

          <View style={styles.toggleRow}>
            {(['light', 'dark'] as const).map((m) => (
              <Pressable
                key={m}
                style={[
                  styles.toggleBtn,
                  {
                    borderColor: theme.border,
                    backgroundColor:
                      mode === m ? theme.primary : theme.inputBg,
                  },
                ]}
                onPress={() => void setMode(m)}
              >
                <Text
                  style={[
                    styles.toggleText,
                    { color: mode === m ? '#fff' : theme.text },
                  ]}
                >
                  {m}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* DATA */}
        <View
          style={[
            styles.card,
            { backgroundColor: theme.card, borderColor: theme.border },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Data
          </Text>

          <Pressable
            style={({ pressed }) => [
              styles.exportBtn,
              { opacity: pressed ? 0.85 : 1 },
            ]}
            onPress={() => void exportCSV()}
          >
            <Text style={styles.exportText}>
              Export Data (CSV)
            </Text>
          </Pressable>
        </View>

        {/* ACCOUNT */}
        <View
          style={[
            styles.card,
            { backgroundColor: theme.card, borderColor: theme.border },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Account
          </Text>

          <Pressable
            style={styles.dangerBtn}
            onPress={() => router.push('/delete-profile')}
          >
            <Text style={styles.dangerText}>
              Delete Account
            </Text>
          </Pressable>
        </View>
      </View>

      <NavDrawer />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },

  title: {
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 20,
  },

  card: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 14,
  },

  toggleRow: {
    flexDirection: 'row',
    gap: 10,
  },

  toggleBtn: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },

  toggleText: {
    fontSize: 13,
    fontWeight: '600',
  },

  exportBtn: {
    backgroundColor: '#06D6A0',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },

  exportText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },

  dangerBtn: {
    borderWidth: 1,
    borderColor: '#EF4444',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },

  dangerText: {
    color: '#EF4444',
    fontWeight: '700',
    fontSize: 14,
  },
});