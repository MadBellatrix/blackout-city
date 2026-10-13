import { BUILDINGS, GAME_CONFIG } from "./gameBalance.js";

export const getUpgradeCost = (buildingId, currentLevel = 0) => {
  const building = BUILDINGS[buildingId];
  if (!building) return {};

  const nextLevel = currentLevel + 1;

  if (building.upgradeCosts) {
    const costResource =
      building.costResource ||
      (building.id === "dataNode" ? "knowledge" : "fragments");

    if (nextLevel >= building.upgradeCosts.length) {
      return { [costResource]: Infinity };
    }

    const costAmount = building.upgradeCosts[nextLevel];

    if (typeof costAmount === "object" && costAmount !== null) {
      return costAmount;
    }

    return { [costResource]: costAmount };
  }

  if (building.baseCost) {
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
  }

  return {};
};

export const getSlotsForLevel = (level) => 1 + level;

export const getAirCapacity = (airPurifierLevel = 0) => {
  const purifier = BUILDINGS.airPurifier;
  const capacityArray = purifier?.maxAirCapacity || purifier?.airCapacity;

  if (capacityArray && capacityArray[airPurifierLevel] !== undefined) {
    return capacityArray[airPurifierLevel];
  }

  if (capacityArray && capacityArray.length > 0) {
    return capacityArray[capacityArray.length - 1];
  }

  return (
    GAME_CONFIG.air.baseCapacity +
    airPurifierLevel * GAME_CONFIG.air.capacityPerLevel
  );
};

export const getAirRegeneration = (airPurifierLevel = 0) => {
  const purifier = BUILDINGS.airPurifier;
  const regenArray = purifier?.airRegeneration || purifier?.airRegenerationRate;

  if (regenArray && regenArray[airPurifierLevel] !== undefined) {
    return regenArray[airPurifierLevel];
  }

  if (regenArray && regenArray.length > 0) {
    return regenArray[regenArray.length - 1];
  }

  return 0;
};

export const getAirConsumption = (buildingId, level = 0) => {
  const building = BUILDINGS[buildingId];

  if (building?.airConsumption) {
    if (building.airConsumption[level] !== undefined) {
      return building.airConsumption[level];
    }
    return building.airConsumption[building.airConsumption.length - 1];
  }

  return 0;
};

export const getOutputPerWorker = (buildingId, level = 0) => {
  const building = BUILDINGS[buildingId];
  if (!building) return 0;

  if (building.productionRates) {
    if (building.productionRates[level] !== undefined) {
      return building.productionRates[level];
    }
    return building.productionRates[building.productionRates.length - 1];
  }

  return (
    (building.baseOutput ?? 0) +
    level * (building.outputIncreasePerLevel ?? 0)
  );
};

export const getProductionPerSecond = ({
  buildingId,
  level,
  activeWorkers,
}) => {
  const outputPerWorker = getOutputPerWorker(buildingId, level);

  return (activeWorkers ?? 0) * outputPerWorker;
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