/**
 * GradientText
 * Renders text with the Hercules accent gradient using a masked linear gradient.
 * Ideal for highlighting key labels while staying aligned with the theme system.
 */

import React, { useMemo } from 'react';
import { StyleProp, StyleSheet, Text as RNText, TextStyle } from 'react-native';
import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';

import { colors, typography } from '@/constants/theme';

// =============================================================================
// TYPES
// =============================================================================

type GradientTextVariant = keyof typeof typography;

interface GradientTextProps {
  /** Text content to render with the gradient fill */
  children: string;
  /** Typography variant sourced from the theme */
  variant?: GradientTextVariant;
  /** Optional override for the gradient start color */
  gradientStart?: string;
  /** Optional override for the gradient end color */
  gradientEnd?: string;
  /** Additional text style overrides */
  style?: StyleProp<TextStyle>;
}

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * GradientText
 * Applies the Hercules accent gradient to text by masking a linear gradient.
 */
export const GradientText: React.FC<GradientTextProps> = ({
  children,
  variant = 'body',
  gradientStart = colors.accent.gradientStart,
  gradientEnd = colors.accent.gradientEnd,
  style,
}) => {
  const typographyStyle = useMemo<TextStyle>(() => {
    const baseStyle = typography[variant];

    return {
      fontSize: baseStyle.fontSize,
      fontWeight: baseStyle.fontWeight as TextStyle['fontWeight'],
      lineHeight: baseStyle.lineHeight,
    };
  }, [variant]);

  const maskStyle = useMemo<StyleProp<TextStyle>>(() => {
    return [styles.maskText, typographyStyle, style];
  }, [style, typographyStyle]);

  const gradientColors = useMemo<[string, string]>(() => {
    return [gradientStart, gradientEnd];
  }, [gradientEnd, gradientStart]);

  return (
    <MaskedView
      style={styles.maskContainer}
      maskElement={<RNText style={maskStyle}>{children}</RNText>}
    >
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientFill}
      >
        <RNText style={[typographyStyle, styles.hiddenText, style]}>{children}</RNText>
      </LinearGradient>
    </MaskedView>
  );
};

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  maskContainer: {
    flexDirection: 'row',
    alignSelf: 'center',
    alignItems: 'center',
  },
  maskText: {
    textAlign: 'center',
    color: '#000',
  },
  gradientFill: {
    alignItems: 'center',
  },
  hiddenText: {
    opacity: 0,
    textAlign: 'center',
  },
});
