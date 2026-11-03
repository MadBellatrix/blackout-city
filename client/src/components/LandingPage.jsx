import React from 'react';
import gameTrailer from '../assets/GameTrailer.mp4';

export default function LandingPage({ onOpenAuth }) {
  return (
    <div style={styles.container}>
      {/* Header / Titel */}
      <header style={styles.header}>
        <div style={styles.badge}>SEKTOR 01 · KUPPEL-PROTOKOLL AKTIV</div>
        <h1 style={styles.title}>BLACKOUT-CITY</h1>
        <p style={styles.subtitle}>
          Überlebe unter der Kuppel. Verwalte Sauerstoff, sammle Fragmente und baue die Zivilisation wieder auf.
        </p>
      </header>

      {/* Trailer-Bereich */}
      <div style={styles.videoWrapper}>
        <video
          src={gameTrailer}
          autoPlay
          loop
          muted
          playsInline
          style={styles.video}
        />
        <div style={styles.videoOverlay} />
      </div>

      {/* Call to Action */}
      <div style={styles.ctaContainer}>
        <button
          type="button"
          onClick={onOpenAuth}
          style={styles.ctaButton}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 0 35px rgba(6, 182, 212, 0.6)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 0 25px rgba(6, 182, 212, 0.4)';
          }}
        >
          Kuppel betreten / Anmelden
          <span style={{ fontSize: '1.2rem', marginLeft: '6px' }}>→</span>
        </button>
        <p style={styles.ctaHint}>
          Melde dich als Kommandant an oder registriere dich, um deinen Kuppelsektor zu verwalten.
        </p>
      </div>

      {/* Info-Karten */}
      <div style={styles.featuresGrid}>
        <div style={styles.featureCard}>
          <span style={styles.featureIcon}>🤖</span>
          <h3 style={styles.featureTitle}>Bergungsroboter</h3>
          <p style={styles.featureDesc}>
            Durchkämme die Ruinen nach wertvollen Fragmenten der alten Welt.
          </p>
        </div>

        <div style={styles.featureCard}>
          <span style={styles.featureIcon}>💾</span>
          <h3 style={styles.featureTitle}>Datenknoten</h3>
          <p style={styles.featureDesc}>
            Entschlüssele verschlüsselte Archive und generiere technologisches Wissen.
          </p>
        </div>

        <div style={styles.featureCard}>
          <span style={styles.featureIcon}>🌬️</span>
          <h3 style={styles.featureTitle}>Luftreiniger</h3>
          <p style={styles.featureDesc}>
            Sichere die Sauerstoffversorgung, um Platz für mehr Arbeitskräfte zu schaffen.
          </p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '1080px',
    margin: '0 auto',
    padding: '40px 24px 60px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    color: '#edf8f4',
  },
  header: {
    textAlign: 'center',
    marginBottom: '32px',
  },
  badge: {
    display: 'inline-block',
    padding: '6px 14px',
    backgroundColor: 'rgba(6, 182, 212, 0.12)',
    border: '1px solid rgba(6, 182, 212, 0.35)',
    borderRadius: '999px',
    color: '#06b6d4',
    fontSize: '0.76rem',
    fontWeight: '800',
    letterSpacing: '0.15em',
    marginBottom: '16px',
    textTransform: 'uppercase',
  },
  title: {
    margin: '0 0 12px 0',
    fontSize: 'clamp(2.5rem, 6vw, 4.2rem)',
    fontWeight: '900',
    letterSpacing: '-0.04em',
    color: '#ffffff',
    textShadow: '0 0 30px rgba(6, 182, 212, 0.25)',
  },
  subtitle: {
    margin: '0 auto',
    maxWidth: '680px',
    fontSize: '1.05rem',
    color: '#94a3b8',
    lineHeight: 1.6,
  },
  videoWrapper: {
    width: '100%',
    maxWidth: '860px',
    aspectRatio: '16 / 9',
    borderRadius: '16px',
    overflow: 'hidden',
    position: 'relative',
    border: '1px solid #1e293b',
    boxShadow: '0 0 35px rgba(6, 182, 212, 0.2), 0 20px 40px rgba(0, 0, 0, 0.7)',
    backgroundColor: '#020617',
    marginBottom: '36px',
  },
  video: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
  },
  videoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(180deg, rgba(7, 16, 16, 0.2) 0%, rgba(7, 16, 16, 0.6) 100%)',
    pointerEvents: 'none',
  },
  ctaContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '48px',
  },
  ctaButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '16px 36px',
    backgroundColor: '#06b6d4',
    color: '#020617',
    border: 'none',
    borderRadius: '10px',
    fontSize: '1.1rem',
    fontWeight: '800',
    cursor: 'pointer',
    boxShadow: '0 0 25px rgba(6, 182, 212, 0.4)',
    transition: 'all 0.2s ease',
  },
  ctaHint: {
    margin: 0,
    fontSize: '0.84rem',
    color: '#64748b',
  },
  featuresGrid: {
    width: '100%',
    maxWidth: '860px',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '18px',
  },
  featureCard: {
    backgroundColor: '#0f172a',
    border: '1px solid #1e293b',
    borderRadius: '14px',
    padding: '22px',
    boxShadow: '0 8px 20px rgba(0, 0, 0, 0.35)',
  },
  featureIcon: {
    display: 'inline-block',
    fontSize: '1.8rem',
    marginBottom: '10px',
  },
  featureTitle: {
    margin: '0 0 8px 0',
    fontSize: '1.1rem',
    color: '#f8fafc',
    fontWeight: '700',
  },
  featureDesc: {
    margin: 0,
    fontSize: '0.88rem',
    color: '#94a3b8',
    lineHeight: 1.5,
  },
};
