export type Cafe = {
  name: string;
  rating: number;
  review_count: number;
  address: string;
  distance_km: number;
};

const PLACES_BASE_URL = "https://maps.googleapis.com/maps/api/place/nearbysearch/json";
const SEARCH_RADIUS_METERS = 1500;

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const TOP_N = 3;

// Scoring weights must sum to 1
const WEIGHTS = { distance: 0.5, rating: 0.35, review_count: 0.15 };

/**
 * Score a cafe from 0–1 using three factors:
 *   Distance:     1 / (1 + km)      — closer scores higher, no upper bound needed
 *   Rating:       rating / 5        — normalised against max possible rating
 *   Review count: min(count, 500) / 500 — capped so viral outliers don't dominate
 */
function score(cafe: Cafe): number {
  const distanceScore  = 1 / (1 + cafe.distance_km);
  const ratingScore    = cafe.rating / 5;
  const reviewScore    = Math.min(cafe.review_count, 500) / 500;

  return (
    WEIGHTS.distance     * distanceScore +
    WEIGHTS.rating       * ratingScore +
    WEIGHTS.review_count * reviewScore
  );
}

function rankCafes(cafes: Cafe[]): Cafe[] {
  return cafes
    .sort((a, b) => score(b) - score(a))
    .slice(0, TOP_N);
}

export async function getRecommendations(latitude: number, longitude: number): Promise<Cafe[]> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) throw new Error("GOOGLE_PLACES_API_KEY is not set");

  const url = new URL(PLACES_BASE_URL);
  url.searchParams.set("location", `${latitude},${longitude}`);
  url.searchParams.set("radius", String(SEARCH_RADIUS_METERS));
  url.searchParams.set("type", "cafe");
  url.searchParams.set("key", apiKey);

  const response = await fetch(url.toString());
  if (!response.ok) throw new Error(`Places API request failed: ${response.status}`);

  const data = await response.json();
  if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
    throw new Error(`Places API error: ${data.status}`);
  }

  const cafes: Cafe[] = (data.results ?? []).map((place: any) => ({
    name: place.name,
    rating: place.rating ?? 0,
    review_count: place.user_ratings_total ?? 0,
    address: place.vicinity ?? "",
    distance_km: parseFloat(
      haversineDistance(latitude, longitude, place.geometry.location.lat, place.geometry.location.lng).toFixed(2)
    ),
  }));

  return rankCafes(cafes);
}
