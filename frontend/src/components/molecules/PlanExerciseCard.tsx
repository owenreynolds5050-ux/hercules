import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/atoms/Button';
import { SurfaceCard } from '@/components/atoms/SurfaceCard';
import { Text } from '@/components/atoms/Text';
import { colors, radius, spacing } from '@/constants/theme';
import type { Exercise } from '@/constants/exercises';

interface PlanExerciseCardProps {
  exercise: Exercise;
  onAdd: (exercise: Exercise) => void;
}

export const PlanExerciseCard: React.FC<PlanExerciseCardProps> = ({ exercise, onAdd }) => {
  const primarySecondaryLabel = useMemo(() => {
    const parts = [exercise.muscleGroup];
    
    if (exercise.secondaryMuscleGroups && exercise.secondaryMuscleGroups.length > 0) {
      parts.push(...exercise.secondaryMuscleGroups);
    }

    return parts.join(' · ');
  }, [exercise.muscleGroup, exercise.secondaryMuscleGroups]);

  return (
    <SurfaceCard tone="neutral" padding="lg" showAccentStripe={false} style={styles.card}>
      <View style={styles.content}>
        <View style={styles.meta}>
          <Text variant="bodySemibold" color="primary">
            {exercise.name}
          </Text>
          <Text variant="caption" color="secondary">
            {primarySecondaryLabel}
          </Text>
        </View>
        <Button label="Add" size="sm" variant="secondary" onPress={() => onAdd(exercise)} />
      </View>
    </SurfaceCard>
  );
};

const styles = StyleSheet.create({
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.accent.orangeLight,
    borderRadius: radius.lg,
    backgroundColor: colors.surface.card,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  meta: {
    flex: 1,
    gap: spacing.xs,
  },
});
