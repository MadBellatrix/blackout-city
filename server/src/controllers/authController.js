import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import Player from '../models/Player.js';
import BetaCode from '../models/BetaCode.js';
import { sendVerificationEmail } from '../services/emailService.js';

// Hilfsfunktion: Token generieren (7 Tage Gültigkeit)
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// 1. Kontaktanfrage an Discord-Webhook senden
export const requestBetaAccess = async (req, res) => {
  try {
    const { nickname, discordTag, message } = req.body;
    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

    if (!nickname || !discordTag) {
      return res.status(400).json({ message: 'Bitte Nickname und Discord-Tag angeben.' });
    }

    if (!webhookUrl) {
      console.log('[DEV] Kein DISCORD_WEBHOOK_URL gesetzt. Anfrage:', { nickname, discordTag, message });
      return res.status(200).json({ message: 'Anfrage im Entwicklungsmodus empfangen.' });
    }

    const discordPayload = {
      username: 'Blackout-City Schleusentor',
      embeds: [
        {
          title: '🚨 NEUE BETA-ZUGANGSANFRAGE',
          color: 0x06b6d4, // Cyan
          description: 'Ein Überlebender bittet um Autorisierung für die Kuppel.',
          fields: [
            { name: '👤 Bürger / Name', value: nickname, inline: true },
            { name: '💬 Discord-Kontakt', value: discordTag, inline: true },
            { name: '📝 Nachricht / Motivation', value: message || 'Keine Nachricht hinterlassen.' },
          ],
          footer: { text: 'Nutze /betacode im Admin-Kanal, um einen Einmal-Code zu generieren.' },
          timestamp: new Date().toISOString(),
        },
      ],
    };

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(discordPayload),
    });

    if (!response.ok) {
      throw new Error('Discord-Webhook konnte nicht erreicht werden.');
    }

    res.status(200).json({ message: 'Deine Anfrage wurde erfolgreich an den Discord-Kanal übermittelt!' });
  } catch (error) {
    console.error('Fehler bei Webhook-Übertragung:', error);
    res.status(500).json({ message: 'Übertragungsfehler.', error: error.message });
  }
};

// 2. Registrierung: Atomare Prüfung des Einmal-Beta-Codes
export const register = async (req, res) => {
  try {
    const { username, email, password, betaCode } = req.body;

    if (!username || !email || !password || !betaCode) {
      return res.status(400).json({ message: 'Benutzername, E-Mail, Passwort und Beta-Code sind erforderlich.' });
    }

    const cleanBetaCode = betaCode.trim().toUpperCase();

    // ATOMARE PRÜFUNG & ENTWERTUNG: Nur gültig, wenn noch NICHT benutzt
    const codeDoc = await BetaCode.findOneAndUpdate(
      { code: cleanBetaCode, isUsed: false },
      {
        $set: {
          isUsed: true,
          usedAt: new Date(),
        },
      },
      { new: true }
    );

    if (!codeDoc) {
      return res.status(400).json({
        message: 'Der angegebene Beta-Code ist ungültig oder wurde bereits verwendet.',
      });
    }

    // Prüfen, ob Benutzername oder E-Mail vergeben sind
    const existingPlayer = await Player.findOne({
      $or: [{ username: username.trim() }, { email: email.trim().toLowerCase() }],
    });

    if (existingPlayer) {
      // Rollback des Codes, falls Account schon existiert!
      await BetaCode.findByIdAndUpdate(codeDoc._id, { $set: { isUsed: false, usedAt: null } });
      return res.status(400).json({ message: 'Benutzername oder E-Mail-Adresse ist bereits vergeben.' });
    }

    // Token für E-Mail-Verifizierung erzeugen (24h Gültigkeit)
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const newPlayer = await Player.create({
      username: username.trim(),
      email: email.trim().toLowerCase(),
      password,
      hasBetaAccess: true,
      isVerified: false,
      verificationToken,
      verificationTokenExpires,
    });

    // Code mit Spieler verknüpfen
    codeDoc.usedBy = newPlayer._id;
    await codeDoc.save();

    // Verifizierungs-E-Mail über Resend senden (in try/catch gekapselt)
    try {
      await sendVerificationEmail({
        email: newPlayer.email,
        username: newPlayer.username,
        token: verificationToken,
      });
    } catch (mailError) {
      console.warn('Verifizierungs-E-Mail konnte nicht gesendet werden:', mailError.message);
    }

    res.status(201).json({
      message: 'Registrierung erfolgreich! Bitte bestätige deine Bürger-ID über den Link in deiner E-Mail.',
      player: {
        id: newPlayer._id,
        username: newPlayer.username,
        email: newPlayer.email,
        isVerified: newPlayer.isVerified,
        hasBetaAccess: newPlayer.hasBetaAccess,
      },
    });
  } catch (error) {
    console.error('Registrierungsfehler:', error);
    res.status(500).json({ message: 'Serverfehler bei der Registrierung.', error: error.message });
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
  requestBetaAccess,
  register,
  login,
  verifyEmail,
  redeemBetaCode
};
