import mongoose from "mongoose";

const movieSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    language: { type: String, required: true },
    genre: { type: String, required: true },
    duration: { type: Number, required: true },
    rating: { type: Number, default: 0 },
    certificate: { type: String, default: "UA" },
    posterUrl: { type: String, required: true },
    bannerUrl: { type: String, required: true },
    description: { type: String, required: true },
    releaseDate: { type: Date, required: true }
  },
  { timestamps: true }
);

export const Movie = mongoose.model("Movie", movieSchema);
