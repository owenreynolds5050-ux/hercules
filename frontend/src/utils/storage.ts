import AsyncStorage from '@react-native-async-storage/async-storage';

import type { WorkoutPlan } from '@/types/plan';
import { canUseAsyncStorage } from '@/utils/environment';

const PLANS_STORAGE_KEY = '@hercules/plans';
const PENDING_PROFILE_KEY = '@hercules/pending-profile';
const PENDING_AUTH_EMAIL_KEY = '@hercules/pending-auth-email';

export interface PendingProfileDraft {
  firstName: string;
  lastName: string;
  email: string;
}

const logError = (message: string, error: unknown) => {
  console.error(`[storage] ${message}`, error);
};

const serializePlans = (plans: WorkoutPlan[]): string => {
  return JSON.stringify(plans);
};

const parsePlans = (value: string | null): WorkoutPlan[] => {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value) as WorkoutPlan[];

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((plan) => Boolean(plan?.id));
  } catch (error) {
    logError('Failed to parse plans snapshot', error);
    return [];
  }
};

const warnAsyncStorageUnavailable = (operation: string): void => {
  console.warn(`[storage] ${operation} skipped because AsyncStorage is unavailable in this environment.`);
};

export const getPlans = async (): Promise<WorkoutPlan[]> => {
  if (!canUseAsyncStorage()) {
    return [];
  }

  try {
    const storedPlans = await AsyncStorage.getItem(PLANS_STORAGE_KEY);
    return parsePlans(storedPlans);
  } catch (error) {
    logError('Failed to load plans', error);
    return [];
  }
};

export const savePlan = async (plan: WorkoutPlan): Promise<void> => {
  if (!canUseAsyncStorage()) {
    warnAsyncStorageUnavailable('savePlan');
    return;
  }

  try {
    console.log('[storage.savePlan] CALLED WITH:', plan);
    const existingPlans = await getPlans();
    const filteredPlans = existingPlans.filter((existing) => existing.id !== plan.id);
    const updatedPlans = [...filteredPlans, plan];
    await AsyncStorage.setItem(PLANS_STORAGE_KEY, serializePlans(updatedPlans));
    console.log('[storage.savePlan] SAVED SUCCESSFULLY');
  } catch (error) {
    console.error('[storage.savePlan] ERROR:', error);
    logError('Failed to save plan', error);
    throw error;
  }
};

export const deletePlan = async (id: string): Promise<void> => {
  if (!canUseAsyncStorage()) {
    warnAsyncStorageUnavailable('deletePlan');
    return;
  }

  try {
    const existingPlans = await getPlans();
    const updatedPlans = existingPlans.filter((plan) => plan.id !== id);
    await AsyncStorage.setItem(PLANS_STORAGE_KEY, serializePlans(updatedPlans));
  } catch (error) {
    logError('Failed to delete plan', error);
    throw new Error('Unable to delete plan');
  }
};

export const setPendingProfileDraft = async (profile: PendingProfileDraft): Promise<void> => {
  if (!canUseAsyncStorage()) {
    warnAsyncStorageUnavailable('setPendingProfileDraft');
    return;
  }

  try {
    await AsyncStorage.setItem(PENDING_PROFILE_KEY, JSON.stringify(profile));
  } catch (error) {
    logError('Failed to persist pending profile', error);
  }
};

export const getPendingProfileDraft = async (): Promise<PendingProfileDraft | null> => {
  if (!canUseAsyncStorage()) {
    return null;
  }

  try {
    const rawValue = await AsyncStorage.getItem(PENDING_PROFILE_KEY);

    if (!rawValue) {
      return null;
    }

    const parsed = JSON.parse(rawValue) as PendingProfileDraft;

    if (!parsed.firstName || !parsed.lastName || !parsed.email) {
      return null;
    }

    return parsed;
  } catch (error) {
    logError('Failed to load pending profile', error);
    return null;
  }
};

export const clearPendingProfileDraft = async (): Promise<void> => {
  if (!canUseAsyncStorage()) {
    warnAsyncStorageUnavailable('clearPendingProfileDraft');
    return;
  }

  try {
    await AsyncStorage.removeItem(PENDING_PROFILE_KEY);
  } catch (error) {
    logError('Failed to clear pending profile', error);
  }
};

export const setPendingAuthEmail = async (email: string): Promise<void> => {
  if (!canUseAsyncStorage()) {
    warnAsyncStorageUnavailable('setPendingAuthEmail');
    return;
  }

  try {
    await AsyncStorage.setItem(PENDING_AUTH_EMAIL_KEY, email.trim().toLowerCase());
  } catch (error) {
    logError('Failed to persist pending auth email', error);
  }
};

export const getPendingAuthEmail = async (): Promise<string | null> => {
  if (!canUseAsyncStorage()) {
    return null;
  }

  try {
    const storedEmail = await AsyncStorage.getItem(PENDING_AUTH_EMAIL_KEY);

    if (!storedEmail) {
      return null;
    }

    return storedEmail;
  } catch (error) {
    logError('Failed to load pending auth email', error);
    return null;
  }
};

export const clearPendingAuthEmail = async (): Promise<void> => {
  if (!canUseAsyncStorage()) {
    warnAsyncStorageUnavailable('clearPendingAuthEmail');
    return;
  }

  try {
    await AsyncStorage.removeItem(PENDING_AUTH_EMAIL_KEY);
  } catch (error) {
    logError('Failed to clear pending auth email', error);
  }
};
