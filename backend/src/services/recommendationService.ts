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

  return (data.results ?? []).map((place: any) => ({
    name: place.name,
    rating: place.rating ?? 0,
    review_count: place.user_ratings_total ?? 0,
    address: place.vicinity ?? "",
    distance_km: parseFloat(
      haversineDistance(latitude, longitude, place.geometry.location.lat, place.geometry.location.lng).toFixed(2)
    ),
  }));
}
