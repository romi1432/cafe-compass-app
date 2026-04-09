import { useState } from 'react';
import {
  ActivityIndicator,
  Button,
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import * as Location from 'expo-location';

type Cafe = {
  name: string;
  rating: number;
};

// Use your machine's local IP when testing on a physical device
// Run `ipconfig` (Windows) or `ifconfig` (Mac/Linux) to find it
const API_URL = 'http://192.168.18.8:3000';

export default function HomeScreen() {
  const [cafes, setCafes] = useState<Cafe[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchRecommendations() {
    setLoading(true);
    setError(null);
    setCafes([]);

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError(
          'Location permission denied. If testing in a browser, geolocation requires HTTPS. Use Expo Go instead.'
        );
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);

      const response = await fetch(`${API_URL}/recommendations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ latitude, longitude }),
        signal: controller.signal,
      }).finally(() => clearTimeout(timeout));

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      setCafes(data.cafes);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cafe Compass</Text>

      <Button title="Find Nearby Cafes" onPress={fetchRecommendations} disabled={loading} />

      {loading && <ActivityIndicator style={styles.spacer} />}

      {error && <Text style={styles.error}>{error}</Text>}

      <FlatList
        data={cafes}
        keyExtractor={(item) => item.name}
        style={styles.spacer}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cafeName}>{item.name}</Text>
            <Text style={styles.cafeRating}>★ {item.rating}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 80,
    paddingHorizontal: 24,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  spacer: {
    marginTop: 16,
  },
  error: {
    marginTop: 16,
    color: 'red',
  },
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  cafeName: {
    fontSize: 16,
  },
  cafeRating: {
    fontSize: 16,
    color: '#f5a623',
  },
});
