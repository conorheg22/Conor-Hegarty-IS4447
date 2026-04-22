import { useEffect, useState } from 'react';
import {
  Dimensions,
  ImageBackground,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { eq } from 'drizzle-orm';
import { BarChart } from 'react-native-chart-kit';
import { db } from '../db/db';
import {
  activities as activitiesTable,
  categories as categoriesTable,
  trips as tripsTable,
} from '../db/schema';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/Colors';

type DurationByCategory = { category: string; totalDuration: number };
type CountByTrip = { trip: string; totalActivities: number };

const chartWidth = Math.max(Dimensions.get('window').width - 32, 280);

export default function InsightsScreen() {
  const scheme = useColorScheme() ?? 'light';
  const theme = Colors[scheme];
  const [durationByCategory, setDurationByCategory] = useState<DurationByCategory[]>([]);
  const [activitiesByTrip, setActivitiesByTrip] = useState<CountByTrip[]>([]);

  useEffect(() => {
    async function loadInsights() {
      const activityRows = await db
        .select({
          duration: activitiesTable.duration,
          categoryName: categoriesTable.name,
          tripName: tripsTable.name,
        })
        .from(activitiesTable)
        .innerJoin(categoriesTable, eq(activitiesTable.categoryId, categoriesTable.id))
        .innerJoin(tripsTable, eq(activitiesTable.tripId, tripsTable.id));

      const durationMap: Record<string, number> = {};
      const tripCountMap: Record<string, number> = {};

      for (const row of activityRows) {
        durationMap[row.categoryName] = (durationMap[row.categoryName] ?? 0) + row.duration;
        tripCountMap[row.tripName] = (tripCountMap[row.tripName] ?? 0) + 1;
      }

      const durationSummary = Object.entries(durationMap).map(([category, totalDuration]) => ({
        category,
        totalDuration,
      }));

      const tripSummary = Object.entries(tripCountMap).map(([trip, totalActivities]) => ({
        trip,
        totalActivities,
      }));

      setDurationByCategory(durationSummary);
      setActivitiesByTrip(tripSummary);
    }

    void loadInsights();
  }, []);

  const chartData = {
    labels: durationByCategory.map((item) => item.category),
    datasets: [{ data: durationByCategory.map((item) => item.totalDuration) }],
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <ImageBackground
          source={{
            uri: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=1200&q=80',
          }}
          style={styles.banner}
          imageStyle={styles.bannerImage}
        >
          <View style={styles.bannerOverlay}>
            <Text style={styles.bannerTitle}>Insights</Text>
            <Text style={styles.bannerSubtitle}>See how your travel time is spent</Text>
          </View>
        </ImageBackground>

        <View style={[styles.sectionCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Total Duration per Category</Text>
          {durationByCategory.length === 0 ? (
            <Text style={[styles.empty, { color: theme.subtext }]}>No activity data yet.</Text>
          ) : (
            <>
              {durationByCategory.map((item) => (
                <Text key={item.category} style={[styles.summaryText, { color: theme.text }]}>
                  {item.category}: {item.totalDuration} mins
                </Text>
              ))}

              <BarChart
                data={chartData}
                width={chartWidth}
                height={220}
                yAxisLabel=""
                yAxisSuffix="m"
                fromZero
                showValuesOnTopOfBars
                chartConfig={{
                  backgroundGradientFrom: theme.background,
                  backgroundGradientTo: theme.background,
                  decimalPlaces: 0,
                  color: (opacity = 1) => `rgba(255, 107, 107, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(45, 27, 0, ${opacity})`,
                  barPercentage: 0.65,
                  fillShadowGradient: '#06D6A0',
                  fillShadowGradientOpacity: 1,
                }}
                style={styles.chart}
              />
            </>
          )}
        </View>

        <View style={[styles.sectionCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Total Activities per Trip</Text>
          {activitiesByTrip.length === 0 ? (
            <Text style={[styles.empty, { color: theme.subtext }]}>No trip activity data yet.</Text>
          ) : (
            activitiesByTrip.map((item) => (
              <View key={item.trip} style={[styles.tripRow, { backgroundColor: theme.inputBg }]}>
                <Text style={[styles.summaryText, { color: theme.text }]}>{item.trip}</Text>
                <Text style={[styles.tripValue, { color: theme.primary }]}>{item.totalActivities}</Text>
              </View>
            ))
          )}
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
    gap: 14,
    paddingBottom: 26,
  },
  banner: {
    height: 148,
    borderRadius: 20,
    overflow: 'hidden',
  },
  bannerImage: {
    borderRadius: 20,
  },
  bannerOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    padding: 14,
  },
  bannerTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#fff',
  },
  bannerSubtitle: {
    color: '#F5E6CA',
    marginTop: 4,
  },
  sectionCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
    shadowColor: '#1F2937',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 15,
    marginBottom: 4,
  },
  empty: {
    color: '#1F2937',
  },
  chart: {
    marginTop: 8,
    borderRadius: 12,
  },
  tripRow: {
    backgroundColor: '#FFF7E8',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  tripValue: {
    color: '#2E8B57',
    fontWeight: '700',
    fontSize: 16,
  },
});
