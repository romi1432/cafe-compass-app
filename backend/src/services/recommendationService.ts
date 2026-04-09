export type Cafe = {
  name: string;
  rating: number;
  distance_km: number;
};

export function getRecommendations(_latitude: number, _longitude: number): Cafe[] {
  // TODO: replace with real cafe lookup using coordinates
  return [
    { name: "The Cosy Bean", rating: 4.8, distance_km: 0.3 },
    { name: "Brewed Awakening", rating: 4.5, distance_km: 0.7 },
    { name: "Grounds for Celebration", rating: 4.3, distance_km: 1.1 },
    { name: "The Daily Grind", rating: 4.6, distance_km: 1.4 },
    { name: "Perk & Pie", rating: 4.2, distance_km: 2.0 },
  ];
}
