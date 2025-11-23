export interface PlanExercise {
  id: string;
  name: string;
  sets: number;
}

export interface WorkoutPlan {
  id: string;
  name: string;
  exercises: PlanExercise[];
  createdAt: string;
}
