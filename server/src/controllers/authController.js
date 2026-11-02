import jwt from 'jsonwebtoken';
import Player from '../models/Player.js';

// Hilfsfunktion: Token generieren (7 Tage Gültigkeit)
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// Registrierung
export const register = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validierung: Beide Felder erforderlich
    if (!username || !password) {
      return res.status(400).json({
        error: 'Benutzername und Passwort sind erforderlich.'
      });
    }

    // Validierung: Username min. 3 Zeichen
    if (username.trim().length < 3) {
      return res.status(400).json({
        error: 'Der Benutzername muss mindestens 3 Zeichen lang sein.'
      });
    }

    // Prüfen, ob Benutzername bereits existiert
    const existingPlayer = await Player.findOne({ username: username.trim() });
    if (existingPlayer) {
      return res.status(400).json({
        error: 'Dieser Benutzername ist bereits vergeben.'
      });
    }

    // Neuen Spieler anlegen (Standardwerte für Ressourcen etc. greifen aus dem Schema)
    const player = new Player({
      username: username.trim(),
      password
    });

    await player.save();

    const token = generateToken(player._id);

    return res.status(201).json({
      token,
      player: {
        id: player._id,
        username: player.username,
        resources: player.resources,
        buildings: player.buildings,
        workers: player.workers,
        lastActive: player.lastActive
      }
    });
  } catch (error) {
    console.error('Fehler bei der Registrierung:', error);
    return res.status(500).json({
      error: 'Interner Serverfehler bei der Registrierung.',
      details: error.message
    });
  }
};

// Login
export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        error: 'Benutzername und Passwort sind erforderlich.'
      });
    }

    // Spieler suchen
    const player = await Player.findOne({ username: username.trim() });
    if (!player) {
      return res.status(401).json({
        error: 'Ungültige Anmeldedaten.'
      });
    }

    // Passwort verifizieren
    const isMatch = await player.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        error: 'Ungültige Anmeldedaten.'
      });
    }

    // Letzte Aktivität aktualisieren
    player.lastActive = new Date();
    await player.save();

    const token = generateToken(player._id);

    return res.status(200).json({
      token,
      player: {
        id: player._id,
        username: player.username,
        resources: player.resources,
        buildings: player.buildings,
        workers: player.workers,
        lastActive: player.lastActive
      }
    });
  } catch (error) {
    console.error('Fehler beim Login:', error);
    return res.status(500).json({
      error: 'Interner Serverfehler beim Login.',
      details: error.message
    });
  }
};

export default {
  register,
  login
};
