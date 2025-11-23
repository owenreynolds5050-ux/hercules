import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

import { canUseAsyncStorage } from '@/utils/environment';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

const createAuthStorage = () => {
  if (canUseAsyncStorage()) {
    return AsyncStorage;
  }

  const memoryStorage: Record<string, string> = {};

  return {
    isServer: true,
    getItem: async (key: string): Promise<string | null> => {
      return memoryStorage[key] ?? null;
    },
    setItem: async (key: string, value: string): Promise<void> => {
      memoryStorage[key] = value;
    },
    removeItem: async (key: string): Promise<void> => {
      delete memoryStorage[key];
    },
  };
};

export const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: createAuthStorage(),
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
});
