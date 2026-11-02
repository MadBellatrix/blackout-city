import request from 'supertest';
import app from '../server.js';
import connectDB from '../src/config/db.js';

// Funktion zum Ermitteln aller registrierten Endpunkte
function extractEndpoints(expressApp) {
  const routes = [];
  const knownPrefixes = [
    { prefix: '/api/auth', match: (p) => p.includes('login') || p.includes('register') },
    { prefix: '/api', match: (p) => p.includes('player') }
  ];

  const stack =
    (expressApp.router && expressApp.router.stack) ||
    (expressApp._router && expressApp._router.stack) ||
    [];

  for (const layer of stack) {
    // 1. Direkt auf der App registrierte Routen (z. B. app.get('/api/health'))
    if (layer.route) {
      const path = layer.route.path;
      const methods = Object.keys(layer.route.methods).map((m) => m.toUpperCase());
      for (const method of methods) {
        routes.push({ path, method });
      }
    }
    // 2. Eingebundene Router (app.use)
    else if (layer.handle && layer.handle.stack) {
      for (const subLayer of layer.handle.stack) {
        if (subLayer.route) {
          const subPath = subLayer.route.path;
          let fullPath = subPath;

          for (const item of knownPrefixes) {
            if (item.match(subPath)) {
              fullPath = `${item.prefix}${subPath.startsWith('/') ? '' : '/'}${subPath}`;
              break;
            }
          }

          const methods = Object.keys(subLayer.route.methods).map((m) => m.toUpperCase());
          for (const method of methods) {
            routes.push({ path: fullPath, method });
          }
        }
      }
    }
  }

  // Deduplizieren und sortieren
  const unique = [];
  const seen = new Set();
  for (const r of routes) {
    const key = `${r.method}:${r.path}`;
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(r);
    }
  }

  return unique.sort((a, b) => a.path.localeCompare(b.path));
}

// Dummy-Payloads für Testaufrufe
function getTestPayload(path) {
  if (path.includes('/register')) {
    return {
      username: `probe_${Date.now()}`,
      password: 'testPassword123'
    };
  }
  if (path.includes('/login')) {
    return {
      username: 'test_probe',
      password: 'testPassword123'
    };
  }
  if (path.includes('/save')) {
    return {
      resources: { fragments: 150, knowledge: 20, credits: 5 },
      buildings: {
        fragmentsCollector: { level: 1 },
        dataNode: { level: 0 },
        airPurifier: { level: 0 },
        museum: { level: 0 }
      }
    };
  }
  return {};
}

// Hauptfunktion für Testausführung
async function runRouteTests() {
  console.log('\n============================================================');
  console.log('       BLACKOUT CITY - AUTOMATISIERTER ROUTEN-TEST');
  console.log('============================================================\n');

  try {
    await connectDB();
  } catch (err) {
    console.warn(`[Hinweis] DB-Verbindung übersprungen: ${err.message}`);
  }

  const endpoints = extractEndpoints(app);

  if (endpoints.length === 0) {
    console.error('Keine Routen im Express-Router gefunden!');
    process.exit(1);
  }

  console.log(`Gefundene Endpunkte: ${endpoints.length}\n`);

  const results = [];
  let passCount = 0;
  let failCount = 0;

  for (const { method, path } of endpoints) {
    const requestPath = path.replace(':userId', 'test_commander');
    const reqMethod = method.toLowerCase();

    let status = 0;
    let errorMsg = null;

    try {
      let req = request(app)[reqMethod](requestPath);

      if (['post', 'put', 'patch'].includes(reqMethod)) {
        req = req.send(getTestPayload(path)).set('Content-Type', 'application/json');
      }

      const res = await req;
      status = res.status;
    } catch (err) {
      status = 500;
      errorMsg = err.message;
    }

    // Ergebnis bewerten: Route gilt als erreichbar (PASS), wenn sie existiert (nicht 404)
    const isPass = status !== 404 && status > 0;
    if (isPass) {
      passCount++;
    } else {
      failCount++;
    }

    results.push({
      Status: status,
      Methode: method,
      Pfad: path,
      Ergebnis: isPass ? '[PASS]' : '[FAIL]',
      Info: errorMsg ? `Error: ${errorMsg}` : ''
    });
  }

  // Ausgabe als formatierte Tabelle
  console.table(results, ['Status', 'Methode', 'Pfad', 'Ergebnis']);

  console.log(`\nGesamtergebnis: ${passCount} bestanden, ${failCount} fehlgeschlagen von ${endpoints.length} Routen.`);

  if (failCount > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runRouteTests();
