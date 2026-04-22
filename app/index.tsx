import { Link } from 'expo-router';
import { ImageBackground, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/Colors';

export default function HomeScreen() {
  const scheme = useColorScheme() ?? 'light';
  const theme = Colors[scheme];

  const mainNavCards = [
    { href: '/trips' as const, label: 'Trips', icon: '✈️', tint: scheme === 'dark' ? '#203A56' : '#E8F4FF' },
    { href: '/activities' as const, label: 'Activities', icon: '🏖️', tint: scheme === 'dark' ? '#1E4A45' : '#E8FFF8' },
    { href: '/targets' as const, label: 'Targets', icon: '🏆', tint: scheme === 'dark' ? '#4B3B2C' : '#FFF3E6' },
    { href: '/insights' as const, label: 'Insights', icon: '📊', tint: scheme === 'dark' ? '#3B3452' : '#F4ECFF' },
  ];

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]} contentContainerStyle={styles.content}>
      <View style={styles.heroSection}>
        <ImageBackground
          source={{
            uri: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
          }}
          imageStyle={styles.heroImage}
          style={styles.hero}
        >
          <View style={styles.heroOverlay}>
            <View style={styles.heroTextWrap}>
              <Text style={styles.title}>Trip Planner</Text>
              <Text style={styles.subtitle}>Plan your perfect getaway</Text>
            </View>
          </View>
        </ImageBackground>
      </View>

      <View style={styles.actionSection}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Start Planning</Text>
        <View style={styles.grid}>
          {mainNavCards.map((card) => (
            <Link key={card.href} href={card.href} asChild>
              <Pressable
                style={({ pressed }) => [
                  styles.card,
                  { backgroundColor: card.tint },
                  pressed && styles.cardPressed,
                ]}
              >
                <Text style={styles.cardIcon}>{card.icon}</Text>
                <Text style={[styles.cardLabel, { color: theme.text }]}>{card.label}</Text>
              </Pressable>
            </Link>
          ))}
        </View>
      </View>

      <View style={styles.secondarySection}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Explore</Text>
        <Link href="/categories" asChild>
          <Pressable
            style={({ pressed }) => [
              styles.secondaryButton,
              { backgroundColor: theme.primary },
              pressed && styles.secondaryButtonPressed,
            ]}
          >
            <Text style={styles.secondaryButtonText}>Browse Categories 🌴</Text>
          </Pressable>
        </Link>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 30,
  },
  heroSection: {
    marginBottom: 24,
  },
  hero: {
    height: 230,
    borderRadius: 20,
    overflow: 'hidden',
  },
  heroImage: {
    borderRadius: 20,
  },
  heroOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'flex-end',
    padding: 24,
  },
  heroTextWrap: {
    marginBottom: 8,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: '#fff',
  },
  subtitle: {
    marginTop: 8,
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.82)',
  },
  actionSection: {
    marginBottom: 26,
  },
  sectionTitle: {
    fontSize: 23,
    fontWeight: '700',
    color: '#2D1B00',
    marginBottom: 14,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '48.5%',
    minHeight: 132,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    shadowColor: '#1F2937',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 3,
  },
  cardPressed: {
    opacity: 0.82,
    transform: [{ scale: 0.98 }],
  },
  cardIcon: {
    fontSize: 34,
    marginBottom: 10,
  },
  cardLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  secondarySection: {
    marginBottom: 8,
  },
  secondaryButton: {
    width: '100%',
    backgroundColor: '#FF6B6B',
    borderRadius: 20,
    paddingVertical: 15,
    alignItems: 'center',
    shadowColor: '#1F2937',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 3,
  },
  secondaryButtonPressed: {
    opacity: 0.86,
  },
  secondaryButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
});
