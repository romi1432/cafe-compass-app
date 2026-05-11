import * as Location from 'expo-location';
import { Cafe } from '@/types/cafe';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export async function getNearbyRecommendations(): Promise<Cafe[]> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    throw new Error('Location permission denied. If testing in a browser, geolocation requires HTTPS. Use Expo Go instead.');
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

  if (!response.ok) throw new Error(`Server error: ${response.status}`);

  const data = await response.json();
  return data.cafes;
}
