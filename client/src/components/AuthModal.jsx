import React, { useState } from 'react';

const AuthModal = ({ isOpen, onClose, onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const endpoint = isLogin
      ? 'http://localhost:5000/api/auth/login'
      : 'http://localhost:5000/api/auth/register';

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Authentifizierung fehlgeschlagen');
      }

      // Token und Spielerdaten im LocalStorage sichern
      localStorage.setItem('blackout_token', data.token);
      localStorage.setItem('blackout_player', JSON.stringify(data.player));

      if (onAuthSuccess) {
        onAuthSuccess(data);
      }
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        {/* Header mit Tabs */}
        <div style={styles.tabContainer}>
          <button
            type="button"
            style={{
              ...styles.tab,
              ...(isLogin ? styles.activeTab : {}),
            }}
            onClick={() => {
              setIsLogin(true);
              setError(null);
            }}
          >
            Anmelden
          </button>
          <button
            type="button"
            style={{
              ...styles.tab,
              ...(!isLogin ? styles.activeTab : {}),
            }}
            onClick={() => {
              setIsLogin(false);
              setError(null);
            }}
          >
            Registrieren
          </button>
        </div>

        {/* Formular */}
        <form onSubmit={handleSubmit} style={styles.form}>
          <h2 style={styles.title}>
            {isLogin ? 'Kommandant-Login' : 'Neuer Kommandant'}
          </h2>

          {error && <div style={styles.errorBox}>{error}</div>}

          <div style={styles.inputGroup}>
            <label style={styles.label} htmlFor="auth-username">
              Benutzername
            </label>
            <input
              id="auth-username"
              type="text"
              style={styles.input}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="z.B. Raven"
              required
              minLength={3}
              autoComplete="username"
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label} htmlFor="auth-password">
              Passwort
            </label>
            <input
              id="auth-password"
              type="password"
              style={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              autoComplete={isLogin ? "current-password" : "new-password"}
            />
          </div>

          <div style={styles.buttonGroup}>
            <button
              type="button"
              onClick={onClose}
              style={styles.cancelBtn}
            >
              Abbrechen
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                ...styles.submitBtn,
                ...(loading ? styles.btnDisabled : {}),
              }}
            >
              {loading
                ? 'Wird geladen...'
                : isLogin
                ? 'Anmelden'
                : 'Registrieren'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Dark-Theme Styling gemäß Designvorgaben
const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    backdropFilter: 'blur(4px)',
  },
  modal: {
    backgroundColor: '#0f172a',
    border: '1px solid #1e293b',
    boxShadow: '0 0 25px rgba(6, 182, 212, 0.15)',
    borderRadius: '12px',
    width: '100%',
    maxWidth: '420px',
    overflow: 'hidden',
    color: '#e2e8f0',
  },
  tabContainer: {
    display: 'flex',
    borderBottom: '1px solid #1e293b',
  },
  tab: {
    flex: 1,
    padding: '14px',
    backgroundColor: '#090d16',
    border: 'none',
    color: '#64748b',
    cursor: 'pointer',
    fontSize: '0.95rem',
    fontWeight: '600',
    transition: 'all 0.2s',
  },
  activeTab: {
    backgroundColor: '#0f172a',
    color: '#06b6d4', // Cyan Akzent
    borderBottom: '2px solid #06b6d4',
  },
  form: {
    padding: '24px',
  },
  title: {
    margin: '0 0 16px 0',
    fontSize: '1.25rem',
    color: '#f8fafc',
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '0.85rem',
    color: '#94a3b8',
  },
  input: {
    backgroundColor: '#020617',
    border: '1px solid #334155',
    borderRadius: '6px',
    padding: '10px 12px',
    color: '#f8fafc',
    fontSize: '0.95rem',
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
  buttonGroup: {
    display: 'flex',
    gap: '12px',
    marginTop: '20px',
  },
  submitBtn: {
    flex: 2,
    backgroundColor: '#06b6d4',
    color: '#020617',
    border: 'none',
    borderRadius: '6px',
    padding: '12px',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: '0.95rem',
  },
  btnDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed',
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: 'transparent',
    border: '1px solid #334155',
    color: '#94a3b8',
    borderRadius: '6px',
    padding: '12px',
    cursor: 'pointer',
  },
};

export default AuthModal;
