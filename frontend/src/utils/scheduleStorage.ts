import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Schedule } from '@/types/schedule';
import { canUseAsyncStorage } from '@/utils/environment';

const SCHEDULES_STORAGE_KEY = 'hercules/schedules';

const logError = (message: string, error: unknown): void => {
  console.error(`[scheduleStorage] ${message}`, error);
};

const serializeSchedules = (schedules: Schedule[]): string => {
  return JSON.stringify(schedules);
};

const parseSchedules = (value: string | null): Schedule[] => {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value) as Schedule[];

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((schedule) => Boolean(schedule?.id));
  } catch (error) {
    logError('Failed to parse schedules snapshot', error);
    return [];
  }
};

const warnAsyncStorageUnavailable = (operation: string): void => {
  console.warn(`[scheduleStorage] ${operation} skipped because AsyncStorage is unavailable in this environment.`);
};

export const loadStoredSchedules = async (): Promise<Schedule[]> => {
  if (!canUseAsyncStorage()) {
    return [];
  }

  try {
    const stored = await AsyncStorage.getItem(SCHEDULES_STORAGE_KEY);
    return parseSchedules(stored);
  } catch (error) {
    logError('Failed to load stored schedules', error);
    return [];
  }
};

export const persistStoredSchedules = async (schedules: Schedule[]): Promise<void> => {
  if (!canUseAsyncStorage()) {
    warnAsyncStorageUnavailable('persistStoredSchedules');
    return;
  }

  try {
    console.log('SAVING SCHEDULE TO ASYNCSTORAGE:', schedules);
    await AsyncStorage.setItem(SCHEDULES_STORAGE_KEY, serializeSchedules(schedules));
  } catch (error) {
    logError('Failed to persist schedules snapshot', error);
    throw new Error('Unable to persist schedules');
  }
};

export const clearStoredSchedules = async (): Promise<void> => {
  if (!canUseAsyncStorage()) {
    warnAsyncStorageUnavailable('clearStoredSchedules');
    return;
  }

  try {
    await AsyncStorage.removeItem(SCHEDULES_STORAGE_KEY);
  } catch (error) {
    logError('Failed to clear stored schedules', error);
    throw new Error('Unable to clear stored schedules');
  }
};
