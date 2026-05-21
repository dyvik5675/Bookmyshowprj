import mongoose from "mongoose";

const foodItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true }
  },
  { _id: false }
);

const bookingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    show: { type: mongoose.Schema.Types.ObjectId, ref: "Show", required: true },
    seats: [{ type: String, required: true }],
    foodItems: [foodItemSchema],
    subtotal: { type: Number, default: 0 },
    foodTotal: { type: Number, default: 0 },
    convenienceFee: { type: Number, default: 0 },
    gst: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    paymentStatus: { type: String, enum: ["paid", "pending", "cancelled"], default: "paid" },
    paymentMethod: { type: String, enum: ["upi", "card", "wallet"], default: "upi" },
    cancelledAt: { type: Date },
    refundAmount: { type: Number, default: 0 },
    bookingCode: { type: String, required: true, unique: true }
  },
  { timestamps: true }
);

export const Booking = mongoose.model("Booking", bookingSchema);