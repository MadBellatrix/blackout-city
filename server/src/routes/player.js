import express from 'express';
import mongoose from 'mongoose';
import Player from '../models/Player.js';

const router = express.Router();

// Fallback In-Memory Speicher für Entwicklung ohne laufende MongoDB
const inMemoryPlayers = new Map();

const getInitialPlayerData = (identifier) => ({
  username: identifier,
  password: 'defaultPassword123',
  resources: {
    fragments: 100,
    knowledge: 0,
    credits: 0
  },
  buildings: {
    fragmentsCollector: { level: 0 },
    dataNode: { level: 0 },
    airPurifier: { level: 0 },
    museum: { level: 0 }
  },
  workers: {
    activeWorkers: 0
  },
  lastActive: new Date(),
  createdAt: new Date(),
  updatedAt: new Date()
});

// Hilfsfunktion zum Finden eines Spielers anhand von ID oder Username
const findPlayer = async (identifier) => {
  const isObjectId = mongoose.Types.ObjectId.isValid(identifier);
  if (isObjectId) {
    const byId = await Player.findById(identifier);
    if (byId) return byId;
  }
  return Player.findOne({ username: identifier });
};

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
      player = await findPlayer(userId);
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
    const lastSave = player.lastActive || player.lastSaveTime ? new Date(player.lastActive || player.lastSaveTime) : now;
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
      let player = await findPlayer(userId);

      if (!player) {
        player = new Player({
          ...getInitialPlayerData(userId),
          ...(resources && { resources }),
          ...(buildings && { buildings }),
          lastActive: now
        });
      } else {
        if (resources) player.resources = resources;
        if (buildings) player.buildings = buildings;
        player.lastActive = now;
      }

      await player.save();

      return res.json({
        success: true,
        player,
        storage: 'mongodb'
      });
    }

    // In-Memory Fallback
    const existing = inMemoryPlayers.get(userId) || getInitialPlayerData(userId);
    const updated = {
      ...existing,
      resources: resources || existing.resources,
      buildings: buildings || existing.buildings,
      lastActive: now,
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
      let player = await findPlayer(userId);
      if (!player) {
        player = new Player(initialData);
      } else {
        player.resources = initialData.resources;
        player.buildings = initialData.buildings;
        player.workers = initialData.workers;
        player.lastActive = new Date();
      }
      await player.save();
      return res.json({ success: true, player, storage: 'mongodb' });
    }

    inMemoryPlayers.set(userId, initialData);
    res.json({ success: true, player: initialData, storage: 'memory' });
  } catch (error) {
    console.error('Fehler beim Zurücksetzen des Spielers:', error);
    res.status(500).json({ error: 'Interner Serverfehler', details: error.message });
  }
});

export default router;
