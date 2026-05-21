import {
  BadgeIndianRupee,
  CircleUserRound,
  Mail,
  Shield,
  Ticket,
  XCircle
} from "lucide-react";

import { useEffect, useMemo, useState } from "react";
import { api } from "../api";
import { useAuth } from "../state/AuthContext";

export default function ProfilePage() {
  const { user } = useAuth();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api(
      user?.role === "admin"
        ? "/bookings/admin/stats"
        : "/bookings/mine"
    )
      .then(setBookings)
      .finally(() => setLoading(false));
  }, [user]);

  const stats = useMemo(() => {

    if (user?.role === "admin") {
      return {
        total: bookings.totalBookings || 0,
        active:
          (bookings.totalBookings || 0) -
          (bookings.cancelledBookings || 0),

        cancelled: bookings.cancelledBookings || 0,

        spent: bookings.revenue || 0
      };
    }

    const active = bookings.filter(
      (booking) => booking.paymentStatus !== "cancelled"
    );

    const cancelled = bookings.filter(
      (booking) => booking.paymentStatus === "cancelled"
    );

    const spent = active.reduce(
      (sum, booking) => sum + booking.totalAmount,
      0
    );

    return {
      total: bookings.length,
      active: active.length,
      cancelled: cancelled.length,
      spent
    };

  }, [bookings, user]);

  if (loading) {
    return (
      <main className="page">
        <p className="muted">Loading profile...</p>
      </main>
    );
  }

  return (
    <main className="page">

      <section className="profile-hero">
        <div className="profile-avatar">
          <CircleUserRound size={64} />
        </div>

        <div>
          <p className="eyebrow">
            {user?.role === "admin"
              ? "Admin Profile"
              : "My Profile"}
          </p>

          <h1>
            {user?.role === "admin"
              ? "Administrator"
              : user?.name}
          </h1>

          <div className="profile-meta">
            <span>
              <Mail size={16} />
              {user?.email}
            </span>

            <span>
              <Shield size={16} />
              {user?.role}
            </span>
          </div>
        </div>
      </section>

      <section className="profile-stats">

        <div className="stat-card">
          <Ticket />
          <span>Total Bookings</span>
          <strong>{stats.total}</strong>
        </div>

        <div className="stat-card">
          <Ticket />
          <span>
            {user?.role === "admin"
              ? "Active Platform Bookings"
              : "Active Bookings"}
          </span>

          <strong>{stats.active}</strong>
        </div>

        <div className="stat-card">
          <XCircle />
          <span>Cancelled</span>
          <strong>{stats.cancelled}</strong>
        </div>

        <div className="stat-card">
          <BadgeIndianRupee />
          <span>
            {user?.role === "admin"
              ? "Total Revenue"
              : "Total Spent"}
          </span>

          <strong>Rs {stats.spent}</strong>
        </div>

      </section>
    </main>
  );
}