import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import { connectDB } from "./lib/db.js";
import { User } from "./models/User.js";
import { Movie } from "./models/Movie.js";
import { Theater } from "./models/Theater.js";
import { Show } from "./models/Show.js";
import { Booking } from "./models/Booking.js";

dotenv.config();

function buildSeats(booked = []) {
  const bookedSet = new Set(booked);
  return ["A", "B", "C", "D", "E", "F"].flatMap((row) =>
    Array.from({ length: 10 }, (_, index) => {
      const label = `${row}${index + 1}`;
      return { label, status: bookedSet.has(label) ? "booked" : "available" };
    })
  );
}

await connectDB();

await Promise.all([
  Booking.deleteMany({}),
  Show.deleteMany({}),
  Theater.deleteMany({}),
  Movie.deleteMany({}),
  User.deleteMany({})
]);

const password = await bcrypt.hash("admin123", 10);
const userPassword = await bcrypt.hash("user123", 10);

await User.create([
  { name: "Admin", email: "admin@bookmyshow.test", password, role: "admin" },
  { name: "Demo User", email: "user@bookmyshow.test", password: userPassword, role: "user" }
]);

const movies = await Movie.create([
  {
    title: "Starlight Express",
    language: "English",
    genre: "Sci-Fi",
    duration: 142,
    rating: 8.6,
    certificate: "UA",
    posterUrl: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=600&q=80",
    bannerUrl: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1400&q=80",
    description: "A pilot discovers a hidden route through space and must choose between fame and saving Earth.",
    releaseDate: new Date("2026-04-21")
  },
  {
    title: "Mumbai Monsoon",
    language: "Hindi",
    genre: "Drama",
    duration: 128,
    rating: 8.1,
    certificate: "U",
    posterUrl: "https://images.unsplash.com/photo-1518929458119-e5bf444c30f4?auto=format&fit=crop&w=600&q=80",
    bannerUrl: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=80",
    description: "Three strangers meet during one rainy evening and change the direction of each other's lives.",
    releaseDate: new Date("2026-03-15")
  },
  {
    title: "Final Over",
    language: "Tamil",
    genre: "Sports",
    duration: 136,
    rating: 7.9,
    certificate: "UA",
    posterUrl: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=600&q=80",
    bannerUrl: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=1400&q=80",
    description: "A retired cricketer returns to coach a young team through the biggest match of their lives.",
    releaseDate: new Date("2026-02-10")
  }
]);

const theaters = await Theater.create([
  { name: "PVR Orion Mall", city: "Bengaluru", address: "Rajajinagar, Bengaluru", screens: 4 },
  { name: "INOX Phoenix", city: "Mumbai", address: "Lower Parel, Mumbai", screens: 5 },
  { name: "Cinepolis Forum", city: "Chennai", address: "Vadapalani, Chennai", screens: 3 }
]);

const now = new Date();
const addHours = (hours) => new Date(now.getTime() + hours * 60 * 60 * 1000);

await Show.create([
  {
    movie: movies[0]._id,
    theater: theaters[0]._id,
    screen: "Screen 1",
    startsAt: addHours(3),
    price: 280,
    seats: buildSeats(["A1", "A2", "C5"])
  },
  {
    movie: movies[0]._id,
    theater: theaters[1]._id,
    screen: "Screen 3",
    startsAt: addHours(7),
    price: 340,
    seats: buildSeats(["B3", "B4"])
  },
  {
    movie: movies[1]._id,
    theater: theaters[1]._id,
    screen: "Screen 2",
    startsAt: addHours(4),
    price: 220,
    seats: buildSeats(["D7", "D8"])
  },
  {
    movie: movies[2]._id,
    theater: theaters[2]._id,
    screen: "Screen 1",
    startsAt: addHours(5),
    price: 240,
    seats: buildSeats(["E1", "E2", "E3"])
  }
]);

console.log("Seed data created");
process.exit(0);
