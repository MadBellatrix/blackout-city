import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import Player from '../models/Player.js';
import BetaCode from '../models/BetaCode.js';
import { sendVerificationEmail } from '../services/emailService.js';

// Hilfsfunktion: Token generieren (7 Tage Gültigkeit)
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// Registrierung
export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validierung: Alle Felder erforderlich
    if (!username || !email || !password) {
      return res.status(400).json({
        message: 'Benutzername, E-Mail-Adresse und Passwort sind erforderlich.'
      });
    }

    // Validierung: Username min. 3 Zeichen
    if (username.trim().length < 3) {
      return res.status(400).json({
        message: 'Der Benutzername muss mindestens 3 Zeichen lang sein.'
      });
    }

    // Prüfen, ob Benutzername bereits existiert
    const existingPlayerByUsername = await Player.findOne({ username: username.trim() });
    if (existingPlayerByUsername) {
      return res.status(400).json({
        message: 'Dieser Benutzername ist bereits vergeben.'
      });
    }

    // Prüfen, ob E-Mail-Adresse bereits existiert
    const existingPlayerByEmail = await Player.findOne({ email: email.trim().toLowerCase() });
    if (existingPlayerByEmail) {
      return res.status(400).json({
        message: 'Diese E-Mail-Adresse ist bereits registriert.'
      });
    }

    // Verifizierungs-Token generieren (24h Gültigkeit)
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Neuen Spieler anlegen
    const player = new Player({
      username: username.trim(),
      email: email.trim().toLowerCase(),
      password,
      isVerified: false,
      verificationToken,
      verificationTokenExpires,
    });

    await player.save();

    // Verifizierungs-E-Mail versenden (Fehler abfangen, damit die Registrierung nicht blockiert wird)
    try {
      await sendVerificationEmail({
        email: player.email,
        username: player.username,
        token: verificationToken,
      });
    } catch (mailError) {
      console.warn('Verifizierungs-E-Mail konnte nicht gesendet werden:', mailError.message);
    }

    return res.status(201).json({
      message: 'Registrierung erfolgreich! Bitte überprüfe dein Postfach, um deine Bürger-ID zu bestätigen.',
      player: {
        id: player._id,
        username: player.username,
        email: player.email,
        isVerified: player.isVerified,
      }
    });
  } catch (error) {
    console.error('Fehler bei der Registrierung:', error);
    return res.status(500).json({
      message: 'Interner Serverfehler bei der Registrierung.',
      error: error.message
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
        message: 'Ungültige Anmeldedaten.'
      });
    }

    // Passwort verifizieren
    const isMatch = await player.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        message: 'Ungültige Anmeldedaten.'
      });
    }

    // E-Mail-Verifizierung prüfen
    if (!player.isVerified) {
      return res.status(403).json({
        message: 'Deine Bürger-ID wurde noch nicht bestätigt. Bitte überprüfe deine E-Mails.'
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
        email: player.email,
        isVerified: player.isVerified,
        hasBetaAccess: player.hasBetaAccess || false,
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

// E-Mail-Bestätigung verarbeiten
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    const player = await Player.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: Date.now() },
    });

    if (!player) {
      return res.status(400).json({
        message: 'Der Bestätigungslink ist ungültig oder bereits abgelaufen.',
      });
    }

    // Spieler freischalten & Token entwerten
    player.isVerified = true;
    player.verificationToken = undefined;
    player.verificationTokenExpires = undefined;
    await player.save();

    res.status(200).json({
      message: 'Bürger-ID erfolgreich verifiziert! Du kannst die Kuppel jetzt betreten.',
      username: player.username,
    });
  } catch (error) {
    res.status(500).json({ message: 'Serverfehler bei der Verifizierung.', error: error.message });
  }
};

// Beta-Code einlösen
export const redeemBetaCode = async (req, res) => {
  try {
    const { code } = req.body;
    const playerId = req.player.id || req.player._id; // Aus authMiddleware (JWT)

    if (!code) {
      return res.status(400).json({ message: 'Bitte gib einen Beta-Code ein.' });
    }

    const cleanCode = code.trim().toUpperCase();

    // Prüfen, ob Spieler bereits freigeschaltet ist
    if (req.player.hasBetaAccess) {
      return res.status(200).json({
        message: 'Du hast bereits autorisierten Beta-Zugang.',
        player: req.player,
      });
    }

    // 1. Atomare Prüfung & Entwertung (Schutz vor doppelter Einlösung / Race Condition)
    const betaDoc = await BetaCode.findOneAndUpdate(
      { code: cleanCode, isUsed: false },
      {
        $set: {
          isUsed: true,
          usedBy: playerId,
          usedAt: new Date(),
        },
      },
      { new: true }
    );

    if (!betaDoc) {
      return res.status(400).json({
        message: 'Dieser Beta-Code ist ungültig oder wurde bereits von einem anderen Bürger eingelöst.',
      });
    }

    // 2. Spieler freischalten
    const updatedPlayer = await Player.findByIdAndUpdate(
      playerId,
      {
        $set: {
          hasBetaAccess: true,
        },
      },
      { new: true }
    ).select('-password');

    res.status(200).json({
      message: 'Autorisierung erfolgreich! Die Schotten zur Kuppel öffnen sich.',
      player: updatedPlayer,
    });
  } catch (error) {
    console.error('Fehler beim Einlösen des Beta-Codes:', error);
    res.status(500).json({ message: 'Serverfehler bei der Autorisierung.', error: error.message });
  }
};

export default {
  register,
  login,
  verifyEmail,
  redeemBetaCode
};
