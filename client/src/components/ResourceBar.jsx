import { formatNumber } from "../utils/gameLogic";

const resourceConfig = [
  { key: "fragments", icon: "🔩", label: "Fragmente" },
  { key: "knowledge", icon: "📚", label: "Wissen" },
  { key: "credits", icon: "◈", label: "Credits" },
];

export default function ResourceBar({
  resources = { fragments: 0, knowledge: 0, credits: 0 },
  production = {},
  usedAir = 0,
  activeWorkers,
  airCapacity = 0,
}) {
  const currentUsedAir = usedAir ?? activeWorkers ?? 0;

  return (
    <header className="resource-bar" style={styles.header}>
      <div className="resource-bar__brand" style={styles.brand}>
        <span className="resource-bar__eyebrow" style={styles.eyebrow}>
          KUPPELSEKTOR 01
        </span>
        <h1 style={styles.title}>Blackout City</h1>
      </div>

      <div className="resource-bar__items" style={styles.items}>
        {resourceConfig.map(({ key, icon, label }) => (
          <div className="resource-card" key={key} style={styles.card}>
            <span className="resource-card__label" style={styles.label}>
              {icon} {label}
            </span>
            <strong style={styles.value}>
              {formatNumber(resources[key] ?? 0, 2)}
            </strong>
            {production[key] > 0 && (
              <small style={styles.production}>
                +{formatNumber(production[key], 2)}/Sek.
              </small>
            )}
          </div>
        ))}

        <div
          className="resource-card resource-card--air"
          style={styles.airCard}
        >
          <span className="resource-card__label" style={styles.airLabel}>
            🌬️ Luftkapazität
          </span>
          <strong style={styles.airValue}>
            {currentUsedAir} / {airCapacity}
          </strong>
          <small style={styles.airSub}>
            Genutzt / Verfügbar
          </small>
        </div>
      </div>
    </header>
  );
}

const styles = {
  header: {
    display: "flex",
    gap: "24px",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "24px",
    flexWrap: "wrap",
  },
  brand: {
    display: "flex",
    flexDirection: "column",
  },
  eyebrow: {
    color: "#8ebcb2",
    fontSize: "0.72rem",
    fontWeight: "800",
    letterSpacing: "0.16em",
  },
  title: {
    margin: "4px 0 0",
    fontSize: "clamp(1.8rem, 3vw, 2.5rem)",
    letterSpacing: "-0.06em",
    color: "#ffffff",
  },
  items: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
    flex: 1,
    gap: "12px",
    maxWidth: "780px",
  },
  card: {
    backgroundColor: "#0d1b1a",
    border: "1px solid rgba(168, 213, 202, 0.16)",
    borderRadius: "12px",
    padding: "12px 14px",
    minHeight: "84px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.35)",
  },
  label: {
    color: "#9bb9b3",
    fontSize: "0.76rem",
    fontWeight: "600",
    display: "block",
  },
  value: {
    display: "block",
    margin: "4px 0 2px",
    color: "#ffffff",
    fontSize: "1.2rem",
    fontWeight: "800",
  },
  production: {
    display: "block",
    color: "#75c7af",
    fontSize: "0.72rem",
    fontWeight: "600",
  },
  airCard: {
    backgroundColor: "#06151f",
    border: "1px solid rgba(56, 189, 248, 0.45)",
    borderRadius: "12px",
    padding: "12px 14px",
    minHeight: "84px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    boxShadow: "0 0 20px rgba(56, 189, 248, 0.12)",
  },
  airLabel: {
    color: "#38bdf8",
    fontSize: "0.76rem",
    fontWeight: "700",
    display: "block",
    letterSpacing: "0.02em",
  },
  airValue: {
    display: "block",
    margin: "4px 0 2px",
    color: "#e0f2fe",
    fontSize: "1.2rem",
    fontWeight: "800",
    textShadow: "0 0 10px rgba(56, 189, 248, 0.35)",
  },
  airSub: {
    display: "block",
    color: "#7dd3fc",
    fontSize: "0.72rem",
  },
};