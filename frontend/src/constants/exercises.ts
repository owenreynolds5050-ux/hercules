import rawExercises from '@/data/exercises.json';
import { normalizeSearchText } from '@/utils/strings';
import {
  type DifficultyLevel,
  type EquipmentType,
  type Exercise,
  type ExerciseCatalogItem,
  type MovementPattern,
  type MuscleGroup,
  type FilterMuscleGroup,
  DIFFICULTY_LEVELS,
  EQUIPMENT_TYPES,
  MOVEMENT_PATTERNS,
  MUSCLE_GROUPS,
  FILTER_MUSCLE_GROUPS,
  FILTER_EQUIPMENT,
  FILTER_DIFFICULTY,
} from '@/types/exercise';

interface RawExercise {
  id: string;
  name: string;
  primary_muscle: MuscleGroup;
  secondary_muscles: MuscleGroup[];
  equipment: EquipmentType[];
  movement_pattern: MovementPattern;
  difficulty: DifficultyLevel;
  is_compound: boolean;
  muscle_group: FilterMuscleGroup;
}

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === 'string');

const isValidRawExercise = (candidate: unknown): candidate is RawExercise => {
  if (!candidate || typeof candidate !== 'object') {
    return false;
  }

  const exercise = candidate as Partial<RawExercise>;

  return (
    typeof exercise.id === 'string' &&
    typeof exercise.name === 'string' &&
    typeof exercise.primary_muscle === 'string' &&
    isStringArray(exercise.secondary_muscles) &&
    isStringArray(exercise.equipment) &&
    typeof exercise.movement_pattern === 'string' &&
    typeof exercise.difficulty === 'string' &&
    typeof exercise.is_compound === 'boolean' &&
    typeof exercise.muscle_group === 'string'
  );
};

const buildSearchIndex = (exercise: RawExercise): string => {
  const parts: string[] = [
    exercise.name,
    exercise.primary_muscle,
    ...exercise.secondary_muscles,
    ...exercise.equipment,
    exercise.movement_pattern,
    exercise.difficulty,
    exercise.muscle_group,
  ];

  if (exercise.is_compound) {
    parts.push('compound');
  }

  if (exercise.equipment.length === 1 && exercise.equipment[0] === 'Bodyweight') {
    parts.push('bodyweight');
  }

  return normalizeSearchText(parts.join(' '));
};

const toExercise = (exercise: RawExercise): ExerciseCatalogItem => {
  const isBodyweight =
    exercise.equipment.length === 1 && exercise.equipment[0] === 'Bodyweight';

  return {
    id: exercise.id,
    name: exercise.name,
    muscleGroup: exercise.primary_muscle,
    filterMuscleGroup: exercise.muscle_group,
    secondaryMuscleGroups: exercise.secondary_muscles,
    equipment: exercise.equipment,
    movementPattern: exercise.movement_pattern,
    difficulty: exercise.difficulty,
    isCompound: exercise.is_compound,
    isBodyweight,
    searchIndex: buildSearchIndex(exercise),
  };
};

// Handle both array and single object formats for robustness
const rawData = Array.isArray(rawExercises)
  ? rawExercises
  : [rawExercises];

const rawExerciseList = (rawData as unknown[]).filter(isValidRawExercise);

export const exercises: ExerciseCatalogItem[] = rawExerciseList.map(toExercise);

const exerciseLookup = new Map<string, ExerciseCatalogItem>(
  exercises.map((exercise) => [exercise.id, exercise]),
);

export const getExerciseById = (id: string): ExerciseCatalogItem | undefined =>
  exerciseLookup.get(id);

export const exerciseFilterOptions = {
  muscleGroups: FILTER_MUSCLE_GROUPS,
  equipment: FILTER_EQUIPMENT,
  difficulty: FILTER_DIFFICULTY,
} as const;

export type { Exercise, ExerciseCatalogItem } from '@/types/exercise';

