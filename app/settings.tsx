import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { NavDrawer } from '../components/NavDrawer';
import { useTheme } from '../context/ThemeContext';

export default function SettingsScreen() {
  const scheme = useColorScheme();
  const theme = Colors[scheme];
  const { mode, setMode } = useTheme();
  const router = useRouter();

  return (
    <View style={{ flex: 1 }}>
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={[styles.title, { color: theme.text }]}>Settings</Text>

        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Appearance</Text>

          <View style={styles.toggleRow}>
            {(['light', 'dark', 'system'] as const).map((m) => (
              <Pressable
                key={m}
                style={[
                  styles.toggleBtn,
                  {
                    borderColor: theme.border,
                    backgroundColor: mode === m ? theme.primary : theme.inputBg,
                  },
                ]}
                onPress={() => void setMode(m)}
              >
                <Text style={[styles.toggleText, { color: mode === m ? '#fff' : theme.text }]}>
                  {m}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Account</Text>

          <Pressable style={styles.dangerBtn} onPress={() => router.push('/delete-profile')}>
            <Text style={styles.dangerText}>Delete Account</Text>
          </Pressable>
        </View>
      </View>

      <NavDrawer />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  title: { fontSize: 26, fontWeight: '800', marginBottom: 20 },
  card: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 14 },
  toggleRow: { flexDirection: 'row', gap: 10 },
  toggleBtn: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  toggleText: { fontSize: 13, fontWeight: '600' },
  dangerBtn: {
    borderWidth: 1,
    borderColor: '#EF4444',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  dangerText: { color: '#EF4444', fontWeight: '700', fontSize: 14 },
});