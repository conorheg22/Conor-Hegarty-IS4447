import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useFocusEffect } from '@react-navigation/native';
import { eq } from 'drizzle-orm';
import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  FlatList,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { NavDrawer } from '../components/NavDrawer';
import { db } from '../db/db';
import { activities, categories, targets } from '../db/schema';

type TargetRow = {
  id: number;
  type: string;
  value: number;
  categoryId: number | null;
  categoryName: string | null;
};

type ProgressMap = {
  [key: number]: {
    completed: number;
    percentage: number;
    remaining: number;
    streak: number;
  };
};

export default function TargetsScreen() {
  const router = useRouter();
  const scheme = useColorScheme() ?? 'light';
  const theme = Colors[scheme];

  const [targetList, setTargetList] = useState<TargetRow[]>([]);
  const [progressMap, setProgressMap] = useState<ProgressMap>({});

  const loadTargets = useCallback(async () => {
    const targetRows = await db
      .select({
        id: targets.id,
        type: targets.type,
        value: targets.value,
        categoryId: targets.categoryId,
        categoryName: categories.name,
      })
      .from(targets)
      .leftJoin(categories, eq(targets.categoryId, categories.id));

    const activityRows = await db.select().from(activities);

    const now = new Date();
    const newProgress: ProgressMap = {};

    targetRows.forEach((target) => {
      const periods = [];
      const periodCount = 6;

      for (let i = 0; i < periodCount; i++) {
        const start = new Date();

        if (target.type === 'weekly') {
          start.setDate(now.getDate() - (i + 1) * 7);
        } else {
          start.setMonth(now.getMonth() - (i + 1));
        }

        const startStr = start.toISOString().split('T')[0];

        const filtered = activityRows.filter((a) => {
          if (a.date < startStr) return false;
          if (target.categoryId && a.categoryId !== target.categoryId) return false;
          return true;
        });

        periods.push(filtered.length);
      }

      const completed = periods[0];
      const percentage = Math.min((completed / target.value) * 100, 100);
      const remaining = Math.max(target.value - completed, 0);

      let streak = 0;
      for (let p of periods) {
        if (p >= target.value) streak++;
        else break;
      }

      newProgress[target.id] = {
        completed,
        percentage,
        remaining,
        streak,
      };
    });

    setTargetList(targetRows);
    setProgressMap(newProgress);
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadTargets();
    }, [loadTargets])
  );

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>

        {/* ADD BUTTON */}
        <Pressable
          style={({ pressed }) => [
            styles.addButton,
            { opacity: pressed ? 0.9 : 1 },
          ]}
          onPress={() => router.push('/add-target')}
        >
          <Text style={styles.buttonText}>+ Add Target</Text>
        </Pressable>

        <FlatList
          data={targetList}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text style={[styles.emptyText, { color: theme.subtext }]}>
              No targets yet. Create one to start tracking your progress.
            </Text>
          }
          renderItem={({ item }) => {
            const progress = progressMap[item.id] || {
              completed: 0,
              percentage: 0,
              remaining: item.value,
              streak: 0,
            };

            let statusText = '';
            let statusColor = '';

            if (progress.completed > item.value) {
              statusText = 'Exceeded Target';
              statusColor = '#EF4444';
            } else if (progress.completed === item.value) {
              statusText = 'Target Achieved';
              statusColor = '#06D6A0';
            } else {
              statusText = 'In Progress';
              statusColor = '#FFB347';
            }

            return (
              <View
                style={[
                  styles.card,
                  { backgroundColor: theme.card, borderColor: theme.border },
                ]}
              >
                <Text style={[styles.title, { color: theme.text }]}>
                  {item.type === 'weekly' ? 'Weekly Target' : 'Monthly Target'}
                </Text>

                <Text style={[styles.meta, { color: theme.text }]}>
                  Progress: {progress.completed} / {item.value}
                </Text>

                <Text style={[styles.meta, { color: theme.subtext }]}>
                  {progress.remaining > 0
                    ? `${progress.remaining} remaining`
                    : 'No remaining'}
                </Text>

                <Text style={[styles.meta, { color: theme.subtext }]}>
                  Category: {item.categoryName ?? 'All'}
                </Text>

                <Text style={[styles.meta, { color: theme.primary }]}>
                  Streak: {progress.streak}
                </Text>

                <Text style={[styles.status, { color: statusColor }]}>
                  {statusText}
                </Text>

                {/* PROGRESS BAR */}
                <View
                  style={[
                    styles.progressTrack,
                    { backgroundColor: theme.inputBg },
                  ]}
                >
                  <View
                    style={[
                      styles.progressFill,
                      {
                        backgroundColor:
                          item.type === 'weekly'
                            ? theme.primary
                            : theme.accent,
                        width: `${progress.percentage}%`,
                      },
                    ]}
                  />
                </View>

                <Text style={[styles.progressText, { color: theme.text }]}>
                  {Math.round(progress.percentage)}%
                </Text>
              </View>
            );
          }}
        />
      </SafeAreaView>

      <NavDrawer />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 10,
  },

  addButton: {
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 12,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: '#FFB347',
    elevation: 4,
  },

  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },

  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 120,
  },

  emptyText: {
    marginTop: 20,
  },

  card: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 15,
    marginBottom: 12,
  },

  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },

  meta: {
    marginBottom: 2,
    fontSize: 15,
  },

  status: {
    marginTop: 6,
    fontWeight: '700',
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
  },
});