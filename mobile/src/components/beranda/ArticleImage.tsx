import { Image, View } from "react-native";

import { Sym } from "@/components/chronicle/Sym";
import { chronicle } from "@/theme/chronicle";

/**
 * Article thumbnail that prefers the real backend image. When no real image
 * exists we DON'T fall back to a random picsum photo (which mismatches the
 * headline) — instead we render a neutral, on-brand surface block with a small
 * "newspaper" glyph. Used by featured, briefs and latest.
 */
export function ArticleImage({
  uri,
  className,
  iconSize = 28,
}: {
  uri?: string;
  className?: string;
  iconSize?: number;
}) {
  if (uri) {
    return <Image source={{ uri }} className={`${className ?? ""} bg-surface-container-high`} />;
  }
  return (
    <View className={`${className ?? ""} bg-surface-container-high items-center justify-center`}>
      <Sym name="newspaper" size={iconSize} color={chronicle.onSurfaceVariant} />
    </View>
  );
}
