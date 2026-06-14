/**
 * NativeWind className helpers for the home analysis UI.
 *
 * Resolves a {@link ToneKey} (from `@/data/home`) onto Tailwind class fragments
 * for foreground text, tinted background, and border — mirroring the
 * `SignalTone` triples used by the StyleSheet components, but expressed as
 * `className` strings so the home screen can be styled with NativeWind.
 */
import type { ToneKey } from '@/data/home';

export interface ToneClasses {
  /** Foreground / text color class, e.g. `text-warning`. */
  fg: string;
  /** Tinted background class, e.g. `bg-warningDark`. */
  bg: string;
  /** Border color class, e.g. `border-warningBorder`. */
  border: string;
  /**
   * Solid foreground-colored background, e.g. `bg-warning` (for dots / bar
   * fills). Kept as a literal so the NativeWind compiler emits the class.
   */
  dot: string;
}

const TONE_CLASSES: Record<ToneKey, ToneClasses> = {
  positive: { fg: 'text-success', bg: 'bg-successDark', border: 'border-successBorder', dot: 'bg-success' },
  neutral: { fg: 'text-textSecondary', bg: 'bg-surface', border: 'border-border', dot: 'bg-textSecondary' },
  warning: { fg: 'text-warning', bg: 'bg-warningDark', border: 'border-warningBorder', dot: 'bg-warning' },
  danger: { fg: 'text-danger', bg: 'bg-dangerDark', border: 'border-dangerBorder', dot: 'bg-danger' },
  info: { fg: 'text-accent', bg: 'bg-accentDark', border: 'border-accentBorder', dot: 'bg-accent' },
  special: { fg: 'text-purple', bg: 'bg-purpleDark', border: 'border-purpleBorder', dot: 'bg-purple' },
};

/** Resolve a ToneKey onto its NativeWind class fragments. */
export function toneClasses(key: ToneKey): ToneClasses {
  return TONE_CLASSES[key];
}
