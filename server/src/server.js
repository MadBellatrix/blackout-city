import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import playerRoutes from './routes/player.js';

// Umgebungsvariablen (werden durch --env-file=.env geladen)
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/blackout-city';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// API-Routen registrieren
app.use('/api', playerRoutes);

// Health-Check Route
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Blackout City Server is running',
    storage: mongoose.connection.readyState === 1 ? 'mongodb' : 'memory',
    timestamp: new Date().toISOString()
  });
});

// Basis-Route
app.get('/', (req, res) => {
  res.json({
    name: 'Blackout City API',
    version: '0.1.0',
    endpoints: {
      health: '/api/health',
      player: '/api/player/:userId'
    }
  });
});

// Server sofort starten
const server = app.listen(PORT, () => {
  console.log(`✓ Server läuft auf Port ${PORT}`);
  console.log(`✓ API Health-Check: http://localhost:${PORT}/api/health`);
});

// MongoDB im Hintergrund verbinden
mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 2000 })
  .then(() => {
    console.log('✓ Verbunden mit MongoDB');
  })
  .catch((error) => {
    console.warn(`⚠ MongoDB nicht erreichbar (${error.message}). Server läuft im In-Memory-Modus.`);
  });

export default app;
