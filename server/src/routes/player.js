import express from 'express';
import mongoose from 'mongoose';
import Player from '../models/Player.js';

const router = express.Router();

// Fallback In-Memory Speicher für Entwicklung ohne laufende MongoDB
const inMemoryPlayers = new Map();

const getInitialPlayerData = (userId) => ({
  userId,
  resources: {
    fragments: 100,
    knowledge: 0,
    credits: 0
  },
  buildings: {
    fragmentsCollector: 0,
    dataNode: 0,
    airPurifier: 0,
    museum: 0
  },
  lastSaveTime: new Date(),
  createdAt: new Date(),
  updatedAt: new Date()
});

// Spielerstand laden (oder initial anlegen, falls noch nicht existent)
router.get('/player/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: 'userId ist erforderlich' });
    }

    const isDbConnected = mongoose.connection.readyState === 1;
    let player = null;

    if (isDbConnected) {
      player = await Player.findOne({ userId });
      if (!player) {
        player = new Player(getInitialPlayerData(userId));
        await player.save();
      }
    } else {
      if (!inMemoryPlayers.has(userId)) {
        inMemoryPlayers.set(userId, getInitialPlayerData(userId));
      }
      player = inMemoryPlayers.get(userId);
    }

    const now = new Date();
    const lastSave = player.lastSaveTime ? new Date(player.lastSaveTime) : now;
    const offlineSeconds = Math.max(0, Math.floor((now.getTime() - lastSave.getTime()) / 1000));

    res.json({
      player,
      offlineSeconds,
      storage: isDbConnected ? 'mongodb' : 'memory'
    });
  } catch (error) {
    console.error('Fehler beim Laden des Spielers:', error);
    res.status(500).json({ error: 'Interner Serverfehler', details: error.message });
  }
});

// Spielstand speichern
router.post('/player/:userId/save', async (req, res) => {
  try {
    const { userId } = req.params;
    const { resources, buildings } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId ist erforderlich' });
    }

    const isDbConnected = mongoose.connection.readyState === 1;
    const now = new Date();

    if (isDbConnected) {
      const updatedPlayer = await Player.findOneAndUpdate(
        { userId },
        {
          $set: {
            ...(resources && { resources }),
            ...(buildings && { buildings }),
            lastSaveTime: now
          }
        },
        { new: true, upsert: true }
      );

      return res.json({
        success: true,
        player: updatedPlayer,
        storage: 'mongodb'
      });
    }

    // In-Memory Fallback
    const existing = inMemoryPlayers.get(userId) || getInitialPlayerData(userId);
    const updated = {
      ...existing,
      resources: resources || existing.resources,
      buildings: buildings || existing.buildings,
      lastSaveTime: now,
      updatedAt: now
    };
    inMemoryPlayers.set(userId, updated);

    res.json({
      success: true,
      player: updated,
      storage: 'memory'
    });
  } catch (error) {
    console.error('Fehler beim Speichern des Spielers:', error);
    res.status(500).json({ error: 'Interner Serverfehler', details: error.message });
  }
});

// Spielstand zurücksetzen
router.post('/player/:userId/reset', async (req, res) => {
  try {
    const { userId } = req.params;
    const isDbConnected = mongoose.connection.readyState === 1;
    const initialData = getInitialPlayerData(userId);

    if (isDbConnected) {
      const resetPlayer = await Player.findOneAndUpdate(
        { userId },
        { $set: initialData },
        { new: true, upsert: true }
      );
      return res.json({ success: true, player: resetPlayer, storage: 'mongodb' });
    }

    inMemoryPlayers.set(userId, initialData);
    res.json({ success: true, player: initialData, storage: 'memory' });
  } catch (error) {
    console.error('Fehler beim Zurücksetzen des Spielers:', error);
    res.status(500).json({ error: 'Interner Serverfehler', details: error.message });
  }
});

export default router;
