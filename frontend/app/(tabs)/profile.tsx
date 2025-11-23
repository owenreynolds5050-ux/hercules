import React from 'react';
import { StyleSheet, View } from 'react-native';

import { SurfaceCard } from '@/components/atoms/SurfaceCard';
import { Text } from '@/components/atoms/Text';
import { ScreenHeader } from '@/components/molecules/ScreenHeader';
import { TabSwipeContainer } from '@/components/templates/TabSwipeContainer';
import { FocusDistributionChart } from '@/components/molecules/FocusDistributionChart';
import { colors, spacing } from '@/constants/theme';

const styles = StyleSheet.create({
  contentContainer: {
    flexGrow: 1,
    backgroundColor: colors.primary.bg,
    paddingTop: spacing.xl,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    gap: spacing.xl,
  },
  cardContent: {
    gap: spacing.md,
  },
});

const StatsScreen: React.FC = () => {
  return (
    <TabSwipeContainer contentContainerStyle={styles.contentContainer}>
      <ScreenHeader title="Progress" subtitle="Track your strength and celebrate wins." />

      <SurfaceCard tone="neutral" padding="xl">
        <View style={styles.cardContent}>
          <Text variant="heading3" color="primary">
            Focus Distribution
          </Text>
          <FocusDistributionChart />
        </View>
      </SurfaceCard>
    </TabSwipeContainer>
  );
};

export default StatsScreen;
