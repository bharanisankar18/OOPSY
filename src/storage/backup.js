import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { dayKey } from '../utils/dates';

const BACKUP_VERSION = 1;

export const exportBackup = async (mistakes, settings) => {
  const { pinEnabled, biometricEnabled, ...portableSettings } = settings;
  const payload = {
    app: 'oopsy',
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    settings: portableSettings,
    mistakes,
  };
  const file = new File(Paths.cache, `oopsy-backup-${dayKey(new Date())}.json`);
  if (file.exists) file.delete();
  file.create();
  await file.write(JSON.stringify(payload, null, 2));

  if (!(await Sharing.isAvailableAsync())) {
    throw new Error('Sharing is not available on this device.');
  }
  await Sharing.shareAsync(file.uri, {
    mimeType: 'application/json',
    dialogTitle: 'Save your Oopsy backup',
    UTI: 'public.json',
  });
};

const isValidMistake = (m) =>
  m &&
  typeof m.id === 'string' &&
  typeof m.title === 'string' &&
  typeof m.lesson === 'string' &&
  Array.isArray(m.causes) &&
  m.review &&
  typeof m.review.stage === 'number' &&
  Array.isArray(m.review.history);

/** Returns { mistakes, settings } or null if the user cancelled. Throws on a bad file. */
export const pickBackup = async () => {
  const res = await DocumentPicker.getDocumentAsync({
    type: ['application/json', 'text/plain', '*/*'],
    copyToCacheDirectory: true,
  });
  if (res.canceled || !res.assets?.length) return null;

  const text = await new File(res.assets[0].uri).text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error("That file isn't valid JSON. Pick a backup exported from Oopsy.");
  }
  if (data?.app !== 'oopsy' || !Array.isArray(data.mistakes)) {
    throw new Error("That file isn't an Oopsy backup. Pick a file named oopsy-backup-….json.");
  }
  const mistakes = data.mistakes.filter(isValidMistake);
  return { mistakes, settings: data.settings || {}, skipped: data.mistakes.length - mistakes.length };
};
