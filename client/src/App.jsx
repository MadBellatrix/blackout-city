import { useEffect, useMemo, useRef, useState } from "react";
import "./index.css";

import BuildingCard from "./components/BuildingCard";
import ResourceBar from "./components/ResourceBar";
import { BUILDINGS } from "./utils/gameBalance";
import {
  canAfford,
  formatNumber,
  getAirCapacity,
  getAirConsumption,
  getOutputPerWorker,
  getUpgradeCost,
  subtractCost,
} from "./utils/gameLogic";
import {
  getUserId,
  loadPlayerState,
  savePlayerState,
} from "./api/playerApi";

export default function App() {
  const [userId] = useState(() => getUserId());
  const [saveStatus, setSaveStatus] = useState({ source: "init", lastSaved: null });
  const [offlineNotice, setOfflineNotice] = useState(null);
  const isLoadedRef = useRef(false);

  // Initialer React-State für die Ressourcen
  const [resources, setResources] = useState({
    fragments: 100,
    knowledge: 0,
    credits: 0,
  });

  // State für die Gebäude-Level
  const [buildingLevels, setBuildingLevels] = useState({
    fragmentsCollector: 0,
    dataNode: 0,
    airPurifier: 0,
  });

  // 1. Spielstand beim Start laden (Phase 2: Persistenz)
  useEffect(() => {
    let isCancelled = false;

    async function initGame() {
      const result = await loadPlayerState(userId);
      if (isCancelled) return;

      const savedPlayer = result.player;
      let initResources = savedPlayer.resources || { fragments: 100, knowledge: 0, credits: 0 };
      const initBuildings = savedPlayer.buildings || { fragmentsCollector: 0, dataNode: 0, airPurifier: 0 };

      // Offline-Progression berechnen (maximal 8 Stunden / 28800 Sekunden)
      if (result.offlineSeconds > 5) {
        const cappedSeconds = Math.min(result.offlineSeconds, 8 * 3600);
        const fragmentsRate = getOutputPerWorker("fragmentsCollector", initBuildings.fragmentsCollector ?? 0);
        const knowledgeRate = getOutputPerWorker("dataNode", initBuildings.dataNode ?? 0);

        const gainedFragments = cappedSeconds * fragmentsRate;
        const gainedKnowledge = cappedSeconds * knowledgeRate;

        initResources = {
          ...initResources,
          fragments: (initResources.fragments ?? 0) + gainedFragments,
          knowledge: (initResources.knowledge ?? 0) + gainedKnowledge,
        };

        const minutes = Math.floor(cappedSeconds / 60);
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        const timeString = hours > 0 ? `${hours}h ${remainingMinutes}m` : `${minutes}m`;

        setOfflineNotice({
          duration: timeString,
          fragments: gainedFragments,
          knowledge: gainedKnowledge,
        });
      }

      setResources(initResources);
      setBuildingLevels({
        fragmentsCollector: initBuildings.fragmentsCollector ?? 0,
        dataNode: initBuildings.dataNode ?? 0,
        airPurifier: initBuildings.airPurifier ?? 0,
      });

      setSaveStatus({
        source: result.source,
        lastSaved: new Date(),
      });

      isLoadedRef.current = true;
    }

    initGame();

    return () => {
      isCancelled = true;
    };
  }, [userId]);

  // Produktion pro Sekunde berechnen
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

  // 2. Game Loop (jede Sekunde / 1000ms)
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

  // 3. Autosave alle 15 Sekunden (Phase 2: Persistenz)
  useEffect(() => {
    const saveTimer = window.setInterval(async () => {
      if (!isLoadedRef.current) return;
      const res = await savePlayerState(userId, {
        resources,
        buildings: buildingLevels,
      });
      setSaveStatus({
        source: res.source,
        lastSaved: new Date(),
      });
    }, 15000);

    return () => window.clearInterval(saveTimer);
  }, [userId, resources, buildingLevels]);

  const airCapacity = getAirCapacity(buildingLevels.airPurifier);
  const usedAir =
    getAirConsumption("fragmentsCollector", buildingLevels.fragmentsCollector) +
    getAirConsumption("dataNode", buildingLevels.dataNode);

  const handleUpgrade = async (buildingId) => {
    const currentLevel = buildingLevels[buildingId];
    const cost = getUpgradeCost(buildingId, currentLevel);

    if (!canAfford(resources, cost)) {
      return;
    }

    const nextResources = subtractCost(resources, cost);
    const nextBuildingLevels = {
      ...buildingLevels,
      [buildingId]: buildingLevels[buildingId] + 1,
    };

    setResources(nextResources);
    setBuildingLevels(nextBuildingLevels);

    // Direkt nach dem Upgrade speichern
    const res = await savePlayerState(userId, {
      resources: nextResources,
      buildings: nextBuildingLevels,
    });
    setSaveStatus({
      source: res.source,
      lastSaved: new Date(),
    });
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

        {offlineNotice && (
          <div
            className="offline-banner"
            style={{
              backgroundColor: "rgba(16, 37, 35, 0.95)",
              border: "1px solid rgba(197, 233, 138, 0.4)",
              borderRadius: "12px",
              padding: "14px 18px",
              marginBottom: "20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              boxShadow: "0 8px 24px rgba(0, 0, 0, 0.35)",
            }}
          >
            <div>
              <span style={{ color: "#c5e98a", fontWeight: "700", fontSize: "0.88rem" }}>
                ⚡ Willkommen zurück, Kommandant!
              </span>
              <p style={{ margin: "4px 0 0", color: "#a9c0bb", fontSize: "0.82rem" }}>
                Während deiner Abwesenheit ({offlineNotice.duration}) wurden{" "}
                <strong style={{ color: "#edf8f4" }}>+{formatNumber(offlineNotice.fragments, 1)} Fragmente</strong> und{" "}
                <strong style={{ color: "#edf8f4" }}>+{formatNumber(offlineNotice.knowledge, 1)} Wissen</strong> geborgen.
              </p>
            </div>
            <button
              onClick={() => setOfflineNotice(null)}
              style={{
                background: "rgba(255, 255, 255, 0.1)",
                border: "none",
                borderRadius: "6px",
                color: "#edf8f4",
                padding: "6px 12px",
                cursor: "pointer",
                fontSize: "0.78rem",
              }}
              type="button"
            >
              OK
            </button>
          </div>
        )}

        <section className="status-panel">
          <div>
            <span className="status-panel__label">SYSTEMSTATUS</span>
            <h2>Kuppelsektor aktiv</h2>
            <p>
              Die Stationen laufen autonom im 1-Sekunden-Takt. Speicherstatus:{" "}
              <strong style={{ color: saveStatus.source === "mongodb" ? "#86efac" : "#67e8f9" }}>
                {saveStatus.source === "mongodb" ? "MongoDB Atlas / Online" : "Lokaler Speicher"}
              </strong>
              {saveStatus.lastSaved && (
                <span> (Zuletzt gespeichert: {saveStatus.lastSaved.toLocaleTimeString("de-DE")})</span>
              )}
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