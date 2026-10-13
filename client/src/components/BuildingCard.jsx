import {
  canAfford,
  formatNumber,
  getAirCapacity,
  getAirRegeneration,
  getOutputPerWorker,
  getResourceLabel,
  getUpgradeCost,
} from "../utils/gameLogic";

const getBuildingOutput = (building, level) => {
  if (!building) return "";

  if (building.id === "fragmentsCollector") {
    const rate = getOutputPerWorker("fragmentsCollector", level);
    return `${formatNumber(rate, 2)} Frag./Sek.`;
  }

  if (building.id === "dataNode") {
    const rate = getOutputPerWorker("dataNode", level);
    return `${formatNumber(rate, 2)} KB/Sek.`;
  }

  if (building.id === "airPurifier") {
    const capacity = getAirCapacity(level);
    const regen = getAirRegeneration(level);
    return `${capacity} Kapazität (+${formatNumber(regen, 1)} Luft/Sek.)`;
  }

  if (building.productionRates) {
    const rate = building.productionRates[level] ?? 0;
    return `${formatNumber(rate, 2)}/Sek.`;
  }

  return "Bereit";
};

export default function BuildingCard({
  building,
  level = 0,
  output,
  upgradeCost,
  resources,
  canAfford: canAffordProp,
  onUpgrade,
  details = [],
  children,
}) {
  const currentCost =
    upgradeCost || (building?.id ? getUpgradeCost(building.id, level) : {});

  const isMaxLevel =
    Object.values(currentCost).some((amount) => amount === Infinity) ||
    (building?.upgradeCosts && level >= building.upgradeCosts.length - 1 && Object.values(currentCost).length === 0);

  const affordable =
    !isMaxLevel &&
    (canAffordProp ?? (resources ? canAfford(resources, currentCost) : false));

  const currentOutput = output || getBuildingOutput(building, level);

  return (
    <article className="building-card" style={styles.card}>
      <div className="building-card__header" style={styles.header}>
        <div style={styles.titleGroup}>
          {building?.icon && (
            <span className="building-card__icon" style={styles.icon}>
              {building.icon}
            </span>
          )}
          <h2 style={styles.name}>{building?.name}</h2>
        </div>

        <span className="level-badge" style={styles.levelBadge}>
          Level {level}
        </span>
      </div>

      {building?.description && (
        <p className="building-card__description" style={styles.description}>
          {building.description}
        </p>
      )}

      <div className="building-card__details" style={styles.details}>
        <div className="building-card__detail" style={styles.detailRow}>
          <span>Aktueller Output:</span>
          <strong style={styles.outputValue}>{currentOutput}</strong>
        </div>

        {details.map((detail) => (
          <div
            className="building-card__detail"
            key={detail.label}
            style={styles.detailRow}
          >
            <span>{detail.label}</span>
            <strong>{detail.value}</strong>
          </div>
        ))}
      </div>

      {children}

      <div className="building-card__footer" style={styles.footer}>
        <div className="upgrade-cost" style={styles.upgradeCost}>
          <span style={styles.costLabel}>Nächstes Upgrade:</span>
          <div style={styles.costTags}>
            {isMaxLevel ? (
              <span style={styles.maxBadge}>Maximalstufe erreicht</span>
            ) : Object.keys(currentCost).length > 0 ? (
              Object.entries(currentCost).map(([resource, amount]) => (
                <span key={resource} style={styles.costTag}>
                  {formatNumber(amount, 0)} {getResourceLabel(resource)}
                </span>
              ))
            ) : (
              <span style={styles.costTag}>Kostenlos</span>
            )}
          </div>
        </div>

        <button
          className="upgrade-button"
          disabled={!affordable || isMaxLevel}
          onClick={onUpgrade}
          style={getButtonStyle(affordable, isMaxLevel)}
          type="button"
        >
          {isMaxLevel ? "Max. Level" : "Upgrade"}
        </button>
      </div>
    </article>
  );
}

