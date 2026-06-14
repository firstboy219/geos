import { useEffect } from 'react';
import { StyleSheet, View, type DimensionValue } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { colors, durations, radii, spacing } from '@/theme';

/**
 * Shimmer skeleton placeholder (BAB 7.3 requires shimmer on every screen that
 * loads data). A single pulsing box; use <SkeletonList> for a stack of cards.
 */
export interface LoadingSkeletonProps {
  width?: DimensionValue;
  height?: number;
  radius?: number;
}

export function LoadingSkeleton({
  width = '100%',
  height = 16,
  radius = radii.chip,
}: LoadingSkeletonProps) {
  const progress = useSharedValue(0.4);

  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, {
        duration: durations.shimmer,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true,
    );
  }, [progress]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: progress.value }));

  return (
    <Animated.View
      style={[
        styles.box,
        { width, height, borderRadius: radius },
        animatedStyle,
      ]}
    />
  );
}

/** Convenience: a vertical stack of placeholder cards. */
export function SkeletonList({
  count = 4,
  cardHeight = 120,
}: {
  count?: number;
  cardHeight?: number;
}) {
  return (
    <View>
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} style={styles.item}>
          <LoadingSkeleton height={cardHeight} radius={radii.card} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    backgroundColor: colors.surface,
  },
  item: {
    marginBottom: spacing.md,
  },
});
