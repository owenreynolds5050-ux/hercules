/**
 * WorkoutExerciseSummaryCard
 * Molecule component that visualizes an exercise with its logged sets.
 */

import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { Layout } from 'react-native-reanimated';

import { Text } from '@/components/atoms/Text';
import { SurfaceCard } from '@/components/atoms/SurfaceCard';
import { colors, radius, spacing } from '@/constants/theme';
import type { WorkoutExercise } from '@/types/workout';

interface WorkoutExerciseSummaryCardProps {
  exercise: WorkoutExercise;
  index: number;
}

/**
 * WorkoutExerciseSummaryCard
 * Displays an exercise name alongside its logged sets and completion state.
 *
 * @param exercise - The exercise data with sets to render.
 * @param index - Index for display ordering.
 */
export const WorkoutExerciseSummaryCard: React.FC<WorkoutExerciseSummaryCardProps> = ({
  exercise,
  index,
}) => {
  return (
    <Animated.View layout={Layout.springify()} style={styles.wrapper}>
      <SurfaceCard tone="card" padding="lg" style={styles.card}>
        <View style={styles.header}>
          <View style={styles.titleGroup}>
            <Text variant="bodySemibold" color="primary">
              {exercise.name}
            </Text>
          </View>
        </View>

        <View style={styles.setList}>
          {exercise.sets.map((set, setIndex) => {
            const effortLabel = `${set.weight ?? 0} lbs × ${set.reps ?? 0} reps`;

            return (
              <View key={`${exercise.name}-${setIndex}`} style={styles.setRow}>
                <View style={styles.setMeta}>
                  <Text variant="bodySemibold" color="primary">
                    {`Set ${setIndex + 1}`}
                  </Text>
                  <Text variant="body" color="secondary">
                    {effortLabel}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      </SurfaceCard>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
  },
  card: {
    gap: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleGroup: {
    flex: 1,
    gap: spacing.xs,
  },
  setList: {
    gap: spacing.sm,
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radius.mdCompact,
    backgroundColor: colors.surface.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.accent.orangeLight,
  },
  setMeta: {
    flex: 1,
    gap: spacing.xxxs,
  },
});
