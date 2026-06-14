import type { ReactNode } from 'react';
import {
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { borders, colors, padding, radii } from '@/theme';

/**
 * Standard surface card (BAB 7.3).
 *
 * Defaults: surface background, 0.5dp border, 14dp radius, 14dp padding.
 * Set `emphasis` for a 1.5dp border. Pass `onPress` to make it tappable.
 */
export interface GeoCardProps {
  children: ReactNode;
  emphasis?: boolean;
  color?: string;
  borderColor?: string;
  radius?: number;
  padded?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export function GeoCard({
  children,
  emphasis = false,
  color = colors.surface,
  borderColor = colors.border,
  radius = radii.card,
  padded = true,
  onPress,
  style,
}: GeoCardProps) {
  const cardStyle: StyleProp<ViewStyle> = [
    styles.card,
    {
      backgroundColor: color,
      borderColor,
      borderRadius: radius,
      borderWidth: emphasis ? borders.emphasis : borders.hairline,
      padding: padded ? padding.card : 0,
    },
    style,
  ];

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [cardStyle, pressed && styles.pressed]}
      >
        {children}
      </Pressable>
    );
  }

  return <View style={cardStyle}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
  },
  pressed: {
    opacity: 0.85,
  },
});
