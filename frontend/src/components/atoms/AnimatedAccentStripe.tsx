/**
 * AnimatedAccentStripe
 * Solid accent stripe aligned to the left edge of cards.
 */

import React from 'react';
import { StyleProp, StyleSheet, ViewStyle } from 'react-native';
import Animated from 'react-native-reanimated';

import { colors } from '@/constants/theme';

interface AnimatedAccentStripeProps {
  /** Optional style overrides for stripe layout */
  style?: StyleProp<ViewStyle>;
}

export const AnimatedAccentStripe: React.FC<AnimatedAccentStripeProps> = ({ style }) => {
  return <Animated.View pointerEvents="none" style={[styles.stripe, style]} />;
};

const styles = StyleSheet.create({
  stripe: {
    backgroundColor: colors.accent.orange,
  },
});
