import express from "express";
import { Theater } from "../models/Theater.js";
import { requireAdmin, requireAuth } from "../lib/auth.js";

const router = express.Router();

router.get("/", async (_req, res, next) => {
  try {
    const theaters = await Theater.find().sort({ city: 1, name: 1 });
    res.json(theaters);
  } catch (error) {
    next(error);
  }
});

router.post("/", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const theater = await Theater.create(req.body);
    res.status(201).json(theater);
  } catch (error) {
    next(error);
  }
});

export default router;
