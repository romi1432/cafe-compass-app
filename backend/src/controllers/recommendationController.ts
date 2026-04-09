import { Request, Response } from "express";
import { getRecommendations } from "../services/recommendationService";

export function recommend(req: Request, res: Response) {
  const { latitude, longitude } = req.body;

  if (latitude == null || longitude == null) {
    return res.status(400).json({ error: "Missing location" });
  }

  const cafes = getRecommendations(latitude, longitude);
  return res.json({ cafes });
}
