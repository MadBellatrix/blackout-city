import { useEffect, useMemo, useRef, useState } from "react";
import "./index.css";

import BuildingCard from "./components/BuildingCard";
import BuildingFocusView from "./components/BuildingFocusView";
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

const BUILDING_KEYS = ["fragmentsCollector", "dataNode", "airPurifier"];

// Hilfsfunktion: Konvertiert Zahl oder { level: number } sicher in eine Zahl
const extractLevel = (val) => {
  if (typeof val === "number") return val;
  if (val && typeof val.level === "number") return val.level;
  return 0;
};

export default function App() {
  const [userId] = useState(() => getUserId());
  const [saveStatus, setSaveStatus] = useState({ source: "init", lastSaved: null });
  const [offlineNotice, setOfflineNotice] = useState(null);
  const [selectedBuilding, setSelectedBuilding] = useState("fragmentsCollector");
  const isLoadedRef = useRef(false);

  // Initialer React-State für die Ressourcen
  const [resources, setResources] = useState({
    fragments: 100,
    knowledge: 0,
    credits: 0,
  });

  // State für die Gebäude-Level (immer flache Zahlen: 0, 1, 2...)
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
      let initResources = savedPlayer?.resources || { fragments: 100, knowledge: 0, credits: 0 };
      const rawBuildings = savedPlayer?.buildings || {};

      // Sicherstellen, dass Level immer eine Zahl ist, selbst wenn das Backend { level: X } liefert
      const initBuildings = {
        fragmentsCollector: extractLevel(rawBuildings.fragmentsCollector),
        dataNode: extractLevel(rawBuildings.dataNode),
        airPurifier: extractLevel(rawBuildings.airPurifier),
      };

      // Offline-Progression berechnen (maximal 8 Stunden / 28800 Sekunden)
      if (result.offlineSeconds > 5) {
        const cappedSeconds = Math.min(result.offlineSeconds, 8 * 3600);
        const fragmentsRate = getOutputPerWorker("fragmentsCollector", initBuildings.fragmentsCollector);
        const knowledgeRate = getOutputPerWorker("dataNode", initBuildings.dataNode);

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
      setBuildingLevels(initBuildings);

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
    const currentLevel = extractLevel(buildingLevels[buildingId]);
    const cost = getUpgradeCost(buildingId, currentLevel);

    if (!canAfford(resources, cost)) {
      return;
    }

    const nextResources = subtractCost(resources, cost);
    const nextBuildingLevels = {
      ...buildingLevels,
      [buildingId]: currentLevel + 1,
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

  const activeBuildingConfig = BUILDINGS[selectedBuilding] || BUILDINGS.fragmentsCollector;
  const activeBuildingLevel = extractLevel(buildingLevels[selectedBuilding]);

  return (
    <div className="site-shell" style={{ backgroundColor: "#071010", minHeight: "100vh" }}>
      <main className="game-page" style={{ maxWidth: "1280px", margin: "0 auto", padding: "20px 24px" }}>
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

        <section
          className="status-panel"
          style={{
            backgroundColor: "#0d1b1a",
            border: "1px solid rgba(168, 213, 202, 0.16)",
            borderRadius: "16px",
            padding: "18px 22px",
            marginBottom: "24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "20px",
          }}
        >
          <div>
            <span
              className="status-panel__label"
              style={{
                color: "#8ebcb2",
                fontSize: "0.72rem",
                fontWeight: "800",
                letterSpacing: "0.16em",
              }}
            >
              SYSTEMSTATUS
            </span>
            <h2 style={{ margin: "4px 0 2px", color: "#ffffff", fontSize: "1.3rem" }}>
              Kuppelsektor aktiv
            </h2>
            <p style={{ margin: 0, color: "#94a3b8", fontSize: "0.85rem" }}>
              Die Stationen laufen autonom im 1-Sekunden-Takt. Speicher:{" "}
              <strong style={{ color: saveStatus.source === "mongodb" ? "#86efac" : "#67e8f9" }}>
                {saveStatus.source === "mongodb" ? "MongoDB Online" : "Lokaler Browser-Speicher"}
              </strong>
              {saveStatus.lastSaved && (
                <span> (Zuletzt gespeichert: {saveStatus.lastSaved.toLocaleTimeString("de-DE")})</span>
              )}
            </p>
          </div>

          <div className="status-panel__capacity" style={{ minWidth: "220px" }}>
            <span style={{ color: "#9bb9b3", fontSize: "0.8rem", display: "block" }}>
              Luftauslastung der Kuppel
            </span>
            <strong style={{ display: "block", margin: "4px 0", fontSize: "1.35rem", color: "#e0f2fe" }}>
              {usedAir} / {airCapacity}
            </strong>
            <div
              className="capacity-bar"
              aria-hidden="true"
              style={{
                height: "9px",
                backgroundColor: "#071010",
                borderRadius: "999px",
                overflow: "hidden",
                border: "1px solid rgba(56, 189, 248, 0.2)",
              }}
            >
              <span
                style={{
                  display: "block",
                  height: "100%",
                  width: `${Math.min((usedAir / (airCapacity || 1)) * 100, 100)}%`,
                  background:
                    usedAir > airCapacity
                      ? "#ef4444"
                      : "linear-gradient(90deg, #38bdf8, #22c55e)",
                  transition: "width 200ms ease",
                }}
              />
            </div>
          </div>
        </section>

        {/* 2-Spalten Layout: Links/Mitte Fokus-Ansicht, Rechts Gebäude- & Upgrade-Leiste */}
        <div
          className="game-workspace-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(320px, 1.25fr) minmax(300px, 1fr)",
            gap: "24px",
            alignItems: "start",
          }}
        >
          {/* Spalte 1 (Mitte/Fokus): 1:1 Bild + Detailansicht */}
          <BuildingFocusView
            building={activeBuildingConfig}
            level={activeBuildingLevel}
          />

          {/* Spalte 2 (Rechts): Vertikale Gebäude- & Upgrade-Liste */}
          <section
            className="buildings-sidebar"
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "14px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                paddingBottom: "4px",
              }}
            >
              <span
                style={{
                  color: "#94a3b8",
                  fontSize: "0.78rem",
                  fontWeight: "700",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                Kuppel-Stationen
              </span>
              <span style={{ color: "#64748b", fontSize: "0.74rem" }}>
                3 Sektoren errichtet
              </span>
            </div>

            {BUILDING_KEYS.map((key) => (
              <BuildingCard
                key={key}
                building={BUILDINGS[key]}
                level={extractLevel(buildingLevels[key])}
                resources={resources}
                isSelected={selectedBuilding === key}
                onSelect={() => setSelectedBuilding(key)}
                onUpgrade={() => handleUpgrade(key)}
              />
            ))}
          </section>
        </div>
      </main>
    </div>
  );
}
