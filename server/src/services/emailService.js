import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;
const EMAIL_FROM = process.env.EMAIL_FROM || 'Blackout-City <onboarding@resend.dev>';
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

/**
 * Gemeinsames HTML-Template im Blackout-City Dark-Mode & Sci-Fi Design
 */
const getBaseTemplate = ({ title, preheader, contentHtml }) => `
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #020617;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #e2e8f0;
    }
    .wrapper {
      width: 100%;
      background-color: #020617;
      padding: 30px 0;
    }
    .container {
      max-width: 580px;
      margin: 0 auto;
      background-color: #0b0f19;
      border: 1px solid #1e293b;
      border-radius: 12px;
      padding: 32px 28px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.7);
    }
    .badge {
      display: inline-block;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 1.5px;
      color: #06b6d4;
      background-color: rgba(6, 182, 212, 0.1);
      border: 1px solid rgba(6, 182, 212, 0.25);
      padding: 4px 10px;
      border-radius: 4px;
      margin-bottom: 20px;
    }
    h1 {
      font-size: 22px;
      font-weight: 700;
      color: #f8fafc;
      margin: 0 0 16px 0;
      letter-spacing: 0.5px;
    }
    p {
      font-size: 15px;
      line-height: 1.6;
      color: #94a3b8;
      margin: 0 0 18px 0;
    }
    .btn-container {
      text-align: center;
      margin: 28px 0;
    }
    .btn {
      display: inline-block;
      background-color: #06b6d4;
      color: #020617 !important;
      font-weight: bold;
      padding: 12px 24px;
      text-decoration: none;
      border-radius: 6px;
      font-size: 15px;
      letter-spacing: 0.5px;
    }
    .fallback-box {
      background-color: #020617;
      border: 1px solid #1e293b;
      border-radius: 6px;
      padding: 12px;
      margin: 20px 0;
      font-family: monospace;
      font-size: 12px;
      color: #38bdf8;
      word-break: break-all;
    }
    .footer {
      border-top: 1px solid #1e293b;
      padding-top: 20px;
      margin-top: 28px;
      font-size: 12px;
      color: #64748b;
      line-height: 1.5;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="badge">BLACKOUT-CITY // NETZWERK-TERMINAL</div>
      ${contentHtml}
      <div class="footer">
        Diese Übertragung wurde automatisch vom Zentralrechner der Kuppel generiert.<br>
        Falls du diese Anfrage nicht veranlasst hast, kannst du diese Nachricht ignorieren.
      </div>
    </div>
  </div>
</body>
</html>
`;

/**
 * Sendet eine Verifizierungs-E-Mail zur Freischaltung des Accounts
 * @param {Object} params
 * @param {string} params.email - Empfänger-Adresse
 * @param {string} params.username - Benutzername des Spielers
 * @param {string} params.token - Generierter Verifizierungs-Token
 */
export async function sendVerificationEmail({ email, username, token }) {
  const verificationUrl = `${CLIENT_URL}/verify-email?token=${token}`;
  const subject = '[Blackout-City] Bestätige deine Bürger-ID zur Freischaltung der Kuppel';

  if (!resend) {
    console.log('\n============================================================');
    console.log(' [DEV-EMAIL-SERVICE] RESEND_API_KEY nicht gesetzt.');
    console.log(` [DEV-EMAIL-SERVICE] Ziel: ${email} (${username})`);
    console.log(` [DEV-EMAIL-SERVICE] Betreff: ${subject}`);
    console.log(` [DEV-EMAIL-SERVICE] Verifizierungs-URL: ${verificationUrl}`);
    console.log('============================================================\n');
    return { success: true, simulated: true };
  }

  const contentHtml = `
    <h1>Bürger-ID Verifizierung</h1>
    <p>Willkommen im Kuppelsystem, Bürger <strong>${username}</strong>.</p>
    <p>
      Deine Zugangsberechtigung für Sektor 01 wurde registriert. Um die Lebenserhaltungssysteme,
      den Ressourcen-Tresor und das Terminal freizuschalten, bestätige bitte deine Bürger-ID.
    </p>
    <div class="btn-container">
      <a href="${verificationUrl}" class="btn" target="_blank">Bürger-ID bestätigen</a>
    </div>
    <p>
      Dieser Bestätigungslink ist <strong>24 Stunden gültig</strong>. Falls der Button nicht funktioniert,
      kopiere folgenden Link direkt in das Terminal deines Browsers:
    </p>
    <div class="fallback-box">${verificationUrl}</div>
  `;

  return await resend.emails.send({
    from: EMAIL_FROM,
    to: email,
    subject,
    html: getBaseTemplate({
      title: subject,
      contentHtml,
    }),
  });
}

/**
 * Sendet eine E-Mail zum Zurücksetzen des Sicherheitsschlüssels (Passworts)
 * @param {Object} params
 * @param {string} params.email - Empfänger-Adresse
 * @param {string} params.username - Benutzername des Spielers
 * @param {string} params.token - Generierter Reset-Token
 */
export async function sendPasswordResetEmail({ email, username, token }) {
  const resetUrl = `${CLIENT_URL}/reset-password?token=${token}`;
  const subject = '[Blackout-City] Sicherheitsschlüssel zurücksetzen';

  if (!resend) {
    console.log('\n============================================================');
    console.log(' [DEV-EMAIL-SERVICE] RESEND_API_KEY nicht gesetzt.');
    console.log(` [DEV-EMAIL-SERVICE] Ziel: ${email} (${username})`);
    console.log(` [DEV-EMAIL-SERVICE] Betreff: ${subject}`);
    console.log(` [DEV-EMAIL-SERVICE] Reset-URL: ${resetUrl}`);
    console.log('============================================================\n');
    return { success: true, simulated: true };
  }

  const contentHtml = `
    <h1>Sicherheitsschlüssel zurücksetzen</h1>
    <p>Hallo Bürger <strong>${username}</strong>,</p>
    <p>
      für deinen Zugang zum Kuppelsystem wurde das Zurücksetzen deines Sicherheitsschlüssels angefordert.
    </p>
    <div class="btn-container">
      <a href="${resetUrl}" class="btn" target="_blank">Neuen Schlüssel festlegen</a>
    </div>
    <p>
      Dieser Link ist <strong>1 Stunde gültig</strong>. Falls du diesen Vorgang nicht ausgelöst hast,
      bleibt dein bestehender Schlüssel weiterhin aktiv und deine Kuppel geschützt.
    </p>
    <div class="fallback-box">${resetUrl}</div>
  `;

  return await resend.emails.send({
    from: EMAIL_FROM,
    to: email,
    subject,
    html: getBaseTemplate({
      title: subject,
      contentHtml,
    }),
  });
}

export default {
  sendVerificationEmail,
  sendPasswordResetEmail,
};