const getButtonStyle = (affordable, isMaxLevel) => {
  if (isMaxLevel) {
    return {
      padding: "10px 18px",
      border: "1px solid rgba(148, 163, 184, 0.2)",
      borderRadius: "9px",
      color: "#64748b",
      backgroundColor: "#182422",
      fontWeight: "800",
      cursor: "not-allowed",
      transition: "all 160ms ease",
    };
  }

  if (!affordable) {
    return {
      padding: "10px 18px",
      border: "1px solid rgba(239, 68, 68, 0.35)",
      borderRadius: "9px",
      color: "#f87171",
      backgroundColor: "rgba(239, 68, 68, 0.12)",
      fontWeight: "800",
      cursor: "not-allowed",
      transition: "all 160ms ease",
    };
  }

  return {
    padding: "10px 18px",
    border: "none",
    borderRadius: "9px",
    color: "#0a2318",
    background: "linear-gradient(135deg, #a3e635, #eab308)",
    fontWeight: "800",
    cursor: "pointer",
    boxShadow: "0 4px 14px rgba(163, 230, 53, 0.35)",
    transition: "all 160ms ease",
  };
};

const styles = {
  card: {
    backgroundColor: "#0d1b1a",
    border: "1px solid rgba(168, 213, 202, 0.16)",
    borderRadius: "16px",
    padding: "22px",
    display: "flex",
    flexDirection: "column",
    minHeight: "330px",
    color: "#edf8f4",
    boxShadow: "0 16px 36px rgba(0, 0, 0, 0.3)",
  },
  header: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "12px",
    marginBottom: "12px",
  },
  titleGroup: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  name: {
    margin: 0,
    fontSize: "1.25rem",
    color: "#ffffff",
    fontWeight: "700",
  },
  icon: {
    display: "grid",
    width: "38px",
    height: "38px",
    placeItems: "center",
    borderRadius: "10px",
    background: "rgba(104, 186, 165, 0.14)",
    fontSize: "1.25rem",
  },
  levelBadge: {
    padding: "5px 10px",
    border: "1px solid rgba(150, 220, 202, 0.25)",
    borderRadius: "999px",
    color: "#b8e4d9",
    fontSize: "0.75rem",
    fontWeight: "700",
    backgroundColor: "rgba(16, 37, 35, 0.6)",
  },
  description: {
    minHeight: "44px",
    color: "#abc1bc",
    lineHeight: 1.5,
    fontSize: "0.88rem",
    margin: "0 0 14px 0",
  },
  details: {
    display: "grid",
    gap: "8px",
    margin: "8px 0 16px",
  },
  detailRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    padding: "8px 0",
    borderBottom: "1px solid rgba(168, 213, 202, 0.09)",
    color: "#a9c0bb",
    fontSize: "0.9rem",
  },
  outputValue: {
    color: "#86efac",
    textAlign: "right",
    fontWeight: "700",
  },
  footer: {
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: "16px",
    paddingTop: "16px",
    marginTop: "auto",
    borderTop: "1px solid rgba(168, 213, 202, 0.12)",
  },
  upgradeCost: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  costLabel: {
    color: "#92aaa5",
    fontSize: "0.76rem",
    fontWeight: "600",
  },
  costTags: {
    display: "flex",
    flexWrap: "wrap",
    gap: "6px",
    marginTop: "4px",
  },
  costTag: {
    padding: "4px 8px",
    borderRadius: "6px",
    color: "#edf8f4",
    backgroundColor: "rgba(92, 153, 138, 0.2)",
    border: "1px solid rgba(168, 213, 202, 0.15)",
    fontSize: "0.78rem",
    fontWeight: "600",
  },
  maxBadge: {
    padding: "4px 8px",
    borderRadius: "6px",
    color: "#94a3b8",
    backgroundColor: "rgba(51, 65, 85, 0.3)",
    fontSize: "0.78rem",
    fontStyle: "italic",
  },
};