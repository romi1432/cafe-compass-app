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

function formatDistance(km: number): string {
  return km < 1 ? `${Math.round(km * 1000)}m away` : `${km.toFixed(1)}km away`;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <View style={styles.ratingRow}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Text key={i} style={[styles.star, i <= Math.round(rating) ? styles.starFilled : styles.starEmpty]}>
          ★
        </Text>
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
      const cafes = await getNearbyRecommendations();
      setCafes(cafes);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Cafe Compass</Text>
        <Text style={styles.tagline}>your coffee awaits ☕</Text>
      </View>

      {/* Initial hero state */}
      {!loading && !hasResults && !error && (
        <View style={styles.hero}>
          <Text style={styles.heroText}>Ready to find your{'\n'}perfect brew?</Text>

          <TouchableOpacity onPress={fetchRecommendations} activeOpacity={0.8} style={styles.heroRing}>
            <View style={styles.heroButton}>
              <Text style={styles.heroIcon}>☕</Text>
              <Text style={styles.heroButtonLabel}>Find Cafes</Text>
            </View>
          </TouchableOpacity>

          <Text style={styles.heroHint}>📍 Uses your current location</Text>
        </View>
      )}

      {/* Loading */}
      {loading && (
        <View style={styles.hero}>
          <Text style={styles.loadingEmoji}>☕</Text>
          <ActivityIndicator size="large" color="#6F4E37" style={{ marginTop: 16 }} />
          <Text style={styles.loadingText}>Sniffing out cafes nearby...</Text>
        </View>
      )}

      {/* Error */}
      {!loading && error && (
        <View style={styles.hero}>
          <Text style={styles.errorEmoji}>😕</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchRecommendations}>
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Results */}
      {hasResults && (
        <>
          <TouchableOpacity style={styles.searchAgainButton} onPress={fetchRecommendations} disabled={loading}>
            <Text style={styles.searchAgainText}>🔄  Search Again</Text>
          </TouchableOpacity>

          <FlatList
            data={cafes}
            keyExtractor={(item) => item.name}
            contentContainerStyle={styles.list}
            renderItem={({ item, index }) => (
              <TouchableOpacity style={styles.card} activeOpacity={0.75} onPress={() => openInMaps(item)}>
                <View style={styles.cardRank}>
                  <Text style={styles.cardRankText}>#{index + 1}</Text>
                </View>
                <View style={styles.cardBody}>
                  <Text style={styles.cafeName}>{item.name}</Text>
                  <Text style={styles.address}>{item.address}</Text>
                  <StarRating rating={item.rating} />
                  <View style={styles.cardFooter}>
                    <Text style={styles.distance}>📍 {formatDistance(item.distance_km)}</Text>
                    <Text style={styles.reviewCount}>{item.review_count.toLocaleString()} reviews</Text>
                  </View>
                </View>
              </TouchableOpacity>
            )}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8F0',
    paddingTop: 68,
  },
  header: {
    paddingHorizontal: 24,
    marginBottom: 8,
  },
  title: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#2C1A0E',
    fontFamily: COSY_FONT,
  },
  tagline: {
    fontSize: 15,
    color: '#A07850',
    fontFamily: COSY_FONT,
    marginTop: 2,
  },

  // Hero
  hero: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    paddingBottom: 60,
  },
  heroText: {
    fontSize: 22,
    color: '#2C1A0E',
    fontFamily: COSY_FONT,
    textAlign: 'center',
    lineHeight: 32,
  },
  heroRing: {
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: 'rgba(111, 78, 55, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
  },
  heroButton: {
    width: 155,
    height: 155,
    borderRadius: 78,
    backgroundColor: '#6F4E37',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    shadowColor: '#6F4E37',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.45,
    shadowRadius: 20,
    elevation: 14,
  },
  heroIcon: {
    fontSize: 40,
  },
  heroButtonLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    fontFamily: COSY_FONT,
    letterSpacing: 0.5,
  },
  heroHint: {
    fontSize: 13,
    color: '#B09070',
    fontFamily: COSY_FONT,
  },

  // Loading
  loadingEmoji: {
    fontSize: 52,
  },
  loadingText: {
    fontSize: 16,
    color: '#A07850',
    fontFamily: COSY_FONT,
    marginTop: 12,
  },

  // Error
  errorEmoji: {
    fontSize: 48,
  },
  errorText: {
    fontSize: 15,
    color: '#B91C1C',
    fontFamily: COSY_FONT,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  retryButton: {
    marginTop: 8,
    backgroundColor: '#6F4E37',
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 24,
  },
  retryText: {
    color: '#fff',
    fontWeight: '700',
    fontFamily: COSY_FONT,
    fontSize: 15,
  },

  // Results
  searchAgainButton: {
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 4,
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#6F4E37',
    paddingHorizontal: 20,
    paddingVertical: 9,
    borderRadius: 20,
  },
  searchAgainText: {
    color: '#6F4E37',
    fontWeight: '600',
    fontFamily: COSY_FONT,
    fontSize: 14,
  },
  list: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
    gap: 14,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    shadowColor: '#8B5E3C',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardRank: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FDF0E0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  cardRankText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6F4E37',
    fontFamily: COSY_FONT,
  },
  cardBody: {
    flex: 1,
    gap: 4,
  },
  cafeName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#2C1A0E',
    fontFamily: COSY_FONT,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  star: {
    fontSize: 14,
  },
  starFilled: {
    color: '#F59E0B',
  },
  starEmpty: {
    color: '#E5D5C5',
  },
  ratingNumber: {
    fontSize: 13,
    color: '#A07850',
    fontFamily: COSY_FONT,
    marginLeft: 4,
    fontWeight: '600',
  },
  distance: {
    fontSize: 13,
    color: '#A07850',
    fontFamily: COSY_FONT,
  },
  address: {
    fontSize: 13,
    color: '#B09070',
    fontFamily: COSY_FONT,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reviewCount: {
    fontSize: 12,
    color: '#B09070',
    fontFamily: COSY_FONT,
  },
});
