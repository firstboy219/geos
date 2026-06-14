import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

import { borders, colors, spacing, typography } from '@/theme';

/** Horizontal scrolling filter chips (component #5). */
export interface FilterChipsProps {
  filters: readonly string[];
  selectedIndex: number;
  onSelect: (index: number) => void;
}

export function FilterChips({ filters, selectedIndex, onSelect }: FilterChipsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.content}
    >
      {filters.map((label, i) => {
        const active = i === selectedIndex;
        return (
          <Pressable
            key={label}
            onPress={() => onSelect(i)}
            style={[
              styles.chip,
              {
                backgroundColor: active ? colors.accentDark : colors.surface,
                borderColor: active ? colors.accent : colors.border,
              },
            ]}
            hitSlop={4}
          >
            <Text
              style={[
                typography.bodySm,
                { color: active ? colors.accent : colors.textSecondary, fontWeight: active ? '500' : '400' },
              ]}
            >
              {label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 5,
    paddingRight: spacing.sm,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: spacing.xs,
    borderRadius: 14,
    borderWidth: borders.hairline,
  },
});
