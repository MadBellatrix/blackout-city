export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div>
        <strong>Blackout City</strong>
        <span>Aufbau, Überleben und verlorenes Wissen.</span>
      </div>

      <p>© {currentYear} Blackout City · Früher Entwicklungsprototyp</p>
    </footer>
  );
}