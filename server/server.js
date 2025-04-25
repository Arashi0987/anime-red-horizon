
const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

app.use('/media', express.static('/Media'));

// Enable CORS with more comprehensive configuration
app.use(cors({
  origin: '*', // Allow all origins during development
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
  optionsSuccessStatus: 204
}));
app.use(express.json());

// Database connection
let db;

// Initialize database connection
async function initializeDatabase() {
  try {
    // Use path.join for proper cross-platform path handling
    // We'll look for the database file in the current directory, the instance directory,
    // and one level up in the instance directory
    const possiblePaths = [
      //path.join(__dirname, 'anime_list.db'),
      //path.join(__dirname, 'instance', 'anime_list.db'),
      path.join(__dirname, '..', 'instance', 'anime_list.db')
    ];
    
    let dbPath = '';
    
    // Try to find the database file
    for (const p of possiblePaths) {
      try {
        require('fs').accessSync(p);
        dbPath = p;
        console.log(`Database found at: ${dbPath}`);
        break;
      } catch (err) {
        console.log(`No database at: ${p}`);
      }
    }
    
    if (!dbPath) {
      throw new Error('Database file not found in any of the expected locations');
    }
    
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });
    
    console.log('Connected to SQLite database');
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
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
        'SELECT * FROM soundtracks WHERE soundtrack_path = ?', 
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
    const soundtracks = await db.all('SELECT * FROM soundtracks');
    res.json(soundtracks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch soundtracks' });
  }
});

// Add a simple health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Initialize database and start server
initializeDatabase()
  .then(() => {
    app.listen(PORT, '0.0.0.0', () => { // Use '0.0.0.0' to listen on all network interfaces
      console.log(`Server running on port ${PORT} and accessible at http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('Failed to initialize database:', err);
  });
