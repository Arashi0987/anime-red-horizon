
const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS
app.use(cors());
app.use(express.json());

// Database connection
let db;

// Initialize database connection
async function initializeDatabase() {
  // Replace 'your-anime-database.db' with the path to your actual .db file
  db = await open({
    filename: './your-anime-database.db',
    driver: sqlite3.Database
  });
  
  console.log('Connected to SQLite database');
}

// API Routes

// Get all anime shows
app.get('/api/anime', async (req, res) => {
  try {
    const shows = await db.all('SELECT * FROM show');
    res.json(shows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch anime shows' });
  }
});

// Get a specific anime show by ID
app.get('/api/anime/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const show = await db.get('SELECT * FROM show WHERE id = ?', id);
    
    if (!show) {
      return res.status(404).json({ error: 'Anime not found' });
    }
    
    // Get soundtrack info if it exists
    if (show.soundtrack_path) {
      const soundtrack = await db.get(
        'SELECT * FROM soundtrack WHERE soundtrack_path = ?', 
        show.soundtrack_path
      );
      
      if (soundtrack) {
        show.soundtrack_info = soundtrack;
      }
    }
    
    res.json(show);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch anime details' });
  }
});

// Search anime by name
app.get('/api/anime/search/:query', async (req, res) => {
  try {
    const { query } = req.params;
    const shows = await db.all(
      'SELECT * FROM show WHERE english_name LIKE ? OR romanji_name LIKE ?', 
      [`%${query}%`, `%${query}%`]
    );
    res.json(shows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to search anime' });
  }
});

// Get all soundtracks
app.get('/api/soundtracks', async (req, res) => {
  try {
    const soundtracks = await db.all('SELECT * FROM soundtrack');
    res.json(soundtracks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch soundtracks' });
  }
});

// Initialize database and start server
initializeDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Failed to initialize database:', err);
  });
