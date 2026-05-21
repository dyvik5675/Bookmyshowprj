import axios from "axios";
import {
  CheckCircle2,
  CreditCard,
  Minus,
  Plus,
  RefreshCw,
  ShieldCheck,
  TimerReset,
  Utensils
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api";

const snacks = [
  { name: "Popcorn Combo", price: 240 },
  { name: "Coke", price: 120 },
  { name: "Nachos", price: 180 }
];

function seatCategory(label, basePrice) {
  const row = label.charAt(0);

  if (["E", "F"].includes(row)) {
    return { name: "Recliner", price: basePrice + 180 };
  }

  if (["C", "D"].includes(row)) {
    return { name: "Gold", price: basePrice + 80 };
  }

  return { name: "Silver", price: basePrice };
}

export default function BookingPage() {
  const { showId } = useParams();
  const [show, setShow] = useState(null);
  const [selected, setSelected] = useState([]);
  const [food, setFood] = useState(() => snacks.map((item) => ({ ...item, quantity: 0 })));
  const [booking, setBooking] = useState(null);
  const [error, setError] = useState("");
  const [holdEndsAt, setHoldEndsAt] = useState(null);
  const [now, setNow] = useState(Date.now());
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [isPaying, setIsPaying] = useState(false);

  useEffect(() => {
    let alive = true;

    async function loadShow() {
      const data = await api(`/shows/${showId}`);
      if (!alive) return;

      setShow(data);
      setSelected((current) =>
        current.filter((label) =>
          data.seats.some((seat) => seat.label === label && seat.status === "available")
        )
      );
    }

    loadShow();
    const interval = setInterval(loadShow, 5000);

    return () => {
      alive = false;
      clearInterval(interval);
    };
  }, [showId]);

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selected.length === 0) {
      setHoldEndsAt(null);
      setPaymentOpen(false);
      return;
    }

    if (!holdEndsAt) setHoldEndsAt(Date.now() + 5 * 60 * 1000);
  }, [selected.length, holdEndsAt]);

  useEffect(() => {
    if (holdEndsAt && now > holdEndsAt) {
      setSelected([]);
      setHoldEndsAt(null);
      setPaymentOpen(false);
      setError("Seat hold expired. Please select seats again.");
    }
  }, [holdEndsAt, now]);

  const selectedSeats = useMemo(() => {
    if (!show) return [];
    return selected.map((label) => ({
      label,
      ...seatCategory(label, show.price)
    }));
  }, [selected, show]);

  const pricing = useMemo(() => {
    const subtotal = selectedSeats.reduce((sum, seat) => sum + seat.price, 0);
    const foodTotal = food.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const convenienceFee = Math.ceil((subtotal + foodTotal) * 0.06);
    const gst = Math.round(convenienceFee * 0.18);

    return {
      subtotal,
      foodTotal,
      convenienceFee,
      gst,
      total: subtotal + foodTotal + convenienceFee + gst
    };
  }, [selectedSeats, food]);

  const holdTime = useMemo(() => {
    if (!holdEndsAt) return "05:00";

    const remaining = Math.max(0, holdEndsAt - now);
    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);

    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }, [holdEndsAt, now]);

  function toggleSeat(seat) {
    if (seat.status === "booked") return;

    setError("");
    setSelected((current) =>
      current.includes(seat.label)
        ? current.filter((item) => item !== seat.label)
        : [...current, seat.label]
    );
  }

  function updateFood(name, direction) {
    setFood((current) =>
      current.map((item) =>
        item.name === name
          ? { ...item, quantity: Math.max(0, item.quantity + direction) }
          : item
      )
    );
  }

 async function confirmBooking() {

  if (selected.length === 0) return;

  setError("");

  setIsPaying(true);

  try {

    // Create Razorpay Order
    const { data } = await axios.post(
      "http://localhost:5000/api/payments/create-order",
      {
        amount: pricing.total
      }
    );

    const options = {

      // Replace with your Razorpay Test Key
      key: "rzp_test_SpjuCfpggzga3X",

      amount: data.amount,

      currency: data.currency,

      name: "BookMyShow Clone",

      description: "Movie Ticket Booking",

      order_id: data.id,

      handler: async function (response) {

        try {

          // Create booking only after successful payment
          const bookingData = await api(
            "/bookings",
            {
              method: "POST",

              body: JSON.stringify({

                showId,

                seats: selected,

                foodItems: food.filter(
                  (item) => item.quantity > 0
                ),

                paymentMethod,

                paymentId:
                  response.razorpay_payment_id

              })
            }
          );

          setBooking(bookingData);

          setSelected([]);

          setFood(
            snacks.map((item) => ({
              ...item,
              quantity: 0
            }))
          );

          setHoldEndsAt(null);

          setPaymentOpen(false);

          const updatedShow =
            await api(`/shows/${showId}`);

          setShow(updatedShow);

          alert("Payment Successful");

        } catch (err) {

          setError(err.message);

        }
      },

      prefill: {

        name: "Shreyas",

        email: "test@test.com"

      },

      theme: {

        color: "#e11d48"

      }
    };

    const razorpay =
      new window.Razorpay(options);

    razorpay.open();

  } catch (err) {

    setError(err.message);

  } finally {

    setIsPaying(false);

  }
}

  if (!show) {
    return (
      <main className="page">
        <p className="muted">Loading seats...</p>
      </main>
    );
  }

  return (
    <main className="page booking-page">
      <section>
        <p className="eyebrow">Select seats</p>
        <h1>{show.movie.title}</h1>

        <p className="muted">
          {show.theater.name} | {show.screen} | {new Date(show.startsAt).toLocaleString()}
        </p>

        <div className="seat-category-row">
          <span>Silver Rs {show.price}</span>
          <span>Gold Rs {show.price + 80}</span>
          <span>Recliner Rs {show.price + 180}</span>
        </div>

        <div className="screen">SCREEN</div>

        <div className="seat-grid">
          {show.seats.map((seat) => {
            const category = seatCategory(seat.label, show.price);

            return (
              <button
                key={seat.label}
                title={`${category.name} - Rs ${category.price}`}
                className={`seat ${seat.status} ${category.name.toLowerCase()} ${
                  selected.includes(seat.label) ? "selected" : ""
                }`}
                disabled={seat.status === "booked"}
                onClick={() => toggleSeat(seat)}
              >
                {seat.label}
              </button>
            );
          })}
        </div>

        <div className="seat-legend">
          <span><i className="available-box" /> Available</span>
          <span><i className="selected-box" /> Selected</span>
          <span><i className="booked-box" /> Booked</span>
        </div>

        <div className="booking-status">
          <span><RefreshCw size={16} /> Seats refresh every 5 seconds</span>
          {selected.length > 0 && (
            <span><TimerReset size={16} /> Hold expires in {holdTime}</span>
          )}
        </div>
      </section>

      <aside className="summary-card">
        <h2>Booking Summary</h2>

        <p>Movie: <strong>{show.movie.title}</strong></p>
        <p>Theater: <strong>{show.theater.name}</strong></p>
        <p>Seats: <strong>{selected.length ? selected.join(", ") : "None"}</strong></p>

        {selectedSeats.length > 0 && (
          <div className="seat-price-list">
            {selectedSeats.map((seat) => (
              <span key={seat.label}>
                {seat.label} {seat.name}
                <strong>Rs {seat.price}</strong>
              </span>
            ))}
          </div>
        )}

        <div className="food-box">
          <div className="payment-title">
            <Utensils size={18} />
            <strong>Food add-ons</strong>
          </div>

          {food.map((item) => (
            <div className="food-item" key={item.name}>
              <span>{item.name}<small>Rs {item.price}</small></span>
              <div className="stepper">
                <button type="button" onClick={() => updateFood(item.name, -1)}>
                  <Minus size={14} />
                </button>
                <strong>{item.quantity}</strong>
                <button type="button" onClick={() => updateFood(item.name, 1)}>
                  <Plus size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="price-breakdown">
          <span>Ticket amount <strong>Rs {pricing.subtotal}</strong></span>
          <span>Food amount <strong>Rs {pricing.foodTotal}</strong></span>
          <span>Convenience fee <strong>Rs {pricing.convenienceFee}</strong></span>
          <span>GST <strong>Rs {pricing.gst}</strong></span>
        </div>

        <h3>Total: Rs {pricing.total}</h3>

        {error && <div className="alert">{error}</div>}

        <button
          className="primary-btn full"
          disabled={selected.length === 0}
          onClick={() => setPaymentOpen(true)}
        >
          Continue to Pay
        </button>

        {paymentOpen && (
          <div className="payment-box">
            <div className="payment-title">
              <CreditCard size={18} />
              <strong>Secure Payment</strong>
            </div>

            <label>
              <input
                type="radio"
                name="payment"
                checked={paymentMethod === "upi"}
                onChange={() => setPaymentMethod("upi")}
              />
              UPI
            </label>

            <label>
              <input
                type="radio"
                name="payment"
                checked={paymentMethod === "card"}
                onChange={() => setPaymentMethod("card")}
              />
              Debit / Credit Card
            </label>

            <label>
              <input
                type="radio"
                name="payment"
                checked={paymentMethod === "wallet"}
                onChange={() => setPaymentMethod("wallet")}
              />
              Wallet
            </label>

            <button className="primary-btn full" disabled={isPaying} onClick={confirmBooking}>
              {isPaying ? "Processing..." : `Pay Rs ${pricing.total}`}
            </button>

            <small>
              <ShieldCheck size={14} /> Demo payment. No real money is charged.
            </small>
          </div>
        )}

        {booking && (
          <div className="success-card">
            <CheckCircle2 />
            <strong>Booking confirmed</strong>
            <span>{booking.bookingCode}</span>
            <Link to="/my-bookings">View my bookings</Link>
          </div>
        )}
      </aside>
    </main>
  );
}