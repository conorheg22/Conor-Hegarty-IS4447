import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { db } from '../db/db';
import { categories } from '../db/schema';

const COLORS = ['#FF6B6B', '#FFD166', '#06D6A0', '#118AB2', '#9B5DE5'];
const EMOJIS = ['🏖️', '🍔', '🏃', '🛍️', '🍻', '🎉', '📸'];

export default function AddCategoryScreen() {
  const router = useRouter();
  const scheme = useColorScheme() ?? 'light';
  const theme = Colors[scheme];

  const [name, setName] = useState('');
  const [color, setColor] = useState(COLORS[0]);
  const [emoji, setEmoji] = useState(EMOJIS[0]);

  async function handleSubmit() {
    if (!name.trim()) return;

    await db.insert(categories).values({
      name,
      color,
      emoji,
    });

    router.back();
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.form, { backgroundColor: theme.card }]}>

        <Text>Name</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} />

        <Text>Emoji</Text>
        <View style={styles.row}>
          {EMOJIS.map((e) => (
            <Pressable key={e} onPress={() => setEmoji(e)}>
              <Text style={[styles.emoji, emoji === e && styles.selected]}>
                {e}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text>Colour</Text>
        <View style={styles.row}>
          {COLORS.map((c) => (
            <Pressable
              key={c}
              style={[
                styles.color,
                { backgroundColor: c },
                color === c && styles.selectedColor,
              ]}
              onPress={() => setColor(c)}
            />
          ))}
        </View>

        <Pressable style={styles.button} onPress={handleSubmit}>
          <Text style={{ color: '#fff' }}>Save Category</Text>
        </Pressable>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },

  form: {
    borderRadius: 16,
    padding: 16,
    gap: 10,
  },

  input: {
    borderWidth: 1,
    padding: 10,
    borderRadius: 6,
  },

  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  emoji: {
    fontSize: 26,
    padding: 6,
  },

  selected: {
    borderWidth: 2,
    borderRadius: 6,
  },

  color: {
    width: 30,
    height: 30,
    borderRadius: 6,
  },

  selectedColor: {
    borderWidth: 3,
  },

  button: {
    marginTop: 20,
    backgroundColor: '#06D6A0',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
});