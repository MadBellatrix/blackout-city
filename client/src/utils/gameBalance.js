export const BUILDINGS = {
  fragmentsCollector: {
    id: "fragmentsCollector",
    name: "Fragmentsammler",
    icon: "🤖",
    description: "Bergungsroboter sammeln verwertbare Fragmente aus den Ruinen.",
    resource: "fragments",
    workerType: "robots",
    baseOutput: 0.2,
    outputIncreasePerLevel: 0.1,
    baseCost: {
      fragments: 50,
    },
  },

  dataNode: {
    id: "dataNode",
    name: "Datenknoten",
    icon: "💾",
    description: "Hacker entschlüsseln Wissen aus den Netzwerken der alten Welt.",
    resource: "knowledge",
    workerType: "hackers",
    baseOutput: 2,
    outputIncreasePerLevel: 1,
    baseCost: {
      fragments: 75,
      knowledge: 0,
    },
  },

  airPurifier: {
    id: "airPurifier",
    name: "Luftreiniger",
    icon: "🌬️",
    description: "Reinigt die Luft in der Kuppel und schafft Platz für Arbeitskräfte.",
    baseCost: {
      fragments: 100,
    },
  },

  museum: {
    id: "museum",
    name: "Museum der Wächter",
    icon: "🏛️",
    description: "Nimmt später Artefakte und besondere Daten entgegen.",
    baseCost: {
      fragments: 150,
      knowledge: 50,
    },
  },
};

export const GAME_CONFIG = {
  startingResources: {
    fragments: 100,
    knowledge: 0,
    credits: 0,
  },

  startingBuildings: {
    fragmentsCollector: 0,
    dataNode: 0,
    airPurifier: 0,
    museum: 0,
  },

  air: {
    baseCapacity: 10,
    capacityPerLevel: 10,
  },

  productionTickMs: 1000,
  upgradeCostMultiplier: 2,
};