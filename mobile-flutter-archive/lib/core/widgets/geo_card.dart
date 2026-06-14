import 'package:flutter/material.dart';

import '../constants/app_constants.dart';
import '../theme/app_colors.dart';

/// Standard surface card matching BAB 7.3.
///
/// Defaults: [AppColors.surface] background, 0.5dp [AppColors.border] border,
/// 14dp radius, 14dp padding. Set [emphasis] for a 1.5dp border (e.g. hero
/// cards). Pass [onTap] to make the whole card tappable with a ripple.
class GeoCard extends StatelessWidget {
  const GeoCard({
    super.key,
    required this.child,
    this.padding = AppPadding.card,
    this.radius = AppRadii.card,
    this.color = AppColors.surface,
    this.borderColor = AppColors.border,
    this.emphasis = false,
    this.onTap,
    this.margin,
  });

  final Widget child;
  final EdgeInsetsGeometry padding;
  final double radius;
  final Color color;
  final Color borderColor;
  final bool emphasis;
  final VoidCallback? onTap;
  final EdgeInsetsGeometry? margin;

  @override
  Widget build(BuildContext context) {
    final borderRadius = BorderRadius.circular(radius);
    final content = DecoratedBox(
      decoration: BoxDecoration(
        color: color,
        borderRadius: borderRadius,
        border: Border.all(
          color: borderColor,
          width: emphasis ? AppBorders.emphasis : AppBorders.hairline,
        ),
      ),
      child: onTap == null
          ? Padding(padding: padding, child: child)
          : Material(
              color: Colors.transparent,
              child: InkWell(
                onTap: onTap,
                borderRadius: borderRadius,
                child: Padding(padding: padding, child: child),
              ),
            ),
    );

    return margin == null ? content : Padding(padding: margin!, child: content);
  }
}
