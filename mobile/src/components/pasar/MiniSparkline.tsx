import { StyleSheet, View } from 'react-native';

import { directionTone, type PriceDirection } from '@/data/pasar';

/**
 * A mini bar sparkline (matches `.spark` in the mockup). [values] are 0..1
 * normalized heights; the trailing bar is fully tinted by [direction], earlier
 * bars dimmed. Pure View — no chart lib.
 */
export interface MiniSparklineProps {
  values: number[];
  direction: PriceDirection;
  height?: number;
  barWidth?: number;
}

export function MiniSparkline({
  values,
  direction,
  height = 22,
  barWidth = 4,
}: MiniSparklineProps) {
  if (values.length === 0) return <View style={{ height }} />;
  const tint = directionTone[direction].fg;
  const last = values.length - 1;

  return (
    <View style={[styles.row, { height }]}>
      {values.map((v, i) => (
        <View
          key={i}
          style={{
            width: barWidth,
            height: Math.max(0, Math.min(1, v)) * height,
            marginLeft: i > 0 ? 2 : 0,
            borderRadius: 1,
            backgroundColor: i === last ? tint : `${tint}59`, // 0.35 alpha
          }}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
});
