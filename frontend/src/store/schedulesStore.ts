import { create } from 'zustand';

import type { Schedule } from '@/types/schedule';
import { loadStoredSchedules, persistStoredSchedules } from '@/utils/scheduleStorage';

interface SchedulesState {
  schedules: Schedule[];
  addSchedule: (schedule: Schedule) => Promise<void>;
  deleteSchedule: (id: string) => Promise<void>;
  updateSchedule: (schedule: Schedule) => Promise<void>;
  getSchedules: () => Schedule[];
  hydrateSchedules: () => Promise<void>;
}

export const useSchedulesStore = create<SchedulesState>((set, get) => ({
  schedules: [],
  addSchedule: async (schedule) => {
    const next = [schedule, ...get().schedules];
    set({ schedules: next });

    try {
      await persistStoredSchedules(next);
    } catch (error) {
      console.error('[schedulesStore] Failed to persist schedules after add', error);
    }
  },
  deleteSchedule: async (id) => {
    const next = get().schedules.filter((schedule) => schedule.id !== id);
    set({ schedules: next });

    try {
      await persistStoredSchedules(next);
    } catch (error) {
      console.error('[schedulesStore] Failed to persist schedules after delete', error);
    }
  },
  updateSchedule: async (schedule) => {
    const next = get().schedules.map((existing) => {
      if (existing.id === schedule.id) {
        return schedule;
      }

      return existing;
    });

    set({ schedules: next });

    try {
      await persistStoredSchedules(next);
    } catch (error) {
      console.error('[schedulesStore] Failed to persist schedules after update', error);
    }
  },
  getSchedules: () => {
    return get().schedules;
  },
  hydrateSchedules: async () => {
    try {
      console.log('[schedulesStore] HYDRATING SCHEDULES');
      const stored = await loadStoredSchedules();
      set({ schedules: stored });
    } catch (error) {
      console.error('[schedulesStore] Failed to hydrate schedules', error);
    }
  },
}));

export type { SchedulesState };
