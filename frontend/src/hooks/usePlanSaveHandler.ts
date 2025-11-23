/**
 * usePlanSaveHandler
 * Handles persistence logic for Create Plan screen.
 */
import { useCallback, useMemo, useState } from 'react';
import * as Haptics from 'expo-haptics';

import type { Exercise } from '@/constants/exercises';
import { usePlansStore } from '@/store/plansStore';
import { savePlan } from '@/utils/storage';
import type { PlanExercise, WorkoutPlan } from '@/types/plan';

const DEFAULT_PLAN_SET_COUNT = 3;

const createPlanIdentifier = (): string => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export type SubmitPlanResult = 'success' | 'missing-name' | 'no-exercises' | 'error';

interface UsePlanSaveHandlerParams {
  editingPlanId: string | null;
  planName: string;
  selectedExercises: Exercise[];
  editingPlanCreatedAt: number | null;
  resetBuilder: () => void;
  onSuccess?: () => void;
}

interface PlanSaveHandlerState {
  isSaving: boolean;
  saveLabel: string;
  selectedListTitle: string;
  selectedListSubtitle: string;
  isSaveDisabled: boolean;
  handleSavePlan: () => Promise<SubmitPlanResult>;
}

export const usePlanSaveHandler = ({
  editingPlanId,
  planName,
  selectedExercises,
  editingPlanCreatedAt,
  resetBuilder,
  onSuccess,
}: UsePlanSaveHandlerParams): PlanSaveHandlerState => {
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const persistPlan = usePlansStore((state) => state.addPlan);
  const updatePlan = usePlansStore((state) => state.updatePlan);

  const isEditing = Boolean(editingPlanId);

  const handleSavePlan = useCallback(async (): Promise<SubmitPlanResult> => {
    const trimmedName = planName.trim();

    if (!trimmedName) {
      return 'missing-name';
    }

    if (selectedExercises.length === 0) {
      return 'no-exercises';
    }

    if (isSaving) {
      return 'error';
    }

    setIsSaving(true);

    const planIdentifier = editingPlanId ?? createPlanIdentifier();
    const createdAtTimestamp = editingPlanCreatedAt ?? Date.now();

    const normalizedExercises: PlanExercise[] = selectedExercises.map((exercise) => ({
      id: exercise.id,
      name: exercise.name,
      sets: DEFAULT_PLAN_SET_COUNT,
    }));

    const payload: WorkoutPlan = {
      id: planIdentifier,
      name: trimmedName,
      exercises: normalizedExercises,
      createdAt: new Date(createdAtTimestamp).toISOString(),
    };

    try {
      await savePlan(payload);

      if (isEditing) {
        updatePlan({
          id: planIdentifier,
          name: trimmedName,
          exercises: selectedExercises,
          createdAt: createdAtTimestamp,
        });
      } else {
        persistPlan({
          id: planIdentifier,
          name: trimmedName,
          exercises: selectedExercises,
          createdAt: createdAtTimestamp,
        });
      }

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      if (!isEditing) {
        resetBuilder();
      }

      onSuccess?.();
      return 'success';
    } catch (error) {
      console.error('[usePlanSaveHandler] Failed to save plan', error);
      return 'error';
    } finally {
      setIsSaving(false);
    }
  }, [editingPlanCreatedAt, editingPlanId, isEditing, isSaving, onSuccess, persistPlan, planName, resetBuilder, selectedExercises, updatePlan]);

  const saveLabel = 'Save Plan';
  const selectedListTitle = 'Exercises';
  const selectedListSubtitle = '';
  const saveCtaLabel = 'Save Plan';

  const isSaveDisabled = useMemo(() => {
    const trimmedName = planName.trim();
    return trimmedName.length === 0 || selectedExercises.length === 0 || isSaving;
  }, [planName, selectedExercises.length, isSaving]);

  return {
    isSaving,
    saveLabel,
    selectedListTitle,
    selectedListSubtitle,
    isSaveDisabled,
    handleSavePlan,
  };
};
