import { Resend } from 'resend';

// Initialisiere Resend mit API-Key (Fallback auf leeren String verhindert Konstruktorfehler, falls Key noch nicht in .env hinterlegt ist)
const resend = new Resend(process.env.RESEND_API_KEY || 're_mock_placeholder');

/**
 * Sendet eine Verifizierungs-E-Mail an den neu registrierten Kommandanten
 * @param {Object} params
 * @param {string} params.email - Empfänger-Adresse
 * @param {string} params.username - Benutzername des Spielers
 * @param {string} params.token - Generierter Verifizierungs-Token
 */
export async function sendVerificationEmail({ email, username, token }) {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const verificationUrl = `${clientUrl}/verify-email?token=${token}`;
  const senderEmail = process.env.EMAIL_FROM || 'Blackout-City <onboarding@resend.dev>';

  const subject = 'Verifiziere deinen Kuppel-Zugang – Blackout-City';

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="de">
    <head>
      <meta charset="UTF-8">
      <title>Kuppel-Zugang verifizieren</title>
      <style>
        body {
          margin: 0;
          padding: 0;
          background-color: #071010;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          color: #edf8f4;
        }
        .container {
          max-width: 600px;
          margin: 30px auto;
          background: #0d1b1a;
          border: 1px solid rgba(168, 213, 202, 0.2);
          border-radius: 12px;
          padding: 32px 28px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
        }
        .badge {
          display: inline-block;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.15em;
          color: #06b6d4;
          background: rgba(6, 182, 212, 0.15);
          border: 1px solid rgba(6, 182, 212, 0.3);
          padding: 4px 10px;
          border-radius: 999px;
          margin-bottom: 16px;
        }
        h1 {
          font-size: 24px;
          margin: 0 0 16px;
          color: #ffffff;
          letter-spacing: 0.05em;
        }
        p {
          font-size: 15px;
          line-height: 1.6;
          color: #a9c0bb;
          margin: 0 0 20px;
        }
        .btn-wrapper {
          text-align: center;
          margin: 30px 0;
        }
        .btn {
          display: inline-block;
          background: linear-gradient(135deg, #06b6d4, #0891b2);
          color: #051414 !important;
          text-decoration: none;
          font-size: 15px;
          font-weight: 700;
          padding: 14px 28px;
          border-radius: 8px;
          letter-spacing: 0.05em;
        }
        .footnote {
          font-size: 12px;
          color: #64748b;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          padding-top: 18px;
          margin-top: 30px;
          word-break: break-all;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="badge">ZUGANGS-PROTOKOLL · KUPPEL SEKTOR 01</div>
        <h1>Willkommen bei Blackout-City, Kommandant ${username}!</h1>
        <p>
          Dein Sektor wurde initialisiert. Um deine Kuppel-Systeme vor unerlaubtem Zugriff zu schützen und deine Ressourcen sicherzustellen, bestätige bitte deine E-Mail-Adresse.
        </p>
        <div class="btn-wrapper">
          <a href="${verificationUrl}" class="btn" target="_blank">E-Mail-Adresse bestätigen</a>
        </div>
        <p>
          Sollte der Button nicht funktionieren, kopiere diesen Link bitte direkt in deinen Browser:
        </p>
        <p style="font-family: monospace; font-size: 13px; color: #38bdf8;">
          <a href="${verificationUrl}" style="color: #38bdf8;">${verificationUrl}</a>
        </p>
        <div class="footnote">
          Falls du diesen Account nicht erstellt hast, ignoriere diese Nachricht einfach.
        </div>
      </div>
    </body>
    </html>
  `;

  return await resend.emails.send({
    from: senderEmail,
    to: email,
    subject,
    html: htmlContent,
  });
}

export default {
  sendVerificationEmail,
};
