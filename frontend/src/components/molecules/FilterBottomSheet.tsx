/**
 * FilterBottomSheet
 * Bottom sheet modal for exercise filtering with all filter categories
 */
import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, Easing, Modal, PanResponder, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/atoms/Button';
import { Text } from '@/components/atoms/Text';
import { QuickFilterChip } from '@/components/atoms/QuickFilterChip';
import { ExerciseFilterGroup } from '@/components/molecules/ExerciseFilterGroup';
import { colors, radius, spacing, shadows } from '@/constants/theme';
import type { ExerciseFilters, FilterDifficulty, FilterEquipment, FilterMuscleGroup, MuscleGroup } from '@/types/exercise';
import type { exerciseFilterOptions } from '@/constants/exercises';
import hierarchyData from '@/data/hierarchy.json';

const MUSCLE_HIERARCHY = hierarchyData.muscle_hierarchy as Record<string, Record<string, string[]>>;

interface FilterBottomSheetProps {
  visible: boolean;
  filters: ExerciseFilters;
  filterOptions: typeof exerciseFilterOptions;
  onClose: () => void;
  onApply: () => void;
  toggleMuscleGroupFilter: (value: FilterMuscleGroup) => void;
  toggleSpecificMuscleFilter: (value: MuscleGroup) => void;
  toggleEquipmentFilter: (value: FilterEquipment) => void;
  toggleDifficultyFilter: (value: FilterDifficulty) => void;
  toggleBodyweightOnly: () => void;
  toggleCompoundOnly: () => void;
}

export const FilterBottomSheet: React.FC<FilterBottomSheetProps> = ({
  visible,
  filters,
  filterOptions,
  onClose,
  onApply,
  toggleMuscleGroupFilter,
  toggleSpecificMuscleFilter,
  toggleEquipmentFilter,
  toggleDifficultyFilter,
  toggleBodyweightOnly,
  toggleCompoundOnly,
}) => {
  const insets = useSafeAreaInsets();
  const headerHeight = 140; // Height covering drag handle + header text area
  const translateY = useRef(new Animated.Value(0)).current;
  const hasActiveGesture = useRef(false);
  const closeDistance = useRef(Dimensions.get('window').height).current;

  // Calculate active specific muscles for display
  const activeSpecificOptions = React.useMemo(() => {
    const options: { group: FilterMuscleGroup; muscles: MuscleGroup[] }[] = [];
    
    filters.muscleGroups.forEach((group) => {
      const hierarchy = MUSCLE_HIERARCHY[group];
      if (hierarchy) {
        options.push({
          group,
          muscles: Object.keys(hierarchy) as MuscleGroup[],
        });
      }
    });
    
    return options;
  }, [filters.muscleGroups]);

  useEffect(() => {
    if (visible) {
      translateY.setValue(closeDistance);
      hasActiveGesture.current = false;
      Animated.timing(translateY, {
        toValue: 0,
        duration: 220,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start();
    }
  }, [translateY, visible, closeDistance]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: (evt) => {
        // Only start gesture from top part of sheet (header area)
        const isWithinHeader = evt.nativeEvent.locationY <= headerHeight;
        hasActiveGesture.current = isWithinHeader;
        return isWithinHeader;
      },
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        // Only respond to downward swipes from header area
        const isFromTop = hasActiveGesture.current;
        const isDownwardSwipe = gestureState.dy > 5 && Math.abs(gestureState.vx) < Math.abs(gestureState.vy);
        hasActiveGesture.current = isFromTop && isDownwardSwipe;
        return hasActiveGesture.current;
      },
      onPanResponderMove: (evt, gestureState) => {
        // Move sheet down with finger in real-time
        if (hasActiveGesture.current && gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        // Close if swiped down more than 50 pixels or with velocity
        if (hasActiveGesture.current && (gestureState.dy > 50 || gestureState.vy > 0.5)) {
          Animated.timing(translateY, {
            toValue: closeDistance,
            duration: 200,
            useNativeDriver: true,
            easing: Easing.in(Easing.cubic),
          }).start(({ finished }) => {
            if (finished) {
              hasActiveGesture.current = false;
              onClose();
              requestAnimationFrame(() => {
                translateY.setValue(0);
              });
            }
          });
        } else {
          // Snap back to top
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            tension: 50,
            friction: 8,
          }).start(() => {
            hasActiveGesture.current = false;
          });
        }
      },
    }),
  ).current;

  return (
    <Modal
      animationType="none"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.scrim} onPress={onClose} accessibilityRole="button" />

        <Animated.View
          style={[
            styles.container,
            { 
              paddingBottom: insets.bottom + spacing.lg,
              transform: [{ translateY }],
            },
          ]}
          {...panResponder.panHandlers}
        >
          <View style={styles.dragHandle} />

          <View style={styles.header}>
            <Text variant="heading3" color="primary">
              Filter exercises
            </Text>
          </View>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.filterGroups}>
              <ExerciseFilterGroup
                title="Muscle group"
                values={filterOptions.muscleGroups}
                selected={filters.muscleGroups}
                onToggle={toggleMuscleGroupFilter}
                testIDPrefix="filter-muscle"
              />

              {activeSpecificOptions.map(({ group, muscles }) => (
                <View key={group} style={styles.nestedFilterGroup}>
                  <ExerciseFilterGroup
                    title={group}
                    values={muscles}
                    selected={filters.specificMuscles}
                    onToggle={toggleSpecificMuscleFilter}
                    testIDPrefix={`filter-specific-${group}`}
                  />
                </View>
              ))}

              <ExerciseFilterGroup
                title="Equipment"
                values={filterOptions.equipment}
                selected={filters.equipment}
                onToggle={toggleEquipmentFilter}
                testIDPrefix="filter-equipment"
              />

              <ExerciseFilterGroup
                title="Difficulty"
                values={filterOptions.difficulty}
                selected={filters.difficulty}
                onToggle={toggleDifficultyFilter}
                testIDPrefix="filter-difficulty"
              />

              <View style={styles.toggleSection}>
                <Text variant="caption" color="secondary">
                  Special filters
                </Text>
                <View style={styles.toggleRow}>
                  <QuickFilterChip
                    label="Bodyweight"
                    active={filters.bodyweightOnly}
                    onPress={toggleBodyweightOnly}
                    testID="filter-bodyweight"
                  />
                  <QuickFilterChip
                    label="Compound"
                    active={filters.compoundOnly}
                    onPress={toggleCompoundOnly}
                    testID="filter-compound"
                  />
                </View>
              </View>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <Button
              label="Apply Filters"
              variant="primary"
              size="lg"
              onPress={onApply}
            />
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay.scrimTransparent,
    justifyContent: 'flex-end',
  },
  scrim: {
    ...StyleSheet.absoluteFillObject,
  },
  container: {
    flex: 1,
    maxHeight: '85%',
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    backgroundColor: colors.surface.card,
    ...shadows.cardSoft,
    flexDirection: 'column',
  },
  dragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border.medium,
    alignSelf: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  scrollView: {
    flex: 1,
    minHeight: 0,
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    flexGrow: 1,
  },
  filterGroups: {
    gap: spacing.lg,
  },
  toggleSection: {
    gap: spacing.xs,
  },
  toggleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  nestedFilterGroup: {
    marginLeft: spacing.lg,
    paddingLeft: spacing.md,
    borderLeftWidth: StyleSheet.hairlineWidth,
    borderLeftColor: colors.border.light,
    gap: spacing.xs,
  },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
});
