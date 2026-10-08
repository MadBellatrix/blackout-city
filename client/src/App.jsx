import { useEffect, useMemo, useState } from "react";
import "./index.css";

import BuildingCard from "./components/BuildingCard";
import ResourceBar from "./components/ResourceBar";
import { BUILDINGS, GAME_CONFIG } from "./utils/gameBalance";
import {
  canAfford,
  formatNumber,
  getAirCapacity,
  getOutputPerWorker,
  getProductionPerSecond,
  getSlotsForLevel,
  getTotalActiveWorkers,
  getUpgradeCost,
  subtractCost,
} from "./utils/gameLogic";

export default function App() {
  const [resources, setResources] = useState(
    GAME_CONFIG.startingResources,
  );

  const [buildings, setBuildings] = useState(
    GAME_CONFIG.startingBuildings,
  );

  const [workers, setWorkers] = useState({
    robots: 1,
    hackers: 1,
  });

  const airCapacity = getAirCapacity(buildings.airPurifier);
  const activeWorkers = getTotalActiveWorkers(workers);

  const production = useMemo(() => {
    const fragmentsPerSecond = getProductionPerSecond({
      buildingId: "fragmentsCollector",
      level: buildings.fragmentsCollector,
      activeWorkers: workers.robots,
    });

    const knowledgePerSecond = getProductionPerSecond({
      buildingId: "dataNode",
      level: buildings.dataNode,
      activeWorkers: workers.hackers,
    });

    return {
      fragments: fragmentsPerSecond,
      knowledge: knowledgePerSecond,
      credits: 0,
    };
  }, [buildings, workers]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setResources((currentResources) => ({
        ...currentResources,
        fragments: currentResources.fragments + production.fragments,
        knowledge: currentResources.knowledge + production.knowledge,
      }));
    }, GAME_CONFIG.productionTickMs);

    return () => window.clearInterval(intervalId);
  }, [production]);

  const upgradeBuilding = (buildingId) => {
    const currentLevel = buildings[buildingId];
    const cost = getUpgradeCost(buildingId, currentLevel);

    if (!canAfford(resources, cost)) {
      return;
    }

    setResources((currentResources) => subtractCost(currentResources, cost));

    setBuildings((currentBuildings) => ({
      ...currentBuildings,
      [buildingId]: currentBuildings[buildingId] + 1,
    }));
  };

  const changeWorkers = (workerType, change) => {
    const buildingId =
      workerType === "robots" ? "fragmentsCollector" : "dataNode";

    const maxSlots = getSlotsForLevel(buildings[buildingId]);

    setWorkers((currentWorkers) => {
      const currentValue = currentWorkers[workerType];
      const nextValue = currentValue + change;

      if (nextValue < 0 || nextValue > maxSlots) {
        return currentWorkers;
      }

      const nextWorkers = {
        ...currentWorkers,
        [workerType]: nextValue,
      };

      if (getTotalActiveWorkers(nextWorkers) > airCapacity) {
        return currentWorkers;
      }

      return nextWorkers;
    });
  };

  const fragmentsLevel = buildings.fragmentsCollector;
  const dataNodeLevel = buildings.dataNode;
  const airPurifierLevel = buildings.airPurifier;
  const museumLevel = buildings.museum;

  return (
    <main className="app-shell">
      <ResourceBar
        resources={resources}
        production={production}
        activeWorkers={activeWorkers}
        airCapacity={airCapacity}
      />

      <section className="status-panel">
        <div>
          <span className="status-panel__label">Systemstatus</span>
          <h2>Kuppel stabil</h2>
          <p>
            Die Stationen arbeiten autonom. Nutze Fragmente und Wissen,
            um den Sektor weiter auszubauen.
          </p>
        </div>

        <div className="status-panel__capacity">
          <span>Arbeitskräfte</span>
          <strong>
            {activeWorkers} / {airCapacity}
          </strong>
          <div className="capacity-bar" aria-hidden="true">
            <span
              style={{
                width: `${Math.min(
                  (activeWorkers / airCapacity) * 100,
                  100,
                )}%`,
              }}
            />
          </div>
        </div>
      </section>

      <section className="building-grid">
        <BuildingCard
          building={BUILDINGS.fragmentsCollector}
          level={fragmentsLevel}
          resources={resources}
          upgradeCost={getUpgradeCost(
            "fragmentsCollector",
            fragmentsLevel,
          )}
          onUpgrade={() => upgradeBuilding("fragmentsCollector")}
          details={[
            {
              label: "Verfügbare Roboter-Slots",
              value: getSlotsForLevel(fragmentsLevel),
            },
            {
              label: "Aktive Roboter",
              value: workers.robots,
            },
            {
              label: "Output pro Roboter",
              value: `${formatNumber(
                getOutputPerWorker("fragmentsCollector", fragmentsLevel),
                2,
              )} Frag./Sek.`,
            },
            {
              label: "Gesamtproduktion",
              value: `${formatNumber(production.fragments, 2)} Frag./Sek.`,
            },
          ]}
        >
          <WorkerControl
            label="Roboter"
            value={workers.robots}
            max={getSlotsForLevel(fragmentsLevel)}
            onDecrease={() => changeWorkers("robots", -1)}
            onIncrease={() => changeWorkers("robots", 1)}
            disableIncrease={
              workers.robots >= getSlotsForLevel(fragmentsLevel) ||
              activeWorkers >= airCapacity
            }
          />
        </BuildingCard>

        <BuildingCard
          building={BUILDINGS.dataNode}
          level={dataNodeLevel}
          resources={resources}
          upgradeCost={getUpgradeCost("dataNode", dataNodeLevel)}
          onUpgrade={() => upgradeBuilding("dataNode")}
          details={[
            {
              label: "Verfügbare Hacker-Slots",
              value: getSlotsForLevel(dataNodeLevel),
            },
            {
              label: "Aktive Hacker",
              value: workers.hackers,
            },
            {
              label: "Output pro Hacker",
              value: `${formatNumber(
                getOutputPerWorker("dataNode", dataNodeLevel),
                2,
              )} KB/Sek.`,
            },
            {
              label: "Gesamtproduktion",
              value: `${formatNumber(production.knowledge, 2)} KB/Sek.`,
            },
          ]}
        >
          <WorkerControl
            label="Hacker"
            value={workers.hackers}
            max={getSlotsForLevel(dataNodeLevel)}
            onDecrease={() => changeWorkers("hackers", -1)}
            onIncrease={() => changeWorkers("hackers", 1)}
            disableIncrease={
              workers.hackers >= getSlotsForLevel(dataNodeLevel) ||
              activeWorkers >= airCapacity
            }
          />
        </BuildingCard>

        <BuildingCard
          building={BUILDINGS.airPurifier}
          level={airPurifierLevel}
          resources={resources}
          upgradeCost={getUpgradeCost("airPurifier", airPurifierLevel)}
          onUpgrade={() => upgradeBuilding("airPurifier")}
          details={[
            {
              label: "Luftkapazität",
              value: `${airCapacity} Arbeitskräfte`,
            },
            {
              label: "Freie Kapazität",
              value: `${airCapacity - activeWorkers} Arbeitskräfte`,
            },
            {
              label: "Kapazität nächstes Level",
              value: `${getAirCapacity(
                airPurifierLevel + 1,
              )} Arbeitskräfte`,
            },
          ]}
        />

        <BuildingCard
          building={BUILDINGS.museum}
          level={museumLevel}
          resources={resources}
          upgradeCost={getUpgradeCost("museum", museumLevel)}
          onUpgrade={() => upgradeBuilding("museum")}
          details={[
            {
              label: "Einreich-Slots",
              value: 3 + museumLevel * 3,
            },
            {
              label: "Credit-Multiplikator",
              value: `${formatNumber(1 + museumLevel * 0.1, 1)}×`,
            },
            {
              label: "MVP-Status",
              value: "Artefakte folgen",
            },
          ]}
        />
      </section>

      <section className="prototype-note">
        <h2>Prototyp-Status</h2>
        <p>
          Dieser Spielstand existiert aktuell nur im Browser. Als Nächstes
          verbinden wir ihn mit der Node-/MongoDB-API, damit Fortschritt
          gespeichert werden kann.
        </p>
      </section>
    </main>
  );
}

function WorkerControl({
  label,
  value,
  max,
  onDecrease,
  onIncrease,
  disableIncrease,
}) {
  return (
    <div className="worker-control">
      <span>{label} aktiv</span>

      <div className="worker-control__buttons">
        <button type="button" onClick={onDecrease} disabled={value === 0}>
          −
        </button>

        <strong>
          {value} / {max}
        </strong>

        <button type="button" onClick={onIncrease} disabled={disableIncrease}>
          +
        </button>
      </div>
    </div>
  );
}