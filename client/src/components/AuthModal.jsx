import React, { useState } from 'react';

const AuthModal = ({ isOpen, onClose, onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleTabChange = (loginMode) => {
    setIsLogin(loginMode);
    setError(null);
    setSuccessMessage(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    const payload = isLogin ? { username, password } : { username, email, password };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Aktion fehlgeschlagen');
      }

      if (isLogin) {
        // Erfolgreicher Login: Token sichern und Kuppel betreten
        localStorage.setItem('blackout_token', data.token);
        localStorage.setItem('blackout_player', JSON.stringify(data.player));
        if (onAuthSuccess) {
          onAuthSuccess(data);
        }
        onClose();
      } else {
        // Erfolgreiche Registrierung: Hinweis auf Aktivierungs-Mail
        setSuccessMessage(
          data.message || 'Registrierung erfolgreich! Bitte überprüfe dein Postfach, um deine Bürger-ID zu bestätigen.'
        );
        setUsername('');
        setEmail('');
        setPassword('');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        {/* Header Tabs */}
        <div style={styles.tabContainer}>
          <button
            type="button"
            style={{
              ...styles.tab,
              ...(isLogin ? styles.activeTab : {}),
            }}
            onClick={() => handleTabChange(true)}
          >
            Anmelden
          </button>
          <button
            type="button"
            style={{
              ...styles.tab,
              ...(!isLogin ? styles.activeTab : {}),
            }}
            onClick={() => handleTabChange(false)}
          >
            Registrieren
          </button>
        </div>

        {/* Formular-Bereich */}
        <form onSubmit={handleSubmit} style={styles.form}>
          <h2 style={styles.title}>
            {isLogin ? 'Kommandant-Login' : 'Bürger-Registrierung'}
          </h2>

          {error && <div style={styles.errorBox}>{error}</div>}

          {/* Erfolgs-Box bei Registrierung */}
          {!isLogin && successMessage && (
            <div style={styles.successBox}>
              <div style={styles.successTitle}>Bestätigung erforderlich</div>
              <p style={styles.successText}>{successMessage}</p>
              <button
                type="button"
                style={styles.switchTabBtn}
                onClick={() => handleTabChange(true)}
              >
                Zum Login wechseln
              </button>
            </div>
          )}

          {/* Eingabefelder */}
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
              placeholder="z. B. Raven"
              required
              minLength={3}
              autoComplete="username"
            />
          </div>

          {!isLogin && (
            <div style={styles.inputGroup}>
              <label style={styles.label} htmlFor="auth-email">
                E-Mail-Adresse
              </label>
              <input
                id="auth-email"
                type="email"
                style={styles.input}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="z. B. bürger@blackout-city.de"
                required
                autoComplete="email"
              />
            </div>
          )}

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
              autoComplete={isLogin ? 'current-password' : 'new-password'}
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
                ? 'Wird verarbeitet...'
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
    boxShadow: '0 0 30px rgba(6, 182, 212, 0.15)',
    borderRadius: '12px',
    width: '100%',
    maxWidth: '440px',
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
    color: '#06b6d4',
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
    padding: '10px 12px',
    borderRadius: '6px',
    marginBottom: '16px',
    fontSize: '0.85rem',
  },
  successBox: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    border: '1px solid #22c55e',
    color: '#86efac',
    padding: '16px',
    borderRadius: '8px',
    textAlign: 'center',
    marginBottom: '16px',
  },
  successTitle: {
    fontWeight: 'bold',
    fontSize: '1rem',
    marginBottom: '6px',
    color: '#22c55e',
  },
  successText: {
    fontSize: '0.85rem',
    color: '#cbd5e1',
    lineHeight: '1.4',
    margin: '0 0 12px 0',
  },
  switchTabBtn: {
    backgroundColor: '#22c55e',
    color: '#020617',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '6px',
    fontWeight: 'bold',
    cursor: 'pointer',
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
