import express from "express";
import { Show } from "../models/Show.js";
import { requireAdmin, requireAuth } from "../lib/auth.js";

const router = express.Router();

function buildSeats() {
  const rows = ["A", "B", "C", "D", "E", "F"];
  return rows.flatMap((row) =>
    Array.from({ length: 10 }, (_, index) => ({
      label: `${row}${index + 1}`,
      status: "available"
    }))
  );
}

router.get("/", async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.movie) filter.movie = req.query.movie;

    const shows = await Show.find(filter)
      .populate("movie")
      .populate("theater")
      .sort({ startsAt: 1 });

    res.json(shows);
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const show = await Show.findById(req.params.id).populate("movie").populate("theater");
    if (!show) return res.status(404).json({ message: "Show not found" });
    res.json(show);
  } catch (error) {
    next(error);
  }
});

router.post("/", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const show = await Show.create({ ...req.body, seats: buildSeats() });
    const populated = await show.populate(["movie", "theater"]);
    res.status(201).json(populated);
  } catch (error) {
    next(error);
  }
});

export default router;
