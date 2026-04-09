import "dotenv/config";
import express from "express";
import cors from "cors";
import recommendationRoutes from "./routes/recommendationRoutes";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.send("Cafe Compass API running");
});

app.use("/recommendations", recommendationRoutes);

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
