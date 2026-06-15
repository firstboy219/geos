import { Text, type StyleProp, type TextStyle } from "react-native";

/**
 * Material Symbols Outlined glyph (mockup_v2 uses these throughout).
 * Renders the icon via the font's ligature names, e.g. <Sym name="bookmark_add" />.
 * Uses the static @expo-google-fonts/material-symbols (outlined, weight 400).
 */
export function Sym({
  name,
  size = 20,
  color,
  style,
}: {
  name: string;
  size?: number;
  color?: string;
  style?: StyleProp<TextStyle>;
}) {
  return (
    <Text
      allowFontScaling={false}
      style={[
        {
          fontFamily: "MaterialSymbols_400Regular",
          fontSize: size,
          lineHeight: size,
          color,
        },
        style,
      ]}
    >
      {name}
    </Text>
  );
}
