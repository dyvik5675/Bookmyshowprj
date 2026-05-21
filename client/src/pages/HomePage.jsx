import { Filter, MapPin, Search, SlidersHorizontal, TicketCheck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { api } from "../api";
import MovieCard from "../components/MovieCard";

export default function HomePage() {
  const [movies, setMovies] = useState([]);
  const [query, setQuery] = useState("");
  const [genre, setGenre] = useState("All");
  const [language, setLanguage] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api("/movies")
      .then(setMovies)
      .finally(() => setLoading(false));
  }, []);

  const genres = useMemo(() => ["All", ...new Set(movies.map((movie) => movie.genre))], [movies]);
  const languages = useMemo(() => ["All", ...new Set(movies.map((movie) => movie.language))], [movies]);

  const filtered = useMemo(() => {
    return movies.filter((movie) => {
      const matchesSearch = movie.title.toLowerCase().includes(query.toLowerCase());
      const matchesGenre = genre === "All" || movie.genre === genre;
      const matchesLanguage = language === "All" || movie.language === language;

      return matchesSearch && matchesGenre && matchesLanguage;
    });
  }, [movies, query, genre, language]);

  return (
    <main className="page">
      <section className="hero enhanced-hero">
        <div>
          <p className="eyebrow">Now showing near you</p>
          <h1>Book movie tickets with a smooth real-time experience.</h1>
          <p className="hero-text">
            Browse movies, choose show timings, select your seats, and confirm bookings instantly.
          </p>

          <div className="hero-stats">
            <span><TicketCheck size={18} /> {movies.length} movies</span>
            <span><MapPin size={18} /> Multiple cities</span>
            <span><SlidersHorizontal size={18} /> Smart filters</span>
          </div>
        </div>

        <div className="discovery-panel">
          <div className="search-box">
            <Search size={18} />
            <input
              placeholder="Search for movies"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <div className="filter-row">
            <label>
              <Filter size={16} />
              <select value={genre} onChange={(e) => setGenre(e.target.value)}>
                {genres.map((item) => (
                  <option key={item} value={item}>{item} genre</option>
                ))}
              </select>
            </label>

            <label>
              <SlidersHorizontal size={16} />
              <select value={language} onChange={(e) => setLanguage(e.target.value)}>
                {languages.map((item) => (
                  <option key={item} value={item}>{item} language</option>
                ))}
              </select>
            </label>
          </div>
        </div>
      </section>

      <section>
        <div className="section-title">
          <h2>Recommended Movies</h2>
          <span>{filtered.length} movies</span>
        </div>

        {loading ? (
          <p className="muted">Loading movies...</p>
        ) : (
          <div className="movie-grid">
            {filtered.map((movie) => (
              <MovieCard key={movie._id} movie={movie} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
