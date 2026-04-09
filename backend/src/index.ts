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
      { name: "Cafe 1", rating: 4.5 },
      { name: "Cafe 2", rating: 4.3 },
      { name: "Cafe 3", rating: 4.7 }
    ]
  });
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});