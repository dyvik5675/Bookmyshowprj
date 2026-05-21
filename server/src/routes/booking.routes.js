import express from "express";
import { Booking } from "../models/Booking.js";
import { Show } from "../models/Show.js";
import { requireAuth } from "../lib/auth.js";

const router = express.Router();

router.get("/mine", requireAuth, async (req, res, next) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate({
        path: "show",
        populate: [{ path: "movie" }, { path: "theater" }]
      })
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    next(error);
  }
});

router.get("/admin/stats", requireAuth, async (req, res, next) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const bookings = await Booking.find();
    const activeBookings = bookings.filter((booking) => booking.paymentStatus !== "cancelled");
    const cancelledBookings = bookings.filter((booking) => booking.paymentStatus === "cancelled");

    const revenue = activeBookings.reduce(
      (sum, booking) => sum + booking.totalAmount,
      0
    );

    res.json({
      totalBookings: bookings.length,
      activeBookings: activeBookings.length,
      cancelledBookings: cancelledBookings.length,
      revenue
    });
  } catch (error) {
    next(error);
  }
});

router.post("/", requireAuth, async (req, res, next) => {
  try {
    const { showId, seats, foodItems = [], paymentMethod = "upi" } = req.body;

    if (!showId || !Array.isArray(seats) || seats.length === 0) {
      return res.status(400).json({ message: "Show and seats are required" });
    }

    const show = await Show.findById(showId);
    if (!show) return res.status(404).json({ message: "Show not found" });

    const requested = new Set(seats);
    const unavailable = show.seats.filter(
      (seat) => requested.has(seat.label) && seat.status === "booked"
    );

    if (unavailable.length > 0) {
      return res.status(409).json({
        message: `Seats already booked: ${unavailable.map((seat) => seat.label).join(", ")}`
      });
    }

    show.seats = show.seats.map((seat) =>
      requested.has(seat.label) ? { ...seat.toObject(), status: "booked" } : seat
    );
    await show.save();

    const seatPrice = (label) => {
      const row = label.charAt(0);
      if (["E", "F"].includes(row)) return show.price + 180;
      if (["C", "D"].includes(row)) return show.price + 80;
      return show.price;
    };

    const normalizedFoodItems = foodItems
      .filter((item) => item.quantity > 0)
      .map((item) => ({
        name: item.name,
        price: Number(item.price),
        quantity: Number(item.quantity)
      }));

    const subtotal = seats.reduce((sum, label) => sum + seatPrice(label), 0);
    const foodTotal = normalizedFoodItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const convenienceFee = Math.ceil((subtotal + foodTotal) * 0.06);
    const gst = Math.round(convenienceFee * 0.18);
    const totalAmount = subtotal + foodTotal + convenienceFee + gst;
    const code = `BMS-${Date.now()}-${Math.floor(Math.random() * 9000 + 1000)}`;

    const booking = await Booking.create({
      user: req.user._id,
      show: show._id,
      seats,
      foodItems: normalizedFoodItems,
      subtotal,
      foodTotal,
      convenienceFee,
      gst,
      totalAmount,
      paymentMethod,
      bookingCode: code
    });

    const populated = await Booking.findById(booking._id).populate({
      path: "show",
      populate: [{ path: "movie" }, { path: "theater" }]
    });

    res.status(201).json(populated);
  } catch (error) {
    next(error);
  }
});

router.patch("/:id/cancel", requireAuth, async (req, res, next) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      user: req.user._id
    }).populate("show");

    if (!booking) return res.status(404).json({ message: "Booking not found" });

    if (booking.paymentStatus === "cancelled") {
      return res.status(400).json({ message: "Booking is already cancelled" });
    }

    const cancelledSeats = new Set(booking.seats);
    const show = await Show.findById(booking.show._id);

    show.seats = show.seats.map((seat) =>
      cancelledSeats.has(seat.label) ? { ...seat.toObject(), status: "available" } : seat
    );
    await show.save();

    booking.paymentStatus = "cancelled";
    booking.cancelledAt = new Date();

    const subtotal = booking.subtotal || booking.totalAmount || 0;
    const convenienceFee = booking.convenienceFee || 0;
    booking.refundAmount = Math.max(0, subtotal - convenienceFee);

    await booking.save();

    const populated = await Booking.findById(booking._id).populate({
      path: "show",
      populate: [{ path: "movie" }, { path: "theater" }]
    });

    res.json(populated);
  } catch (error) {
    next(error);
  }
});

export default router;
