import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { eq } from 'drizzle-orm';
import { useEffect, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { SafeAreaView as SafeArea } from 'react-native-safe-area-context';
import { NavDrawer } from '../components/NavDrawer';
import { db } from '../db/db';
import {
  activities as activitiesTable,
  categories as categoriesTable,
  trips as tripsTable,
} from '../db/schema';

type DurationByCategory = { category: string; totalDuration: number };
type CountByTrip = { trip: string; totalActivities: number };

type ViewMode = 'weekly' | 'monthly';

export default function InsightsScreen() {
  const scheme = useColorScheme() ?? 'light';
  const theme = Colors[scheme];

  const [viewMode, setViewMode] = useState<ViewMode>('weekly');
  const [durationByCategory, setDurationByCategory] = useState<DurationByCategory[]>([]);
  const [activitiesByTrip, setActivitiesByTrip] = useState<CountByTrip[]>([]);
  const [chartWidth, setChartWidth] = useState(0);

  useEffect(() => {
    async function loadInsights() {
      const rows = await db
        .select({
          duration: activitiesTable.duration,
          date: activitiesTable.date,
          categoryName: categoriesTable.name,
          tripName: tripsTable.name,
        })
        .from(activitiesTable)
        .innerJoin(categoriesTable, eq(activitiesTable.categoryId, categoriesTable.id))
        .innerJoin(tripsTable, eq(activitiesTable.tripId, tripsTable.id));

      const now = new Date();
      const cutoff = new Date();

      if (viewMode === 'weekly') {
        cutoff.setDate(now.getDate() - 7);
      } else {
        cutoff.setMonth(now.getMonth() - 1);
      }

      const cutoffStr = cutoff.toISOString().split('T')[0];
      const filtered = rows.filter((r) => r.date >= cutoffStr);

      const durationMap: Record<string, number> = {};
      const tripMap: Record<string, number> = {};

      filtered.forEach((r) => {
        durationMap[r.categoryName] =
          (durationMap[r.categoryName] ?? 0) + r.duration;

        tripMap[r.tripName] =
          (tripMap[r.tripName] ?? 0) + 1;
      });

      setDurationByCategory(
        Object.entries(durationMap).map(([category, totalDuration]) => ({
          category,
          totalDuration,
        }))
      );

      setActivitiesByTrip(
        Object.entries(tripMap).map(([trip, totalActivities]) => ({
          trip,
          totalActivities,
        }))
      );
    }

    void loadInsights();
  }, [viewMode]);

  const mostActive = durationByCategory.reduce(
    (max, item) =>
      item.totalDuration > (max?.totalDuration ?? 0) ? item : max,
    null as DurationByCategory | null
  );

  return (
    <View style={{ flex: 1 }}>
      <SafeArea style={[styles.container, { backgroundColor: theme.background }]}>
        <ScrollView contentContainerStyle={styles.content}>

          {/* FILTER */}
          <View style={styles.filterRow}>
            {(['weekly', 'monthly'] as const).map((mode) => (
              <Pressable
                key={mode}
                style={[
                  styles.filterButton,
                  {
                    backgroundColor:
                      viewMode === mode ? theme.primary : theme.inputBg,
                  },
                ]}
                onPress={() => setViewMode(mode)}
              >
                <Text
                  style={{
                    color: viewMode === mode ? '#fff' : theme.text,
                    fontWeight: '600',
                  }}
                >
                  {mode}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* CATEGORY CHART */}
          <View
            style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}
            onLayout={(e) => {
              const width = e.nativeEvent.layout.width;
              setChartWidth(width - 32);
            }}
          >
            <Text style={[styles.title, { color: theme.text }]}>
              Duration by Category
            </Text>

            {mostActive && (
              <Text style={[styles.highlight, { color: theme.primary }]}>
                Most Active: {mostActive.category} ({mostActive.totalDuration} mins)
              </Text>
            )}

            {durationByCategory.length === 0 ? (
              <Text style={{ color: theme.subtext }}>
                No data for this period.
              </Text>
            ) : (
              chartWidth > 0 && (
                <BarChart
                  data={{
                    labels: durationByCategory.map((i) => i.category),
                    datasets: [
                      { data: durationByCategory.map((i) => i.totalDuration) },
                    ],
                  }}
                  width={chartWidth}
                  height={220}
                  fromZero
                  showValuesOnTopOfBars
                  withInnerLines={false}
                  chartConfig={{
                    backgroundGradientFrom: theme.card,
                    backgroundGradientTo: theme.card,
                    decimalPlaces: 0,
                    color: () => theme.primary,
                    labelColor: () => theme.text,
                  }}
                  style={styles.chart}
                />
              )
            )}
          </View>

          {/* TRIP SUMMARY */}
          <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.title, { color: theme.text }]}>
              Activities by Trip
            </Text>

            {activitiesByTrip.length === 0 ? (
              <Text style={{ color: theme.subtext }}>
                No trip data yet.
              </Text>
            ) : (
              activitiesByTrip.map((item) => (
                <View
                  key={item.trip}
                  style={[styles.tripRow, { backgroundColor: theme.inputBg }]}
                >
                  <Text style={{ color: theme.text }}>{item.trip}</Text>
                  <Text style={{ color: theme.primary, fontWeight: '700' }}>
                    {item.totalActivities}
                  </Text>
                </View>
              ))
            )}
          </View>

        </ScrollView>
      </SafeArea>

      <NavDrawer />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  content: {
    paddingHorizontal: 16,
    paddingBottom: 120,
    paddingTop: 4, // ✅ reduced top gap
    gap: 16,
  },

  filterRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 4, // ✅ tighter spacing
  },

  filterButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },

  card: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
  },

  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },

  highlight: {
    marginBottom: 8,
    fontWeight: '700',
  },

  chart: {
    marginTop: 10,
    borderRadius: 12,
  },

  tripRow: {
    borderRadius: 12,
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
});