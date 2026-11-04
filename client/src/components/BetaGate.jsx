import React, { useState } from 'react';

const BetaGate = ({ onAccessGranted }) => {
  const [accessCode, setAccessCode] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const validPassword = import.meta.env.VITE_BETA_ACCESS_PASSWORD || 'Kuppel2026';

    if (accessCode.trim() === validPassword) {
      localStorage.setItem('blackout_beta_access', 'granted');
      if (onAccessGranted) {
        onAccessGranted();
      }
    } else {
      setError('Zugang verweigert: Ungültiger Sicherheitscode');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.badge}>BLACKOUT-CITY // GESCHLOSSENE TEST-PHASE</div>

        <h1 style={styles.heading}>Sicherheitsschleuse Sektor 01</h1>

        <p style={styles.text}>
          Der Zutritt zur Biosphäre ist aktuell autorisierten Testern vorbehalten. Bitte gib den Zugangscode ein, um das Schleusentor zu öffnen.
        </p>

        {error && <div style={styles.errorBox}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label} htmlFor="beta-code">
              Autorisierungs-Code
            </label>
            <input
              id="beta-code"
              type="password"
              style={styles.input}
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value)}
              placeholder="Zugangscode eingeben..."
              autoFocus
              required
            />
          </div>

          <button type="submit" style={styles.submitBtn}>
            Schleuse entriegeln
          </button>
        </form>

        <div style={styles.footerNote}>
          SICHERHEITSSTUFE: KLASSIFIZIERT · PROTOKOLL 2026
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#020617',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    color: '#e2e8f0',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  card: {
    backgroundColor: '#0f172a',
    border: '1px solid #1e293b',
    borderRadius: '12px',
    padding: '36px 32px',
    maxWidth: '460px',
    width: '100%',
    textAlign: 'center',
    boxShadow: '0 0 35px rgba(6, 182, 212, 0.12)',
  },
  badge: {
    display: 'inline-block',
    fontSize: '0.72rem',
    fontWeight: 'bold',
    color: '#06b6d4',
    letterSpacing: '1.5px',
    marginBottom: '18px',
    padding: '5px 12px',
    borderRadius: '4px',
    backgroundColor: 'rgba(6, 182, 212, 0.1)',
    border: '1px solid rgba(6, 182, 212, 0.25)',
  },
  heading: {
    margin: '0 0 12px 0',
    fontSize: '1.5rem',
    color: '#f8fafc',
    letterSpacing: '0.5px',
  },
  text: {
    color: '#94a3b8',
    fontSize: '0.92rem',
    lineHeight: '1.6',
    marginBottom: '24px',
  },
  errorBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    border: '1px solid #ef4444',
    color: '#fca5a5',
    padding: '12px',
    borderRadius: '6px',
    fontSize: '0.88rem',
    marginBottom: '20px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    textAlign: 'left',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '0.82rem',
    color: '#94a3b8',
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#020617',
    border: '1px solid #334155',
    borderRadius: '6px',
    padding: '12px 14px',
    color: '#f8fafc',
    fontSize: '0.95rem',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  submitBtn: {
    backgroundColor: '#06b6d4',
    color: '#020617',
    border: 'none',
    padding: '12px 20px',
    borderRadius: '6px',
    fontWeight: 'bold',
    fontSize: '0.95rem',
    cursor: 'pointer',
    marginTop: '6px',
    boxShadow: '0 0 15px rgba(6, 182, 212, 0.3)',
    transition: 'all 0.2s',
  },
  footerNote: {
    marginTop: '28px',
    fontSize: '0.72rem',
    color: '#475569',
    letterSpacing: '1px',
    borderTop: '1px solid #1e293b',
    paddingTop: '16px',
  },
};

export default BetaGate;
