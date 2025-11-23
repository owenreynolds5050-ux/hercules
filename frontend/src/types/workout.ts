export interface SetLog {
  reps: number;
  weight: number;
  completed: boolean;
}

export interface WorkoutExercise {
  name: string;
  sets: SetLog[];
}

export interface Workout {
  id: string;
  planId: string | null;
  date: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  exercises: WorkoutExercise[];
}
