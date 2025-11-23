import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { SurfaceCard } from '@/components/atoms/SurfaceCard';
import { Text } from '@/components/atoms/Text';
import { ScreenHeader } from '@/components/molecules/ScreenHeader';
import { TabSwipeContainer } from '@/components/templates/TabSwipeContainer';
import { Button } from '@/components/atoms/Button';
import { WEEKDAY_LABELS } from '@/constants/schedule';
import { colors, radius, shadows, spacing } from '@/constants/theme';
import { usePlansStore, type Plan, type PlansState } from '@/store/plansStore';
import { useSchedulesStore, type SchedulesState } from '@/store/schedulesStore';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useSessionStore } from '@/store/sessionStore';
import type { WorkoutExercise } from '@/types/workout';
import type { Schedule } from '@/types/schedule';

const styles = StyleSheet.create({
  contentContainer: {
    flexGrow: 1,
    backgroundColor: colors.primary.bg,
    paddingTop: spacing.xl,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    gap: spacing.xl,
  },
  outerCardContent: {
    gap: spacing.lg,
  },
  scheduleCardContent: {
    gap: spacing.lg,
  },
  planCards: {
    gap: spacing.md,
  },
  planCreateButtonWrapper: {
    width: '100%',
  },
  planCardContent: {
    gap: spacing.xs,
  },
  planCardShell: {
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border.light,
    backgroundColor: colors.surface.card,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    ...shadows.cardSoft,
  },
  planActionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  planActionButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    gap: spacing.sm,
    backgroundColor: 'transparent',
  },
  planActionIconWrapper: {
    width: spacing['2xl'],
    height: spacing['2xl'],
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.accent.primary,
  },
  planExpandedContent: {
    gap: spacing.md,
  },
  planActionIconWarning: {
    borderColor: colors.accent.warning,
  },
  planActionIconSecondary: {
    borderColor: colors.border.medium,
  },
  planActionLabel: {
    textAlign: 'center',
  },
  planCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scheduleSubCard: {
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border.light,
    backgroundColor: colors.surface.card,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    ...shadows.cardSoft,
  },
  scheduleRows: {
    gap: spacing.sm,
  },
  scheduleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scheduleDayLabel: {
    flexShrink: 0,
  },
  schedulePlanLabel: {
    flex: 1,
    textAlign: 'right',
  },
  scheduleEmptyText: {
    textAlign: 'left',
  },
  scheduleButtonWrapper: {
    width: '100%',
  },
  dialogOverlay: {
    flex: 1,
    backgroundColor: colors.overlay.scrim,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  dialogCard: {
    width: '100%',
    maxWidth: 360,
    gap: spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.accent.orangeLight,
    borderRadius: radius.lg,
    backgroundColor: colors.surface.card,
  },
  dialogContent: {
    gap: spacing.xs,
  },
  dialogActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
  },
  dialogActionButton: {
    flex: 1,
  },
  dialogCancelButton: {
    borderColor: colors.accent.gradientStart,
  },
});

