import React, { useState } from 'react';

const BetaGate = ({ onOpenLogin, onOpenRegister }) => {
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [nickname, setNickname] = useState('');
  const [discordTag, setDiscordTag] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [error, setError] = useState(null);

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setFeedback(null);

    try {
      const response = await fetch('/api/auth/request-beta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname, discordTag, message }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Übertragung fehlgeschlagen');

      setFeedback(data.message);
      setNickname('');
      setDiscordTag('');
      setMessage('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.card}>
        <div style={styles.badge}>BLACKOUT-CITY // GESCHLOSSENE BETA</div>
        <h1 style={styles.title}>Zugang zur Biosphäre</h1>
        <p style={styles.subtext}>
          Die Kuppel befindet sich im Versuchsbetrieb. Der Zutritt ist aktuell autorisierten Testern vorbehalten.
        </p>

        {!showRequestForm ? (
          <div style={styles.buttonStack}>
            <button onClick={onOpenRegister} style={styles.primaryBtn} type="button">
              ⚡ Ich habe einen Beta-Code (Registrieren)
            </button>
            <button onClick={onOpenLogin} style={styles.secondaryBtn} type="button">
              Bereits Bürger (Anmelden)
            </button>
            <div style={styles.divider}>ODER</div>
            <button onClick={() => setShowRequestForm(true)} style={styles.requestBtn} type="button">
              📩 Beta-Zugang anfordern (Discord)
            </button>
          </div>
        ) : (
          <form onSubmit={handleRequestSubmit} style={styles.form}>
            <h3 style={styles.formTitle}>Signal an Discord-Zentrale</h3>
            
            {feedback && <div style={styles.successBox}>{feedback}</div>}
            {error && <div style={styles.errorBox}>{error}</div>}

            <div style={styles.inputGroup}>
              <label style={styles.label}>Dein Nickname / Name</label>
              <input
                type="text"
                required
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="z. B. Scout_042"
                style={styles.input}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Discord Benutzername (für Code-Zusendung)</label>
              <input
                type="text"
                required
                value={discordTag}
                onChange={(e) => setDiscordTag(e.target.value)}
                placeholder="z. B. @scout oder Name#1234"
                style={styles.input}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Nachricht / Motivation (optional)</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Warum möchtest du beim Testen helfen?"
                rows={3}
                style={styles.textarea}
              />
            </div>

            <button type="submit" disabled={loading} style={styles.submitBtn}>
              {loading ? 'Sende Signal...' : 'Anfrage an Discord absenden'}
            </button>
            <button
              type="button"
              onClick={() => { setShowRequestForm(false); setFeedback(null); setError(null); }}
              style={styles.backBtn}
            >
              Zurück zur Auswahl
            </button>
          </form>
        )}
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
  card: {
    backgroundColor: '#0a1512',
    border: '1px solid rgba(34, 197, 94, 0.25)',
    borderRadius: '12px',
    padding: '36px',
    maxWidth: '460px',
    width: '100%',
    textAlign: 'center',
    boxShadow: '0 0 40px rgba(34, 197, 94, 0.18)',
  },
  badge: {
    display: 'inline-block',
    fontSize: '0.75rem',
    fontWeight: 'bold',
    color: '#22c55e',
    letterSpacing: '1.5px',
    marginBottom: '16px',
    padding: '4px 12px',
    borderRadius: '4px',
    backgroundColor: 'rgba(34, 197, 94, 0.12)',
    border: '1px solid rgba(34, 197, 94, 0.35)',
    boxShadow: '0 0 12px rgba(34, 197, 94, 0.2)',
  },
  title: { margin: '0 0 12px 0', fontSize: '1.5rem', color: '#f8fafc', letterSpacing: '0.5px' },
  subtext: { color: '#94a3b8', fontSize: '0.9rem', lineHeight: '1.5', marginBottom: '24px' },
  buttonStack: { display: 'flex', flexDirection: 'column', gap: '12px' },
  primaryBtn: {
    backgroundColor: '#22c55e',
    color: '#021208',
    border: 'none',
    padding: '14px',
    borderRadius: '6px',
    fontWeight: 'bold',
    fontSize: '0.95rem',
    cursor: 'pointer',
    boxShadow: '0 0 20px rgba(34, 197, 94, 0.45)',
    transition: 'all 0.2s ease',
  },
  secondaryBtn: {
    backgroundColor: '#0f231c',
    color: '#e2e8f0',
    border: '1px solid rgba(34, 197, 94, 0.3)',
    padding: '12px',
    borderRadius: '6px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  divider: { fontSize: '0.75rem', color: '#4ade80', opacity: 0.6, margin: '4px 0', letterSpacing: '1px' },
  requestBtn: {
    backgroundColor: 'transparent',
    color: '#4ade80',
    border: '1px dashed #22c55e',
    padding: '12px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600',
    transition: 'all 0.2s ease',
  },
  form: { textAlign: 'left', marginTop: '16px' },
  formTitle: { fontSize: '1.1rem', margin: '0 0 16px 0', color: '#86efac', textAlign: 'center' },
  inputGroup: { marginBottom: '14px', display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '0.8rem', color: '#86efac' },
  input: {
    backgroundColor: '#020617',
    border: '1px solid rgba(34, 197, 94, 0.35)',
    borderRadius: '6px',
    padding: '10px',
    color: '#f8fafc',
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  },
  textarea: {
    backgroundColor: '#020617',
    border: '1px solid rgba(34, 197, 94, 0.35)',
    borderRadius: '6px',
    padding: '10px',
    color: '#f8fafc',
    outline: 'none',
    resize: 'vertical',
  },
  submitBtn: {
    width: '100%',
    backgroundColor: '#22c55e',
    color: '#021208',
    border: 'none',
    padding: '12px',
    borderRadius: '6px',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: '10px',
    boxShadow: '0 0 15px rgba(34, 197, 94, 0.4)',
  },
  backBtn: {
    width: '100%',
    backgroundColor: 'transparent',
    color: '#94a3b8',
    border: 'none',
    padding: '10px',
    cursor: 'pointer',
    marginTop: '6px',
    fontSize: '0.85rem',
  },
  successBox: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    border: '1px solid #22c55e',
    color: '#86efac',
    padding: '12px',
    borderRadius: '6px',
    fontSize: '0.85rem',
    marginBottom: '14px',
  },
  errorBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid #ef4444',
    color: '#fca5a5',
    padding: '12px',
    borderRadius: '6px',
    fontSize: '0.85rem',
    marginBottom: '14px',
  },
};

export default BetaGate;
