import mongoose from "mongoose";

const showSchema = new mongoose.Schema(
  {
    movie: { type: mongoose.Schema.Types.ObjectId, ref: "Movie", required: true },
    theater: { type: mongoose.Schema.Types.ObjectId, ref: "Theater", required: true },
    screen: { type: String, required: true },
    startsAt: { type: Date, required: true },
    price: { type: Number, required: true },
    seats: [
      {
        label: { type: String, required: true },
        status: { type: String, enum: ["available", "booked"], default: "available" }
      }
    ]
  },
  { timestamps: true }
);

export const Show = mongoose.model("Show", showSchema);
