import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { borders, colors, spacing, typography } from '@/theme';

/**
 * Horizontal scrolling category tabs (component #1). Index 0 ("Semua") means
 * all categories.
 */
export interface CategoryTabsProps {
  tabs: readonly string[];
  selectedIndex: number;
  onSelect: (index: number) => void;
}

export function CategoryTabs({ tabs, selectedIndex, onSelect }: CategoryTabsProps) {
  return (
    <View style={styles.bar}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {tabs.map((label, i) => {
          const active = i === selectedIndex;
          return (
            <Pressable
              key={label}
              onPress={() => onSelect(i)}
              style={[styles.tab, active && styles.tabActive]}
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
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    borderBottomWidth: borders.hairline,
    borderBottomColor: colors.borderSubtle,
  },
  content: {
    paddingHorizontal: spacing.md + 2,
  },
  tab: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 2,
    borderBottomColor: colors.transparent,
  },
  tabActive: {
    borderBottomColor: colors.accent,
  },
});
