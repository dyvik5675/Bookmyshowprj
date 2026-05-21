import {
  Ban,
  CalendarDays,
  CircleDollarSign,
  Download,
  MapPin,
  Printer,
  QrCode,
  Ticket,
  Utensils
} from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "../api";

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  async function loadBookings() {
    const data = await api("/bookings/mine");
    setBookings(data);
  }

  useEffect(() => {
    loadBookings().finally(() => setLoading(false));
  }, []);

  async function cancelBooking(id) {
    if (!window.confirm("Cancel this booking? The seats will become available again.")) return;

    try {
      const cancelled = await api(`/bookings/${id}/cancel`, {
        method: "PATCH"
      });

      setBookings((current) =>
        current.map((booking) => (booking._id === id ? cancelled : booking))
      );

      setMessage("Booking cancelled. Refund initiated.");
    } catch (error) {
      setMessage(error.message);
    }
  }

  function canCancel(booking) {
    return booking.paymentStatus !== "cancelled";
  }

  function buildTicketHtml(booking, autoPrint = false) {
    const foodRows = booking.foodItems?.length
      ? booking.foodItems
          .map(
            (item) =>
              `<p>${item.name} x ${item.quantity} - Rs ${item.price * item.quantity}</p>`
          )
          .join("")
      : "<p>No food add-ons</p>";

    return `
      <html>
        <head>
          <title>Ticket ${booking.bookingCode}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 24px;
              color: #111827;
            }

            .ticket {
              border: 2px dashed #111827;
              border-radius: 12px;
              max-width: 520px;
              padding: 24px;
            }

            h1 {
              color: #e50914;
              margin: 0 0 10px;
            }

            h2 {
              margin: 0 0 18px;
            }

            p {
              margin: 8px 0;
            }

            .code {
              background: #f1f5f9;
              border-radius: 8px;
              font-size: 20px;
              font-weight: 800;
              margin-top: 18px;
              padding: 14px;
              text-align: center;
            }

            .total {
              border-top: 1px solid #e5e7eb;
              font-size: 20px;
              font-weight: 800;
              margin-top: 16px;
              padding-top: 12px;
            }
          </style>
        </head>

        <body>
          <div class="ticket">
            <h1>BookMyShow</h1>
            <h2>${booking.show.movie.title}</h2>

            <p><strong>Theater:</strong> ${booking.show.theater.name}</p>
            <p><strong>Address:</strong> ${booking.show.theater.address}</p>
            <p><strong>Date:</strong> ${new Date(booking.show.startsAt).toLocaleString()}</p>
            <p><strong>Seats:</strong> ${booking.seats.join(", ")}</p>
            <p><strong>Payment:</strong> ${booking.paymentMethod?.toUpperCase() || "UPI"}</p>
            <p><strong>Status:</strong> ${booking.paymentStatus}</p>

            <h3>Food Add-ons</h3>
            ${foodRows}

            <p class="total">Total: Rs ${booking.totalAmount}</p>

            <div class="code">${booking.bookingCode}</div>

            <p>Show this ticket at entry.</p>
          </div>

          ${autoPrint ? "<script>window.print();</script>" : ""}
        </body>
      </html>
    `;
  }

  function printTicket(booking) {
    const printWindow = window.open("", "_blank");
    printWindow.document.write(buildTicketHtml(booking, true));
    printWindow.document.close();
  }

  function downloadTicket(booking) {
    const html = buildTicketHtml(booking);
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `${booking.bookingCode}.html`;
    link.click();

    URL.revokeObjectURL(url);
  }

  return (
    <main className="page">
      <div className="section-title">
        <h1>My Bookings</h1>
        <span>{bookings.length} tickets</span>
      </div>

      {message && <div className="success-line">{message}</div>}

      {loading ? (
        <p className="muted">Loading bookings...</p>
      ) : (
        <div className="booking-list">
          {bookings.map((booking) => {
            const cancelled = booking.paymentStatus === "cancelled";
            const hasFood = booking.foodItems && booking.foodItems.length > 0;

            return (
              <div
                className={`ticket-card premium-ticket ${cancelled ? "cancelled-ticket" : ""}`}
                key={booking._id}
              >
                <div className="ticket-icon">
                  <Ticket />
                </div>

                <div className="ticket-main">
                  <div className="ticket-head">
                    <div>
                      <h3>{booking.show.movie.title}</h3>
                      <p><MapPin size={16} /> {booking.show.theater.name}</p>
                    </div>

                    <span className={`status-pill ${cancelled ? "cancelled" : "paid"}`}>
                      {cancelled ? "Cancelled" : "Confirmed"}
                    </span>
                  </div>

                  <div className="ticket-details">
                    <span><CalendarDays size={16} /> {new Date(booking.show.startsAt).toLocaleString()}</span>
                    <span>Seats: <strong>{booking.seats.join(", ")}</strong></span>
                    <span>Payment: <strong>{booking.paymentMethod?.toUpperCase() || "UPI"}</strong></span>
                    <span>Total: <strong>Rs {booking.totalAmount}</strong></span>
                  </div>

                  {hasFood && (
                    <div className="ticket-food">
                      <strong><Utensils size={16} /> Food Add-ons</strong>

                      {booking.foodItems.map((item) => (
                        <span key={item.name}>
                          {item.name} x {item.quantity}
                          <b>Rs {item.price * item.quantity}</b>
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="qr-ticket">
                    <div>
                      <QrCode />
                      <strong>{booking.bookingCode}</strong>
                    </div>
                    <small>Show this code at entry</small>
                  </div>

                  <div className="ticket-footer">
                    {cancelled ? (
                      <span className="refund-text">
                        <CircleDollarSign size={16} /> Refund Rs {booking.refundAmount || 0}
                      </span>
                    ) : (
                      <>
                        <button
                          className="print-btn"
                          onClick={() => printTicket(booking)}
                        >
                          <Printer size={16} /> Print Ticket
                        </button>

                        <button
                          className="download-btn"
                          onClick={() => downloadTicket(booking)}
                        >
                          <Download size={16} /> Download Ticket
                        </button>

                        <button
                          className="cancel-btn"
                          disabled={!canCancel(booking)}
                          onClick={() => cancelBooking(booking._id)}
                        >
                          <Ban size={16} /> Cancel booking
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {bookings.length === 0 && <p className="muted">No bookings yet.</p>}
        </div>
      )}
    </main>
  );
}
