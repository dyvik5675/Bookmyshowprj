import { CalendarDays, Clock, MapPin, Star } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api";

export default function MovieDetailsPage() {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [shows, setShows] = useState([]);
  const [dateFilter, setDateFilter] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api(`/movies/${id}`), api(`/shows?movie=${id}`)])
      .then(([movieData, showData]) => {
        setMovie(movieData);
        setShows(showData);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const dateOptions = useMemo(() => {
    return ["All", ...new Set(shows.map((show) => new Date(show.startsAt).toDateString()))];
  }, [shows]);

  const filteredShows = useMemo(() => {
    if (dateFilter === "All") return shows;
    return shows.filter((show) => new Date(show.startsAt).toDateString() === dateFilter);
  }, [shows, dateFilter]);

  function availableSeats(show) {
    return show.seats.filter((seat) => seat.status === "available").length;
  }

  if (loading) {
    return (
      <main className="page">
        <p className="muted">Loading movie...</p>
      </main>
    );
  }

  if (!movie) {
    return <main className="page">Movie not found</main>;
  }

  return (
    <>
      <section className="movie-hero" style={{ backgroundImage: `url(${movie.bannerUrl})` }}>
        <div className="movie-hero-overlay">
          <img src={movie.posterUrl} alt={movie.title} />

          <div>
            <p className="eyebrow">{movie.genre} | {movie.language}</p>
            <h1>{movie.title}</h1>
            <p className="movie-desc">{movie.description}</p>

            <div className="meta-row">
              <span><Star size={18} fill="currentColor" /> {movie.rating}/10</span>
              <span><Clock size={18} /> {movie.duration} min</span>
              <span>{movie.certificate}</span>
            </div>
          </div>
        </div>
      </section>

      <main className="page">
        <div className="section-title">
          <h2>Available Shows</h2>
          <span>{filteredShows.length} shows</span>
        </div>

        <div className="date-tabs">
          {dateOptions.map((date) => (
            <button
              key={date}
              className={dateFilter === date ? "active" : ""}
              onClick={() => setDateFilter(date)}
            >
              {date === "All"
                ? "All dates"
                : new Date(date).toLocaleDateString(undefined, {
                    weekday: "short",
                    month: "short",
                    day: "numeric"
                  })}
            </button>
          ))}
        </div>

        <div className="show-list">
          {filteredShows.map((show) => (
            <div className="show-card" key={show._id}>
              <div>
                <h3>{show.theater.name}</h3>
                <p><MapPin size={16} /> {show.theater.address}</p>
                <p><CalendarDays size={16} /> {new Date(show.startsAt).toLocaleDateString()}</p>
                <p>
                  <Clock size={16} />
                  {new Date(show.startsAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit"
                  })} | {show.screen}
                </p>
              </div>

              <div className="show-price">
                <span className={availableSeats(show) > 10 ? "availability good" : "availability low"}>
                  {availableSeats(show)} seats left
                </span>

                <strong>Rs {show.price}</strong>

                <Link className="primary-btn" to={`/booking/${show._id}`}>
                  Book Tickets
                </Link>
              </div>
            </div>
          ))}

          {filteredShows.length === 0 && <p className="muted">No shows available.</p>}
        </div>
      </main>
    </>
  );
}
