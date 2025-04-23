
# Anime Database Server

This is a simple Express.js server that connects to your SQLite anime database and provides API endpoints for the frontend to consume.

## Setup

1. Place your anime database file (`.db`) in this directory
2. Update the database filename in `server.js` to match your actual database file name
3. Install dependencies:

```bash
npm install
```

4. Start the server:

```bash
npm start
```

The server will start on port 5000 by default.

## API Endpoints

- `GET /api/anime` - Get all anime shows
- `GET /api/anime/:id` - Get anime show by ID (includes soundtrack info if available)
- `GET /api/anime/search/:query` - Search anime by name
- `GET /api/soundtracks` - Get all soundtracks

## Connecting to the Frontend

The React frontend is configured to fetch data from this server. Make sure the server is running when using the frontend application.

If you need to change the API URL in the frontend, update the `apiClient.ts` file.
