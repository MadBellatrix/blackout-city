import { BUILDINGS, GAME_CONFIG } from "./gameBalance";

export const getUpgradeCost = (buildingId, currentLevel) => {
  const building = BUILDINGS[buildingId];
  const nextLevel = currentLevel + 1;
  const multiplier = Math.pow(
    GAME_CONFIG.upgradeCostMultiplier,
    nextLevel - 1,
  );

  return Object.fromEntries(
    Object.entries(building.baseCost).map(([resource, baseCost]) => [
      resource,
      Math.ceil(baseCost * multiplier),
    ]),
  );
};

export const getSlotsForLevel = (level) => 1 + level;

export const getAirCapacity = (airPurifierLevel) =>
  GAME_CONFIG.air.baseCapacity +
  airPurifierLevel * GAME_CONFIG.air.capacityPerLevel;

export const getOutputPerWorker = (buildingId, level) => {
  const building = BUILDINGS[buildingId];

  return building.baseOutput + level * building.outputIncreasePerLevel;
};

export const getProductionPerSecond = ({
  buildingId,
  level,
  activeWorkers,
}) => {
  const outputPerWorker = getOutputPerWorker(buildingId, level);

  return activeWorkers * outputPerWorker;
};

export const getTotalActiveWorkers = (workers) =>
  workers.robots + workers.hackers;

export const canAfford = (resources, cost) =>
  Object.entries(cost).every(
    ([resource, amount]) => (resources[resource] ?? 0) >= amount,
  );

export const subtractCost = (resources, cost) => {
  const nextResources = { ...resources };

  for (const [resource, amount] of Object.entries(cost)) {
    nextResources[resource] -= amount;
  }

  return nextResources;
};

export const formatNumber = (value, maximumFractionDigits = 1) =>
  new Intl.NumberFormat("de-DE", {
    maximumFractionDigits,
  }).format(value);

export const getResourceLabel = (resource) => {
  const labels = {
    fragments: "Fragmente",
    knowledge: "Wissen",
    credits: "Credits",
  };

  return labels[resource] ?? resource;
};