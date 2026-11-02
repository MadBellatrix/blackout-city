import {
  canAfford,
  formatNumber,
  getResourceLabel,
  getUpgradeCost,
} from "../utils/gameLogic";

export default function BuildingCard({
  building,
  level = 0,
  resources,
  isSelected = false,
  onSelect,
  onUpgrade,
}) {
  const currentCost = building?.id ? getUpgradeCost(building.id, level) : {};

  const isMaxLevel =
    Object.values(currentCost).some((amount) => amount === Infinity) ||
    (building?.upgradeCosts &&
      level >= building.upgradeCosts.length - 1 &&
      Object.values(currentCost).length === 0);

  const affordable =
    !isMaxLevel && (resources ? canAfford(resources, currentCost) : false);

  const handleUpgradeClick = (e) => {
    e.stopPropagation();
    if (affordable && !isMaxLevel && onUpgrade) {
      onUpgrade();
    }
  };

  return (
    <div
      onClick={onSelect}
      className={`building-list-item ${isSelected ? "building-list-item--selected" : ""}`}
      style={{
        backgroundColor: isSelected ? "#132328" : "#0f172a",
        border: isSelected
          ? "2px solid #38bdf8"
          : "1px solid rgba(148, 163, 184, 0.16)",
        boxShadow: isSelected
          ? "0 0 18px rgba(56, 189, 248, 0.25), 0 8px 24px rgba(0,0,0,0.4)"
          : "0 6px 18px rgba(0, 0, 0, 0.35)",
        borderRadius: "14px",
        padding: "16px",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        transition: "all 180ms ease",
        position: "relative",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "10px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span
            style={{
              display: "grid",
              width: "36px",
              height: "36px",
              placeItems: "center",
              borderRadius: "10px",
              background: isSelected
                ? "rgba(56, 189, 248, 0.2)"
                : "rgba(104, 186, 165, 0.14)",
              fontSize: "1.2rem",
            }}
          >
            {building?.icon}
          </span>
          <div>
            <h3
              style={{
                margin: 0,
                fontSize: "1.05rem",
                color: "#ffffff",
                fontWeight: "700",
                letterSpacing: "-0.01em",
              }}
            >
              {building?.name}
            </h3>
            <span
              style={{
                fontSize: "0.78rem",
                color: isSelected ? "#7dd3fc" : "#94a3b8",
              }}
            >
              {isSelected ? "● Fokus aktiv" : "Klicken zum Auswählen"}
            </span>
          </div>
        </div>

        <span
          style={{
            padding: "4px 9px",
            border: isSelected
              ? "1px solid rgba(56, 189, 248, 0.5)"
              : "1px solid rgba(148, 163, 184, 0.2)",
            borderRadius: "999px",
            color: isSelected ? "#38bdf8" : "#cbd5e1",
            fontSize: "0.74rem",
            fontWeight: "700",
            backgroundColor: isSelected
              ? "rgba(56, 189, 248, 0.12)"
              : "rgba(15, 23, 42, 0.6)",
          }}
        >
          Level {level}
        </span>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
          paddingTop: "12px",
          borderTop: "1px solid rgba(148, 163, 184, 0.1)",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
          <span
            style={{
              color: "#94a3b8",
              fontSize: "0.72rem",
              fontWeight: "600",
            }}
          >
            Nächstes Upgrade:
          </span>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
            {isMaxLevel ? (
              <span
                style={{
                  padding: "3px 7px",
                  borderRadius: "5px",
                  color: "#94a3b8",
                  backgroundColor: "rgba(51, 65, 85, 0.35)",
                  fontSize: "0.75rem",
                  fontStyle: "italic",
                }}
              >
                Max. Stufe
              </span>
            ) : Object.keys(currentCost).length > 0 ? (
              Object.entries(currentCost).map(([resource, amount]) => (
                <span
                  key={resource}
                  style={{
                    padding: "3px 7px",
                    borderRadius: "5px",
                    color: "#f1f5f9",
                    backgroundColor: "rgba(30, 41, 59, 0.75)",
                    border: "1px solid rgba(148, 163, 184, 0.2)",
                    fontSize: "0.76rem",
                    fontWeight: "600",
                  }}
                >
                  {formatNumber(amount, 0)} {getResourceLabel(resource)}
                </span>
              ))
            ) : (
              <span
                style={{
                  padding: "3px 7px",
                  borderRadius: "5px",
                  color: "#86efac",
                  backgroundColor: "rgba(34, 197, 94, 0.12)",
                  fontSize: "0.75rem",
                  fontWeight: "600",
                }}
              >
                Kostenlos
              </span>
            )}
          </div>
        </div>

        <button
          className="upgrade-button"
          disabled={!affordable || isMaxLevel}
          onClick={handleUpgradeClick}
          style={getButtonStyle(affordable, isMaxLevel)}
          type="button"
        >
          {isMaxLevel ? "Max. Level" : "Upgrade"}
        </button>
      </div>
    </div>
  );
}

const getButtonStyle = (affordable, isMaxLevel) => {
  if (isMaxLevel) {
    return {
      padding: "8px 14px",
      border: "1px solid rgba(148, 163, 184, 0.2)",
      borderRadius: "8px",
      color: "#64748b",
      backgroundColor: "#1e293b",
      fontWeight: "700",
      fontSize: "0.82rem",
      cursor: "not-allowed",
      transition: "all 160ms ease",
      whiteSpace: "nowrap",
    };
  }

  if (!affordable) {
    return {
      padding: "8px 14px",
      border: "1px solid rgba(148, 163, 184, 0.2)",
      borderRadius: "8px",
      color: "#64748b",
      backgroundColor: "#1e293b",
      fontWeight: "700",
      fontSize: "0.82rem",
      cursor: "not-allowed",
      transition: "all 160ms ease",
      whiteSpace: "nowrap",
    };
  }

  return {
    padding: "8px 14px",
    border: "none",
    borderRadius: "8px",
    color: "#052e16",
    background: "linear-gradient(135deg, #22c55e, #eab308)",
    fontWeight: "800",
    fontSize: "0.82rem",
    cursor: "pointer",
    boxShadow: "0 4px 14px rgba(34, 197, 94, 0.35)",
    transition: "all 160ms ease",
    whiteSpace: "nowrap",
  };
};
