import mongoose from 'mongoose';

const playerSchema = new mongoose.Schema({
  // Eindeutige Spieler-ID
  userId: {
    type: String,
    required: true,
    unique: true
  },

  // Ressourcen
  resources: {
    fragments: { type: Number, default: 100 },
    knowledge: { type: Number, default: 0 },
    credits: { type: Number, default: 0 }
  },

  // Gebäude-Level
  buildings: {
    fragmentsCollector: { type: Number, default: 0 },
    dataNode: { type: Number, default: 0 },
    airPurifier: { type: Number, default: 0 },
    museum: { type: Number, default: 0 }
  },

  // Zeitpunkt des letzten Saves (für Offline-Progression)
  lastSaveTime: { type: Date, default: Date.now }
}, {
  timestamps: true
});

const Player = mongoose.model('Player', playerSchema);

export default Player;
