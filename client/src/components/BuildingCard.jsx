import {
  canAfford,
  formatNumber,
  getResourceLabel,
} from "../utils/gameLogic";

export default function BuildingCard({
  building,
  level,
  details = [],
  upgradeCost,
  resources,
  onUpgrade,
  children,
}) {
  const affordable = canAfford(resources, upgradeCost);

  return (
    <article className="building-card">
      <div className="building-card__header">
        <div>
          <span className="building-card__icon">{building.icon}</span>
          <h2>{building.name}</h2>
        </div>

        <span className="level-badge">Level {level}</span>
      </div>

      <p className="building-card__description">{building.description}</p>

      <div className="building-card__details">
        {details.map((detail) => (
          <div className="building-card__detail" key={detail.label}>
            <span>{detail.label}</span>
            <strong>{detail.value}</strong>
          </div>
        ))}
      </div>

      {children}

      <div className="building-card__footer">
        <div className="upgrade-cost">
          <span>Nächstes Upgrade:</span>
          <div>
            {Object.entries(upgradeCost).map(([resource, amount]) => (
              <span key={resource}>
                {formatNumber(amount, 0)} {getResourceLabel(resource)}
              </span>
            ))}
          </div>
        </div>

        <button
          className="upgrade-button"
          disabled={!affordable}
          onClick={onUpgrade}
          type="button"
        >
          Upgrade
        </button>
      </div>
    </article>
  );
}