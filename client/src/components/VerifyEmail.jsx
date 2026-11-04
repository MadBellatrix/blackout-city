import React, { useEffect, useState } from 'react';

const VerifyEmail = ({ onBackToLanding }) => {
  const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'error'
  const [message, setMessage] = useState('');
  const [username, setUsername] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    if (!token) {
      setStatus('error');
      setMessage('Kein Sicherheitstoken übergeben.');
      return;
    }

    const confirmToken = async () => {
      try {
        const response = await fetch(`/api/auth/verify-email/${token}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Verifizierung fehlgeschlagen.');
        }

        setStatus('success');
        setMessage(data.message);
        setUsername(data.username || '');
      } catch (err) {
        setStatus('error');
        setMessage(err.message);
      }
    };

    confirmToken();
  }, []);

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.badge}>BLACKOUT-CITY // NETZWERK-TERMINAL</div>

        {status === 'loading' && (
          <div>
            <h2 style={styles.heading}>Synchronisiere Bürger-ID...</h2>
            <p style={styles.text}>Die Authentifizierungsdaten werden an das Kuppel-System übermittelt.</p>
          </div>
        )}

        {status === 'success' && (
          <div>
            <h2 style={{ ...styles.heading, color: '#38bdf8' }}>Zugang autorisiert!</h2>
            <p style={styles.text}>
              Willkommen im System, Bürger <strong>{username}</strong>.
            </p>
            <p style={styles.subtext}>{message}</p>
            <button
              type="button"
              style={styles.actionBtn}
              onClick={onBackToLanding}
            >
              Zur Kuppel / Anmelden
            </button>
          </div>
        )}

        {status === 'error' && (
          <div>
            <h2 style={{ ...styles.heading, color: '#f87171' }}>Verifizierung fehlgeschlagen</h2>
            <p style={styles.errorText}>{message}</p>
            <button
              type="button"
              style={styles.secondaryBtn}
              onClick={onBackToLanding}
            >
              Zurück zur Startseite
            </button>
          </div>
        )}
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
    padding: '32px',
    maxWidth: '480px',
    width: '100%',
    textAlign: 'center',
    boxShadow: '0 0 30px rgba(6, 182, 212, 0.1)',
  },
  badge: {
    display: 'inline-block',
    fontSize: '0.75rem',
    fontWeight: 'bold',
    color: '#06b6d4',
    letterSpacing: '1.5px',
    marginBottom: '16px',
    padding: '4px 10px',
    borderRadius: '4px',
    backgroundColor: 'rgba(6, 182, 212, 0.1)',
    border: '1px solid rgba(6, 182, 212, 0.2)',
  },
  heading: {
    margin: '0 0 12px 0',
    fontSize: '1.5rem',
  },
  text: {
    color: '#94a3b8',
    fontSize: '0.95rem',
    lineHeight: '1.5',
    marginBottom: '8px',
  },
  subtext: {
    color: '#64748b',
    fontSize: '0.85rem',
    marginBottom: '24px',
  },
  errorText: {
    color: '#fca5a5',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid #ef4444',
    padding: '12px',
    borderRadius: '6px',
    fontSize: '0.9rem',
    marginBottom: '20px',
  },
  actionBtn: {
    backgroundColor: '#06b6d4',
    color: '#020617',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '6px',
    fontWeight: 'bold',
    fontSize: '0.95rem',
    cursor: 'pointer',
    width: '100%',
    transition: 'all 0.2s ease',
  },
  secondaryBtn: {
    backgroundColor: 'transparent',
    color: '#94a3b8',
    border: '1px solid #334155',
    padding: '12px 24px',
    borderRadius: '6px',
    fontSize: '0.95rem',
    cursor: 'pointer',
    width: '100%',
    transition: 'all 0.2s ease',
  },
};

export default VerifyEmail;
