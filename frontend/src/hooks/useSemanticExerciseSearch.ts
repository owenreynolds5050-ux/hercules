/**
 * useSemanticExerciseSearch
 * Lightweight semantic-ish lookup with synonyms + fuzzy scoring.
 */
import { useMemo } from 'react';

import type { ExerciseCatalogItem } from '@/constants/exercises';
import { normalizeSearchText } from '@/utils/strings';

interface UseSemanticExerciseSearchOptions {
  limit?: number;
  excludeIds?: string[];
}

const TOKEN_SYNONYMS: Record<string, string[]> = {
  chest: ['pec', 'pectorals', 'push'],
  pec: ['chest'],
  back: ['pull', 'lats', 'posterior'],
  legs: ['lower', 'quads', 'glutes', 'squat'],
  shoulders: ['delts', 'press'],
  hamstrings: ['posterior', 'hinge'],
  glutes: ['posterior', 'hips'],
  full: ['total', 'compound'],
  press: ['push'],
  row: ['pull'],
  squat: ['legs', 'hinge'],
  deadlift: ['hinge', 'posterior'],
  hinge: ['posterior', 'deadlift'],
  lunge: ['single', 'split'],
  carry: ['farmer', 'loaded'],
  rotation: ['anti-rotation', 'twist'],
  olympic: ['power', 'explosive'],
  arms: ['biceps', 'triceps'],
  biceps: ['arms'],
  triceps: ['arms'],
};

const normalize = (value: string): string =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const expandTokens = (tokens: string[]): string[] => {
  const expanded = new Set(tokens);

  tokens.forEach((token) => {
    const synonyms = TOKEN_SYNONYMS[token];

    if (synonyms) {
      synonyms.forEach((synonym) => expanded.add(synonym));
    }
  });

  return Array.from(expanded);
};

const scoreExercise = (exercise: ExerciseCatalogItem, tokens: string[]): number => {
  if (tokens.length === 0) {
    return 0;
  }

  const normalizedName = normalizeSearchText(exercise.name);
  const muscleGroup = normalizeSearchText(exercise.muscleGroup);
  const filterMuscleGroup = normalizeSearchText(exercise.filterMuscleGroup);
  const secondaryMuscleGroups = exercise.secondaryMuscleGroups.map(normalizeSearchText);
  const equipment = exercise.equipment.map(normalizeSearchText);
  const movementPattern = normalizeSearchText(exercise.movementPattern);
  const searchIndex = exercise.searchIndex;

  return tokens.reduce((score, token) => {
    if (!token) {
      return score;
    }

    if (normalizedName === token) {
      return score + 10;
    }

    if (normalizedName.startsWith(token)) {
      return score + 7;
    }

    if (normalizedName.includes(token)) {
      return score + 6;
    }

    if (muscleGroup.includes(token) || filterMuscleGroup.includes(token)) {
      return score + 5;
    }

    if (secondaryMuscleGroups.some((target) => target.includes(token))) {
      return score + 4;
    }

    if (equipment.some((item) => item.includes(token))) {
      return score + 4;
    }

    if (movementPattern.includes(token)) {
      return score + 3;
    }

    if (token === 'compound' && exercise.isCompound) {
      return score + 5;
    }

    if (token === 'bodyweight' && exercise.isBodyweight) {
      return score + 5;
    }

    if (searchIndex.includes(token)) {
      return score + 2;
    }

    return score;
  }, 0);
};

export const useSemanticExerciseSearch = (
  query: string,
  exercises: ExerciseCatalogItem[],
  options?: UseSemanticExerciseSearchOptions,
): ExerciseCatalogItem[] => {
  const { limit = 6, excludeIds = [] } = options ?? {};

  const excludeKey = useMemo(() => excludeIds.slice().sort().join('|'), [excludeIds]);

  return useMemo(() => {
    const normalizedQuery = normalizeSearchText(query);

    if (!normalizedQuery) {
      return [];
    }

    const tokens = expandTokens(normalizedQuery.split(' ').filter(Boolean));
    const excluded = new Set(excludeIds);

    return exercises
      .filter((exercise) => !excluded.has(exercise.id))
      .map((exercise) => ({ exercise, score: scoreExercise(exercise, tokens) }))
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((entry) => entry.exercise);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exercises, query, limit, excludeKey]);
};
