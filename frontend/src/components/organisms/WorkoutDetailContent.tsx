/**
 * WorkoutDetailContent
 * Organism that renders the core metrics and exercise list for a workout.
 */

import React, { useMemo } from 'react';
import { StyleSheet, View, type TextStyle } from 'react-native';
import Animated, { Layout } from 'react-native-reanimated';

import { Text } from '@/components/atoms/Text';
import { SurfaceCard } from '@/components/atoms/SurfaceCard';
import { WorkoutExerciseSummaryCard } from '@/components/molecules/WorkoutExerciseSummaryCard';
import { spacing, typography } from '@/constants/theme';
import type { Workout } from '@/types/workout';
import { formatDurationLabel, getWorkoutTotals } from '@/utils/workout';

interface WorkoutDetailContentProps {
  workout: Workout;
}

/**
 * WorkoutDetailContent
 *
 * @param workout - Completed workout session to visualize.
 */
export const WorkoutDetailContent: React.FC<WorkoutDetailContentProps> = ({ workout }) => {
  const durationLabel = useMemo(() => formatDurationLabel(workout.duration), [workout.duration]);
  const { completedSets } = useMemo(() => getWorkoutTotals(workout), [workout]);

  return (
    <Animated.View layout={Layout.springify()} style={styles.container}>
      <View style={styles.summarySection}>
        <Text variant="heading3" color="primary">
          Summary
        </Text>
        <SurfaceCard tone="card" padding="xl" style={styles.metricsCard}>
          <View style={styles.metricsRow}>
            <View style={styles.metricItem}>
              <Text variant="caption" color="primary" style={styles.metricLabel} numberOfLines={1}>
                Duration
              </Text>
              <Text variant="heading2" color="orange" style={styles.metricValue} numberOfLines={1}>
                {durationLabel}
              </Text>
            </View>
            <View style={styles.metricItem}>
              <Text variant="caption" color="primary" style={styles.metricLabel} numberOfLines={1}>
                Sets
              </Text>
              <Text variant="heading2" color="orange" style={styles.metricValue} numberOfLines={1}>
                {completedSets}
              </Text>
            </View>
          </View>
        </SurfaceCard>
      </View>

      <View style={styles.exerciseSection}>
        <Text variant="heading3" color="primary">
          Exercises
        </Text>
        <View style={styles.exerciseList}>
          {workout.exercises.map((exercise, index) => (
            <WorkoutExerciseSummaryCard key={`${exercise.name}-${index}`} exercise={exercise} index={index} />
          ))}
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: spacing['2xl'],
  },
  metricsCard: {
    gap: spacing.lg,
    overflow: 'hidden',
  },
  metricsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.lg,
  },
  metricItem: {
    flexBasis: '45%',
    gap: spacing.xxxs,
  },
  metricLabel: {
    ...typography.heading3,
    lineHeight: typography.heading3.lineHeight,
  } as TextStyle,
  summarySection: {
    gap: spacing.md,
  },
  exerciseSection: {
    gap: spacing.md,
  },
  exerciseList: {
    gap: spacing.md,
  },
  metricValue: {
    ...typography.heading2,
    lineHeight: typography.heading2.lineHeight,
  } as TextStyle,
});
