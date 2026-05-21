import mongoose from "mongoose";

const theaterSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    city: { type: String, required: true },
    address: { type: String, required: true },
    screens: { type: Number, default: 1 }
  },
  { timestamps: true }
);

export const Theater = mongoose.model("Theater", theaterSchema);
