import { useEffect, useMemo, useState } from "react";
import "./index.css";

import BuildingCard from "./components/BuildingCard";
import ResourceBar from "./components/ResourceBar";
import { BUILDINGS } from "./utils/gameBalance";
import {
  canAfford,
  getAirCapacity,
  getAirConsumption,
  getOutputPerWorker,
  getUpgradeCost,
  subtractCost,
} from "./utils/gameLogic";

export default function App() {
  // Aufgabe 1: Initialer React-State für die Ressourcen
  const [resources, setResources] = useState({
    fragments: 100,
    knowledge: 0,
    credits: 0,
  });

  // Aufgabe 1: State für die Gebäude-Level
  const [buildingLevels, setBuildingLevels] = useState({
    fragmentsCollector: 0,
    dataNode: 0,
    airPurifier: 0,
  });

  // Produktion pro Sekunde anhand der Gebäudelevel berechnen
  const production = useMemo(() => {
    return {
      fragments: getOutputPerWorker(
        "fragmentsCollector",
        buildingLevels.fragmentsCollector,
      ),
      knowledge: getOutputPerWorker("dataNode", buildingLevels.dataNode),
      credits: 0,
    };
  }, [buildingLevels.fragmentsCollector, buildingLevels.dataNode]);

  // Aufgabe 1: Game Loop (läuft jede Sekunde / 1000ms)
  useEffect(() => {
    const timer = window.setInterval(() => {
      setResources((currentResources) => ({
        ...currentResources,
        fragments: currentResources.fragments + production.fragments,
        knowledge: currentResources.knowledge + production.knowledge,
        credits: currentResources.credits + production.credits,
      }));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [production]);

  const airCapacity = getAirCapacity(buildingLevels.airPurifier);
  const usedAir =
    getAirConsumption("fragmentsCollector", buildingLevels.fragmentsCollector) +
    getAirConsumption("dataNode", buildingLevels.dataNode);

  const handleUpgrade = (buildingId) => {
    const currentLevel = buildingLevels[buildingId];
    const cost = getUpgradeCost(buildingId, currentLevel);

    if (!canAfford(resources, cost)) {
      return;
    }

    setResources((currentResources) =>
      subtractCost(currentResources, cost),
    );

    setBuildingLevels((currentLevels) => ({
      ...currentLevels,
      [buildingId]: currentLevels[buildingId] + 1,
    }));
  };

  return (
    <div className="site-shell">
      <main className="game-page">
        <ResourceBar
          resources={resources}
          production={production}
          usedAir={usedAir}
          airCapacity={airCapacity}
        />

        <section className="status-panel">
          <div>
            <span className="status-panel__label">SYSTEMSTATUS</span>
            <h2>Kuppelsektor aktiv</h2>
            <p>
              Die Stationen laufen autonom im 1-Sekunden-Takt. Erweitere deine
              Gebäude, um die Ausbeute zu maximieren.
            </p>
          </div>

          <div className="status-panel__capacity">
            <span>Luftauslastung</span>
            <strong>
              {usedAir} / {airCapacity}
            </strong>
            <div className="capacity-bar" aria-hidden="true">
              <span
                style={{
                  width: `${Math.min(
                    (usedAir / (airCapacity || 1)) * 100,
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
            level={buildingLevels.fragmentsCollector}
            resources={resources}
            onUpgrade={() => handleUpgrade("fragmentsCollector")}
          />

          <BuildingCard
            building={BUILDINGS.dataNode}
            level={buildingLevels.dataNode}
            resources={resources}
            onUpgrade={() => handleUpgrade("dataNode")}
          />

          <BuildingCard
            building={BUILDINGS.airPurifier}
            level={buildingLevels.airPurifier}
            resources={resources}
            onUpgrade={() => handleUpgrade("airPurifier")}
          />
        </section>
      </main>
    </div>
  );
}