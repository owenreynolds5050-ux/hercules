/**
 * workout-edit
 * Screen for editing an existing workout session.
 */

import React, { useCallback } from 'react';
import { FlatList, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/atoms/Button';
import { SurfaceCard } from '@/components/atoms/SurfaceCard';
import { Text } from '@/components/atoms/Text';
import { EditableWorkoutExerciseCard } from '@/components/molecules/EditableWorkoutExerciseCard';
import { colors, radius, spacing } from '@/constants/theme';
import { useWorkoutEditor } from '@/hooks/useWorkoutEditor';

const WorkoutEditScreen: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { workoutId } = useLocalSearchParams<{ workoutId?: string }>();

  const {
    workout,
    planName,
    exerciseDrafts,
    expandedExercise,
    toggleExercise,
    updateExerciseSets,
    removeExercise,
    moveExercise,
    addExercise,
    isPickerVisible,
    openPicker,
    closePicker,
    filteredExercises,
    searchTerm,
    setSearchTerm,
    exerciseCount,
    saveWorkout,
  } = useWorkoutEditor(workoutId);

  const [isInteractionLocked, setInteractionLocked] = React.useState(false);

  const handleSaveWorkout = useCallback(async () => {
    const success = await saveWorkout();

    if (!success) {
      return;
    }

    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.back();
  }, [router, saveWorkout]);

  const handleSelectExercise = useCallback(
    (exercise: any) => {
      addExercise(exercise);
      void Haptics.selectionAsync();
    },
    [addExercise],
  );

  if (!workout) {
    return (
      <View style={styles.emptyContainer}>
        <SurfaceCard padding="xl" showAccentStripe={false} style={styles.emptyCard}>
          <Text variant="heading3">Workout not found</Text>
          <Text color="secondary">Return to the dashboard and select a workout to edit.</Text>
          <Button label="Go Back" onPress={router.back} />
        </SurfaceCard>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={exerciseDrafts}
        keyExtractor={(item) => item.name}
        contentContainerStyle={[styles.listContent, { paddingTop: spacing.md + insets.top }]}
        ListHeaderComponent={(
          <View style={styles.headerSection}>
            <SurfaceCard tone="neutral" padding="lg" showAccentStripe={false} style={styles.headerCard}>
              <View style={styles.headerTextGroup}>
                <Text variant="heading3" color="primary">
                  {planName ?? 'Workout Session'}
                </Text>
                <Text variant="body" color="secondary">
                  {`${exerciseCount} exercise${exerciseCount === 1 ? '' : 's'} in this session`}
                </Text>
              </View>
            </SurfaceCard>
            <LinearGradient
              colors={[colors.accent.gradientStart, colors.accent.gradientEnd]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.headerDivider}
            />
            <View style={styles.headerActions}>
              <Button label="Add Exercise" variant="ghost" size="md" onPress={openPicker} />
            </View>
          </View>
        )}
        ListFooterComponent={(
          <View style={styles.footerSection}>
            <Button label="Save Changes" onPress={handleSaveWorkout} disabled={exerciseDrafts.length === 0} />
          </View>
        )}
        onScrollBeginDrag={() => setInteractionLocked(true)}
        onScrollEndDrag={() => setInteractionLocked(false)}
        onMomentumScrollEnd={() => setInteractionLocked(false)}
        onMomentumScrollBegin={() => setInteractionLocked(true)}
        renderItem={({ item, index }) => (
          <EditableWorkoutExerciseCard
            exercise={item}
            index={index}
            isExpanded={expandedExercise === item.name}
            onToggle={() => toggleExercise(item.name)}
            onSaveSets={(sets) => {
              updateExerciseSets(item.name, sets);
              void Haptics.selectionAsync();
            }}
            onRemove={() => {
              removeExercise(item.name);
              void Haptics.selectionAsync();
            }}
            onMoveUp={() => {
              moveExercise(item.name, 'up');
              void Haptics.selectionAsync();
            }}
            onMoveDown={() => {
              moveExercise(item.name, 'down');
              void Haptics.selectionAsync();
            }}
            canMoveUp={index > 0}
            canMoveDown={index < exerciseDrafts.length - 1}
            onProgressChange={() => undefined}
            isInteractionDisabled={isInteractionLocked}
          />
        )}
        ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
      />

      {isPickerVisible ? (
        <Pressable style={styles.overlay} onPress={closePicker}>
          <Pressable style={styles.modal} onPress={() => undefined}>
            <Text variant="heading3">Add Exercise</Text>
            <TextInput
              value={searchTerm}
              onChangeText={setSearchTerm}
              placeholder="Search by name or category"
              placeholderTextColor={colors.text.tertiary}
              style={styles.searchInput}
            />
            <FlatList
              data={filteredExercises}
              keyExtractor={(item) => item.id}
              style={styles.modalList}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => (
                <Pressable
                  style={styles.modalItem}
                  onPress={() => handleSelectExercise(item)}
                >
                  <Text variant="bodySemibold" color="primary">
                    {item.name}
                  </Text>
                  <Text variant="caption" color="secondary">
                    {item.muscleGroup}
                  </Text>
                </Pressable>
              )}
            />
            <Button label="Close" variant="ghost" onPress={closePicker} />
          </Pressable>
        </Pressable>
      ) : null}
    </View>
  );
};

export default WorkoutEditScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary.bg,
  },
  listContent: {
    padding: spacing.md,
    gap: spacing.md,
  },
  headerSection: {
    gap: spacing.md,
  },
  headerCard: {
    gap: spacing.xs,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.accent.orangeLight,
    borderRadius: radius.lg,
    backgroundColor: colors.surface.card,
  },
  headerTextGroup: {
    gap: spacing.xxxs,
  },
  headerDivider: {
    height: spacing.xs,
    borderRadius: radius.full,
  },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  itemSeparator: {
    height: spacing.sm,
  },
  footerSection: {
    paddingVertical: spacing.lg,
    gap: spacing.md,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlay.scrim,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  modal: {
    width: '100%',
    maxHeight: '80%',
    backgroundColor: colors.surface.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.md,
  },
  searchInput: {
    width: '100%',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border.light,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    color: colors.text.primary,
  },
  modalList: {
    maxHeight: 280,
  },
  modalItem: {
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
    gap: spacing.xxxs,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.primary.bg,
    padding: spacing.lg,
  },
  emptyCard: {
    gap: spacing.md,
  },
});
