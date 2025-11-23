/**
 * PlanEmptyStateCard
 * CTA card prompting users to add or create plan content.
 */

import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { SurfaceCard } from '@/components/atoms/SurfaceCard';
import { Text } from '@/components/atoms/Text';
import { Button } from '@/components/atoms/Button';
import { spacing } from '@/constants/theme';

interface PlanEmptyStateCardProps {
  title: string;
  description?: string;
  buttonLabel: string;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}

export const PlanEmptyStateCard: React.FC<PlanEmptyStateCardProps> = ({
  title,
  description,
  buttonLabel,
  onPress,
  style,
}) => {
  return (
    <SurfaceCard tone="card" padding="xl" showAccentStripe style={style}>
      <View style={styles.content}>
        <View style={styles.copyGroup}>
          <Text variant="bodySemibold" color="primary">
            {title}
          </Text>
          {description ? (
            <Text variant="body" color="secondary">
              {description}
            </Text>
          ) : null}
        </View>
        <Button label={buttonLabel} variant="primary" size="lg" onPress={onPress} />
      </View>
    </SurfaceCard>
  );
};

const styles = StyleSheet.create({
  content: {
    width: '100%',
    gap: spacing.md,
  },
  copyGroup: {
    gap: spacing.xs,
  },
});
