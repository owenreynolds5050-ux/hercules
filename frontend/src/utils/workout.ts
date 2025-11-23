/**
 * workout utils
 * Formatting helpers for workout session data.
 */

import type { Workout } from '@/types/workout';

/**
 * Formats a workout session title, prioritizing the linked plan name when available.
 */
export const formatWorkoutTitle = (workout: Workout | null, planName: string | null): string => {
  if (planName) {
    return planName;
  }

  if (!workout) {
    return 'Workout Session';
  }

  const timestamp = workout.endTime ?? workout.startTime ?? Date.parse(workout.date);
  const date = new Date(timestamp);
  return `${date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} Session`;
};

/**
 * Formats the session start or end timestamp into a friendly date/time string.
 */
export const formatSessionDateTime = (workout: Workout | null): string => {
  if (!workout) {
    return '';
  }

  const timestamp = workout.endTime ?? workout.startTime ?? Date.parse(workout.date);
  const date = new Date(timestamp);

  return date.toLocaleString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

/**
 * Formats a duration in seconds into a human readable string.
 */
export const formatDurationLabel = (duration?: number): string => {
  if (!duration || duration <= 0) {
    return 'Not tracked';
  }

  const minutes = Math.floor(duration / 60);
  const seconds = duration % 60;

  if (minutes === 0) {
    return `${seconds}s`;
  }

  return `${minutes}m ${seconds.toString().padStart(2, '0')}s`;
};

/**
 * Generates a brief summary string describing the workout contents.
 */
export const getWorkoutSummary = (workout: Workout): string => {
  const completedExercises = workout.exercises.filter((exercise) =>
    exercise.sets.length > 0 ? exercise.sets.every((set) => set.completed) : false
  );
  const completedCount = completedExercises.length;
  const base = `${completedCount} completed ${completedCount === 1 ? 'exercise' : 'exercises'}`;
  const durationMinutes = workout.duration ? Math.max(Math.round(workout.duration / 60), 1) : null;

  if (durationMinutes) {
    return `${base} · ${durationMinutes} min session`;
  }

  return base;
};

/**
 * Aggregates total and completed set counts for a workout.
 */
export const getWorkoutTotals = (
  workout: Workout | null,
): { totalSets: number; completedSets: number } => {
  if (!workout) {
    return { totalSets: 0, completedSets: 0 };
  }

  return workout.exercises.reduce(
    (acc, exercise) => {
      const completed = exercise.sets.filter((set) => set.completed).length;

      return {
        totalSets: acc.totalSets + exercise.sets.length,
        completedSets: acc.completedSets + completed,
      };
    },
    { totalSets: 0, completedSets: 0 },
  );
};
