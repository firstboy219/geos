import 'package:flutter/material.dart';

import '../constants/app_constants.dart';
import '../theme/app_colors.dart';
import '../theme/app_text_styles.dart';

/// A small square chip representing one of the 16 Geoscan AI layers
/// (e.g. `A·Redline`, `K·CSI`, `M·+12%`), with a tap-to-reveal tooltip
/// explaining the layer (BAB 7.3 mockup — "Layer chips row ... tooltip on-tap").
///
/// Wrap a row of these for the crisis-card layer strip. The tooltip is shown
/// both on long-press (default) and on tap via [Tooltip.triggerMode].
class LayerChip extends StatelessWidget {
  const LayerChip({
    super.key,
    required this.code,
    required this.label,
    this.tooltip,
    this.color = AppColors.accent,
    this.onTap,
  });

  /// Short layer code, e.g. `A`, `K`, `O`, `M`.
  final String code;

  /// Human label, e.g. `Redline`, `CSI`, `+12%`.
  final String label;

  /// Optional explanatory text shown on tap / long-press.
  final String? tooltip;

  /// Accent color for the code badge + border tint.
  final Color color;

  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final chip = Container(
      padding: const EdgeInsets.symmetric(
        horizontal: AppSpacing.sm,
        vertical: AppSpacing.xs,
      ),
      decoration: BoxDecoration(
        color: AppColors.surfaceAlt,
        borderRadius: BorderRadius.circular(AppRadii.chip),
        border: Border.all(color: AppColors.border, width: AppBorders.hairline),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            code,
            style: AppTextStyles.caption.copyWith(
              color: color,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(width: AppSpacing.xs),
          Text(
            label,
            style: AppTextStyles.caption.copyWith(color: AppColors.textSecondary),
          ),
        ],
      ),
    );

    final tappable = onTap == null
        ? chip
        : Material(
            color: Colors.transparent,
            child: InkWell(
              onTap: onTap,
              borderRadius: BorderRadius.circular(AppRadii.chip),
              child: chip,
            ),
          );

    if (tooltip == null || tooltip!.isEmpty) return tappable;

    return Tooltip(
      message: tooltip!,
      triggerMode: TooltipTriggerMode.tap,
      preferBelow: false,
      textStyle: AppTextStyles.caption.copyWith(color: AppColors.textPrimary),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(AppRadii.inner),
        border: Border.all(color: AppColors.border, width: AppBorders.hairline),
      ),
      child: tappable,
    );
  }
}
