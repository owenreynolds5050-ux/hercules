import { useCallback, useMemo, useState } from 'react';
import * as Haptics from 'expo-haptics';

import { exercises, type Exercise } from '@/constants/exercises';
import type { PlanExercise, WorkoutPlan } from '@/types/plan';
import { savePlan } from '@/utils/storage';

const DEFAULT_SET_COUNT = 3;
const createPlanId = (): string => `${Date.now()}-${Math.round(Math.random() * 1000)}`;

type AddExerciseResult = 'success' | 'invalid';
type SavePlanResult = 'success' | 'missing-name' | 'no-exercises' | 'error';

interface UsePlanBuilderReturn {
  planName: string;
  setPlanName: (value: string) => void;
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  filteredExercises: Exercise[];
  selectedExercises: PlanExercise[];
  isModalVisible: boolean;
  pendingExercise: Exercise | null;
  setCountInput: string;
  setSetCountInput: (value: string) => void;
  startExerciseSelection: (exercise: Exercise) => void;
  closeModal: () => void;
  confirmPendingExercise: () => Promise<AddExerciseResult>;
  submitPlan: () => Promise<SavePlanResult>;
  isSaving: boolean;
}

export const usePlanBuilder = (): UsePlanBuilderReturn => {
  const [planName, setPlanName] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedExercises, setSelectedExercises] = useState<PlanExercise[]>([]);
  const [pendingExercise, setPendingExercise] = useState<Exercise | null>(null);
  const [setCountInput, setSetCountInput] = useState<string>(String(DEFAULT_SET_COUNT));
  const [isModalVisible, setModalVisible] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const filteredExercises = useMemo<Exercise[]>(() => {
    const term = searchTerm.trim().toLowerCase();

    if (!term) {
      return exercises;
    }

    return exercises.filter((exercise) => {
      return (
        exercise.name.toLowerCase().includes(term) ||
        exercise.muscleGroup.toLowerCase().includes(term)
      );
    });
  }, [searchTerm]);

  const startExerciseSelection = useCallback((exercise: Exercise) => {
    const existing = selectedExercises.find((item) => item.id === exercise.id);
    setPendingExercise(exercise);
    setSetCountInput(existing ? String(existing.sets) : String(DEFAULT_SET_COUNT));
    setModalVisible(true);
  }, [selectedExercises]);

  const closeModal = useCallback(() => {
    setModalVisible(false);
    setPendingExercise(null);
  }, []);

  const confirmPendingExercise = useCallback(async (): Promise<AddExerciseResult> => {
    if (!pendingExercise) {
      return 'invalid';
    }

    const setsNumber = Number(setCountInput);

    if (!Number.isFinite(setsNumber) || setsNumber < 1) {
      return 'invalid';
    }

    const exercise = pendingExercise;

    setSelectedExercises((prev) => {
      const existingIndex = prev.findIndex((item) => item.id === exercise.id);

      if (existingIndex >= 0) {
        const next = [...prev];
        next[existingIndex] = { ...next[existingIndex], sets: setsNumber };
        return next;
      }

      return [...prev, { id: exercise.id, name: exercise.name, sets: setsNumber }];
    });

    await Haptics.selectionAsync();
    closeModal();
    return 'success';
  }, [closeModal, pendingExercise, setCountInput]);

  const submitPlan = useCallback(async (): Promise<SavePlanResult> => {
    const trimmedName = planName.trim();

    console.log('[usePlanBuilder] SUBMITTING PLAN:', {
      name: trimmedName,
      exercises: selectedExercises,
    });

    if (!trimmedName) {
      return 'missing-name';
    }

    if (selectedExercises.length === 0) {
      return 'no-exercises';
    }

    setIsSaving(true);

    const payload: WorkoutPlan = {
      id: createPlanId(),
      name: trimmedName,
      exercises: selectedExercises,
      createdAt: new Date().toISOString(),
    };

    try {
      console.log('[usePlanBuilder] Calling savePlan with:', payload);
      await savePlan(payload);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      return 'success';
    } catch (error) {
      console.error('[usePlanBuilder] failed to save plan', error);
      return 'error';
    } finally {
      setIsSaving(false);
    }
  }, [planName, selectedExercises]);

  return {
    planName,
    setPlanName,
    searchTerm,
    setSearchTerm,
    filteredExercises,
    selectedExercises,
    isModalVisible,
    pendingExercise,
    setCountInput,
    setSetCountInput,
    startExerciseSelection,
    closeModal,
    confirmPendingExercise,
    submitPlan,
    isSaving,
  };
};
