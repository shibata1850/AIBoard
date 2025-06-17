import AsyncStorage from '@react-native-async-storage/async-storage';

export interface CompanyInfoSettings {
  learningEnabled: boolean;
  updateFrequency: 'realtime' | 'hourly' | 'daily' | 'weekly';
  lastUpdated: string;
  autoSync: boolean;
}

const SETTINGS_KEY = 'company_info_settings';

const defaultSettings: CompanyInfoSettings = {
  learningEnabled: true,
  updateFrequency: 'daily',
  lastUpdated: new Date().toISOString(),
  autoSync: true,
};

export async function getCompanyInfoSettings(): Promise<CompanyInfoSettings> {
  try {
    const stored = await AsyncStorage.getItem(SETTINGS_KEY);
    if (stored) {
      return { ...defaultSettings, ...JSON.parse(stored) };
    }
    return defaultSettings;
  } catch (error) {
    console.error('Error loading company info settings:', error);
    return defaultSettings;
  }
}

export async function saveCompanyInfoSettings(settings: Partial<CompanyInfoSettings>): Promise<void> {
  try {
    const current = await getCompanyInfoSettings();
    const updated = { ...current, ...settings };
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Error saving company info settings:', error);
    throw error;
  }
}

export async function updateLastSyncTime(): Promise<void> {
  try {
    await saveCompanyInfoSettings({
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error updating last sync time:', error);
  }
}

export function getUpdateIntervalMs(frequency: CompanyInfoSettings['updateFrequency']): number {
  switch (frequency) {
    case 'realtime':
      return 0; // No interval, update immediately
    case 'hourly':
      return 60 * 60 * 1000; // 1 hour
    case 'daily':
      return 24 * 60 * 60 * 1000; // 24 hours
    case 'weekly':
      return 7 * 24 * 60 * 60 * 1000; // 7 days
    default:
      return 24 * 60 * 60 * 1000; // Default to daily
  }
}
