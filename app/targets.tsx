import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  FlatList,
  ImageBackground,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { eq } from 'drizzle-orm';
import { db } from '../db/db';
import { categories, targets } from '../db/schema';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/Colors';

type TargetRow = {
  id: number;
  type: string;
  value: number;
  categoryName: string | null;
};

export default function TargetsScreen() {
  const router = useRouter();
  const scheme = useColorScheme() ?? 'light';
  const theme = Colors[scheme];
  const [targetList, setTargetList] = useState<TargetRow[]>([]);

  const loadTargets = useCallback(async () => {
    const rows = await db
      .select({
        id: targets.id,
        type: targets.type,
        value: targets.value,
        categoryName: categories.name,
      })
      .from(targets)
      .leftJoin(categories, eq(targets.categoryId, categories.id))
      .orderBy(targets.id);

    setTargetList(rows);
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadTargets();
    }, [loadTargets])
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ImageBackground
        source={{
          uri: 'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1200&q=80',
        }}
        style={styles.banner}
        imageStyle={styles.bannerImage}
      >
        <View style={styles.bannerOverlay}>
          <Text style={styles.bannerTitle}>Targets</Text>
          <Text style={styles.bannerSubtitle}>Track progress for every adventure</Text>
        </View>
      </ImageBackground>

      <Pressable style={styles.addButton} onPress={() => router.push('/add-target')}>
        <Text style={styles.addButtonText}>+ Add Target</Text>
      </Pressable>

      <FlatList
        data={targetList}
        contentContainerStyle={styles.listContent}
        keyExtractor={(item) => String(item.id)}
        ListEmptyComponent={<Text style={[styles.emptyText, { color: theme.subtext }]}>No targets yet 🎯</Text>}
        renderItem={({ item }) => (
          <View
            style={[
              styles.card,
              { backgroundColor: theme.card, borderColor: theme.border },
              item.type === 'weekly' ? styles.weeklyCard : styles.monthlyCard,
            ]}
          >
            <View style={[styles.leftBar, { backgroundColor: item.type === 'weekly' ? theme.primary : theme.accent }]} />
            <Text style={styles.title}>
              {item.type === 'weekly' ? '🌴 Weekly Target' : '🌅 Monthly Target'}
            </Text>
            <Text style={styles.meta}>Goal Value: {item.value}</Text>
            <Text style={styles.meta}>Category: {item.categoryName ?? 'All'}</Text>
            <View style={[styles.progressTrack, { backgroundColor: theme.inputBg }]}>
              <View style={[styles.progressFill, { backgroundColor: item.type === 'weekly' ? theme.primary : theme.accent, width: `${Math.min(item.value * 10, 100)}%` }]} />
            </View>
            <Text style={styles.progressText}>{Math.min(item.value * 10, 100)}%</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  banner: {
    height: 140,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 14,
  },
  bannerImage: {
    borderRadius: 20,
  },
  bannerOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.24)',
    padding: 14,
  },
  bannerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  bannerSubtitle: {
    color: '#F5E6CA',
    marginTop: 4,
  },
  addButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 16,
    height: 52,
    borderRadius: 14,
    marginBottom: 14,
    justifyContent: 'center',
    shadowColor: '#1F2937',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 3,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  listContent: {
    paddingBottom: 24,
  },
  emptyText: {
    marginTop: 20,
    color: '#1F2937',
  },
  card: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 15,
    marginBottom: 12,
    shadowColor: '#1F2937',
    shadowOpacity: 0.11,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 3,
  },
  weeklyCard: {
    backgroundColor: '#FFFFFF',
  },
  monthlyCard: {
    backgroundColor: '#FFFFFF',
  },
  leftBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    borderTopLeftRadius: 18,
    borderBottomLeftRadius: 18,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
    color: '#1F2937',
  },
  meta: {
    color: '#1F2937',
    marginBottom: 2,
    fontSize: 15,
  },
  progressTrack: {
    height: 10,
    borderRadius: 999,
    marginTop: 10,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
  },
  progressText: {
    marginTop: 6,
    fontWeight: '800',
    color: '#2D1B00',
  },
});
