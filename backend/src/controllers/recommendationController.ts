import { Request, Response } from "express";
import { getRecommendations } from "../services/recommendationService";

export async function recommend(req: Request, res: Response) {
  const { latitude, longitude } = req.body;

  if (latitude == null || longitude == null) {
    return res.status(400).json({ error: "Missing location" });
  }

  try {
    const cafes = await getRecommendations(latitude, longitude);
    return res.json({ cafes });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch recommendations";
    return res.status(500).json({ error: message });
  }
}
