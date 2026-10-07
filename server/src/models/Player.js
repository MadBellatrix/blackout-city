import mongoose from 'mongoose';

const playerSchema = new mongoose.Schema({
  // Eindeutige Spieler-ID (kann später durch Auth ersetzt werden)
  userId: {
    type: String,
    required: true,
    unique: true
  },

  // Ressourcen
  resources: {
    fragments: { type: Number, default: 0 },
    knowledge: { type: Number, default: 0 },
    credits: { type: Number, default: 0 },
    airCapacity: { type: Number, default: 10 }
  },

  // Gebäude-Level
  buildings: {
    fragmentsCollector: { type: Number, default: 0 },
    dataNode: { type: Number, default: 0 },
    airPurifier: { type: Number, default: 0 },
    museum: { type: Number, default: 0 }
  },

  // Aktive Arbeiter
  workers: {
    activeRobots: { type: Number, default: 0 },
    activeHackers: { type: Number, default: 0 }
  },

  // Zeitpunkt des letzten Saves (für Offline-Progression)
  lastSaveTime: { type: Date, default: Date.now }
}, {
  timestamps: true  // Erstellt createdAt und updatedAt automatisch
});

// Index für schnelle Suche nach userId
playerSchema.index({ userId: 1 });

const Player = mongoose.model('Player', playerSchema);

export default Player;
