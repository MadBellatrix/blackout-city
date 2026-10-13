export default function LandingPage({ onStartPrototype }) {
  return (
    <main className="landing-page">
      <section className="hero-section">
        <div className="hero-section__content">
          <p className="hero-section__eyebrow">
            SEKTOR 01 · KUPPEL-PROTOKOLL AKTIV
          </p>

          <h1>
            Die Welt erstickt.
            <span> Deine Kuppel bleibt.</span>
          </h1>

          <p className="hero-section__description">
            Baue eine Zuflucht in einer verseuchten Welt auf. Bergungsroboter
            suchen Fragmente, Datenknoten stellen verlorenes Wissen wieder her
            und deine Luftkapazität entscheidet darüber, wie viele Menschen
            und Systeme du versorgen kannst.
          </p>

          <div className="hero-section__actions">
            <button
              className="primary-button"
              type="button"
              onClick={onStartPrototype}
            >
              Prototyp starten
              <span aria-hidden="true">→</span>
            </button>

            <a className="secondary-button" href="#systems">
              Systeme entdecken
            </a>
          </div>

          <div className="hero-section__meta">
            <span>Browser-Idle-Game</span>
            <span>Postapokalypse</span>
            <span>Früher Prototyp</span>
          </div>
        </div>

        <div className="hero-section__visual" aria-hidden="true">
          <div className="signal-grid" />
          <div className="dome">
            <div className="dome__glow" />
            <div className="dome__city">
              <span />
              <span />
              <span />
              <span />
              <span />
            </div>
          </div>
          <span className="hero-coordinate hero-coordinate--one">
            52.3724° N
          </span>
          <span className="hero-coordinate hero-coordinate--two">
            ATMOSPHÄRE: KRITISCH
          </span>
        </div>
      </section>

      <section className="world-section" id="world">
        <div className="section-heading">
          <p>Die Ausgangslage</p>
          <h2>Nach dem Blackout ist Wissen eine Währung.</h2>
        </div>

        <div className="world-section__text">
          <p>
            Die Oberfläche ist von Schadstoffen, Ruinen und den Resten einer
            untergegangenen Zivilisation geprägt. Innerhalb deiner Kuppel
            beginnt der Wiederaufbau – klein, langsam und immer abhängig von
            sauberer Luft.
          </p>

          <p>
            Die Wächter der alten Welt sammeln Artefakte und entschlüsselte
            Daten. Was du bergen und wiederherstellen kannst, wird zur
            Grundlage deiner neuen Stadt.
          </p>
        </div>
      </section>

      <section className="systems-section" id="systems">
        <div className="section-heading">
          <p>Kernsysteme</p>
          <h2>Vier Systeme. Eine Überlebens-Loop.</h2>
        </div>

        <div className="systems-grid">
          <article className="system-card">
            <span className="system-card__icon">🤖</span>
            <h3>Fragmente bergen</h3>
            <p>
              Schicke Roboter in Ruinen und Schrottfelder, um Baumaterial für
              deine Basis zu gewinnen.
            </p>
          </article>

          <article className="system-card">
            <span className="system-card__icon">💾</span>
            <h3>Wissen entschlüsseln</h3>
            <p>
              Hacker rekonstruieren Daten, Blaupausen und vergessene
              Technologien der alten Welt.
            </p>
          </article>

          <article className="system-card">
            <span className="system-card__icon">🌬️</span>
            <h3>Luft sichern</h3>
            <p>
              Der Luftreiniger begrenzt, wie viele Arbeitskräfte deine Kuppel
              gleichzeitig versorgen kann.
            </p>
          </article>

          <article className="system-card">
            <span className="system-card__icon">🏛️</span>
            <h3>Wissen bewahren</h3>
            <p>
              Das Museum der Wächter vergütet besondere Funde und verwandelt
              sie in Credits.
            </p>
          </article>
        </div>
      </section>

      <section className="prototype-section">
        <div>
          <p>Entwicklungsstand</p>
          <h2>Der Wiederaufbau hat begonnen.</h2>
        </div>

        <div>
          <p>
            Die aktuelle Version ist ein spielbarer Kern-Prototyp. Ressourcen,
            Gebäude-Upgrades und Luftkapazität werden laufend erweitert und
            getestet.
          </p>

          <button
            className="primary-button"
            type="button"
            onClick={onStartPrototype}
          >
            Zur Kuppel
            <span aria-hidden="true">→</span>
          </button>
        </div>
      </section>
    </main>
  );
}