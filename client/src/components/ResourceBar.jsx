import { formatNumber } from "../utils/gameLogic";

const resourceItems = [
  { key: "fragments", icon: "🔩", label: "Fragmente" },
  { key: "knowledge", icon: "📚", label: "Wissen" },
  { key: "credits", icon: "◈", label: "Credits" },
];

export default function ResourceBar({
  resources,
  production,
  activeWorkers,
  airCapacity,
}) {
  return (
    <header className="resource-bar">
      <div className="resource-bar__brand">
        <span className="resource-bar__eyebrow">KUPPELSEKTOR 01</span>
        <h1>Blackout City</h1>
      </div>

      <div className="resource-bar__items">
        {resourceItems.map(({ key, icon, label }) => (
          <div className="resource-card" key={key}>
            <span className="resource-card__label">
              {icon} {label}
            </span>

            <strong>{formatNumber(resources[key], 2)}</strong>

            {production[key] > 0 && (
              <small>+{formatNumber(production[key], 2)}/Sek.</small>
            )}
          </div>
        ))}

        <div className="resource-card resource-card--air">
          <span className="resource-card__label">🌬️ Luftkapazität</span>
          <strong>
            {activeWorkers} / {airCapacity}
          </strong>
          <small>aktive Arbeitskräfte</small>
        </div>
      </div>
    </header>
  );
}