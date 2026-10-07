import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';

// Umgebungsvariablen (werden durch --env-file=.env geladen)
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/blackout-city';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health-Check Route
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Blackout City Server is running',
    timestamp: new Date().toISOString()
  });
});

// MongoDB-Verbindung
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✓ Verbunden mit MongoDB');

    // Server starten
    app.listen(PORT, () => {
      console.log(`✓ Server läuft auf Port ${PORT}`);
      console.log(`✓ Health-Check: http://localhost:${PORT}/api/health`);
    });
  })
  .catch((error) => {
    console.error('✗ MongoDB-Verbindung fehlgeschlagen:', error.message);
    // Server trotzdem starten (für Development ohne DB)
    app.listen(PORT, () => {
      console.log(`⚠ Server läuft auf Port ${PORT} (ohne MongoDB)`);
    });
  });

// Basis-Route
app.get('/', (req, res) => {
  res.json({
    name: 'Blackout City API',
    version: '0.1.0',
    endpoints: {
      health: '/api/health'
    }
  });
});
