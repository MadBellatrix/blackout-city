import express from 'express';
import cors from 'cors';
import connectDB from './src/config/db.js';
import playerRoutes from './src/routes/player.js';
import authRoutes from './src/routes/authRoutes.js';

// Umgebungsvariablen (werden über native Node.js --env-file=.env geladen)
const PORT = process.env.PORT || 5000;

const app = express();

// Middleware (JSON-Parsing und CORS)
app.use(cors());
app.use(express.json());

// API-Routen registrieren
app.use('/api/auth', authRoutes);
app.use('/api', playerRoutes);

// Health-Check Route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Blackout City Server is running',
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
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login'
      },
      player: '/api/player/:userId'
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
