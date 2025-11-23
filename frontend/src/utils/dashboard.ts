/**
 * Dashboard utilities
 * Helper functions for generating dashboard data structures.
 */

import { WeekDayTracker } from '@/types/dashboard';
import type { Workout } from '@/types/workout';
import { formatDateToLocalISO, getDeviceCurrentDate } from '@/utils/date';

const dayLabels: string[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const getWorkoutLocalISO = (workout: Workout): string | null => {
  if (workout.startTime) {
    return formatDateToLocalISO(new Date(workout.startTime));
  }

  if (workout.date) {
    return formatDateToLocalISO(new Date(workout.date));
  }

  return null;
};

export const createWeekTracker = (workouts: Workout[]): WeekDayTracker[] => {
  const today = getDeviceCurrentDate();
  const todayISO = formatDateToLocalISO(today);

  const startOfWeek = new Date(today);
  startOfWeek.setHours(0, 0, 0, 0);
  startOfWeek.setDate(today.getDate() - today.getDay());

  const workoutDates = new Set<string>();

  workouts.forEach((workout) => {
    const workoutISO = getWorkoutLocalISO(workout);
    if (workoutISO) {
      workoutDates.add(workoutISO);
    }
  });

  return dayLabels.map((label, index) => {
    const dayDate = new Date(startOfWeek);
    dayDate.setDate(startOfWeek.getDate() + index);
    const dayISO = formatDateToLocalISO(dayDate);

    return {
      id: `${dayISO}-${label.toLowerCase()}`,
      label,
      date: dayDate.getDate().toString(),
      hasWorkout: workoutDates.has(dayISO),
      isToday: dayISO === todayISO,
    };
  });
};
