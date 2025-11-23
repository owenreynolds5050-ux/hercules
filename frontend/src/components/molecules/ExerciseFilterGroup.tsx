/**
 * ExerciseFilterGroup
 * Reusable cluster of filter chips with heading label.
 */

import React, { type ReactElement } from 'react';
import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/atoms/Text';
import { QuickFilterChip } from '@/components/atoms/QuickFilterChip';
import { spacing } from '@/constants/theme';

interface ExerciseFilterGroupProps<T extends string> {
  title: string;
  values: readonly T[];
  selected: T[];
  onToggle: (value: T) => void;
  testIDPrefix?: string;
}

export const ExerciseFilterGroup = <T extends string,>({
  title,
  values,
  selected,
  onToggle,
  testIDPrefix,
}: ExerciseFilterGroupProps<T>): ReactElement | null => {
  if (!values.length) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text variant="caption" color="secondary">
        {title}
      </Text>

      <View style={styles.chips}>
        {values.map((value) => {
          const isActive = selected.includes(value);
          const label = String(value);

          return (
            <QuickFilterChip
              key={label}
              label={label}
              active={isActive}
              onPress={() => onToggle(value)}
              testID={testIDPrefix ? `${testIDPrefix}-${label}` : undefined}
            />
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
});
