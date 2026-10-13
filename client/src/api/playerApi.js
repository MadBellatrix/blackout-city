const API_BASE_URL = "http://localhost:3000/api";
const USER_ID_KEY = "blackout_city_user_id";
const LOCAL_STORAGE_KEY = "blackout_city_savegame";

export const getUserId = () => {
  let userId = localStorage.getItem(USER_ID_KEY);
  if (!userId) {
    userId = `commander_${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem(USER_ID_KEY, userId);
  }
  return userId;
};

export const loadPlayerState = async (userId) => {
  // 1. Zuerst Backend versuchen
  try {
    const response = await fetch(`${API_BASE_URL}/player/${userId}`, {
      signal: AbortSignal.timeout(2500),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.player) {
        // Im lokalen Speicher spiegeln
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data.player));
        return {
          success: true,
          source: data.storage || "mongodb",
          player: data.player,
          offlineSeconds: data.offlineSeconds ?? 0,
        };
      }
    }
  } catch (error) {
    console.warn("Backend nicht erreichbar. Wechsle auf LocalStorage:", error.message);
  }

  // 2. Fallback: LocalStorage
  try {
    const rawLocal = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (rawLocal) {
      const localPlayer = JSON.parse(rawLocal);
      const now = new Date();
      const lastSave = localPlayer.lastSaveTime ? new Date(localPlayer.lastSaveTime) : now;
      const offlineSeconds = Math.max(0, Math.floor((now.getTime() - lastSave.getTime()) / 1000));

      return {
        success: true,
        source: "localStorage",
        player: localPlayer,
        offlineSeconds,
      };
    }
  } catch (localError) {
    console.error("Fehler beim Lesen aus LocalStorage:", localError);
  }

  // 3. Fallback: Standardwerte
  return {
    success: false,
    source: "default",
    player: {
      userId,
      resources: { fragments: 100, knowledge: 0, credits: 0 },
      buildings: { fragmentsCollector: 0, dataNode: 0, airPurifier: 0, museum: 0 },
      lastSaveTime: new Date().toISOString(),
    },
    offlineSeconds: 0,
  };
};

export const savePlayerState = async (userId, { resources, buildings }) => {
  const savePayload = {
    userId,
    resources,
    buildings,
    lastSaveTime: new Date().toISOString(),
  };

  // Immer lokal puffern
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(savePayload));
  } catch (err) {
    console.error("Fehler beim lokalen Speichern:", err);
  }

  // An Backend senden
  try {
    const response = await fetch(`${API_BASE_URL}/player/${userId}/save`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resources, buildings }),
      signal: AbortSignal.timeout(3000),
    });

    if (response.ok) {
      const data = await response.json();
      return { success: true, source: data.storage || "mongodb" };
    }
  } catch (error) {
    // Leiser Fallback: lokales Speichern hat bereits funktioniert
    return { success: true, source: "localStorage" };
  }

  return { success: true, source: "localStorage" };
};
