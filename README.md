# BookMyShow MERN Clone

A full-stack BookMyShow-style project using MongoDB, Express, React, and Node.js.

## Features

- User register/login with JWT
- Browse movies
- View movie details and shows
- Select seats and create bookings
- My bookings page
- Admin dashboard for movies, theaters, and shows
- Seed script with sample movies, theaters, shows, and an admin user

## Folder Structure

```text
bookmyshow-mern/
  client/   React frontend
  server/   Express + MongoDB backend
```

## Requirements

- Node.js 18+
- MongoDB running locally, or a MongoDB Atlas connection string

## 1. Backend Setup

```bash
cd bookmyshow-mern/server
npm install
copy .env.example .env
```

Edit `.env` if needed:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/bookmyshow_mern
JWT_SECRET=change_this_secret
CLIENT_URL=http://localhost:5173
```

Seed sample data:

```bash
npm run seed
```

Start backend:

```bash
npm run dev
```

Backend runs at `http://localhost:5000`.

## 2. Frontend Setup

Open another terminal:

```bash
cd bookmyshow-mern/client
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`.

## Demo Accounts

Admin:

```text
email: admin@bookmyshow.test
password: admin123
```

Normal user:

```text
email: user@bookmyshow.test
password: user123
```

## Main Paths

- `/` movies home
- `/movies/:id` movie details and shows
- `/booking/:showId` seat booking
- `/my-bookings` user bookings
- `/admin` admin dashboard
- `/login`
- `/register`
