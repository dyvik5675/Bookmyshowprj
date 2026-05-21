import { Clapperboard, LogOut, Ticket, UserRound, Wrench } from "lucide-react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../state/AuthContext";

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <header className="header">
      <Link to="/" className="brand">
        <Clapperboard />
        <span>BookMyShow</span>
      </Link>

      <nav>
        <NavLink to="/">Movies</NavLink>

        {user?.role !== "admin" && user && (
          <NavLink to="/my-bookings">
            <Ticket size={16} /> My Bookings
          </NavLink>
        )}

        {user && (
          <NavLink to="/profile">
            <UserRound size={16} /> Profile
          </NavLink>
        )}

        {user?.role === "admin" && (
          <NavLink to="/admin">
            <Wrench size={16} /> Admin
          </NavLink>
        )}

        {!user ? (
          <NavLink to="/login">
            <UserRound size={16} /> Login
          </NavLink>
        ) : (
          <button onClick={handleLogout} className="nav-btn">
            <LogOut size={16} /> Logout
          </button>
        )}
      </nav>
    </header>
  );
}
