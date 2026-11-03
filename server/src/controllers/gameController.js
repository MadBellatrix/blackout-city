// Spielstand des authentifizierten Spielers abrufen
export const getGameState = async (req, res) => {
  try {
    const player = req.player;

    return res.status(200).json({
      username: player.username,
      resources: player.resources,
      buildings: player.buildings,
      workers: player.workers,
      lastActive: player.lastActive
    });
  } catch (error) {
    console.error('Fehler beim Abrufen des Spielstands:', error);
    return res.status(500).json({
      error: 'Interner Serverfehler beim Abrufen des Spielstands',
      details: error.message
    });
  }
};

// Spielstand des authentifizierten Spielers speichern
export const saveGameState = async (req, res) => {
  try {
    const player = req.player;
    const { resources, buildings, workers } = req.body;

    if (resources) {
      player.resources = {
        ...player.resources.toObject(),
        ...resources
      };
    }

    if (buildings) {
      player.buildings = {
        ...player.buildings.toObject(),
        ...buildings
      };
    }

    if (workers) {
      player.workers = {
        ...player.workers.toObject(),
        ...workers
      };
    }

    player.lastActive = Date.now();

    await player.save();

    return res.status(200).json({
      message: 'Spielstand erfolgreich gespeichert',
      gameState: {
        username: player.username,
        resources: player.resources,
        buildings: player.buildings,
        workers: player.workers,
        lastActive: player.lastActive
      }
    });
  } catch (error) {
    console.error('Fehler beim Speichern des Spielstands:', error);
    return res.status(500).json({
      error: 'Interner Serverfehler beim Speichern des Spielstands',
      details: error.message
    });
  }
};

export default {
  getGameState,
  saveGameState
};
