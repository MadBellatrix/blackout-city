import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './src/config/db.js';
import playerRoutes from './src/routes/player.js';
import authRoutes from './src/routes/authRoutes.js';
import gameRoutes from './src/routes/gameRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CLIENT_DIST_PATH = path.resolve(__dirname, '../client/dist');

// Umgebungsvariablen (werden über native Node.js --env-file=.env geladen)
const PORT = process.env.PORT || 5000;

const app = express();

// Middleware (JSON-Parsing und CORS)
app.use(cors());
app.use(express.json());

// API-Routen registrieren
app.use('/api/auth', authRoutes);
app.use('/api/game', gameRoutes);
app.use('/api', playerRoutes);

// Health-Check Route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Blackout City Server is running',
    timestamp: new Date().toISOString()
  });
});

// Single-Service-Deployment: Statische Frontend-Dateien aus client/dist ausliefern
app.use(express.static(CLIENT_DIST_PATH));

// SPA-Fallback: Alle nicht durch die API abgedeckten Routen erhalten index.html
app.get('{*path}', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(CLIENT_DIST_PATH, 'index.html'), (err) => {
    if (err) {
      res.status(200).json({
        name: 'Blackout City API',
        version: '0.1.0',
        notice: 'Frontend dist not built yet. Run npm run build in client directory.'
      });
    }
  });
});

// Server nur starten, wenn server.js direkt ausgeführt wird (nicht bei Import z.B. in Tests)
const isDirectRun =
  process.argv[1] &&
  (process.argv[1].endsWith('server.js') || process.argv[1].endsWith('server/server.js'));

if (isDirectRun) {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`✓ Server läuft auf Port ${PORT}`);
    console.log(`✓ API Health-Check: http://localhost:${PORT}/api/health`);
  });
}

export default app;
