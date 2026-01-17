
/**
 * Shastra Local Intelligence Store (Simulated Database)
 */

const DB_KEYS = {
  USERS: 'shastra_db_users',
  DEVICES: 'shastra_db_devices',
  THREATS: 'shastra_db_threats',
  SETTINGS: 'shastra_db_settings',
  SESSION: 'shastra_db_active_session',
  CREDENTIALS: 'shastra_db_vaulted_creds',
  MITIGATION_HISTORY: 'shastra_db_mitigation_history'
};

export const db = {
  _get: <T>(key: string, defaultValue: T): T => {
    const data = localStorage.getItem(key);
    try {
      return data ? JSON.parse(data) : defaultValue;
    } catch (e) {
      console.error(`Database Read Error [${key}]:`, e);
      return defaultValue;
    }
  },

  _set: (key: string, data: any): void => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.error(`Database Write Error [${key}]:`, e);
    }
  },

  users: {
    getAll: () => db._get<any[]>(DB_KEYS.USERS, []),
    save: (user: any) => {
      const users = db.users.getAll();
      const idx = users.findIndex(u => u.identity === user.identity);
      if (idx > -1) users[idx] = { ...users[idx], ...user };
      else users.push(user);
      db._set(DB_KEYS.USERS, users);
    },
    find: (identity: string) => db.users.getAll().find(u => u.identity === identity)
  },

  credentials: {
    get: () => db._get<{identity: string, password: string} | null>(DB_KEYS.CREDENTIALS, null),
    set: (creds: {identity: string, password: string} | null) => db._set(DB_KEYS.CREDENTIALS, creds)
  },

  devices: {
    get: () => db._get<any[]>(DB_KEYS.DEVICES, []),
    set: (devices: any[]) => db._set(DB_KEYS.DEVICES, devices),
    add: (device: any) => {
      const current = db.devices.get();
      db.devices.set([...current, device]);
    }
  },

  threats: {
    get: () => db._get<any[]>(DB_KEYS.THREATS, []),
    set: (threats: any[]) => db._set(DB_KEYS.THREATS, threats),
    add: (threat: any) => {
      const current = db.threats.get();
      db._set(DB_KEYS.THREATS, [threat, ...current].slice(0, 500)); 
    },
    purge: () => db._set(DB_KEYS.THREATS, [])
  },

  mitigationHistory: {
    get: () => db._get<any[]>(DB_KEYS.MITIGATION_HISTORY, []),
    add: (record: any) => {
      const current = db.mitigationHistory.get();
      db._set(DB_KEYS.MITIGATION_HISTORY, [record, ...current].slice(0, 100));
    },
    update: (id: string, updates: any) => {
      const current = db.mitigationHistory.get();
      db._set(DB_KEYS.MITIGATION_HISTORY, current.map(r => r.id === id ? { ...r, ...updates } : r));
    }
  },

  settings: {
    get: () => db._get(DB_KEYS.SETTINGS, {
      theme: 'dark',
      sensitivity: 'Medium',
      autonomousDefense: true,
      protectionMode: 'Protection', // 'Learning' | 'Protection'
      notifications: true,
      alertEmail: '',
      honeytokenDensity: 75,
      edgeInferenceOnly: true,
      metadataFocus: true,
      anonymizedCloudUpdates: false,
      retentionPeriod: '30d'
    }),
    set: (settings: any) => db._set(DB_KEYS.SETTINGS, settings)
  },

  session: {
    get: () => db._get<any | null>(DB_KEYS.SESSION, null),
    set: (user: any | null) => db._set(DB_KEYS.SESSION, user),
    clear: () => localStorage.removeItem(DB_KEYS.SESSION)
  }
};
