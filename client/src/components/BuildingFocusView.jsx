import {
  formatNumber,
  getAirCapacity,
  getAirConsumption,
  getAirRegeneration,
  getOutputPerWorker,
} from "../utils/gameLogic";

import fragmentsammlerImg from "../assets/fragmentsammler_robots.png";
import datenknotenImg from "../assets/datenknoten_hacker.png";
import luftreinigerImg from "../assets/luftreiniger_kuppel.png";

const BUILDING_IMAGES = {
  fragmentsCollector: fragmentsammlerImg,
  dataNode: datenknotenImg,
  airPurifier: luftreinigerImg,
};

const BUILDING_ATMOSPHERE = {
  fragmentsCollector: {
    statusText: "Autonome Bergungseinheiten durchkämmen die Ruinensektoren.",
    statusColor: "#4ade80",
    unitType: "Roboter-Scouts aktiv",
  },
  dataNode: {
    statusText: "Kryptografische Entschlüsselung alter Reliktnetzwerke läuft stabil.",
    statusColor: "#38bdf8",
    unitType: "Hacker-Terminals online",
  },
  airPurifier: {
    statusText: "Atmosphärische Filtermatrizen sichern den Sauerstoffdruck der Kuppel.",
    statusColor: "#67e8f9",
    unitType: "Filterkreislauf aktiv",
  },
};

export default function BuildingFocusView({ building, level: rawLevel = 0 }) {
  if (!building) return null;

  const level = typeof rawLevel === "object" && rawLevel !== null ? (rawLevel.level ?? 0) : Number(rawLevel) || 0;

  const imageSrc = BUILDING_IMAGES[building.id] || fragmentsammlerImg;
  const atmosphere = BUILDING_ATMOSPHERE[building.id] || {
    statusText: "Systeme arbeiten innerhalb der vorgegebenen Parameter.",
    statusColor: "#38bdf8",
    unitType: "Sektor aktiv",
  };

  let outputLabel = "";
  let outputDetail = "";

  if (building.id === "fragmentsCollector") {
    const rate = getOutputPerWorker("fragmentsCollector", level);
    const airCons = getAirConsumption("fragmentsCollector", level);
    outputLabel = `${formatNumber(rate, 2)} Fragmente / Sek.`;
    outputDetail = `Luftverbrauch: ${airCons} Einheit${airCons === 1 ? "" : "en"}/Sek.`;
  } else if (building.id === "dataNode") {
    const rate = getOutputPerWorker("dataNode", level);
    const airCons = getAirConsumption("dataNode", level);
    outputLabel = `${formatNumber(rate, 2)} KB Wissen / Sek.`;
    outputDetail = `Luftverbrauch: ${airCons} Einheit${airCons === 1 ? "" : "en"}/Sek.`;
  } else if (building.id === "airPurifier") {
    const capacity = getAirCapacity(level);
    const regen = getAirRegeneration(level);
    outputLabel = `${capacity} Kuppel-Luftkapazität`;
    outputDetail = `Regeneration: +${formatNumber(regen, 1)} Luft / Sek.`;
  }

  return (
    <section
      className="building-focus-panel"
      style={{
        backgroundColor: "#0b1320",
        border: "1px solid #1e293b",
        borderRadius: "18px",
        padding: "24px",
        boxShadow: "0 0 28px rgba(56, 189, 248, 0.12), 0 16px 36px rgba(0, 0, 0, 0.5)",
        display: "flex",
        flexDirection: "column",
        gap: "20px",
      }}
    >
      {/* 1:1 Bildbereich mit Cyan Glow & abgerundeten Ecken */}
      <div
        style={{
          width: "100%",
          aspectRatio: "1 / 1",
          borderRadius: "14px",
          border: "1px solid #1e293b",
          boxShadow:
            "0 0 24px rgba(56, 189, 248, 0.2), inset 0 0 18px rgba(0, 0, 0, 0.6)",
          overflow: "hidden",
          position: "relative",
          backgroundColor: "#070d18",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <img
          src={imageSrc}
          alt={building.name}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
            transition: "transform 300ms ease",
          }}
        />

        <div
          style={{
            position: "absolute",
            top: "14px",
            right: "14px",
            padding: "6px 12px",
            backgroundColor: "rgba(11, 19, 32, 0.85)",
            backdropFilter: "blur(8px)",
            border: "1px solid rgba(56, 189, 248, 0.4)",
            borderRadius: "999px",
            color: "#e0f2fe",
            fontSize: "0.8rem",
            fontWeight: "700",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
          }}
        >
          <span
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              backgroundColor: atmosphere.statusColor,
              boxShadow: `0 0 8px ${atmosphere.statusColor}`,
            }}
          />
          {atmosphere.unitType}
        </div>
      </div>

      {/* Gebäudedetails unter dem Bild */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "10px",
          }}
        >
          <div>
            <span
              style={{
                color: "#38bdf8",
                fontSize: "0.72rem",
                fontWeight: "800",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
              }}
            >
              Fokus-Sektor
            </span>
            <h2
              style={{
                margin: "4px 0 0",
                fontSize: "1.6rem",
                color: "#ffffff",
                fontWeight: "800",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <span>{building.icon}</span>
              <span>{building.name}</span>
            </h2>
          </div>

          <span
            style={{
              padding: "6px 14px",
              backgroundColor: "rgba(56, 189, 248, 0.12)",
              border: "1px solid rgba(56, 189, 248, 0.35)",
              borderRadius: "999px",
              color: "#38bdf8",
              fontSize: "0.88rem",
              fontWeight: "700",
            }}
          >
            Level {level}
          </span>
        </div>

        <p
          style={{
            margin: 0,
            color: "#94a3b8",
            fontSize: "0.92rem",
            lineHeight: 1.5,
          }}
        >
          {building.description}
        </p>

        {/* Output & Statusanzeige */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "12px",
            marginTop: "6px",
          }}
        >
          <div
            style={{
              backgroundColor: "rgba(15, 23, 42, 0.7)",
              border: "1px solid rgba(148, 163, 184, 0.15)",
              borderRadius: "12px",
              padding: "12px 14px",
            }}
          >
            <span
              style={{
                color: "#94a3b8",
                fontSize: "0.74rem",
                fontWeight: "600",
                display: "block",
              }}
            >
              Aktueller Output
            </span>
            <strong
              style={{
                color: "#86efac",
                fontSize: "1.1rem",
                fontWeight: "700",
                display: "block",
                margin: "4px 0 2px",
              }}
            >
              {outputLabel}
            </strong>
            <small style={{ color: "#cbd5e1", fontSize: "0.75rem" }}>
              {outputDetail}
            </small>
          </div>

          <div
            style={{
              backgroundColor: "rgba(15, 23, 42, 0.7)",
              border: "1px solid rgba(148, 163, 184, 0.15)",
              borderRadius: "12px",
              padding: "12px 14px",
            }}
          >
            <span
              style={{
                color: "#94a3b8",
                fontSize: "0.74rem",
                fontWeight: "600",
                display: "block",
              }}
            >
              Systemstatus
            </span>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                margin: "6px 0 2px",
              }}
            >
              <span
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  backgroundColor: atmosphere.statusColor,
                  boxShadow: `0 0 8px ${atmosphere.statusColor}`,
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  color: "#e2e8f0",
                  fontSize: "0.85rem",
                  fontWeight: "600",
                  lineHeight: 1.3,
                }}
              >
                {atmosphere.statusText}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
