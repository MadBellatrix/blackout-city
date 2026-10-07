# Blackout City

Ein postapokalyptisches Browser-Idle-Game (MERN-Stack: MongoDB, Express, React, Node.js).

## Kurzbeschreibung

Baue eine Kuppelstadt auf, produziere Ressourcen (Fragmente, Wissen, Credits) und verwalte deine begrenzte Luftkapazität. Verlorene Technologie und Artefakte der alten Welt können an das Museum der Wächter übergeben werden.

## Tech-Stack

- **Frontend:** React (Vite)
- **Backend:** Node.js + Express
- **Datenbank:** MongoDB (Atlas oder lokal)
- **Sprache:** JavaScript (später ggf. TypeScript)

## Projektstruktur

```text
blackout-city/
  docs/              # Konzept, Formeln, Roadmap
  client/            # React-Frontend
    src/
      components/
      pages/
      store/
      api/
      utils/
  server/            # Node/Express-Backend
    src/
      models/
      routes/
      services/
      config/
```

## Schnellstart (lokal)

### Voraussetzungen

- Node.js (aktuelle LTS)
- npm oder pnpm
- MongoDB (lokal oder Atlas-URI)

### Backend starten

```bash
cd server
npm install
npm run dev
```

### Frontend starten

```bash
cd client
npm install
npm run dev
```

Öffne danach die angezeigte URL im Browser (meist `http://localhost:5173`).

## Dokumentation

- `docs/mvp-concept.md` – MVP-Konzept und Spielidee
- `docs/formulas.md` – Formeln für Produktion, Kosten, Luft
- `docs/roadmap.md` – Bauplan und Phasen

## Lizenz

Noch nicht festgelegt (alle Rechte vorbehalten bis auf Weiteres).
