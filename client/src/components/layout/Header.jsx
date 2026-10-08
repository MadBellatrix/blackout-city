export default function Header({ currentPage, onNavigate }) {
  const isLandingPage = currentPage === "landing";

  return (
    <header className="site-header">
      <button
        className="site-logo"
        type="button"
        onClick={() => onNavigate("landing")}
        aria-label="Zur Startseite von Blackout City"
      >
        <span className="site-logo__mark">◈</span>

        <span>
          <strong>BLACKOUT</strong>
          <small>CITY</small>
        </span>
      </button>

      <nav className="site-navigation" aria-label="Hauptnavigation">
        <button
          className={isLandingPage ? "nav-link nav-link--active" : "nav-link"}
          type="button"
          onClick={() => onNavigate("landing")}
        >
          Start
        </button>

        <a className="nav-link" href="#world">
          Die Welt
        </a>

        <a className="nav-link" href="#systems">
          Systeme
        </a>

        <button
          className="nav-button"
          type="button"
          onClick={() => onNavigate("game")}
        >
          Prototyp
        </button>
      </nav>
    </header>
  );
}