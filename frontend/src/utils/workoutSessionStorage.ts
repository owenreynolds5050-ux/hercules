import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Workout } from '@/types/workout';
import { canUseAsyncStorage } from '@/utils/environment';

const WORKOUTS_STORAGE_KEY = 'hercules/workouts';

const logError = (message: string, error: unknown): void => {
  console.error(`[workoutSessionStorage] ${message}`, error);
};

const serializeWorkouts = (workouts: Workout[]): string => {
  return JSON.stringify(workouts);
};

const parseWorkouts = (value: string | null): Workout[] => {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value) as Workout[];

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((workout) => Boolean(workout?.id));
  } catch (error) {
    logError('Failed to parse workouts snapshot', error);
    return [];
  }
};

const warnAsyncStorageUnavailable = (operation: string): void => {
  console.warn(`[workoutSessionStorage] ${operation} skipped because AsyncStorage is unavailable in this environment.`);
};

export const loadStoredWorkoutSessions = async (): Promise<Workout[]> => {
  if (!canUseAsyncStorage()) {
    return [];
  }

  try {
    const stored = await AsyncStorage.getItem(WORKOUTS_STORAGE_KEY);
    return parseWorkouts(stored);
  } catch (error) {
    logError('Failed to load stored workouts', error);
    return [];
  }
};

export const persistStoredWorkoutSessions = async (workouts: Workout[]): Promise<void> => {
  if (!canUseAsyncStorage()) {
    warnAsyncStorageUnavailable('persistStoredWorkoutSessions');
    return;
  }

  try {
    await AsyncStorage.setItem(WORKOUTS_STORAGE_KEY, serializeWorkouts(workouts));
  } catch (error) {
    logError('Failed to persist workouts snapshot', error);
    throw new Error('Unable to persist workouts');
  }
};

export const clearStoredWorkoutSessions = async (): Promise<void> => {
  if (!canUseAsyncStorage()) {
    warnAsyncStorageUnavailable('clearStoredWorkoutSessions');
    return;
  }

  try {
    await AsyncStorage.removeItem(WORKOUTS_STORAGE_KEY);
  } catch (error) {
    logError('Failed to clear stored workouts', error);
    throw new Error('Unable to clear stored workouts');
  }
};
