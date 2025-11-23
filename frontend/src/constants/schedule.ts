import type { ScheduleDayKey, ScheduleWeekdayAssignment } from '@/types/schedule';

export interface WeekdayLabel {
  key: ScheduleDayKey;
  label: string;
}

export const WEEKDAY_LABELS: WeekdayLabel[] = [
  { key: 'sunday', label: 'Sunday' },
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
  { key: 'saturday', label: 'Saturday' },
];

export const createEmptyWeekdayAssignment = (): ScheduleWeekdayAssignment => ({
  sunday: null,
  monday: null,
  tuesday: null,
  wednesday: null,
  thursday: null,
  friday: null,
  saturday: null,
});

export const createScheduleId = (): string => {
  return `schedule-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
};
