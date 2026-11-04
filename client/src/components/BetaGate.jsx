import React, { useState } from 'react';

const BetaGate = ({ onAccessGranted, onLogout, username }) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const token = localStorage.getItem('blackout_token');

    try {
      const response = await fetch('/api/auth/redeem-beta', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ code: code.trim().toUpperCase() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Autorisierung fehlgeschlagen.');
      }

      // Spielerdaten im localStorage aktualisieren
      if (data.player) {
        localStorage.setItem('blackout_player', JSON.stringify(data.player));
      }

      onAccessGranted(data.player);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.terminalCard}>
        <div style={styles.badge}>BLACKOUT-CITY // AUTORISIERUNGSTERMINAL</div>
        <h1 style={styles.title}>Kuppel-Schleuse Verriegelt</h1>
        <p style={styles.subtext}>
          Bürger-ID <strong>{username || 'Unbekannt'}</strong> authentifiziert. Zur Dekompression und Zuteilung von Sauerstoffkontingenten wird ein gültiger <strong>Closed-Beta-Sicherheitscode</strong> benötigt.
        </p>

        {error && <div style={styles.errorBox}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={styles.inputGroup}>
            <label style={styles.label} htmlFor="beta-code-input">
              Sicherheitscode eingeben
            </label>
            <input
              id="beta-code-input"
              type="text"
              style={styles.input}
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="BC-XXXX-XXXX"
              autoFocus
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.submitBtn,
              ...(loading ? styles.btnDisabled : {}),
            }}
          >
            {loading ? 'Autorisiere...' : 'Schleuse Entriegeln'}
          </button>
        </form>

        <div style={styles.footer}>
          <p style={styles.hint}>Codes werden manuell über den Community-Discord vergeben.</p>
          <button
            type="button"
            onClick={onLogout}
            style={styles.logoutBtn}
          >
            Abmelden / Zurück zum Hauptmenü
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    minHeight: '100vh',
    backgroundColor: '#020617',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    color: '#e2e8f0',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  terminalCard: {
    backgroundColor: '#0f172a',
    border: '1px solid #1e293b',
    borderRadius: '12px',
    padding: '36px',
    maxWidth: '460px',
    width: '100%',
    textAlign: 'center',
    boxShadow: '0 0 35px rgba(6, 182, 212, 0.15)',
  },
  badge: {
    display: 'inline-block',
    fontSize: '0.75rem',
    fontWeight: 'bold',
    color: '#06b6d4',
    letterSpacing: '1.5px',
    marginBottom: '16px',
    padding: '4px 12px',
    borderRadius: '4px',
    backgroundColor: 'rgba(6, 182, 212, 0.1)',
    border: '1px solid rgba(6, 182, 212, 0.2)',
  },
  title: {
    margin: '0 0 12px 0',
    fontSize: '1.5rem',
    color: '#f8fafc',
  },
  subtext: {
    color: '#94a3b8',
    fontSize: '0.9rem',
    lineHeight: '1.5',
    marginBottom: '24px',
  },
  inputGroup: {
    marginBottom: '20px',
    textAlign: 'left',
  },
  label: {
    display: 'block',
    fontSize: '0.8rem',
    color: '#64748b',
    marginBottom: '6px',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  input: {
    width: '100%',
    boxSizing: 'border-box',
    backgroundColor: '#020617',
    border: '1px solid #334155',
    borderRadius: '6px',
    padding: '12px',
    color: '#06b6d4',
    fontSize: '1.1rem',
    fontWeight: 'bold',
    letterSpacing: '2px',
    textAlign: 'center',
    outline: 'none',
  },
  errorBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    border: '1px solid #ef4444',
    color: '#fca5a5',
    padding: '10px',
    borderRadius: '6px',
    marginBottom: '16px',
    fontSize: '0.85rem',
  },
  submitBtn: {
    width: '100%',
    backgroundColor: '#06b6d4',
    color: '#020617',
    border: 'none',
    padding: '12px',
    borderRadius: '6px',
    fontWeight: 'bold',
    fontSize: '1rem',
    cursor: 'pointer',
    boxShadow: '0 0 15px rgba(6, 182, 212, 0.3)',
  },
  btnDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed',
  },
  footer: {
    marginTop: '24px',
    borderTop: '1px solid #1e293b',
    paddingTop: '16px',
  },
  hint: {
    fontSize: '0.8rem',
    color: '#64748b',
    margin: '0 0 12px 0',
  },
  logoutBtn: {
    background: 'none',
    border: 'none',
    color: '#94a3b8',
    textDecoration: 'underline',
    cursor: 'pointer',
    fontSize: '0.85rem',
  },
};

export default BetaGate;