const PlansScreen: React.FC = () => {
  const router = useRouter();
  const plans = usePlansStore((state: PlansState) => state.plans);
  const removePlan = usePlansStore((state: PlansState) => state.removePlan);
  const schedules = useSchedulesStore((state: SchedulesState) => state.schedules);
  const hydrateSchedules = useSchedulesStore((state: SchedulesState) => state.hydrateSchedules);
  const updateSchedule = useSchedulesStore((state: SchedulesState) => state.updateSchedule);
  const startSession = useSessionStore((state) => state.startSession);
  const setCompletionOverlayVisible = useSessionStore((state) => state.setCompletionOverlayVisible);
  const [expandedPlanId, setExpandedPlanId] = useState<string | null>(null);
  const [pendingDeletePlan, setPendingDeletePlan] = useState<Plan | null>(null);

  const handleCreatePlanPress = useCallback(() => {
    void Haptics.selectionAsync();
    router.push('/(tabs)/create-plan');
  }, [router]);

  const handlePlanPress = useCallback(
    (planId: string) => {
      void Haptics.selectionAsync();
      setExpandedPlanId((prev) => (prev === planId ? null : planId));
    },
    [],
  );

  const handleDeletePlan = useCallback(
    (plan: Plan) => {
      void Haptics.selectionAsync();
      setPendingDeletePlan(plan);
    },
    [],
  );

  const dismissDeleteDialog = useCallback(() => {
    setPendingDeletePlan(null);
  }, []);

  const confirmDeletePlan = useCallback(async () => {
    if (!pendingDeletePlan) {
      return;
    }

    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

    schedules.forEach((schedule: Schedule) => {
      const nextWeekdays = { ...schedule.weekdays };
      let didUpdate = false;

      (Object.keys(nextWeekdays) as (keyof Schedule['weekdays'])[]).forEach((day) => {
        if (nextWeekdays[day] === pendingDeletePlan.id) {
          nextWeekdays[day] = null;
          didUpdate = true;
        }
      });

      if (didUpdate) {
        void updateSchedule({ ...schedule, weekdays: nextWeekdays });
      }
    });

    void removePlan(pendingDeletePlan.id);
    setExpandedPlanId((prev) => (prev === pendingDeletePlan.id ? null : prev));
    setPendingDeletePlan(null);
  }, [pendingDeletePlan, removePlan, schedules, updateSchedule]);

  const createDefaultSetLogs = useCallback(() => {
    return Array.from({ length: 3 }, () => ({ reps: 8, weight: 0, completed: false }));
  }, []);

  const handleStartPlan = useCallback(
    (plan: Plan) => {
      void Haptics.selectionAsync();

      // Reset overlay state before starting new session
      setCompletionOverlayVisible(false);

      const workoutExercises: WorkoutExercise[] = plan.exercises.map((exercise) => ({
        name: exercise.name,
        sets: createDefaultSetLogs(),
      }));

      startSession(plan.id, workoutExercises);
      setExpandedPlanId(null);
      router.push('/(tabs)/workout');
    },
    [createDefaultSetLogs, router, startSession, setCompletionOverlayVisible],
  );

  const handleEditPlan = useCallback(
    (plan: Plan) => {
      void Haptics.selectionAsync();
      setExpandedPlanId(null);
      router.push({ pathname: '/(tabs)/create-plan', params: { planId: plan.id } });
    },
    [router],
  );

  const handleEditSchedulePress = useCallback(() => {
    void Haptics.selectionAsync();
    router.push('/schedule-editor');
  }, [router]);

  useEffect(() => {
    void hydrateSchedules();
  }, [hydrateSchedules]);

  const activeSchedule = schedules[0] ?? null;

  const planNameLookup = useMemo(() => {
    return plans.reduce<Record<string, string>>((acc, plan) => {
      acc[plan.id] = plan.name;
      return acc;
    }, {});
  }, [plans]);

  return (
    <TabSwipeContainer contentContainerStyle={styles.contentContainer}>
      <ScreenHeader title="My Programs" subtitle="Create and manage your workout plans." />

      <SurfaceCard padding="xl" tone="neutral">
        <View style={styles.outerCardContent}>
          <Text variant="heading3" color="primary">
            My Workouts
          </Text>

          <View style={styles.planCards}>
            {plans.length > 0 ? (
              plans.map((plan: Plan) => (
                <Pressable
                  key={plan.id}
                  style={styles.planCardShell}
                  onPress={() => handlePlanPress(plan.id)}
                  accessibilityRole="button"
                  accessibilityLabel={`View ${plan.name}`}
                >
                  {expandedPlanId === plan.id ? (
                      <View style={styles.planExpandedContent}>
                        <View style={styles.planCardHeader}>
                          <Text variant="bodySemibold" color="primary">
                            {plan.name}
                          </Text>
                        </View>
                        <View style={styles.planActionGrid}>
                          <Pressable
                            style={styles.planActionButton}
                            onPress={(event) => {
                              event.stopPropagation();
                              handleStartPlan(plan);
                            }}
                            accessibilityRole="button"
                            accessibilityLabel={`Start ${plan.name}`}
                          >
                            <View style={styles.planActionIconWrapper}>
                              <IconSymbol name="play-arrow" color={colors.accent.primary} size={spacing.lg} />
                            </View>
                            <Text variant="caption" color="primary" style={styles.planActionLabel}>
                              Start
                            </Text>
                          </Pressable>
                          <Pressable
                            style={styles.planActionButton}
                            onPress={(event) => {
                              event.stopPropagation();
                              handleEditPlan(plan);
                            }}
                            accessibilityRole="button"
                            accessibilityLabel={`Edit ${plan.name}`}
                          >
                            <View style={styles.planActionIconWrapper}>
                              <IconSymbol name="edit" color={colors.accent.primary} size={spacing.lg} />
                            </View>
                            <Text variant="caption" color="primary" style={styles.planActionLabel}>
                              Edit
                            </Text>
                          </Pressable>
                          <Pressable
                            style={styles.planActionButton}
                            onPress={(event) => {
                              event.stopPropagation();
                              handleDeletePlan(plan);
                            }}
                            accessibilityRole="button"
                            accessibilityLabel={`Delete ${plan.name}`}
                          >
                            <View style={[styles.planActionIconWrapper, { borderColor: colors.accent.orange }]}>
                              <IconSymbol name="delete" color={colors.accent.orange} size={spacing.lg} />
                            </View>
                            <Text variant="caption" color="primary" style={styles.planActionLabel}>
                              Delete
                            </Text>
                          </Pressable>
                          <Pressable
                            style={styles.planActionButton}
                            onPress={(event) => {
                              event.stopPropagation();
                              setExpandedPlanId(null);
                            }}
                            accessibilityRole="button"
                            accessibilityLabel={`Back from ${plan.name} actions`}
                          >
                            <View style={[styles.planActionIconWrapper, { borderColor: colors.accent.orange }]}>
                              <IconSymbol name="arrow-back" color={colors.accent.orange} size={spacing.lg} />
                            </View>
                            <Text variant="caption" color="primary" style={styles.planActionLabel}>
                              Back
                            </Text>
                          </Pressable>
                        </View>
                      </View>
                    ) : (
                      <View style={styles.planCardContent}>
                        <View style={styles.planCardHeader}>
                          <Text variant="bodySemibold" color="primary">
                            {plan.name}
                          </Text>
                        </View>
                        <Text variant="body" color="secondary">
                          {plan.exercises.length === 1
                            ? '1 exercise'
                            : `${plan.exercises.length} exercises`}
                        </Text>
                      </View>
                    )}
                </Pressable>
              ))
            ) : (
              <View style={[styles.planCardShell, styles.planCardContent]}>
                <Text variant="bodySemibold" color="primary">
                  No plans yet
                </Text>
                <Text variant="body" color="secondary">
                  Create a plan to see it appear here.
                </Text>
              </View>
            )}
          </View>

          <View style={styles.planCreateButtonWrapper}>
            <Button label="Create Workout Plan" onPress={handleCreatePlanPress} size="md" />
          </View>
        </View>
      </SurfaceCard>

      <SurfaceCard padding="xl" tone="neutral">
        <View style={styles.scheduleCardContent}>
          <Text variant="heading3" color="primary">
            My Schedule
          </Text>

          <View style={styles.scheduleSubCard}>
            {activeSchedule ? (
              <View style={styles.scheduleRows}>
                {WEEKDAY_LABELS.map(({ key, label }) => {
                  const assignedPlanId = activeSchedule.weekdays[key];
                  const assignedName = assignedPlanId ? planNameLookup[assignedPlanId] : null;

                  return (
                    <View key={key} style={styles.scheduleRow}>
                      <Text variant="bodySemibold" color="primary" style={styles.scheduleDayLabel}>
                        {label}
                      </Text>
                      <Text variant="body" color="secondary" style={styles.schedulePlanLabel}>
                        {assignedName ?? 'Rest Day'}
                      </Text>
                    </View>
                  );
                })}
              </View>
            ) : (
              <Text variant="body" color="secondary" style={styles.scheduleEmptyText}>
                No schedule yet. Assign plans to your week to see them here.
              </Text>
            )}
          </View>

          <View style={styles.scheduleButtonWrapper}>
            <Button label="Edit Schedule" onPress={handleEditSchedulePress} size="md" />
          </View>
        </View>
      </SurfaceCard>

      <SurfaceCard padding="xl" tone="neutral">
        <View style={styles.outerCardContent}>
          <Text variant="heading3" color="primary">
            Sample Workouts
          </Text>

          <SurfaceCard tone="neutral" padding="lg" showAccentStripe={false} style={styles.planCardShell}>
            <View style={styles.planCardContent}>
              <Text variant="bodySemibold" color="primary">
                Curated sample workouts are coming soon
              </Text>
              <Text variant="body" color="secondary">
                We're polishing guided sessions to help you get started. Check back shortly.
              </Text>
            </View>
          </SurfaceCard>
        </View>
      </SurfaceCard>

      <SurfaceCard padding="xl" tone="neutral">
        <View style={styles.outerCardContent}>
          <Text variant="heading3" color="primary">
            Sample Schedules
          </Text>

          <SurfaceCard tone="neutral" padding="lg" showAccentStripe={false} style={styles.planCardShell}>
            <View style={styles.planCardContent}>
              <Text variant="bodySemibold" color="primary">
                Sample schedules are on the way
              </Text>
              <Text variant="body" color="secondary">
                We're designing weekly templates so you can jump right in. Coming soon.
              </Text>
            </View>
          </SurfaceCard>
        </View>
      </SurfaceCard>

      <Modal
        transparent
        visible={Boolean(pendingDeletePlan)}
        animationType="fade"
        onRequestClose={dismissDeleteDialog}
      >
        <View style={styles.dialogOverlay}>
          <SurfaceCard tone="neutral" padding="lg" showAccentStripe={false} style={styles.dialogCard}>
            <View style={styles.dialogContent}>
              <Text variant="heading3" color="primary">
                Delete plan
              </Text>
              <Text variant="body" color="secondary">
                Are you sure you want to delete {pendingDeletePlan?.name ?? 'this plan'}? This action cannot be undone.
              </Text>
            </View>
            <View style={styles.dialogActions}>
              <Button
                label="Cancel"
                variant="ghost"
                onPress={dismissDeleteDialog}
                size="md"
                textColor={colors.accent.gradientStart}
                style={[styles.dialogActionButton, styles.dialogCancelButton]}
              />
              <Button
                label="Delete"
                variant="primary"
                onPress={confirmDeletePlan}
                size="md"
                style={styles.dialogActionButton}
              />
            </View>
          </SurfaceCard>
        </View>
      </Modal>
    </TabSwipeContainer>
  );
};

export default PlansScreen;
