import { create } from 'zustand';

import type { Workout } from '@/types/workout';
import {
  clearStoredWorkoutSessions,
  loadStoredWorkoutSessions,
  persistStoredWorkoutSessions,
} from '@/utils/workoutSessionStorage';

interface WorkoutSessionsState {
  workouts: Workout[];
  addWorkout: (workout: Workout) => Promise<void>;
  updateWorkout: (workout: Workout) => Promise<void>;
  deleteWorkout: (id: string) => Promise<void>;
  getWorkouts: () => Workout[];
  clearWorkouts: () => Promise<void>;
  hydrateWorkouts: () => Promise<void>;
}

export const useWorkoutSessionsStore = create<WorkoutSessionsState>((set, get) => ({
  workouts: [],
  addWorkout: async (workout) => {
    const next = [workout, ...get().workouts];
    set({ workouts: next });

    try {
      await persistStoredWorkoutSessions(next);
    } catch (error) {
      console.error('[workoutSessionsStore] Failed to persist workouts after add', error);
    }
  },
  updateWorkout: async (workout) => {
    const next = get().workouts.map((existing) => (existing.id === workout.id ? workout : existing));
    set({ workouts: next });

    try {
      await persistStoredWorkoutSessions(next);
    } catch (error) {
      console.error('[workoutSessionsStore] Failed to persist workouts after update', error);
    }
  },
  deleteWorkout: async (id) => {
    const next = get().workouts.filter((workout) => workout.id !== id);
    set({ workouts: next });

    try {
      await persistStoredWorkoutSessions(next);
    } catch (error) {
      console.error('[workoutSessionsStore] Failed to persist workouts after delete', error);
    }
  },
  getWorkouts: () => {
    return get().workouts;
  },
  clearWorkouts: async () => {
    set({ workouts: [] });

    try {
      await clearStoredWorkoutSessions();
    } catch (error) {
      console.error('[workoutSessionsStore] Failed to clear stored workouts', error);
    }
  },
  hydrateWorkouts: async () => {
    try {
      const stored = await loadStoredWorkoutSessions();
      const normalized = stored.map((workout) => ({
        ...workout,
        exercises: Array.isArray(workout.exercises)
          ? workout.exercises.map((exercise) => ({
              ...exercise,
              sets: Array.isArray(exercise.sets)
                ? exercise.sets.map((set) => ({
                    reps: typeof set.reps === 'number' ? set.reps : 0,
                    weight: typeof set.weight === 'number' ? set.weight : 0,
                    completed: Boolean(set.completed),
                  }))
                : [],
            }))
          : [],
      }));

      set({ workouts: normalized });
    } catch (error) {
      console.error('[workoutSessionsStore] Failed to hydrate workouts', error);
    }
  },
}));

export type { WorkoutSessionsState };
