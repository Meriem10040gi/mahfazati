import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  TRANSACTIONS: '@mahfazati_transactions',
  BUDGET: '@mahfazati_budget',
  PROFILE: '@mahfazati_profile',
  PREFERENCES: '@mahfazati_preferences',
  API_KEY: '@mahfazati_api_key',
  ONBOARDED: '@mahfazati_onboarded',
  CATEGORIES: '@mahfazati_custom_categories',
};

// ─── Categories ─────────────────────────────────────────────────
export async function saveCategories(categories) {
  try {
    await AsyncStorage.setItem(KEYS.CATEGORIES, JSON.stringify(categories));
  } catch (e) {
    console.warn('Mahfazati: Failed to save categories', e);
  }
}

export async function loadCategories() {
  try {
    const raw = await AsyncStorage.getItem(KEYS.CATEGORIES);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.warn('Mahfazati: Failed to load categories', e);
    return null;
  }
}

// ─── Transactions ───────────────────────────────────────────────
export async function saveTransactions(transactions) {
  try {
    await AsyncStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(transactions));
  } catch (e) {
    console.warn('Mahfazati: Failed to save transactions', e);
  }
}

export async function loadTransactions() {
  try {
    const raw = await AsyncStorage.getItem(KEYS.TRANSACTIONS);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.warn('Mahfazati: Failed to load transactions', e);
    return null;
  }
}

// ─── Budget Data ────────────────────────────────────────────────
export async function saveBudgetData(budgetData) {
  try {
    await AsyncStorage.setItem(KEYS.BUDGET, JSON.stringify(budgetData));
  } catch (e) {
    console.warn('Mahfazati: Failed to save budget data', e);
  }
}

export async function loadBudgetData() {
  try {
    const raw = await AsyncStorage.getItem(KEYS.BUDGET);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.warn('Mahfazati: Failed to load budget data', e);
    return null;
  }
}

// ─── Profile ────────────────────────────────────────────────────
export async function saveProfile(profile) {
  try {
    await AsyncStorage.setItem(KEYS.PROFILE, JSON.stringify(profile));
  } catch (e) {
    console.warn('Mahfazati: Failed to save profile', e);
  }
}

export async function loadProfile() {
  try {
    const raw = await AsyncStorage.getItem(KEYS.PROFILE);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.warn('Mahfazati: Failed to load profile', e);
    return null;
  }
}

// ─── Preferences (theme, lang) ──────────────────────────────────
export async function savePreferences(prefs) {
  try {
    await AsyncStorage.setItem(KEYS.PREFERENCES, JSON.stringify(prefs));
  } catch (e) {
    console.warn('Mahfazati: Failed to save preferences', e);
  }
}

export async function loadPreferences() {
  try {
    const raw = await AsyncStorage.getItem(KEYS.PREFERENCES);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.warn('Mahfazati: Failed to load preferences', e);
    return null;
  }
}

// ─── AI API Key ─────────────────────────────────────────────────
export async function saveApiKey(key) {
  try {
    await AsyncStorage.setItem(KEYS.API_KEY, key || '');
  } catch (e) {
    console.warn('Mahfazati: Failed to save API key', e);
  }
}

export async function loadApiKey() {
  try {
    const raw = await AsyncStorage.getItem(KEYS.API_KEY);
    return raw || '';
  } catch (e) {
    console.warn('Mahfazati: Failed to load API key', e);
    return '';
  }
}

// ─── Onboarding State ───────────────────────────────────────────
export async function saveOnboarded(value) {
  try {
    await AsyncStorage.setItem(KEYS.ONBOARDED, value ? 'true' : 'false');
  } catch (e) {
    console.warn('Mahfazati: Failed to save onboarded state', e);
  }
}

export async function loadOnboarded() {
  try {
    const raw = await AsyncStorage.getItem(KEYS.ONBOARDED);
    return raw === 'true';
  } catch (e) {
    console.warn('Mahfazati: Failed to load onboarded state', e);
    return false;
  }
}

// ─── Clear All Data (Reset) ─────────────────────────────────────
export async function clearAllData() {
  try {
    await AsyncStorage.multiRemove([
      KEYS.TRANSACTIONS,
      KEYS.BUDGET,
      KEYS.PROFILE,
      KEYS.ONBOARDED,
      // Keep preferences and API key on reset
    ]);
  } catch (e) {
    console.warn('Mahfazati: Failed to clear data', e);
  }
}
