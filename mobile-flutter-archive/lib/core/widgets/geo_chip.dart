import 'package:flutter/material.dart';

import '../constants/app_constants.dart';
import '../theme/app_colors.dart';
import '../theme/app_text_styles.dart';

/// Compact pill / square chip used for filters, tags and status labels.
///
/// BAB 7.3: pill radius 20, square radius 8, 0.5dp border. Use [selected] for
/// the active filter state (accent fill). Provide [leading] for a small icon
/// and [onTap] to make it interactive.
class GeoChip extends StatelessWidget {
  const GeoChip({
    super.key,
    required this.label,
    this.selected = false,
    this.onTap,
    this.leading,
    this.color,
    this.backgroundColor,
    this.borderColor,
    this.square = false,
    this.dense = false,
  });

  final String label;
  final bool selected;
  final VoidCallback? onTap;
  final Widget? leading;

  /// Foreground (text) color override.
  final Color? color;
  final Color? backgroundColor;
  final Color? borderColor;

  /// Square (radius 8) instead of pill (radius 20).
  final bool square;
  final bool dense;

  @override
  Widget build(BuildContext context) {
    final radius = BorderRadius.circular(square ? AppRadii.chip : AppRadii.pill);

    final fg = color ??
        (selected ? AppColors.accent : AppColors.textSecondary);
    final bg = backgroundColor ??
        (selected ? AppColors.accentDark : AppColors.surface);
    final bc = borderColor ??
        (selected ? AppColors.accentBorder : AppColors.border);

    final content = Container(
      padding: EdgeInsets.symmetric(
        horizontal: dense ? AppSpacing.sm : AppSpacing.md,
        vertical: dense ? AppSpacing.xs : AppSpacing.sm,
      ),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: radius,
        border: Border.all(color: bc, width: AppBorders.hairline),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (leading != null) ...[
            IconTheme.merge(
              data: IconThemeData(color: fg, size: 12),
              child: leading!,
            ),
            const SizedBox(width: AppSpacing.xs),
          ],
          Text(
            label,
            style: AppTextStyles.bodySm.copyWith(
              color: fg,
              fontWeight: selected ? FontWeight.w500 : FontWeight.w400,
            ),
          ),
        ],
      ),
    );

    if (onTap == null) return content;
    return Material(
      color: Colors.transparent,
      child: InkWell(onTap: onTap, borderRadius: radius, child: content),
    );
  }
}
