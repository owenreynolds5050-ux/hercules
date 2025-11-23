/**
 * PlanNameCard
 * Displays editable plan name within a surfaced card.
 */
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { InputField } from '@/components/atoms/InputField';
import { SurfaceCard } from '@/components/atoms/SurfaceCard';
import { Text } from '@/components/atoms/Text';
import { spacing } from '@/constants/theme';

interface PlanNameCardProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
}

export const PlanNameCard: React.FC<PlanNameCardProps> = ({
  value,
  onChange,
  label,
  placeholder,
}) => {
  return (
    <SurfaceCard tone="card" padding="xl" showAccentStripe>
      <View style={styles.content}>
        <InputField
          label={label ?? 'Name'}
          value={value}
          onChangeText={onChange}
          placeholder={placeholder ?? 'e.g. Push Day'}
          returnKeyType="done"
          testID="plan-name-input"
        />
      </View>
    </SurfaceCard>
  );
};

const styles = StyleSheet.create({
  content: {
    gap: spacing.sm,
  },
});
