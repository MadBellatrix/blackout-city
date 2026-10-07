import express from 'express';
import Player from '../models/Player.js';

const router = express.Router();

// Neuen Spieler erstellen oder existierenden laden
router.post('/player', async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId ist erforderlich' });
    }

    // Spieler suchen oder erstellen
    let player = await Player.findOne({ userId });

    if (!player) {
      player = new Player({ userId });
      await player.save();
      console.log(`Neuer Spieler erstellt: ${userId}`);
    }

    res.json({ player, message: 'Spieler geladen' });
  } catch (error) {
    console.error('Fehler beim Laden des Spielers:', error);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
});

// Spielerstand laden
router.get('/player/:userId', async (req, res) => {
  try {
    const player = await Player.findOne({ userId: req.params.userId });

    if (!player) {
      return res.status(404).json({ error: 'Spieler nicht gefunden' });
    }

    res.json({ player });
  } catch (error) {
    console.error('Fehler beim Laden des Spielers:', error);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
});

// Gebäude-Upgrade
router.post('/player/:userId/upgrade', async (req, res) => {
  try {
    const { userId } = req.params;
    const { building, level } = req.body;

    const player = await Player.findOne({ userId });

    if (!player) {
      return res.status(404).json({ error: 'Spieler nicht gefunden' });
    }

    // Hier später: Kosten prüfen, Ressourcen abziehen, Level erhöhen
    // Fürs MVP nur ein Placeholder
    console.log(`Upgrade-Anfrage: ${building} auf Level ${level} für ${userId}`);

    res.json({ 
      message: 'Upgrade erfolgreich (Placeholder)',
      player 
    });
  } catch (error) {
    console.error('Fehler beim Upgrade:', error);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
});

export default router;
