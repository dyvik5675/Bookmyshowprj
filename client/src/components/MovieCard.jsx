import { CalendarDays, Clock, Star } from "lucide-react";
import { Link } from "react-router-dom";

export default function MovieCard({ movie }) {
  return (
    <Link to={`/movies/${movie._id}`} className="movie-card">
      <img src={movie.posterUrl} alt={movie.title} />

      <div className="movie-info">
        <div className="movie-badges">
          <span>{movie.certificate}</span>
          <span>{movie.language}</span>
        </div>

        <h3>{movie.title}</h3>
        <p>{movie.genre}</p>

        <div className="movie-meta-line">
          <span><Star size={16} fill="currentColor" /> {movie.rating}/10</span>
          <span><Clock size={16} /> {movie.duration} min</span>
        </div>

        <small><CalendarDays size={14} /> {new Date(movie.releaseDate).toLocaleDateString()}</small>
      </div>
    </Link>
  );
}
