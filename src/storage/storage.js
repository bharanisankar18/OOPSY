import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  mistakes: '@oopsy/mistakes',
  settings: '@oopsy/settings',
};

export const DEFAULT_SETTINGS = {
  pinEnabled: false,
  biometricEnabled: false,
  notificationsEnabled: true,
  notificationTime: '20:00',
  customCauses: [],
  customCategories: [],
  onboardingDone: false,
  name: '',
  role: '',
  focus: [],
};

const readJSON = async (key, fallback) => {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    console.warn(`Could not read ${key}`, e);
    return fallback;
  }
};

export const loadMistakes = () => readJSON(KEYS.mistakes, []);
export const saveMistakes = (list) => AsyncStorage.setItem(KEYS.mistakes, JSON.stringify(list));

export const loadSettings = async () => ({
  ...DEFAULT_SETTINGS,
  ...(await readJSON(KEYS.settings, {})),
});
export const saveSettings = (s) => AsyncStorage.setItem(KEYS.settings, JSON.stringify(s));
