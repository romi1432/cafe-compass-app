import { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Linking,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Cafe } from '@/types/cafe';
import { getNearbyRecommendations } from '@/services/api';

function openInMaps(cafe: Cafe) {
  Linking.openURL(
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(cafe.name)}&query_place_id=${cafe.place_id}`
  );
}

const COSY_FONT = Platform.OS === 'ios' ? 'Georgia' : 'serif';

const RANK = [
  { color: '#C8973A', label: '🥇' },
  { color: '#8E9EAF', label: '🥈' },
  { color: '#A0785A', label: '🥉' },
];

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning ☀️';
  if (h < 17) return 'Good afternoon ☕';
  return 'Good evening 🌙';
}

function formatDistance(km: number): string {
  return km < 1 ? `${Math.round(km * 1000)}m` : `${km.toFixed(1)}km`;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <View style={styles.ratingRow}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Text key={i} style={i <= Math.round(rating) ? styles.starFilled : styles.starEmpty}>★</Text>
      ))}
      <Text style={styles.ratingNumber}>{rating.toFixed(1)}</Text>
    </View>
  );
}

export default function HomeScreen() {
  const [cafes, setCafes] = useState<Cafe[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasResults = cafes.length > 0;

  async function fetchRecommendations() {
    setLoading(true);
    setError(null);
    setCafes([]);
    try {
      setCafes(await getNearbyRecommendations());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>

      {/* ── Dark espresso header ── */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{greeting()}</Text>
          <Text style={styles.title}>Cafe Compass</Text>
          <Text style={styles.tagline}>your cosy corner awaits</Text>
        </View>
        <View style={styles.headerBadge}>
          <Text style={{ fontSize: 30 }}>☕</Text>
        </View>
      </View>

      {/* ── Hero ── */}
      {!loading && !hasResults && !error && (
        <View style={styles.hero}>
          <Text style={[styles.floater, { top: 24, left: 28 }]}>☕</Text>
          <Text style={[styles.floater, { top: 72, right: 32, fontSize: 14 }]}>✦</Text>
          <Text style={[styles.floater, { bottom: 90, left: 24, fontSize: 14 }]}>✦</Text>
          <Text style={[styles.floater, { bottom: 44, right: 28, fontSize: 20 }]}>☕</Text>

          <Text style={styles.heroText}>Ready to find your{'\n'}perfect brew?</Text>

          <TouchableOpacity onPress={fetchRecommendations} activeOpacity={0.85}>
            <View style={styles.ring1}>
              <View style={styles.ring2}>
                <View style={styles.heroButton}>
                  <Text style={styles.heroIcon}>☕</Text>
                  <Text style={styles.heroLabel}>Find Cafes</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>

          <Text style={styles.heroHint}>📍 Uses your current location</Text>
        </View>
      )}

      {/* ── Loading ── */}
      {loading && (
        <View style={styles.hero}>
          <View style={styles.stateCard}>
            <Text style={{ fontSize: 44 }}>☕</Text>
            <ActivityIndicator size="large" color="#C17F3E" style={{ marginTop: 14 }} />
            <Text style={styles.stateTitle}>Finding cafes...</Text>
            <Text style={styles.stateSubtitle}>Looking for great spots near you</Text>
          </View>
        </View>
      )}

      {/* ── Error ── */}
      {!loading && error && (
        <View style={styles.hero}>
          <View style={styles.stateCard}>
            <Text style={{ fontSize: 44 }}>😕</Text>
            <Text style={styles.stateTitle}>Something went wrong</Text>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchRecommendations}>
              <Text style={styles.retryText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* ── Results ── */}
      {hasResults && (
        <>
          <View style={styles.resultsBar}>
            <Text style={styles.resultsTitle}>Top picks near you</Text>
            <TouchableOpacity style={styles.refreshButton} onPress={fetchRecommendations} disabled={loading}>
              <Text style={styles.refreshText}>↺  Refresh</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={cafes}
            keyExtractor={(item) => item.name}
            contentContainerStyle={styles.list}
            renderItem={({ item, index }) => {
              const rank = RANK[index] ?? { color: '#ccc', label: '' };
              return (
                <TouchableOpacity style={styles.card} activeOpacity={0.78} onPress={() => openInMaps(item)}>
                  <View style={[styles.cardStrip, { backgroundColor: rank.color }]} />

                  <View style={styles.cardContent}>
                    <View style={styles.cardTop}>
                      <Text style={styles.rankLabel}>{rank.label}</Text>
                      <View style={[styles.distancePill, { borderColor: rank.color }]}>
                        <Text style={[styles.distanceText, { color: rank.color }]}>
                          📍 {formatDistance(item.distance_km)}
                        </Text>
                      </View>
                    </View>

                    <Text style={styles.cafeName} numberOfLines={1}>{item.name}</Text>
                    <Text style={styles.address} numberOfLines={1}>{item.address}</Text>

                    <View style={styles.cardBottom}>
                      <StarRating rating={item.rating} />
                      <Text style={styles.reviewCount}>{item.review_count.toLocaleString()} reviews</Text>
                    </View>
                  </View>

                  <Text style={styles.cardArrow}>›</Text>
                </TouchableOpacity>
              );
            }}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF7F2',
  },

  // Header
  header: {
    backgroundColor: '#2C1A0E',
    paddingTop: Platform.OS === 'android' ? 44 : 64,
    paddingBottom: 24,
    paddingHorizontal: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  greeting: {
    fontSize: 13,
    color: '#C8973A',
    fontFamily: COSY_FONT,
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#FFF8F0',
    fontFamily: COSY_FONT,
  },
  tagline: {
    fontSize: 13,
    color: '#A07850',
    fontFamily: COSY_FONT,
    marginTop: 2,
  },
  headerBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,248,240,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Hero
  hero: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    paddingBottom: 48,
  },
  floater: {
    position: 'absolute',
    fontSize: 22,
    opacity: 0.18,
  },
  heroText: {
    fontSize: 22,
    color: '#2C1A0E',
    fontFamily: COSY_FONT,
    textAlign: 'center',
    lineHeight: 34,
  },
  ring1: {
    width: 210,
    height: 210,
    borderRadius: 105,
    backgroundColor: 'rgba(111,78,55,0.07)',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
  },
  ring2: {
    width: 178,
    height: 178,
    borderRadius: 89,
    backgroundColor: 'rgba(111,78,55,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroButton: {
    width: 148,
    height: 148,
    borderRadius: 74,
    backgroundColor: '#3C1F0F',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    shadowColor: '#2C1A0E',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 16,
  },
  heroIcon: {
    fontSize: 38,
  },
  heroLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFF8F0',
    fontFamily: COSY_FONT,
    letterSpacing: 0.5,
  },
  heroHint: {
    fontSize: 13,
    color: '#B09070',
    fontFamily: COSY_FONT,
  },

  // State card (loading / error)
  stateCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    paddingVertical: 36,
    paddingHorizontal: 32,
    alignItems: 'center',
    gap: 10,
    width: '78%',
    shadowColor: '#8B5E3C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  stateTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#2C1A0E',
    fontFamily: COSY_FONT,
    marginTop: 4,
  },
  stateSubtitle: {
    fontSize: 13,
    color: '#A07850',
    fontFamily: COSY_FONT,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 13,
    color: '#B91C1C',
    fontFamily: COSY_FONT,
    textAlign: 'center',
    lineHeight: 20,
  },
  retryButton: {
    marginTop: 6,
    backgroundColor: '#3C1F0F',
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 24,
  },
  retryText: {
    color: '#FFF8F0',
    fontWeight: '700',
    fontFamily: COSY_FONT,
    fontSize: 15,
  },

  // Results
  resultsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 8,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2C1A0E',
    fontFamily: COSY_FONT,
  },
  refreshButton: {
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#C8973A',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
  },
  refreshText: {
    color: '#C8973A',
    fontWeight: '600',
    fontFamily: COSY_FONT,
    fontSize: 13,
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 36,
    gap: 14,
  },

  // Card
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#8B5E3C',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.09,
    shadowRadius: 10,
    elevation: 3,
  },
  cardStrip: {
    width: 5,
    alignSelf: 'stretch',
  },
  cardContent: {
    flex: 1,
    padding: 14,
    gap: 4,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  rankLabel: {
    fontSize: 18,
  },
  distancePill: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  distanceText: {
    fontSize: 11,
    fontWeight: '600',
    fontFamily: COSY_FONT,
  },
  cafeName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1C0F07',
    fontFamily: COSY_FONT,
  },
  address: {
    fontSize: 12,
    color: '#A07850',
    fontFamily: COSY_FONT,
  },
  cardBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 1,
  },
  starFilled: {
    color: '#F59E0B',
    fontSize: 13,
  },
  starEmpty: {
    color: '#E5D5C5',
    fontSize: 13,
  },
  ratingNumber: {
    fontSize: 12,
    color: '#A07850',
    fontFamily: COSY_FONT,
    fontWeight: '600',
    marginLeft: 3,
  },
  reviewCount: {
    fontSize: 12,
    color: '#B09070',
    fontFamily: COSY_FONT,
  },
  cardArrow: {
    fontSize: 24,
    color: '#D4B896',
    paddingRight: 14,
  },
});
