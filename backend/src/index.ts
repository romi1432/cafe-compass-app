import express from "express";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.send("Cafe Compass API running");
});

app.post("/recommendations", (req, res) => {
  const { latitude, longitude } = req.body;

  if (latitude == null || longitude == null) {
    return res.status(400).json({ error: "Missing location" });
  }

  return res.json({
    cafes: [
      { name: "The Cosy Bean", rating: 4.8, distance_km: 0.3 },
      { name: "Brewed Awakening", rating: 4.5, distance_km: 0.7 },
      { name: "Grounds for Celebration", rating: 4.3, distance_km: 1.1 },
      { name: "The Daily Grind", rating: 4.6, distance_km: 1.4 },
      { name: "Perk & Pie", rating: 4.2, distance_km: 2.0 },
    ]
  });
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});