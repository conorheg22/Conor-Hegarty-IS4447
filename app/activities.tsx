import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useFocusEffect } from '@react-navigation/native';
import { eq } from 'drizzle-orm';
import { LinearGradient } from 'expo-linear-gradient';
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
  categoryId: number;
  date: string;
  duration: number;
  notes: string | null;
};

type CategoryPill = {
  id: number;
  name: string;
  color: string;
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

  const loadActivities = useCallback(async () => {
    const rows = await db
      .select({
        id: activitiesTable.id,
        tripName: tripsTable.name,
        categoryName: categoriesTable.name,
        categoryColor: categoriesTable.color,
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
      .select({ id: categoriesTable.id, name: categoriesTable.name, color: categoriesTable.color })
      .from(categoriesTable);
    setCategoryPills(cats);
  }, []);

  useEffect(() => {
    void loadActivities();
    void loadCategories();
  }, [loadActivities, loadCategories]);

  useFocusEffect(
    useCallback(() => {
      void loadActivities();
      void loadCategories();
    }, [loadActivities, loadCategories])
  );

  async function handleDeleteActivity(id: number) {
    await db.delete(activitiesTable).where(eq(activitiesTable.id, id));
    await loadActivities();
  }

  const filteredList = useMemo(() => {
    return activityList.filter((item) => {
      if (searchText.trim()) {
        const q = searchText.trim().toLowerCase();
        const match =
          item.tripName.toLowerCase().includes(q) ||
          item.categoryName.toLowerCase().includes(q) ||
          (item.notes ?? '').toLowerCase().includes(q);
        if (!match) return false;
      }
      if (selectedCategoryId !== null && item.categoryId !== selectedCategoryId) return false;
      if (dateFrom.trim() && item.date < dateFrom.trim()) return false;
      if (dateTo.trim() && item.date > dateTo.trim()) return false;
      return true;
    });
  }, [activityList, searchText, selectedCategoryId, dateFrom, dateTo]);

  const isFiltering =
    searchText.trim() !== '' || selectedCategoryId !== null || dateFrom.trim() !== '' || dateTo.trim() !== '';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Search */}
      <View style={[styles.searchRow, { backgroundColor: theme.inputBg, borderColor: theme.border }]}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={[styles.searchInput, { color: theme.text }]}
          placeholder="Search trips, categories, notes..."
          placeholderTextColor={theme.subtext}
          value={searchText}
          onChangeText={setSearchText}
        />
        {searchText.length > 0 && (
          <Pressable onPress={() => setSearchText('')} style={styles.clearBtn}>
            <Text style={{ color: theme.subtext, fontSize: 16 }}>✕</Text>
          </Pressable>
        )}
      </View>

      {/* Category pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.pillRow}
        contentContainerStyle={styles.pillContent}
      >
        <Pressable
          style={[styles.pill, { backgroundColor: selectedCategoryId === null ? '#FF6B6B' : theme.inputBg, borderColor: theme.border }]}
          onPress={() => setSelectedCategoryId(null)}
        >
          <Text style={[styles.pillText, { color: selectedCategoryId === null ? '#fff' : theme.text }]}>All</Text>
        </Pressable>
        {categoryPills.map((cat) => (
          <Pressable
            key={cat.id}
            style={[styles.pill, { backgroundColor: selectedCategoryId === cat.id ? '#FF6B6B' : theme.inputBg, borderColor: theme.border }]}
            onPress={() => setSelectedCategoryId(selectedCategoryId === cat.id ? null : cat.id)}
          >
            <View style={[styles.pillDot, { backgroundColor: cat.color }]} />
            <Text style={[styles.pillText, { color: selectedCategoryId === cat.id ? '#fff' : theme.text }]}>{cat.name}</Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Date range */}
      <View style={styles.dateRow}>
        <View style={[styles.dateInputWrap, { backgroundColor: theme.inputBg, borderColor: theme.border }]}>
          <TextInput
            style={[styles.dateInput, { color: theme.text }]}
            placeholder="From YYYY-MM-DD"
            placeholderTextColor={theme.subtext}
            value={dateFrom}
            onChangeText={setDateFrom}
            maxLength={10}
          />
        </View>
        <View style={[styles.dateInputWrap, { backgroundColor: theme.inputBg, borderColor: theme.border }]}>
          <TextInput
            style={[styles.dateInput, { color: theme.text }]}
            placeholder="To YYYY-MM-DD"
            placeholderTextColor={theme.subtext}
            value={dateTo}
            onChangeText={setDateTo}
            maxLength={10}
          />
        </View>
      </View>

      {/* Add button */}
      <Pressable
        style={({ pressed }) => [styles.addButton, { opacity: pressed ? 0.9 : 1 }]}
        onPress={() => router.push('/add-activity')}
      >
        <LinearGradient colors={['#FF6B6B', '#FF4757']} style={styles.addButtonGradient}>
          <Text style={styles.addButtonText}>+ Add Activity</Text>
        </LinearGradient>
      </Pressable>

      <FlatList
        data={filteredList}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>{isFiltering ? '🔍' : '🌺'}</Text>
            <Text style={[styles.emptyTitle, { color: theme.text }]}>
              {isFiltering ? 'No results found' : 'No activities yet'}
            </Text>
            <Text style={[styles.emptySubtitle, { color: theme.subtext }]}>
              {isFiltering ? 'Try adjusting your filters' : 'Tap + Add Activity to get started'}
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={[styles.leftAccent, { backgroundColor: item.categoryColor }]} />
            <Text style={[styles.tripName, { color: theme.text }]}>{item.tripName}</Text>
            <View style={styles.categoryRow}>
              <View style={[styles.categoryDot, { backgroundColor: item.categoryColor }]} />
              <Text style={[styles.categoryName, { color: theme.subtext }]}>{item.categoryName}</Text>
            </View>
            <View style={styles.metaGrid}>
              <View style={[styles.metaBadge, { backgroundColor: theme.inputBg }]}>
                <Text style={[styles.metaLabel, { color: theme.subtext }]}>DATE</Text>
                <Text style={[styles.metaValue, { color: theme.text }]}>{item.date}</Text>
              </View>
              <View style={[styles.metaBadge, { backgroundColor: theme.inputBg }]}>
                <Text style={[styles.metaLabel, { color: theme.subtext }]}>DURATION</Text>
                <Text style={[styles.metaValue, { color: theme.text }]}>{item.duration} mins</Text>
              </View>
            </View>
            {item.notes ? (
              <Text style={[styles.notes, { color: theme.subtext }]}>📝 {item.notes}</Text>
            ) : null}
            <View style={styles.cardActions}>
              <Pressable
                style={({ pressed }) => [styles.editButton, { opacity: pressed ? 0.85 : 1 }]}
                onPress={() => router.push(`/edit-activity?id=${item.id}`)}
              >
                <Text style={styles.editButtonText}>Edit</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [styles.deleteButton, { opacity: pressed ? 0.85 : 1 }]}
                onPress={() => void handleDeleteActivity(item.id)}
              >
                <Text style={styles.deleteButtonText}>Delete</Text>
              </Pressable>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 48,
    marginBottom: 10,
  },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, fontSize: 15 },
  clearBtn: { padding: 4 },
  pillRow: { maxHeight: 44, marginBottom: 10 },
  pillContent: { gap: 8, alignItems: 'center', paddingRight: 8 },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
    gap: 6,
  },
  pillDot: { width: 10, height: 10, borderRadius: 5 },
  pillText: { fontSize: 13, fontWeight: '600' },
  dateRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  dateInputWrap: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 10,
    height: 44,
    justifyContent: 'center',
  },
  dateInput: { fontSize: 13 },
  addButton: {
    marginBottom: 14,
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#FF4757',
    shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 5,
  },
  addButtonGradient: { paddingVertical: 14, alignItems: 'center' },
  addButtonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  listContent: { paddingBottom: 30 },
  emptyContainer: { alignItems: 'center', marginTop: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 20, fontWeight: '700', marginBottom: 6 },
  emptySubtitle: { fontSize: 14 },
  card: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    paddingLeft: 24,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 3,
    overflow: 'hidden',
  },
  leftAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 6,
  },
  tripName: { fontSize: 18, fontWeight: '800', marginBottom: 6 },
  categoryRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  categoryDot: { width: 14, height: 14, borderRadius: 7 },
  categoryName: { fontSize: 14, fontWeight: '600' },
  metaGrid: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  metaBadge: { flex: 1, borderRadius: 10, padding: 8 },
  metaLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 0.8, marginBottom: 2 },
  metaValue: { fontSize: 13, fontWeight: '600' },
  notes: { fontSize: 13, marginBottom: 12, fontStyle: 'italic' },
  cardActions: { flexDirection: 'row', gap: 10 },
  editButton: {
    flex: 1,
    backgroundColor: '#06D6A0',
    paddingVertical: 11,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#06D6A0',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 3,
  },
  editButtonText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  deleteButton: {
    flex: 1,
    backgroundColor: '#FF4757',
    paddingVertical: 11,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#FF4757',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 3,
  },
  deleteButtonText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});