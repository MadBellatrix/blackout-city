export const BUILDINGS = {
  fragmentsCollector: {
    id: "fragmentsCollector",
    name: "Fragmentsammler",
    icon: "🤖",
    description: "Bergungsroboter sammeln verwertbare Fragmente aus den Ruinen.",
    resource: "fragments",
    costResource: "fragments",
    workerType: "robots",
    upgradeCosts: [0, 50, 200, 600, 1500, 4000],
    productionRates: [0.2, 0.4, 0.6, 1.2, 2.0, 3.0],
    airConsumption: [1, 1, 2, 3, 4, 5],
  },

  dataNode: {
    id: "dataNode",
    name: "Datenknoten",
    icon: "💾",
    description: "Hacker entschlüsseln Wissen aus den Netzwerken der alten Welt.",
    resource: "knowledge",
    costResource: "knowledge",
    workerType: "hackers",
    upgradeCosts: [0, 100, 400, 1200, 3000, 8000],
    productionRates: [2, 4, 6, 12, 20, 30],
    airConsumption: [1, 1, 2, 3, 4, 5],
  },

  airPurifier: {
    id: "airPurifier",
    name: "Luftreiniger",
    icon: "🌬️",
    description: "Reinigt die Luft in der Kuppel und schafft Platz für Arbeitskräfte.",
    costResource: "fragments",
    upgradeCosts: [0, 100, 300, 800, 2000, 5000],
    maxAirCapacity: [10, 25, 50, 90, 150, 250],
    airCapacity: [10, 25, 50, 90, 150, 250],
    airRegeneration: [1, 1.5, 2.5, 4, 6, 9],
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