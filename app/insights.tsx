import { useEffect, useState } from 'react';
import { Dimensions, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { eq } from 'drizzle-orm';
import { BarChart } from 'react-native-chart-kit';
import { db } from '../db/db';
import {
  activities as activitiesTable,
  categories as categoriesTable,
  trips as tripsTable,
} from '../db/schema';

type DurationByCategory = { category: string; totalDuration: number };
type CountByTrip = { trip: string; totalActivities: number };

const chartWidth = Math.max(Dimensions.get('window').width - 32, 280);

export default function InsightsScreen() {
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
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>Total Duration per Category</Text>
        {durationByCategory.length === 0 ? (
          <Text style={styles.empty}>No activity data yet.</Text>
        ) : (
          <>
            {durationByCategory.map((item) => (
              <Text key={item.category} style={styles.summaryText}>
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
              chartConfig={{
                backgroundGradientFrom: '#FFFFFF',
                backgroundGradientTo: '#FFFFFF',
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(17, 24, 39, ${opacity})`,
                barPercentage: 0.7,
              }}
              style={styles.chart}
            />
          </>
        )}

        <Text style={styles.sectionTitle}>Total Activities per Trip</Text>
        {activitiesByTrip.length === 0 ? (
          <Text style={styles.empty}>No trip activity data yet.</Text>
        ) : (
          activitiesByTrip.map((item) => (
            <Text key={item.trip} style={styles.summaryText}>
              {item.trip}: {item.totalActivities} activities
            </Text>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 16,
    gap: 8,
  },
  sectionTitle: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '700',
  },
  summaryText: {
    color: '#374151',
  },
  empty: {
    color: '#6B7280',
  },
  chart: {
    marginTop: 8,
    borderRadius: 8,
  },
});
