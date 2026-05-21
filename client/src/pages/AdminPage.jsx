import { BadgeIndianRupee, Clapperboard, Plus, Ticket, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "../api";

const emptyMovie = {
  title: "",
  language: "",
  genre: "",
  duration: "",
  rating: "",
  certificate: "UA",
  posterUrl: "",
  bannerUrl: "",
  description: "",
  releaseDate: ""
};

export default function AdminPage() {
  const [movies, setMovies] = useState([]);
  const [theaters, setTheaters] = useState([]);
  const [stats, setStats] = useState(null);
  const [message, setMessage] = useState("");

  const [movieForm, setMovieForm] = useState(emptyMovie);

  const [theaterForm, setTheaterForm] = useState({
    name: "",
    city: "",
    address: "",
    screens: 1
  });

  const [showForm, setShowForm] = useState({
    movie: "",
    theater: "",
    screen: "Screen 1",
    startsAt: "",
    price: 200
  });

  async function loadData() {
    const [movieData, theaterData, statsData] = await Promise.all([
      api("/movies"),
      api("/theaters"),
      api("/bookings/admin/stats")
    ]);

    setMovies(movieData);
    setTheaters(theaterData);
    setStats(statsData);
  }

  useEffect(() => {
    loadData();
  }, []);

  async function addMovie(e) {
    e.preventDefault();

    await api("/movies", {
      method: "POST",
      body: JSON.stringify({
        ...movieForm,
        duration: Number(movieForm.duration),
        rating: Number(movieForm.rating)
      })
    });

    setMovieForm(emptyMovie);
    setMessage("Movie added successfully");
    loadData();
  }

  async function addTheater(e) {
    e.preventDefault();

    await api("/theaters", {
      method: "POST",
      body: JSON.stringify({
        ...theaterForm,
        screens: Number(theaterForm.screens)
      })
    });

    setTheaterForm({
      name: "",
      city: "",
      address: "",
      screens: 1
    });

    setMessage("Theater added successfully");
    loadData();
  }

  async function addShow(e) {
    e.preventDefault();

    await api("/shows", {
      method: "POST",
      body: JSON.stringify({
        ...showForm,
        price: Number(showForm.price)
      })
    });

    setShowForm({
      movie: "",
      theater: "",
      screen: "Screen 1",
      startsAt: "",
      price: 200
    });

    setMessage("Show added successfully");
    loadData();
  }

  return (
    <main className="page">
      <p className="eyebrow">Admin panel</p>
      <h1>Manage Movies, Theaters and Shows</h1>

      {stats && (
        <section className="stats-grid">
          <div className="stat-card">
            <Clapperboard />
            <span>Movies</span>
            <strong>{movies.length}</strong>
          </div>

          <div className="stat-card">
            <Ticket />
            <span>Total Bookings</span>
            <strong>{stats.totalBookings}</strong>
          </div>

          <div className="stat-card">
            <BadgeIndianRupee />
            <span>Revenue</span>
            <strong>Rs {stats.revenue}</strong>
          </div>

          <div className="stat-card">
            <XCircle />
            <span>Cancelled</span>
            <strong>{stats.cancelledBookings}</strong>
          </div>
        </section>
      )}

      {message && <div className="success-line">{message}</div>}

      <section className="admin-grid">
        <form className="admin-card" onSubmit={addMovie}>
          <h2>Add Movie</h2>

          {Object.keys(emptyMovie).map((key) => (
            <input
              key={key}
              type={key === "releaseDate" ? "date" : "text"}
              placeholder={key}
              value={movieForm[key]}
              onChange={(e) =>
                setMovieForm({ ...movieForm, [key]: e.target.value })
              }
              required
            />
          ))}

          <button className="primary-btn">
            <Plus size={16} /> Add Movie
          </button>
        </form>

        <form className="admin-card" onSubmit={addTheater}>
          <h2>Add Theater</h2>

          <input
            placeholder="Theater name"
            value={theaterForm.name}
            onChange={(e) =>
              setTheaterForm({ ...theaterForm, name: e.target.value })
            }
            required
          />

          <input
            placeholder="City"
            value={theaterForm.city}
            onChange={(e) =>
              setTheaterForm({ ...theaterForm, city: e.target.value })
            }
            required
          />

          <input
            placeholder="Address"
            value={theaterForm.address}
            onChange={(e) =>
              setTheaterForm({ ...theaterForm, address: e.target.value })
            }
            required
          />

          <input
            type="number"
            placeholder="Screens"
            value={theaterForm.screens}
            onChange={(e) =>
              setTheaterForm({ ...theaterForm, screens: e.target.value })
            }
            required
          />

          <button className="primary-btn">
            <Plus size={16} /> Add Theater
          </button>
        </form>

        <form className="admin-card" onSubmit={addShow}>
          <h2>Add Show</h2>

          <select
            value={showForm.movie}
            onChange={(e) =>
              setShowForm({ ...showForm, movie: e.target.value })
            }
            required
          >
            <option value="">Select movie</option>
            {movies.map((movie) => (
              <option key={movie._id} value={movie._id}>
                {movie.title}
              </option>
            ))}
          </select>

          <select
            value={showForm.theater}
            onChange={(e) =>
              setShowForm({ ...showForm, theater: e.target.value })
            }
            required
          >
            <option value="">Select theater</option>
            {theaters.map((theater) => (
              <option key={theater._id} value={theater._id}>
                {theater.name}
              </option>
            ))}
          </select>

          <input
            placeholder="Screen"
            value={showForm.screen}
            onChange={(e) =>
              setShowForm({ ...showForm, screen: e.target.value })
            }
          />

          <input
            type="datetime-local"
            value={showForm.startsAt}
            onChange={(e) =>
              setShowForm({ ...showForm, startsAt: e.target.value })
            }
            required
          />

          <input
            type="number"
            placeholder="Price"
            value={showForm.price}
            onChange={(e) =>
              setShowForm({ ...showForm, price: e.target.value })
            }
            required
          />

          <button className="primary-btn">
            <Plus size={16} /> Add Show
          </button>
        </form>
      </section>
    </main>
  );
}
