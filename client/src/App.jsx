import { useEffect, useMemo, useRef, useState } from "react";
import "./index.css";

import BuildingCard from "./components/BuildingCard";
import BuildingFocusView from "./components/BuildingFocusView";
import ResourceBar from "./components/ResourceBar";
import AuthModal from "./components/AuthModal";
import LandingPage from "./components/LandingPage";
import BetaGate from "./components/BetaGate";
import VerifyEmail from "./components/VerifyEmail";
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
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(
    () => window.location.pathname === "/verify-email" || new URLSearchParams(window.location.search).has("token")
  );
  const [userId, setUserId] = useState(() => getUserId());
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const stored = localStorage.getItem("blackout_player");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
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

  // 1. Spielstand beim Start laden: Nur wenn ein Benutzer eingeloggt ist UND Beta-Zugang hat
  useEffect(() => {
    if (!currentUser || !currentUser.hasBetaAccess) {
      isLoadedRef.current = false;
      return;
    }

    let isCancelled = false;

    async function initGame() {
      const targetId = currentUser?.username || currentUser?.id || userId;
      const result = await loadPlayerState(targetId);
      if (isCancelled) return;

      const savedPlayer = result.player;
      let initResources = savedPlayer?.resources || { fragments: 100, knowledge: 0, credits: 0 };
      const rawBuildings = savedPlayer?.buildings || {};

      // Sicherstellen, dass Level immer eine Zahl ist
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
  }, [userId, currentUser]);

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

  // 2. Game Loop (jede Sekunde / 1000ms): Nur aktiv, wenn angemeldet & mit Beta-Zugang
  useEffect(() => {
    if (!currentUser || !currentUser.hasBetaAccess) return;

    const timer = window.setInterval(() => {
      setResources((currentResources) => ({
        ...currentResources,
        fragments: currentResources.fragments + production.fragments,
        knowledge: currentResources.knowledge + production.knowledge,
        credits: currentResources.credits + production.credits,
      }));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [currentUser, production]);

  // 3. Autosave alle 15 Sekunden (Phase 2: Persistenz): Nur aktiv, wenn angemeldet & mit Beta-Zugang
  useEffect(() => {
    if (!currentUser || !currentUser.hasBetaAccess) return;

    const saveTimer = window.setInterval(async () => {
      if (!isLoadedRef.current) return;
      const targetId = currentUser?.username || currentUser?.id || userId;
      const res = await savePlayerState(targetId, {
        resources,
        buildings: buildingLevels,
      });
      setSaveStatus({
        source: res.source,
        lastSaved: new Date(),
      });
    }, 15000);

    return () => window.clearInterval(saveTimer);
  }, [currentUser, userId, resources, buildingLevels]);

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
    const targetId = currentUser?.username || currentUser?.id || userId;
    const res = await savePlayerState(targetId, {
      resources: nextResources,
      buildings: nextBuildingLevels,
    });
    setSaveStatus({
      source: res.source,
      lastSaved: new Date(),
    });
  };

  const handleAuthSuccess = (data) => {
    if (data.player) {
      setCurrentUser(data.player);
      if (data.player.username) {
        setUserId(data.player.username);
      }
      if (data.player.resources) {
        setResources(data.player.resources);
      }
      if (data.player.buildings) {
        setBuildingLevels({
          fragmentsCollector: extractLevel(data.player.buildings.fragmentsCollector),
          dataNode: extractLevel(data.player.buildings.dataNode),
          airPurifier: extractLevel(data.player.buildings.airPurifier),
        });
      }
    }
  };

  const handleLogout = async () => {
    // Vor dem Logout aktuellen Spielstand noch einmal sauber in MongoDB speichern
    if (currentUser) {
      const targetId = currentUser?.username || currentUser?.id || userId;
      try {
        await savePlayerState(targetId, {
          resources,
          buildings: buildingLevels,
        });
      } catch (err) {
        console.warn("Konnte Spielstand vor Logout nicht mehr senden:", err);
      }
    }

    localStorage.removeItem("blackout_token");
    localStorage.removeItem("blackout_player");
    setCurrentUser(null);
    setOfflineNotice(null);
    isLoadedRef.current = false;
    setResources({
      fragments: 100,
      knowledge: 0,
      credits: 0,
    });
    setBuildingLevels({
      fragmentsCollector: 0,
      dataNode: 0,
      airPurifier: 0,
    });
  };

  const handleBetaAccessGranted = (updatedPlayer) => {
    if (updatedPlayer) {
      setCurrentUser(updatedPlayer);
    } else {
      setCurrentUser((prev) => (prev ? { ...prev, hasBetaAccess: true } : null));
    }
  };

  const activeBuildingConfig = BUILDINGS[selectedBuilding] || BUILDINGS.fragmentsCollector;
  const activeBuildingLevel = extractLevel(buildingLevels[selectedBuilding]);

  // 1. Verifizierungs-Screen: Wenn Benutzer über den Bestätigungslink der E-Mail kommt
  if (isVerifyingEmail) {
    return (
      <VerifyEmail
        onBackToLanding={() => {
          setIsVerifyingEmail(false);
          window.history.replaceState({}, document.title, window.location.pathname);
        }}
      />
    );
  }

  // 2. Nicht eingeloggt: Zeige das 3-Wege-Tor (BetaGate) und das Login/Register-Modal
  if (!currentUser) {
    return (
      <>
        <BetaGate
          onOpenLogin={() => {
            setAuthMode('login');
            setIsAuthModalOpen(true);
          }}
          onOpenRegister={() => {
            setAuthMode('register');
            setIsAuthModalOpen(true);
          }}
        />
        <AuthModal
          isOpen={isAuthModalOpen}
          initialMode={authMode}
          onClose={() => setIsAuthModalOpen(false)}
          onAuthSuccess={handleAuthSuccess}
        />
      </>
    );
  }

  // 3. Berechtigter Bürger: Voller Zugriff auf die Kuppel und Spiel-Loop
  return (
    <>
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
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
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
              {currentUser ? (
                <span style={{ color: "#38bdf8", fontSize: "0.75rem", fontWeight: "600" }}>
                  👤 Angemeldet als: <strong>{currentUser.username}</strong>
                </span>
              ) : (
                <span style={{ color: "#94a3b8", fontSize: "0.75rem" }}>
                  Gast-Modus
                </span>
              )}
            </div>

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

          <div style={{ display: "flex", alignItems: "center", gap: "20px", flexWrap: "wrap" }}>
            <div className="status-panel__capacity" style={{ minWidth: "180px" }}>
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

            {/* Auth Buttons */}
            <div>
              {currentUser ? (
                <button
                  type="button"
                  onClick={handleLogout}
                  style={{
                    backgroundColor: "transparent",
                    border: "1px solid #334155",
                    color: "#94a3b8",
                    padding: "8px 14px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "0.82rem",
                    fontWeight: "600",
                    transition: "all 0.2s",
                  }}
                >
                  Abmelden
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsAuthModalOpen(true)}
                  style={{
                    backgroundColor: "rgba(6, 182, 212, 0.12)",
                    border: "1px solid #06b6d4",
                    color: "#06b6d4",
                    padding: "8px 16px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "0.84rem",
                    fontWeight: "700",
                    boxShadow: "0 0 12px rgba(6, 182, 212, 0.2)",
                    transition: "all 0.2s",
                  }}
                >
                  Login / Registrieren
                </button>
              )}
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

        {/* Modales Login/Register-Fenster */}
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onAuthSuccess={handleAuthSuccess}
        />
      </main>
    </div>
    </>
  );
}
