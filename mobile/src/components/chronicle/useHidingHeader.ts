import { useRef } from "react";
import { Animated } from "react-native";

/**
 * Auto-hiding header on scroll (like Google News / mobile portals).
 *
 * Usage in a screen:
 *   const { onScroll, headerStyle, scrollViewProps } = useHidingHeader(HEADER_H);
 *   <Animated.View style={[{ position:'absolute', top:0,left:0,right:0, zIndex:20 }, headerStyle]}>
 *      ...header...
 *   </Animated.View>
 *   <Animated.ScrollView onScroll={onScroll} scrollEventThrottle={16}
 *      contentContainerStyle={{ paddingTop: HEADER_H }} {...scrollViewProps}>
 *
 * Header slides up by its own height when scrolling down, back on scrolling up.
 */
export function useHidingHeader(headerHeight = 100) {
  const scrollY = useRef(new Animated.Value(0)).current;
  const clamped = Animated.diffClamp(scrollY, 0, headerHeight);
  const translateY = clamped.interpolate({
    inputRange: [0, headerHeight],
    outputRange: [0, -headerHeight],
    extrapolate: "clamp",
  });
  const onScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    { useNativeDriver: true },
  );
  return {
    onScroll,
    headerStyle: { transform: [{ translateY }] },
    headerHeight,
  };
}
