# Cafe Compass

A mobile app that finds the best cafes near you, ranked by a blend of distance, rating, and review count.

## How it works

1. Tap **Find Cafes** — the app requests your location.
2. The mobile app sends your coordinates to the backend.
3. The backend queries the Google Places API for cafes within 1.5 km and scores each one using:
   - **Distance** (50%) — closer is better
   - **Rating** (35%) — normalised against 5 stars
   - **Review count** (15%) — capped at 500 so viral outliers don't dominate
4. The top 3 results are returned and displayed as ranked cards.
5. Tap any card to open the cafe in Google Maps.

## Project structure

```
cafe-compass/
├── backend/          # Express + TypeScript API (port 3000)
│   └── src/
│       ├── index.ts
│       ├── routes/
│       ├── controllers/
│       └── services/
└── mobile/           # Expo (React Native) app
    ├── app/
    │   └── (tabs)/
    │       └── index.tsx   # main screen
    └── services/
        └── api.ts          # talks to the backend
```

## Setup

### Prerequisites

- Node.js
- A [Google Places API](https://developers.google.com/maps/documentation/places/web-service) key with the **Places API** enabled
- Expo Go on your phone (or an Android/iOS simulator)

### Backend

```bash
cd backend
npm install
```

Create a `.env` file:

```
GOOGLE_PLACES_API_KEY=your_key_here
```

Start the server:

```bash
npm run dev
```

The API will be available at `http://localhost:3000`.

### Mobile

```bash
cd mobile
npm install
```

Copy the example env file and set your backend URL:

```bash
cp .env.example .env
```

Edit `.env`:

```
EXPO_PUBLIC_API_URL=http://YOUR_LOCAL_IP:3000
```

> Use your machine's local IP address (not `localhost`) so the phone can reach the backend over your network.

Start the app:

```bash
npm start
```

Scan the QR code with Expo Go, or press `a` for Android / `i` for iOS simulator.
