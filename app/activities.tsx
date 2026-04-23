import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useFocusEffect } from '@react-navigation/native';
import { eq } from 'drizzle-orm';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { NavDrawer } from '../components/NavDrawer';
import { db } from '../db/db';
import {
  activities as activitiesTable,
  categories as categoriesTable,
  trips as tripsTable,
} from '../db/schema';

type ActivityRow = {
  id: number;
  tripName: string;
  categoryName: string;
  categoryColor: string;
  categoryEmoji: string | null;
  categoryId: number;
  date: string;
  duration: number;
  notes: string | null;
};

type CategoryPill = {
  id: number;
  name: string;
  color: string;
  emoji: string | null;
};

export default function ActivitiesScreen() {
  const router = useRouter();
  const scheme = useColorScheme() ?? 'light';
  const theme = Colors[scheme];

  const [activityList, setActivityList] = useState<ActivityRow[]>([]);
  const [categoryPills, setCategoryPills] = useState<CategoryPill[]>([]);
  const [searchText, setSearchText] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const loadActivities = useCallback(async () => {
    const rows = await db
      .select({
        id: activitiesTable.id,
        tripName: tripsTable.name,
        categoryName: categoriesTable.name,
        categoryColor: categoriesTable.color,
        categoryEmoji: categoriesTable.emoji,
        categoryId: categoriesTable.id,
        date: activitiesTable.date,
        duration: activitiesTable.duration,
        notes: activitiesTable.notes,
      })
      .from(activitiesTable)
      .innerJoin(tripsTable, eq(activitiesTable.tripId, tripsTable.id))
      .innerJoin(categoriesTable, eq(activitiesTable.categoryId, categoriesTable.id))
      .orderBy(activitiesTable.date);

    setActivityList(rows);
  }, []);

  const loadCategories = useCallback(async () => {
    const cats = await db
      .select({
        id: categoriesTable.id,
        name: categoriesTable.name,
        color: categoriesTable.color,
        emoji: categoriesTable.emoji,
      })
      .from(categoriesTable);

    setCategoryPills(cats);
  }, []);

  useEffect(() => {
    void loadActivities();
    void loadCategories();
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadActivities();
    }, [])
  );

  async function handleDeleteActivity(id: number) {
    await db.delete(activitiesTable).where(eq(activitiesTable.id, id));
    await loadActivities();
  }

  const filteredList = useMemo(() => {
    return activityList.filter((item) => {
      if (searchText.trim()) {
        const q = searchText.toLowerCase();
        if (
          !item.tripName.toLowerCase().includes(q) &&
          !item.categoryName.toLowerCase().includes(q) &&
          !(item.notes ?? '').toLowerCase().includes(q)
        ) return false;
      }

      if (selectedCategoryId && item.categoryId !== selectedCategoryId) return false;
      if (dateFrom && item.date < dateFrom) return false;
      if (dateTo && item.date > dateTo) return false;

      return true;
    });
  }, [activityList, searchText, selectedCategoryId, dateFrom, dateTo]);

  function hexToRGBA(hex: string, alpha: number) {
    const r = parseInt(hex.substring(1, 3), 16);
    const g = parseInt(hex.substring(3, 5), 16);
    const b = parseInt(hex.substring(5, 7), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  }

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        
        <FlatList
          data={filteredList}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}

          ListHeaderComponent={
            <>
              {/* 🔥 SPACING FIX */}
              <View style={{ height: 12 }} />

              {/* SEARCH */}
              <View style={[styles.searchRow, { backgroundColor: theme.inputBg, borderColor: theme.border }]}>
                <TextInput
                  style={[styles.searchInput, { color: theme.text }]}
                  placeholder="Search for Trip or Activity"
                  placeholderTextColor={theme.subtext}
                  value={searchText}
                  onChangeText={setSearchText}
                />
              </View>

              {/* CATEGORY FILTER */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillRow}>
                <Pressable
                  style={[styles.pill, selectedCategoryId === null && styles.activePill]}
                  onPress={() => setSelectedCategoryId(null)}
                >
                  <Text style={styles.pillText}>All</Text>
                </Pressable>

                {categoryPills.map((cat) => (
                  <Pressable
                    key={cat.id}
                    style={[
                      styles.pill,
                      selectedCategoryId === cat.id && { backgroundColor: cat.color },
                    ]}
                    onPress={() => setSelectedCategoryId(cat.id)}
                  >
                    <Text style={styles.pillText}>
                      {(cat.emoji ?? '') + ' ' + cat.name}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>

              {/* DATE FILTER */}
              <View style={styles.dateRow}>
                <TextInput
                style={[
                  styles.input,
                  {
                    borderColor: theme.border,
                    backgroundColor: theme.inputBg,
                    color: '#1F2937',
                  },
                ]}
                placeholder="From YYYY-MM-DD"
                placeholderTextColor={theme.subtext}
                value={dateFrom}
                onChangeText={setDateFrom}
              />

                <TextInput
                  style={[
                    styles.input,
                    {
                      borderColor: theme.border,
                      backgroundColor: theme.inputBg,
                      color: '#1F2937',
                    },
                  ]}
                  placeholder="To YYYY-MM-DD"
                  placeholderTextColor={theme.subtext}
                  value={dateTo}
                  onChangeText={setDateTo}
                />
              </View>

              {/* ADD BUTTON */}
              <Pressable
                style={({ pressed }) => [
                  styles.addButton,
                  { opacity: pressed ? 0.9 : 1 },
                ]}
                onPress={() => router.push('/add-activity')}
              >
                <Text style={styles.buttonText}>+ Add Activity</Text>
              </Pressable>
            </>
          }

          renderItem={({ item }) => {
            const isSelected = selectedId === item.id;

            return (
              <Pressable onPress={() => setSelectedId(item.id)}>
                <View
                  style={[
                    styles.card,
                    {
                      backgroundColor: isSelected
                        ? hexToRGBA(item.categoryColor, 0.35)
                        : hexToRGBA(item.categoryColor, 0.12),
                      borderColor: item.categoryColor,
                    },
                  ]}
                >
                  <Text style={[styles.tripName, { color: theme.text }]}>
                    {item.tripName}
                  </Text>

                  <Text style={{ color: theme.subtext }}>
                    {(item.categoryEmoji ?? '') + ' ' + item.categoryName}
                  </Text>

                  {/* 🔥 FIXED VISIBILITY */}
                  <Text style={styles.primaryMeta}>{item.date}</Text>
                  <Text style={styles.primaryMeta}>{item.duration} mins</Text>

                  {item.notes ? (
                    <Text style={{ color: theme.subtext }}>{item.notes}</Text>
                  ) : null}

                  <View style={styles.actions}>
                    <Pressable onPress={() => router.push(`/edit-activity?id=${item.id}`)}>
                      <Text style={styles.edit}>Edit</Text>
                    </Pressable>

                    <Pressable onPress={() => handleDeleteActivity(item.id)}>
                      <Text style={styles.delete}>Delete</Text>
                    </Pressable>
                  </View>
                </View>
              </Pressable>
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

  searchRow: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
    marginHorizontal: 16,
    marginBottom: 12,
  },

  searchInput: {
    flex: 1,
  },

  pillRow: {
    marginBottom: 16,
    marginLeft: 16,
  },

  pill: {
    padding: 10,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },

  activePill: {
    backgroundColor: '#FF6B6B',
  },

  pillText: {
    color: '#000',
  },

  dateRow: {
    flexDirection: 'row',
    gap: 10,
    marginHorizontal: 16,
    marginBottom: 16,
  },

  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
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
    paddingBottom: 120,
  },

  card: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 14,
  },

  tripName: {
    fontWeight: '700',
    fontSize: 16,
    marginBottom: 4,
  },

  primaryMeta: {
    color: '#1F2937',
    fontWeight: '600',
  },

  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
  },

  edit: {
    color: '#06D6A0',
    fontWeight: '700',
  },

  delete: {
    color: '#FF4757',
    fontWeight: '700',
  },
});